// frontend/src/components/forms/RequisitionForm.jsx
import React, { useState } from "react";

// --- Componentes de UI do Shadcn ---
import { Label } from "@/components/ui/label.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";

export function RequisitionForm({ onSubmit, onCancel, isSubmitting }) {
  // Estado para controlar os valores dos campos do formulário
  const [formData, setFormData] = useState({
    requestedBy: "",
    orderNumber: "",
    materialDescription: "",
  });

  // Handler genérico para atualizar o estado quando o usuário digita
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handler para a submissão do formulário
  const handleSubmit = (e) => {
    e.preventDefault(); // Previne o recarregamento da página

    // Chama a função 'onSubmit' passada pelo componente pai, enviando os dados
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {/* Campo: Solicitante */}
      <div className="space-y-2">
        <Label htmlFor="requestedBy">Seu Nome (Solicitante)</Label>
        <Input
          id="requestedBy"
          value={formData.requestedBy}
          onChange={handleChange}
          placeholder="Ex: João da Silva"
          required
        />
      </div>

      {/* Campo: Ordem de Produção */}
      <div className="space-y-2">
        <Label htmlFor="orderNumber">Ordem de Produção (OP)</Label>
        <Input
          id="orderNumber"
          value={formData.orderNumber}
          onChange={handleChange}
          placeholder="Ex: OP-2025-101"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="obra">Obra*</Label>
          <Input
            id="obra"
            type="number"
            value={formData.obra}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sub_item">Sub-item (Opcional)</Label>
          <Input
            id="sub_item"
            type="number"
            value={formData.sub_item}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Campo: Descrição do Material */}
      <div className="space-y-2">
        <Label htmlFor="materialDescription">Material Necessário</Label>
        <Textarea
          id="materialDescription"
          value={formData.materialDescription}
          onChange={handleChange}
          required
          placeholder="Descreva o material com o máximo de detalhes possível (código, nome, dimensões, etc.)"
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Requisição"}
        </Button>
      </div>
    </form>
  );
}
