from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
from sqlalchemy.sql import func

class User(Base):
  __tablename__ = "users"
  
  id = Column(Integer, primary_key=True, index=True)
  email = Column(String, unique=True, index=True)
  hashed_password = Column(String)
  is_active = Column(Boolean, default=True)
  
class ProductionOrder(Base):
  __tablename__ = "production_orders"
  
  id = Column(Integer, primary_key=True, index=True)
  obra_number = Column(String, index=True)
  nro_op = Column(String, unique=True, index=True)
  
  # colunas de status
  transf_potencia_status = Column(String, default="pendente")
  transf_corrente_status = Column(String, default="pendente")
  chave_secc_status = Column(String, default="pendente")
  disjuntor_status = Column(String, default="pendente")
  bucha_iso_raio_status = Column(String, default="pendente")
  geral_status = Column(String, default="produção")
  
  # outras informações
  descricao = Column(String, nullable=True)
  ca = Column(String, nullable=True)
  nobreak = Column(String, nullable=True)
  
  # campos de auditoria
  created_at = Column(DateTime, server_default=func.now())
  updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
  
  #relacionamento com o usuario
  owner_id = Column(Integer, ForeignKey("users.id"))
  owner = relationship("User")
  