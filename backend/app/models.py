# backend/app/models.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    # RELACIONAMENTO INVERSO: Um usuário pode ter muitas ordens criadas
    # e muitas ordens atualizadas.
    created_orders = relationship(
        "ProductionOrder", 
        foreign_keys="[ProductionOrder.owner_id]", 
        back_populates="owner"
    )
    updated_orders = relationship(
        "ProductionOrder", 
        foreign_keys="[ProductionOrder.last_updated_by_id]", 
        back_populates="last_updated_by"
    )


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
    nobreak = Column(String, nullable=True)
    ca_r167 = Column(String, nullable=True)
    
    # --- Colunas de Chave Estrangeira ---
    owner_id = Column(Integer, ForeignKey("users.id"))
    last_updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # campos de auditoria - Usando a função do Python com timezone
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # --- Relacionamentos com Especificação e back_populates ---
    owner = relationship(
        "User", 
        foreign_keys=[owner_id], 
        back_populates="created_orders"
    )
    last_updated_by = relationship(
        "User", 
        foreign_keys=[last_updated_by_id], 
        back_populates="updated_orders"
    )