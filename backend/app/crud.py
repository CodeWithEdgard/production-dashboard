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
    # A maneira mais explícita de criar o objeto
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
        # Não definimos created_at e updated_at, pois o DB faz isso
    )

    db.add(db_order)
    db.commit()
    # A MÁGICA: Após o commit, recarregamos o objeto inteiro do DB
    # Isso garante que todos os defaults, como 'updated_at', sejam carregados.
    db.refresh(db_order) 
    return db_order