# backend/app/ca/models.py

from sqlalchemy import (Column, Integer, String, Text, DateTime, Float, 
                        ForeignKey, func, Enum as SQLAlchemyEnum)
from sqlalchemy.orm import relationship
import enum

# Importa a classe Base do seu arquivo de database central
from ..database import Base

# Enum para os Status do C.A.
class StatusCA(str, enum.Enum):
    PENDENTE_ANALISE = "Pendente de Análise de Estoque"
    AGUARDANDO_COMPRA = "Aguardando Compra"
    PRONTO_PARA_EXECUCAO = "Pronto para Execução"
    CONCLUIDO = "Concluído"
    CANCELADO = "Cancelado"

# --- Tabela Principal: O documento do C.A. ---
class ComunicadoAlteracao(Base):
    __tablename__ = "comunicados_alteracao"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True) 
    status = Column(SQLAlchemyEnum(StatusCA), default=StatusCA.PENDENTE_ANALISE, nullable=False)
    requester_info = Column(String, nullable=False)
    obra = Column(Integer, nullable=False, index=True)
    op = Column(Integer, nullable=False, index=True)
    sub_item = Column(Integer, nullable=True, index=True)
    reason = Column(Text, nullable=False)
    custo_unit = Column(Float, nullable=True)
    sub_total = Column(Float, nullable=True)
    creation_date = Column(DateTime(timezone=True), server_default=func.now())
    completion_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relações
    items = relationship("ItemAlteracao", back_populates="comunicado", cascade="all, delete-orphan")
    movimentos = relationship("MovimentoEstoque", back_populates="comunicado", cascade="all, delete-orphan")

# --- Tabela de Itens ---
class ItemAlteracao(Base):
    __tablename__ = "itens_alteracao"
    
    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(20), nullable=False)
    material_description = Column(String, nullable=False)
    material_code = Column(String, nullable=True)
    quantity = Column(Integer, nullable=False)
    brand = Column(String(50), nullable=True)
    stock_status = Column(String(50), default="Pendente de Verificação", nullable=False)
    ca_id = Column(Integer, ForeignKey("comunicados_alteracao.id"), nullable=False)
    comunicado = relationship("ComunicadoAlteracao", back_populates="items")

# --- <<< CLASSE FALTANTE RESTAURADA AQUI >>> ---
# --- Tabela de Auditoria de Movimentos de Estoque ---
class MovimentoEstoque(Base):
    __tablename__ = "movimentos_estoque"
    
    id = Column(Integer, primary_key=True, index=True)
    item_description = Column(String, nullable=False)
    quantity_moved = Column(Integer, nullable=False)
    movement_type = Column(String, nullable=False)
    destination_stock = Column(String, nullable=True)
    executed_by = Column(String, nullable=False)
    execution_date = Column(DateTime(timezone=True), default=func.now())
    
    # Relação com o C.A.
    ca_id = Column(Integer, ForeignKey("comunicados_alteracao.id"), nullable=False)
    comunicado = relationship("ComunicadoAlteracao", back_populates="movimentos")

# --- <<< CLASSE FALTANTE RESTAURADA AQUI >>> ---
# --- Tabela para Pedidos de Compra ---
class PedidoCompra(Base):
    __tablename__ = "pedidos_compra"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), default="Pendente", nullable=False)
    ca_id = Column(Integer, ForeignKey("comunicados_alteracao.id"), nullable=False)