from pydantic import BaseModel, EmailStr

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
