// frontend/src/components/details/CADetailsView.jsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { ArrowDown, ArrowUp } from 'lucide-react';


// --- Componente auxiliar para um campo de detalhe (Label + Valor) ---
const DetailField = ({ label, value, children }) => (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="text-base">{children || value || '-'}</div>
    </div>
);

// --- Componente auxiliar para um card de item (Adicionar ou Remover) ---
const ItemDetailsCard = ({ title, itemData, icon, colorClass }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className={`text-xl font-bold ${colorClass}`}>{itemData.quantity}x {itemData.material_description}</div>
            <p className="text-xs text-muted-foreground">
                Código: {itemData.material_code || "N/A"} | Marca: {itemData.brand || "N/A"}
            </p>
        </CardContent>
    </Card>
);

// --- O Componente Principal ---
export function CADetailsView({ item }) {
  // Extrai os itens para facilitar o acesso e a legibilidade
  const addedItem = item.item_adicionado;
  const removedItem = item.item_removido;

  return (
    <div className="space-y-6">
      
      {/* --- SEÇÃO 1: DETALHES DA SOLICITAÇÃO --- */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold text-lg border-b pb-2">Detalhes da Solicitação</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailField label="Obra">{item.obra}</DetailField>
          <DetailField label="Ordem de Produção">{item.op}</DetailField>
          <DetailField label="Sub-item">{item.sub_item}</DetailField>
          <DetailField label="Requisitante">{item.requester_info}</DetailField>
        </div>
        <div className="col-span-full">
            <DetailField label="Motivo da Alteração">
                <p className="text-base font-normal bg-muted p-3 rounded-md">{item.reason}</p>
            </DetailField>
        </div>
      </div>

      {/* --- SEÇÃO 2: ITENS DA ALTERAÇÃO --- */}
      <div className="space-y-4 p-4 border rounded-lg">
         <h3 className="font-semibold text-lg border-b pb-2">Itens da Alteração</h3>
         <div className="grid gap-4 md:grid-cols-2">
            {addedItem && (
                <ItemDetailsCard 
                    title="Item a ser Adicionado"
                    itemData={addedItem} 
                    icon={<ArrowUp className="h-4 w-4 text-muted-foreground"/>}
                    colorClass="text-green-600"
                />
            )}
            {removedItem && (
                <ItemDetailsCard 
                    title="Item a ser Removido"
                    itemData={removedItem} 
                    icon={<ArrowDown className="h-4 w-4 text-muted-foreground"/>}
                    colorClass="text-red-600"
                />
            )}
         </div>
      </div>
      
      {/* --- SEÇÃO 3: ÁREA DE AÇÕES (Para o Almoxarife) --- */}
      <div className="space-y-4 p-4 border rounded-lg">
         <h3 className="font-semibold text-lg border-b pb-2">Análise de Estoque</h3>
         {/* 
            Este é o espaço reservado para o futuro. 
            Aqui entrarão os botões e formulários para o almoxarife 
            atualizar o status de cada item.
         */}
         <div className="text-center text-muted-foreground p-8">
            (Área de ações do almoxarife aparecerá aqui)
         </div>
      </div>

    </div>
  );
}