# backend/app/requisitions/schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RequisitionCreate(BaseModel):
    obra: int = Field(..., gt=0)
    sub_item: Optional[int] = Field(None, ge=0)
    requestedBy: str
    orderNumber: str
    materialDescription: str

class Requisition(RequisitionCreate):
    id: int
    requestDate: datetime
    isFulfilled: bool
    receiving_id: Optional[int] = None
    class Config:
        from_attributes = True