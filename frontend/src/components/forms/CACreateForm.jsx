// frontend/src/components/forms/CACreateForm.jsx
import React, { useState } from 'react';
import { Label } from "@/components/ui/label.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.jsx";

// Componente auxiliar reutilizável para o formulário de um item
const ItemForm = ({ title, itemData, setItemData }) => {
  const handleItemChange = (field, value) => {
    setItemData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
      <h4 className="font-semibold">{title}</h4>
      <div className="space-y-2">
        <Label>Descrição do Material*</Label>
        <Input value={itemData.material_description} onChange={(e) => handleItemChange('material_description', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantidade*</Label>
          <Input type="number" value={itemData.quantity} onChange={(e) => handleItemChange('quantity', parseInt(e.target.value, 10) || 0)} required />
        </div>
        <div className="space-y-2">
          <Label>Marca</Label>
          <Input value={itemData.brand} onChange={(e) => handleItemChange('brand', e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
          <Label>Código do Material</Label>
          <Input value={itemData.material_code} onChange={(e) => handleItemChange('material_code', e.target.value)} />
      </div>
    </div>
  );
};

export function CACreateForm({ onSubmit, onCancel, isSubmitting }) {
  // Estado para os dados principais do C.A.
  const [mainData, setMainData] = useState({ obra: '', op: '', sub_item: '', requester_info: '', reason: '' });
  
  // Estado para o tipo de ação selecionado
  const [actionType, setActionType] = useState('SUBSTITUIR'); // ACRESCENTAR, REMOVER, SUBSTITUIR
  
  // Estados para os dados dos itens
  const [addedItem, setAddedItem] = useState({ material_description: '', quantity: 1, brand: '', material_code: '' });
  const [removedItem, setRemovedItem] = useState({ material_description: '', quantity: 1, brand: '', material_code: '' });

  const handleMainChange = (e) => {
    setMainData({ ...mainData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Constrói o payload final exatamente como a API espera
    const finalPayload = {
      ...mainData,
      obra: parseInt(mainData.obra, 10),
      op: parseInt(mainData.op, 10),
      sub_item: mainData.sub_item ? parseInt(mainData.sub_item, 10) : null,
      item_adicionado: (actionType === 'ACRESCENTAR' || actionType === 'SUBSTITUIR') ? addedItem : undefined,
      item_removido: (actionType === 'REMOVER' || actionType === 'SUBSTITUIR') ? removedItem : undefined,
    };

    onSubmit(finalPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg space-y-4">
        <h4 className="font-semibold border-b pb-2">Informações da Solicitação</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="requester_info">Seu Nome*</Label><Input id="requester_info" value={mainData.requester_info} onChange={handleMainChange} required /></div>
          <div className="space-y-2"><Label htmlFor="obra">Obra*</Label><Input id="obra" type="number" value={mainData.obra} onChange={handleMainChange} required /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label htmlFor="op">Ordem de Produção*</Label><Input id="op" type="number" value={mainData.op} onChange={handleMainChange} required /></div>
          <div className="space-y-2"><Label htmlFor="sub_item">Sub-item</Label><Input id="sub_item" type="number" value={mainData.sub_item} onChange={handleMainChange} /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="reason">Motivo da Alteração*</Label><Textarea id="reason" value={mainData.reason} onChange={handleMainChange} required /></div>
      </div>

      <div className="space-y-4 text-center">
        <Label className="font-semibold">Qual ação você deseja realizar?</Label>
        <ToggleGroup type="single" value={actionType} onValueChange={(value) => value && setActionType(value)} className="justify-center">
          <ToggleGroupItem value="ACRESCENTAR">Acrescentar</ToggleGroupItem>
          <ToggleGroupItem value="SUBSTITUIR">Substituir</ToggleGroupItem>
          <ToggleGroupItem value="REMOVER">Remover</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-4">
        {(actionType === 'ACRESCENTAR' || actionType === 'SUBSTITUIR') && (
          <ItemForm title="Material a ser Adicionado" itemData={addedItem} setItemData={setAddedItem} />
        )}
        {(actionType === 'REMOVER' || actionType === 'SUBSTITUIR') && (
          <ItemForm title="Material a ser Removido" itemData={removedItem} setItemData={setRemovedItem} />
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Criar Comunicado'}</Button>
      </div>
    </form>
  );
}