import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// componente agora aceita duas props: onSubmit e onCancel
export function ReceivingRegistrationForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nfNumber: "",
    orderNumber: "",
    nfValue: "",
    nfVolume: "",
    supplier: "",
    receivedBy: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nfNumber || !formData.supplier) {
      alert("Por favor, preencha pelo menos o Número da NF e o Fornecedor.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nfNumber" className="text-right">
            Nº da NF
          </Label>
          <Input
            id="nfNumber"
            value={formData.nfNumber}
            onChange={handleChange}
            placeholder="Ex: 98765"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="orderNumber" className="text-right">
            Nº do Pedido
          </Label>
          <Input
            id="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
            placeholder="Ex: 9090"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nfValue" className="text-right">
            Valor NF
          </Label>
          <Input
            id="nfValue"
            value={formData.nfValue}
            onChange={handleChange}
            placeholder="Ex: 20.000"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="nfVolume" className="text-right">
            Volume
          </Label>
          <Input
            id="nfVolume"
            value={formData.nfVolume}
            onChange={handleChange}
            placeholder="Ex: 11"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="supplier" className="text-right">
            Fornecedor
          </Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Ex: Fornecedor Alpha"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="receivedBy" className="text-right">
            Recebido por
          </Label>
          <Input
            id="receivedBy"
            value={formData.receivedBy}
            onChange={handleChange}
            placeholder="Ex: João da Silva"
            className="col-span-3"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar e Enviar para Conferência</Button>
      </div>
    </form>
  );
}
