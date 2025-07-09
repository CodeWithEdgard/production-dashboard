from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm


from . import crud, models, schemas, auth 
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Production Dashboard API")

# A dependência get_db vive aqui, pois será usada por vários endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==================================
#         ENDPOINTS DE AUTH
# ==================================

@app.post("/users/", response_model=schemas.User, tags=["Authentication"])
def create_new_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/login", response_model=auth.Token, tags=["Authentication"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User, tags=["Authentication"])
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

# =======================================
#      ENDPOINTS PARA PRODUCTION ORDER
# =======================================

@app.post("/orders/", response_model=schemas.ProductionOrder, status_code=status.HTTP_201_CREATED, tags=["Production Orders"])
def create_order(
    order: schemas.ProductionOrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    existing_order = db.query(models.ProductionOrder).filter(models.ProductionOrder.nro_op == order.nro_op).first()
    if existing_order:
        raise HTTPException(status_code=400, detail=f"NRO OP '{order.nro_op}' já existe.")
        
    return crud.create_production_order(db=db, order=order, owner_id=current_user.id)

# Retorna uma lista de todas as ordens de produção. Requer autenticação.
@app.get("/orders/", response_model=list[schemas.ProductionOrder], tags=["Production Orders"])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    orders = crud.get_orders(db, skip=skip, limit=limit)
    return orders