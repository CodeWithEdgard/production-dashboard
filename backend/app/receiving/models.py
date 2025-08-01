
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func, JSON
import datetime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base

class Receiving(Base):
  __tablename__ = "recebimentos"
  
  id = Column(Integer, primary_key=True, index=True)
  nfNumber = Column(String, index=True, nullable=False, unique=True)
  supplier = Column(String, index=True, nullable=False)
  orderNumber = Column(String, nullable=False)
  nfValue = Column(Float, nullable=True)
  nfVolume = Column(Integer, nullable=True)
  
  status = Column(String, default="Aguardando Conferência")
  entryDate = Column(DateTime(timezone=True), server_default=func.now())
  receivedBy = Column(String, nullable=True)
  
  conferenceDate = Column(DateTime(timezone=True), nullable=True)
  conferredBy = Column(String, nullable=True)
  
  details = Column(JSON, nullable=True)
  
  
  resolutionNotes = Column(String, nullable=True)
  resolvedBy = Column(String, nullable=True)
  resolvedDate = Column(DateTime(timezone=True), nullable=True)
  fulfilled_requisition = relationship(
        "Requisition", 
        back_populates="receiving",
        uselist=False 
    )