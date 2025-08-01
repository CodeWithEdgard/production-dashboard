// frontend/src/components/forms/StockMovementForm.jsx
import React, { useState } from 'react';
import { Label } from "@/components/ui/label.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";


export function StockMovementForm({ item, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    destination_stock: 'Almoxarifado Central',
    quantity_moved: item.quantity,
    executed_by: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handler específico para o Select
  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, destination_stock: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.executed_by.trim()) {
      alert("O campo 'Executado Por' é obrigatório.");
      return;
    }
    const finalData = {
      ...formData,
      quantity_moved: parseInt(formData.quantity_moved, 10),
    };
    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {/* O campo de seleção que deveria aparecer */}
      <div className="space-y-2">
        <Label htmlFor="destination_stock">Estoque de Destino</Label>
        <Select onValueChange={handleSelectChange} defaultValue={formData.destination_stock}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o destino..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Almoxarifado Central">Almoxarifado Central</SelectItem>
            <SelectItem value="Estoque de Manutenção">Estoque de Manutenção</SelectItem>
            <SelectItem value="Sucata">Sucata / Descarte</SelectItem>
            <SelectItem value="Devolução ao Fornecedor">Devolução ao Fornecedor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity_moved">Quantidade Devolvida</Label>
        <Input id="quantity_moved" type="number" value={formData.quantity_moved} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="executed_by">Executado Por</Label>
        <Input id="executed_by" value={formData.executed_by} onChange={handleChange} required placeholder="Seu nome" />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Confirmar'}</Button>
      </div>
    </form>
  );
}