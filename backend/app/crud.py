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
    db_order = models.ProductionOrder(
        obra_number=order.obra_number,
        nro_op=order.nro_op,
        # ... (todos os outros campos de status) ...
        transf_potencia_status=order.transf_potencia_status,
        transf_corrente_status=order.transf_corrente_status,
        chave_secc_status=order.chave_secc_status,
        disjuntor_status=order.disjuntor_status,
        bucha_iso_raio_status=order.bucha_iso_raio_status,
        geral_status=order.geral_status,
        descricao=order.descricao,
        ca=order.ca,
        nobreak=order.nobreak,
        owner_id=owner_id
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order) 
    return db_order

# Busca todas as ordens de produção do banco de dados, com paginação.  
def get_orders(db: Session, skip: int = 0, limit: int = 100):
  return db.query(models.ProductionOrder).offset(skip).limit(limit).all()

# Busca uma ordem específica pelo NRO OP para evitar duplicatas.
def get_order_by_nro_op(db: Session, nro_op: str):
  return db.query(models.ProductionOrder).filter(models.ProductionOrder.nro_op == nro_op).first()

# Busca uma ordem específica pelo seu ID.
def get_order_by_id(db: Session, order_id: int):
  return db.query(models.ProductionOrder).filter(models.ProductionOrder.id == order_id).first()