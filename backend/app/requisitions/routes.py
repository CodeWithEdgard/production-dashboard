# backend/app/requisitions/routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from ..database import get_db


router = APIRouter(prefix="/api/requisitions", tags=["Requisições"])

@router.post("/", response_model=schemas.Requisition, status_code=201)
def create_requisition(req_data: schemas.RequisitionCreate, db: Session = Depends(get_db)):
    db_req = models.Requisition(**req_data.model_dump())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

@router.get("/pending", response_model=List[schemas.Requisition])
def get_pending_requisitions(db: Session = Depends(get_db)):
    return db.query(models.Requisition).filter(models.Requisition.isFulfilled == False).all()

@router.put("/{requisition_id}/fulfill", response_model=schemas.Requisition)
def fulfill_requisition(requisition_id: int, db: Session = Depends(get_db)):
    """
    Marca uma requisição como 'atendida' (fulfilled).
    Isso a removerá da lista de pendentes.
    """
    # 1. Encontra a requisição no banco de dados
    db_req = db.query(models.Requisition).filter(models.Requisition.id == requisition_id).first()

    if not db_req:
        raise HTTPException(status_code=404, detail="Requisição não encontrada")
        
    # 2. Impede a ação se já estiver finalizada
    if db_req.isFulfilled:
        raise HTTPException(status_code=400, detail="Esta requisição já foi marcada como atendida.")
        
    # 3. Atualiza o status
    db_req.isFulfilled = True
    
    # 4. Salva as mudanças
    db.commit()
    db.refresh(db_req)
    
    return db_req