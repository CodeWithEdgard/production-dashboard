
from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import datetime
import enum


class StatusRecebimento(str, enum.Enum):
    AGUARDANDO_CONFERENCIA = "Aguardando Conferência"
    CONFERIDO = "Conferido"
    REJEITADO = "Rejeitado"
    PENDENTE = "Pendente"
    ENTRADA_REJEITADA = "Entrada Rejeitada"

# Detalhes da Conferência 
class RecebimentoDetails(BaseModel):
    # pontualidade
    expectedDate: datetime  
    deliveryDate: datetime 
    punctual: bool = Field(description="Entregue no prazo?")
    supplierNote: Optional[str] = Field(None, description="Observação sobre pontualidade")
    
    # qualidade
    issueType: Literal["sem pendência", "avaria", "item errado", "quantidade incorreta", "outro"] = "sem pendência"
    issueDescription: Optional[str] = Field(None, description="Descrição detalhada da pendência encontrada.")
    
    # material
    isClientMaterial: bool = Field(description="Material pertence ao cliente?")
    refusedMaterial: bool = Field(description="Material foi recusado?")


# CRIAÇÃO a partir do formulário de entrada
class RecebimentoCreate(BaseModel):
    nfNumber: str = Field(..., example="987654")
    supplier: str = Field(..., example="Fornecedor Principal S/A")
    orderNumber: Optional[str] = Field(None, example="PED-2025-01")
    nfValue: Optional[float] = Field(None, example=12345.67)
    nfVolume: Optional[int] = Field(None, example=25)
    receivedBy: Optional[str] = Field(None, example="Carlos (Portaria)")

# ATUALIZAÇÃO durante a conferência
class RecebimentoUpdate(BaseModel):
    conferredBy: str = Field(..., example="Ana (Conferência)")
    details: RecebimentoDetails 
    
# COMPLETO para LEITURA (o que a API retorna)
class Recebimento(RecebimentoCreate):
    id: int
    entryDate: datetime
    status: StatusRecebimento 

    conferenceDate: Optional[datetime] = None
    conferredBy: Optional[str] = None
    details: Optional[RecebimentoDetails] = None 
    
    resolutionNotes: Optional[str] = None
    resolvedBy: Optional[str] = None
    resolvedDate: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        
class PaginatedRecebimentos(BaseModel):
    items: List[Recebimento]  # A lista de recebimentos
    total: int                # A contagem total de itens

    class Config:
        from_attributes = True
        
class RecebimentoResolve(BaseModel):
    resolvedBy: str = Field(..., example="Supervisor Nome")
    resolutionNotes: str = Field(..., description="Descrição detalhada da solução aplicada.")
    finalStatus: Literal["Conferido", "Rejeitado"] 
    
class RecebimentoReject(BaseModel):
    rejectedBy: str = Field(..., example="Ana (Conferência)")
    rejectionReason: str = Field(..., description="O motivo pelo qual a entrada foi rejeitada.")