# backend/app/ca/schemas.py

from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Literal
from datetime import datetime
from .models import StatusCA

# --- 1. Schemas de "Blocos de Construção" ---

# Schema para um item de material (Adicionado ou Removido)
class MaterialInfo(BaseModel):
    material_description: str = Field(..., min_length=3)
    material_code: Optional[str] = None
    brand: Optional[str] = None
    quantity: int

    class Config:
        from_attributes = True

# Schema para um item de material na CRIAÇÃO (com validação de quantidade)
class MaterialInfoCreate(MaterialInfo):
    quantity: int = Field(..., gt=0)

# Schema para um Movimento de Estoque
class MovimentoEstoque(BaseModel):
    id: int
    execution_date: datetime
    ca_id: int
    item_description: str
    quantity_moved: int
    movement_type: str
    destination_stock: Optional[str]
    executed_by: str

    class Config:
        from_attributes = True

# --- 2. Schemas do Comunicado de Alteração ---

# Schema para a CRIAÇÃO
class ComunicadoAlteracaoCreate(BaseModel):
    obra: int = Field(..., gt=0)
    op: int = Field(..., gt=0)
    sub_item: Optional[int] = Field(None, ge=0)
    requester_info: str = Field(..., min_length=3)
    reason: str = Field(..., min_length=10)
    
    item_adicionado: Optional[MaterialInfoCreate] = None
    item_removido: Optional[MaterialInfoCreate] = None

    @model_validator(mode='after')
    def validate_model_data(self):
        
        item_add = self.item_adicionado
        item_rem = self.item_removido
        
        # Validação de existência (continua a mesma)
        if not item_add and not item_rem:
            raise ValueError('Pelo menos um item (adicionado ou removido) deve ser fornecido.')

        # Validação de qualidade dos dados (continua a mesma)
        if item_add and (item_add.material_description.lower() == 'string' or item_add.quantity <= 0):
             raise ValueError("Dados inválidos fornecidos para o item a ser adicionado.")
        
        if item_rem and (item_rem.material_description.lower() == 'string' or item_rem.quantity <= 0):
            raise ValueError("Dados inválidos fornecidos para o item a ser removido.")

        # --- <<< NOVA LÓGICA DE COMPARAÇÃO AQUI >>> ---
        # 1. Verifica se é uma operação de "Substituir" (ambos os itens foram fornecidos)
        if item_add and item_rem:
            # 2. Compara os itens. A melhor forma é pelo 'material_code', se existir.
            #    Se não, usamos a descrição como fallback.
            
            # Checa pelo código do material (mais preciso)
            if (item_add.material_code and item_rem.material_code and
                    item_add.material_code == item_rem.material_code):
                raise ValueError(
                    f"Substituição inválida: O código do material a ser adicionado "
                    f"('{item_add.material_code}') é o mesmo do a ser removido."
                )
            
            # Checa pela descrição (caso o código não seja preenchido)
            if item_add.material_description == item_rem.material_description:
                 raise ValueError(
                    f"Substituição inválida: A descrição do material a ser adicionado "
                    f"é a mesma do a ser removido."
                )
        
        # Se todas as validações passaram, retorna a instância do modelo
        return self
        
        

# Schema para a LEITURA (resposta da API)
# Esta é a versão unificada e correta
class ComunicadoAlteracao(BaseModel):
    id: int
    status: StatusCA
    creation_date: datetime
    completion_date: Optional[datetime] = None
    obra: int
    op: int
    sub_item: Optional[int]
    requester_info: str
    reason: str
    
    item_adicionado: Optional[MaterialInfo] = None
    item_removido: Optional[MaterialInfo] = None
    
    # Adicionando a lista de movimentos
    movimentos: List[MovimentoEstoque] = []

    class Config:
        from_attributes = True

# --- 3. Schemas de Ações e Paginação ---

# Schema para ATUALIZAR O STATUS de um item de alteração (aqui o nome antigo era melhor)
class ItemAlteracaoStockStatusUpdate(BaseModel):
    stock_status: Literal[
        "Verificado - Em Estoque", 
        "Verificado - Compra Necessária",
        "Retirada Registrada",
        "Retirada Pendente",
        "Devolvido ao Estoque",
    ] = Field(..., description="O novo status de estoque para o item.")

# Schema para CRIAR UM MOVIMENTO de estoque
class MovimentoEstoqueCreate(BaseModel):
    ca_id: int
    item_description: str
    quantity_moved: int = Field(..., gt=0)
    movement_type: Literal["SAIDA_DA_OBRA", "ENTRADA_NO_ALMOXARIFADO", "DESCARTE"]
    destination_stock: Optional[str] = None
    executed_by: str = Field(..., min_length=2)

# Schema para a resposta paginada
class PaginatedCA(BaseModel):
    items: List[ComunicadoAlteracao]
    total: int