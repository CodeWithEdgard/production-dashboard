# backend/app/api.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional # Importe List e Optional aqui

from . import crud, models, schemas, auth

# Importa a dependência get_db, que vamos mover para dependencies.py
from .dependencies import get_db, get_current_active_user

# Cria o roteador
router = APIRouter()

# ==================================
#         ENDPOINTS DE AUTH
# ==================================

@router.post("/users/", response_model=schemas.User, tags=["Authentication"])
def create_new_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=auth.Token, tags=["Authentication"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.User, tags=["Authentication"])
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

# =======================================
#      ENDPOINTS PARA PRODUCTION ORDER
# =======================================

@router.post("/orders/", response_model=schemas.ProductionOrder, status_code=status.HTTP_201_CREATED, tags=["Production Orders"])
def create_order(
    order: schemas.ProductionOrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    existing_order = db.query(models.ProductionOrder).filter(models.ProductionOrder.nro_op == order.nro_op).first()
    if existing_order:
        raise HTTPException(status_code=400, detail=f"NRO OP '{order.nro_op}' já existe.")
        
    return crud.create_production_order(db=db, order=order, owner_id=current_user.id)

# Retorna os detalhes de uma ordem de produção específica. Requer autenticação.
@router.get("/orders/", response_model=list[schemas.ProductionOrder], tags=["Production Orders"])
def read_orders(
    obra_number: Optional[str] = None,
    nro_op: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    orders = crud.get_orders(
        db, 
        obra_number=obra_number, 
        nro_op=nro_op, 
        skip=skip, 
        limit=limit
    )
    return orders

# Atualiza uma ordem de produção. Requer autenticação.
@router.put("/orders/{order_id}", response_model=schemas.ProductionOrder, tags=["Production Orders"])
def update_order(
    order_id: int, 
    order: schemas.ProductionOrderCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    updated_order = crud.update_order(
        db=db, 
        order_id=order_id, 
        order_data=order, 
        user_id=current_user.id
    )
    if updated_order is None:
        raise HTTPException(status_code=404, detail="Order not found to update")
    return updated_order

# Deleta uma ordem de produção. Requer autenticação.
@router.delete("/orders/{order_id}", response_model=schemas.ProductionOrder, tags=["Production Orders"])
def delete_order(
    order_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    deleted_order = crud.delete_order(db=db, order_id=order_id)
    if deleted_order is None:
        raise HTTPException(status_code=404, detail="Order not found to delete")
    return deleted_order