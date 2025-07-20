// frontend/src/components/forms/ResolvePendencyForm.jsx
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ResolvePendencyForm({ item, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    resolvedBy: '',
    resolutionNotes: '',
    finalStatus: 'Conferido', // Padrão
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/20">
        <p className="text-sm">Tratativa para NF: <span className="font-semibold">{item.nfNumber}</span></p>
        <p className="text-sm text-red-600">Problema: <span className="font-semibold">{item.details?.issueType}</span></p>
        {item.details?.issueDescription && (
          <p className="text-sm mt-2">
            <span className="font-semibold">Descrição do Conferente:</span> "{item.details.issueDescription}"
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="resolvedBy">Resolvido por</Label>
        <Input id="resolvedBy" value={formData.resolvedBy} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="resolutionNotes">Descrição da Tratativa</Label>
        <Textarea id="resolutionNotes" value={formData.resolutionNotes} onChange={handleChange} required placeholder="Descreva como o problema foi resolvido..." />
      </div>
      <div className="space-y-2">
        <Label>Status Final</Label>
        <Select onValueChange={(value) => setFormData(prev => ({...prev, finalStatus: value}))} defaultValue={formData.finalStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Conferido">Conferido (Problema Resolvido)</SelectItem>
            <SelectItem value="Rejeitado">Rejeitado (Material Devolvido)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Tratativa'}
        </Button>
      </div>
    </form>
  );
}