from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List 
from . import models, schemas
from ..database import get_db
from datetime import datetime, timezone, timedelta
from typing import Optional, Literal, List
from ..requisitions import models as requisition_models


router = APIRouter(
    prefix="/api/recebimentos",
    tags=["Recebimentos"]
)

@router.post("/", response_model=schemas.Recebimento, status_code=201)
def create_recebimento(
    recebimento_data: schemas.RecebimentoCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo recebimento e, opcionalmente, o vincula a uma requisição existente.
    """
    # --- Verificações de Duplicidade (seu código, já correto) ---
    existing_nf = db.query(models.Receiving).filter(models.Receiving.nfNumber == recebimento_data.nfNumber).first()
    if existing_nf:
        raise HTTPException(status_code=400, detail=f"A NF nº {recebimento_data.nfNumber} já foi registrada.")
    
    if recebimento_data.orderNumber:
        existing_order = db.query(models.Receiving).filter(models.Receiving.orderNumber == recebimento_data.orderNumber).first()
        if existing_order:
            raise HTTPException(
                status_code=400, 
                detail=f"O Pedido nº {recebimento_data.orderNumber} já foi associado à NF: {existing_order.nfNumber}."
            )
            
    # --- Lógica de Vinculação (A Correção) ---
    
    # 1. Separe a "instrução" de vinculação dos dados principais.
    req_id_to_fulfill = recebimento_data.requisition_id_to_fulfill
    
    # 2. Crie um dicionário de dados limpo, sem o campo extra.
    receiving_model_data = recebimento_data.model_dump(exclude={"requisition_id_to_fulfill"})
    
    # 3. Crie a instância do recebimento com o dicionário limpo.
    db_recebimento = models.Receiving(**receiving_model_data)
    
    # 4. Se um ID de requisição foi fornecido, processe a vinculação.
    if req_id_to_fulfill:
        db_req = db.query(requisition_models.Requisition).filter(requisition_models.Requisition.id == req_id_to_fulfill).first()
        
        # Validações de segurança
        if not db_req:
            raise HTTPException(status_code=404, detail=f"Requisição com ID {req_id_to_fulfill} não encontrada.")
        if db_req.isFulfilled:
            raise HTTPException(status_code=400, detail=f"Requisição {req_id_to_fulfill} já foi atendida.")
            
        # Atualiza a requisição e cria o link
        db_req.isFulfilled = True
        db_req.receiving = db_recebimento # O SQLAlchemy gerencia o 'receiving_id'
        
        db.add(db_req)

    # 5. Adiciona o novo recebimento e salva a transação (que inclui a atualização da requisição, se houver)
    db.add(db_recebimento)
    db.commit()
    db.refresh(db_recebimento)
    response_data = schemas.Recebimento.model_validate(db_recebimento)
    
    return db_recebimento


@router.get("/", response_model=schemas.PaginatedRecebimentos)
def get_all_recebimentos(
    db: Session = Depends(get_db),
    # Parâmetros de Filtro
    search: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    is_client_material: Optional[bool] = None,
    # Parâmetros de Paginação
    page: int = 1,
    page_size: int = 10 
):
    
    query = db.query(models.Receiving)
    
    if is_client_material is not None:
        # Acessa o campo aninhado no JSON
        query = query.filter(models.Receiving.details['isClientMaterial'].as_boolean() == is_client_material)

    # 2. Aplica os filtros de forma encadeada, se eles existirem
    if search:
        query = query.filter(
            models.Receiving.nfNumber.ilike(f"%{search}%") |
            models.Receiving.supplier.ilike(f"%{search}%") |
            models.Receiving.orderNumber.ilike(f"%{search}%")
        )
    if status:
        query = query.filter(models.Receiving.status == status)
    if start_date:
        query = query.filter(models.Receiving.entryDate >= start_date)
    if end_date:
        # Adiciona um dia para garantir que a busca inclua o dia final por completo
        query = query.filter(models.Receiving.entryDate < end_date + timedelta(days=1))
    
    # 3. Conta o número total de itens que correspondem aos filtros
    #    Isso é feito ANTES de aplicar a paginação (limit/offset)
    total_items = query.count()
    
    
    #    Calcula o offset com base na página atual e no tamanho da página
    offset = (page - 1) * page_size
    
    # 5. Aplica a ordenação, o offset e o limite para obter apenas os itens da página atual
    recebimentos_list = query.order_by(models.Receiving.entryDate.desc()).offset(offset).limit(page_size).all()
    
    # 6. Retorna o dicionário no formato esperado pelo schema PaginatedRecebimentos
    return {"items": recebimentos_list, "total": total_items}


@router.put("/{recebimento_id}", response_model=schemas.Recebimento)
def update_conference_details(
    recebimento_id: int,
    update_data: schemas.RecebimentoUpdate, 
    db: Session = Depends(get_db)
):

    
    db_recebimento = db.query(models.Receiving).filter(models.Receiving.id == recebimento_id).first()
    
    if not db_recebimento:
        raise HTTPException(status_code=404, detail="Recebimento não encontrado")

    if db_recebimento.status != "Aguardando Conferência":
        raise HTTPException(
            status_code=400,
            detail=f"Este recebimento já foi processado. Status atual: {db_recebimento.status}"
        )

    
    db_recebimento.conferredBy = update_data.conferredBy
    
    db_recebimento.conferenceDate = datetime.now(timezone.utc)
    
    # Salva o objeto de detalhes como um JSON
    db_recebimento.details = update_data.details.model_dump(mode='json')
    
    # Lógica para definir o status final
    if update_data.details.refusedMaterial:
        db_recebimento.status = "Rejeitado"
    elif update_data.details.issueType != "sem pendência":
        db_recebimento.status = "Pendente"
    else:
        db_recebimento.status = "Conferido"

    
    db.commit()
    db.refresh(db_recebimento)
    
    return db_recebimento


@router.post("/{recebimento_id}/resolve", response_model=schemas.Recebimento)
def resolve_pendency(
    recebimento_id: int,
    resolve_data: schemas.RecebimentoResolve,
    db: Session = Depends(get_db)
):
   
    db_recebimento = db.query(models.Receiving).filter(models.Receiving.id == recebimento_id).first()
    
    if not db_recebimento:
        raise HTTPException(status_code=404, detail="Recebimento não encontrado")
    
    if db_recebimento.status != "Pendente":
        raise HTTPException(status_code=400, detail="Este recebimento não está com status 'Pendente'.")

    # Atualiza os campos da tratativa
    db_recebimento.resolvedBy = resolve_data.resolvedBy
    db_recebimento.resolutionNotes = resolve_data.resolutionNotes
    db_recebimento.resolvedDate = datetime.now(timezone.utc)
    
    # Atualiza o status final
    db_recebimento.status = resolve_data.finalStatus
    
    # Atualiza o campo 'issueResolved' dentro do JSON de detalhes
    if db_recebimento.details:
        db_recebimento.details['issueResolved'] = True

    db.commit()
    db.refresh(db_recebimento)
    return db_recebimento

@router.put("/{recebimento_id}/reject", response_model=schemas.Recebimento)
def reject_entry(
    recebimento_id: int,
    reject_data: schemas.RecebimentoReject,
    db: Session = Depends(get_db)
):
   
    db_recebimento = db.query(models.Receiving).filter(models.Receiving.id == recebimento_id).first()
    
    if not db_recebimento:
        raise HTTPException(status_code=404, detail="Recebimento não encontrado")

    if db_recebimento.status != "Aguardando Conferência":
        raise HTTPException(status_code=400, detail="Apenas recebimentos 'Aguardando Conferência' podem ser rejeitados na entrada.")

    # Atualiza o status
    db_recebimento.status = schemas.StatusRecebimento.ENTRADA_REJEITADA 
    
    # Salva a justificativa da rejeição em um campo
    
    db_recebimento.resolutionNotes = f"Rejeitado por: {reject_data.rejectedBy}. Motivo: {reject_data.rejectionReason}"
    db_recebimento.resolvedBy = reject_data.rejectedBy
    db_recebimento.resolvedDate = datetime.now(timezone.utc)

    db.commit()
    db.refresh(db_recebimento)
    return db_recebimento