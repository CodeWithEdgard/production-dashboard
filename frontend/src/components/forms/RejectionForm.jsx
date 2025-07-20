// frontend/src/components/forms/RejectionForm.jsx
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RejectionForm({ item, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    rejectedBy: '', // Poderia ser pré-preenchido com o nome do usuário logado
    rejectionReason: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.rejectionReason.trim()) {
        alert("A justificativa é obrigatória.");
        return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/20">
        <h4 className="font-semibold">Rejeitando Entrada</h4>
        <p className="text-sm text-muted-foreground">NF: {item.nfNumber}</p>
        <p className="text-sm text-muted-foreground">Fornecedor: {item.supplier}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="rejectedBy">Seu Nome (Rejeitado por)</Label>
        <Input id="rejectedBy" value={formData.rejectedBy} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rejectionReason">Justificativa da Rejeição (Obrigatório)</Label>
        <Textarea 
            id="rejectionReason" 
            value={formData.rejectionReason} 
            onChange={handleChange} 
            required 
            placeholder="Ex: Nota fiscal cancelada, veículo sem agendamento, etc." 
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="destructive" disabled={isSubmitting}>
          {isSubmitting ? 'Confirmando...' : 'Confirmar Rejeição'}
        </Button>
      </div>
    </form>
  );
}