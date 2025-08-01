# backend/app/requisitions/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base

class Requisition(Base):
    __tablename__ = "requisitions"
    
    id = Column(Integer, primary_key=True)
    requestedBy = Column(String, nullable=False)
    orderNumber = Column(String, nullable=False) # OP
    obra = Column(Integer, nullable=False, index=True)
    sub_item = Column(Integer, nullable=True, index=True)
    materialDescription = Column(String, nullable=False)
    requestDate = Column(DateTime(timezone=True), server_default=func.now())
    isFulfilled = Column(Boolean, default=False)
    
    # Relação: Qual recebimento atendeu a esta requisição?
    receiving_id = Column(Integer, ForeignKey("recebimentos.id"), nullable=True, unique=True)
    receiving = relationship("Receiving", back_populates="fulfilled_requisition")