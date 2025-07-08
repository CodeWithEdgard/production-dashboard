from sqlalchemy.orm import Session
from . import models, schemas, security

# Busca um usuário pelo seu endereço de e-mail.
def get_user_by_email(db: Session, email: str):
  return db.query(models.User).filter(models.User.email == email).first() 

# Cria um novo usuário no banco de dados com uma senha hasheada.
def create_user(db: Session, user: schemas.UserCreate):
  hashed_password = security.get_password_hash(user.password) 
  
  # Cria uma instância do modelo do banco de dados, substituindo a senha em texto puro
  # pelo hash.
  db_user = models.User(email=user.email, hashed_password=hashed_password )
  
  db.add(db_user)
  db.commit()
  db.refresh(db_user)
  return db_user

# crud de production order

def create_production_order(db: Session, order: schemas.ProductionOrderCreate, owner_id: int):
  # Cria uma instância do modelo do banco de dados a partir dos dados do schema
  # e adiciona o owner_id.
  db_order = models.ProductionOrder(
    **order.dict(), # Pega todos os campos do schema (obra_number, nro_op, etc.)
    owner_id=owner_id
  )
  
  db.add(db_order)
  db.commit()
  db.refresh(db_order)
  return db_order