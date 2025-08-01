# backend/app/receiving/schemas.py

from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime
import enum

# --- Schemas Auxiliares ---

class StatusRecebimento(str, enum.Enum):
    AGUARDANDO_CONFERENCIA = "Aguardando Conferência"
    CONFERIDO = "Conferido"
    REJEITADO = "Rejeitado"
    PENDENTE = "Pendente"
    ENTRADA_REJEITADA = "Entrada Rejeitada"

class RecebimentoDetails(BaseModel):
    expectedDate: datetime  
    deliveryDate: datetime 
    punctual: bool
    issueType: Literal["sem pendência", "avaria", "item errado", "quantidade incorreta", "outro"]
    issueDescription: Optional[str] = None
    isClientMaterial: bool
    refusedMaterial: bool

class RequisitionInfo(BaseModel):
    id: int
    materialDescription: str
    requestedBy: str
    class Config:
        from_attributes = True

# --- Schemas de Ações (Entrada) ---

class RecebimentoCreate(BaseModel):
    nfNumber: str
    supplier: str
    orderNumber: Optional[str] = None
    nfValue: Optional[float] = None
    nfVolume: Optional[int] = None
    receivedBy: Optional[str] = None
    requisition_id_to_fulfill: Optional[int] = None

class RecebimentoUpdate(BaseModel):
    conferredBy: str
    details: RecebimentoDetails 
    
class RecebimentoResolve(BaseModel):
    resolvedBy: str
    resolutionNotes: str
    finalStatus: Literal["Conferido", "Rejeitado"] 
    
class RecebimentoReject(BaseModel):
    rejectedBy: str
    rejectionReason: str

# --- Schema de Leitura (Saída da API) ---
# Este schema é agora totalmente explícito e não herda de RecebimentoCreate.
class Recebimento(BaseModel):
    id: int
    entryDate: datetime
    status: StatusRecebimento
    
    nfNumber: str
    supplier: str
    orderNumber: Optional[str] = None
    nfValue: Optional[float] = None
    nfVolume: Optional[int] = None
    receivedBy: Optional[str] = None

    conferenceDate: Optional[datetime] = None
    conferredBy: Optional[str] = None
    details: Optional[RecebimentoDetails] = None 
    
    resolutionNotes: Optional[str] = None
    resolvedBy: Optional[str] = None
    resolvedDate: Optional[datetime] = None
    
    # O campo para o objeto da requisição aninhada
    fulfilled_requisition: Optional[RequisitionInfo] = None
    
    class Config:
        from_attributes = True
        
# --- Schema de Paginação ---
class PaginatedRecebimentos(BaseModel):
    items: List[Recebimento]
    total: int