
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Importa os módulos deste domínio ('ca')
from . import models, schemas
# Importa a função para obter a sessão do banco
from ..database import get_db

router = APIRouter(
    prefix="/api/ca",
    tags=["Comunicados de Alteração"]
)

# --- ROTA 1: CRIAR um novo C.A. ---
@router.post("/", response_model=schemas.ComunicadoAlteracao, status_code=201)
def create_comunicado_alteracao(
    ca_data: schemas.ComunicadoAlteracaoCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo Comunicado de Alteração. O payload de entrada contém os
    detalhes principais e objetos para item_adicionado e/ou item_removido.
    A lógica interna "desmonta" isso e salva em múltiplas linhas na tabela de itens.
    """
    # 1. Pega os dados principais, excluindo os itens aninhados
    ca_main_data = ca_data.model_dump(exclude={"item_adicionado", "item_removido"})
    db_ca = models.ComunicadoAlteracao(**ca_main_data)
    
    # 2. Processa o item a ser ADICIONADO, se existir
    if ca_data.item_adicionado:
        item_add_data = ca_data.item_adicionado.model_dump()
        db_item_add = models.ItemAlteracao(action_type="ADICIONAR", **item_add_data)
        db_ca.items.append(db_item_add)

    # 3. Processa o item a ser REMOVIDO, se existir
    if ca_data.item_removido:
        item_remove_data = ca_data.item_removido.model_dump()
        db_item_remove = models.ItemAlteracao(action_type="RETIRAR", **item_remove_data)
        db_ca.items.append(db_item_remove)
    
    # 4. Adiciona o C.A. principal (com seus itens) à sessão e salva
    db.add(db_ca)
    db.commit()
    db.refresh(db_ca)
    
    # O FastAPI/Pydantic irá reformatar a resposta para o schema ComunicadoAlteracao
    return db_ca

@router.get("/", response_model=schemas.PaginatedCA)
def get_all_comunicados_alteracao(
    db: Session = Depends(get_db), page: int = 1, page_size: int = 10
):
    query = db.query(models.ComunicadoAlteracao).order_by(models.ComunicadoAlteracao.creation_date.desc())
    total_items = query.count()
    offset = (page - 1) * page_size
    cas_from_db = query.offset(offset).limit(page_size).all()
    
    formatted_cas = []
    
    for ca in cas_from_db:
        # Começa a construir o dicionário de resposta com os campos principais
        ca_dict = {
            "id": ca.id, "status": ca.status, "creation_date": ca.creation_date,
            "completion_date": ca.completion_date, "obra": ca.obra, "op": ca.op,
            "sub_item": ca.sub_item, "requester_info": ca.requester_info, "reason": ca.reason
        }
        
        item_add = next((item for item in ca.items if item.action_type == "ADICIONAR"), None)
        item_rem = next((item for item in ca.items if item.action_type == "RETIRAR"), None)

        if item_add:
            ca_dict["item_adicionado"] = item_add
        if item_rem:
            ca_dict["item_removido"] = item_rem
            
        # Pydantic irá validar o dicionário completo antes de retornar
        formatted_cas.append(schemas.ComunicadoAlteracao.model_validate(ca_dict))

    return {"items": formatted_cas, "total": total_items}


@router.get("/{ca_id}", response_model=schemas.ComunicadoAlteracao)
def get_comunicado_alteracao(ca_id: int, db: Session = Depends(get_db)):
    db_ca = db.query(models.ComunicadoAlteracao).filter(models.ComunicadoAlteracao.id == ca_id).first()
    if db_ca is None:
        raise HTTPException(status_code=404, detail="C.A. não encontrado")

    # Monta a resposta manualmente
    response_data = {
        "id": db_ca.id, "status": db_ca.status, "creation_date": db_ca.creation_date,
        "completion_date": db_ca.completion_date, "obra": db_ca.obra, "op": db_ca.op,
        "sub_item": db_ca.sub_item, "requester_info": db_ca.requester_info, "reason": db_ca.reason
    }

    item_add = next((item for item in db_ca.items if item.action_type == "ADICIONAR"), None)
    item_rem = next((item for item in db_ca.items if item.action_type == "RETIRAR"), None)
    
    if item_add:
        response_data["item_adicionado"] = item_add
    if item_rem:
        response_data["item_removido"] = item_rem

    # Pydantic valida nosso dicionário antes de enviar a resposta
    return schemas.ComunicadoAlteracao.model_validate(response_data)


@router.put("/items/{item_id}/stock-status", response_model=schemas.MaterialInfo)
def update_item_stock_status(
    item_id: int,
    status_update: schemas.ItemAlteracaoStockStatusUpdate, # O nome do seu schema de update
    db: Session = Depends(get_db)
):
    """
    Atualiza o 'stock_status' de um único ItemAlteracao.
    """
    # A lógica interna continua usando o modelo do SQLAlchemy 'models.ItemAlteracao'
    db_item = db.query(models.ItemAlteracao).filter(models.ItemAlteracao.id == item_id).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Item de alteração não encontrado")
        
    db_item.stock_status = status_update.stock_status
    
    db.commit()
    db.refresh(db_item)
    
    # O Pydantic irá converter o 'db_item' (um objeto ItemAlteracao do SQLAlchemy)
    # para o formato do response_model 'schemas.MaterialInfo'
    return db_item


# --- ROTA 5: CRIAR UM NOVO MOVIMENTO DE ESTOQUE ---
@router.post("/movements", response_model=schemas.MovimentoEstoque, status_code=201)
def create_stock_movement(
    movimento_data: schemas.MovimentoEstoqueCreate,
    db: Session = Depends(get_db)
):
    """
    Registra um novo MovimentoEstoque. Usado para registrar a devolução
    de um item a ser removido da obra.
    """
    # Verifica se o C.A. relacionado existe
    db_ca = db.query(models.ComunicadoAlteracao).filter(models.ComunicadoAlteracao.id == movimento_data.ca_id).first()
    if not db_ca:
        raise HTTPException(status_code=404, detail=f"C.A. com ID {movimento_data.ca_id} não encontrado.")

    db_movimento = models.MovimentoEstoque(**movimento_data.model_dump())
    
    db.add(db_movimento)
    db.commit()
    db.refresh(db_movimento)
    
    return db_movimento


# --- FUNÇÃO AUXILIAR PARA A LÓGICA DE NEGÓCIO ---
def check_and_update_ca_status(comunicado: models.ComunicadoAlteracao, db: Session):
    """
    Verifica os status de todos os itens de um C.A. e, se todos estiverem
    resolvidos, atualiza o status do C.A. principal.
    """
    
    # Ignora se o C.A. já não estiver em análise
    if comunicado.status != "Pendente de Análise de Estoque":
        return

    # Pega todos os itens associados ao C.A.
    items = comunicado.items
    
    # Verifica se todos os itens já saíram do estado "Pendente de Verificação"
    all_items_checked = all(item.stock_status != "Pendente de Verificação" for item in items)
    
    if all_items_checked:
        # Verifica se algum item requer compra
        needs_purchase = any(item.stock_status == "Verificado - Compra Necessária" for item in items)
        
        if needs_purchase:
            comunicado.status = "Aguardando Compra"
        else:
            comunicado.status = "Pronto para Execução"
        
        db.commit()
        db.refresh(comunicado)