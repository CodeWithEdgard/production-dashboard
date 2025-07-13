from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
  email: EmailStr # Pydantic valida automaticamente se é um formato de e-mail válido.
  
class UserCreate(UserBase):
  password: str # O que esperamos receber do cliente ao criar um usuário.
  
class User(UserBase):
  id: int
  is_active: bool # O que nossa API retornará quando pedirmos os dados de um usuário.
  
  class Config:
    #orm_mode = True 
    from_attributes = True # Permite que o Pydantic mapeie os dados diretamente de um objeto ORM (SQLAlchemy)

# Schemas para production order

class ProductionOrderBase(BaseModel):
    obra_number: str
    nro_op: str
    transf_potencia_status: str = "pendente"
    transf_corrente_status: str = "pendente"
    chave_secc_status: str = "pendente"
    disjuntor_status: str = "pendente"
    bucha_iso_raio_status: str = "pendente"
    geral_status: str = "produção"
    descricao: str | None = None
    ca_r167: str | None = None
    nobreak: str | None = None

class ProductionOrderCreate(ProductionOrderBase):
    pass

class UserInDB(UserBase):
    id: int
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

class ProductionOrder(ProductionOrderBase):
    id: int
    owner_id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
    owner: UserInDB 
    last_updated_by: UserInDB | None = None

    class Config:
        from_attributes = True