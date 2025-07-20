// frontend/src/components/forms/ConferenceForm.jsx

import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ConferenceForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  
  // Estado para os campos que o conferente preenche
  const [conferredBy, setConferredBy] = useState('');

  // Um único estado para todos os campos aninhados em 'details'
  const [details, setDetails] = useState({
    expectedDate: new Date().toISOString().split('T')[0], // Pega a data de hoje como padrão
    deliveryDate: new Date().toISOString().split('T')[0], // Pega a data de hoje como padrão
    punctual: true, // Será calculado automaticamente
    supplierNote: '',
    issueType: 'sem pendência',
    issueDescription: '',
    //issueResolved: false,
    isClientMaterial: false,
    refusedMaterial: false,
  });

  // Efeito que recalcula a pontualidade sempre que as datas mudam
  useEffect(() => {
    try {
      const expected = new Date(details.expectedDate);
      const delivered = new Date(details.deliveryDate);
      setDetails(prev => ({ ...prev, punctual: delivered <= expected }));
    } catch (e) {
      // Evita erros se a data for inválida durante a digitação
      setDetails(prev => ({ ...prev, punctual: false }));
    }
  }, [details.expectedDate, details.deliveryDate]);
  
  // Handler genérico para a maioria dos inputs
  const handleDetailsChange = (e) => {
    const { id, value, type, checked } = e.target;
    setDetails(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!conferredBy) {
      alert("O campo 'Conferido Por' é obrigatório.");
      return;
    }
    // Monta o objeto final no formato exato que a API espera (RecebimentoUpdate)
    const finalPayload = {
      conferredBy: conferredBy,
      details: {
        ...details,
        // Garante que as datas sejam enviadas no formato ISO, esperado pelo Pydantic/datetime
        expectedDate: new Date(details.expectedDate).toISOString(),
        deliveryDate: new Date(details.deliveryDate).toISOString(),
      }
    };
    onSubmit(finalPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/20">
        <h3 className="font-semibold text-lg">NF: {initialData.nfNumber}</h3>
        <p className="text-sm text-muted-foreground">Fornecedor: {initialData.supplier}</p>
      </div>

      <div className="p-4 border rounded-lg space-y-4">
        <h4 className="text-md font-semibold border-b pb-2">Detalhes da Conferência</h4>
        
        <div className="space-y-2">
          <Label htmlFor="conferredBy">Conferido Por</Label>
          <Input id="conferredBy" value={conferredBy} onChange={(e) => setConferredBy(e.target.value)} placeholder="Seu nome" required />
        </div>

        {/* --- SEÇÃO PONTUALIDADE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="expectedDate">Data Prevista</Label>
                <Input id="expectedDate" type="date" value={details.expectedDate} onChange={handleDetailsChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="deliveryDate">Data da Entrega Real</Label>
                <Input id="deliveryDate" type="date" value={details.deliveryDate} onChange={handleDetailsChange} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="supplierNote">Observação de Pontualidade</Label>
            <Textarea id="supplierNote" value={details.supplierNote} onChange={handleDetailsChange} placeholder="Ex: Atrasou devido à chuva." />
        </div>

        {/* --- SEÇÃO QUALIDADE E MATERIAL --- */}
        <div className="space-y-2">
            <Label htmlFor="issueType">Pendência de Qualidade</Label>
             <Select onValueChange={(value) => setDetails(prev => ({...prev, issueType: value}))} defaultValue={details.issueType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem pendência">Sem Pendência</SelectItem>
                  <SelectItem value="avaria">Avaria</SelectItem>
                  <SelectItem value="item errado">Item Errado</SelectItem>
                  <SelectItem value="quantidade incorreta">Quantidade Incorreta</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {details.issueType !== 'sem pendência' && (
          <div className="space-y-2">
            <Label htmlFor="issueDescription">Descreva a Pendência</Label>
            <Textarea 
              id="issueDescription" 
              value={details.issueDescription} 
              onChange={handleDetailsChange} // Reutiliza o handler genérico
              placeholder="Ex: Caixa amassada, item arranhado, vieram 10 ao invés de 12."
              required // Torna o campo obrigatório se uma pendência for selecionada
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="issueResolved" checked={details.issueResolved} onCheckedChange={(checked) => setDetails(prev => ({...prev, issueResolved: checked}))} />
                <Label htmlFor="issueResolved">Pendência resolvida?</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="isClientMaterial" checked={details.isClientMaterial} onCheckedChange={(checked) => setDetails(prev => ({...prev, isClientMaterial: checked}))} />
                <Label htmlFor="isClientMaterial">Material do Cliente?</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="refusedMaterial" checked={details.refusedMaterial} onCheckedChange={(checked) => setDetails(prev => ({...prev, refusedMaterial: checked}))} />
                <Label htmlFor="refusedMaterial">Material foi recusado?</Label>
            </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Concluir Conferência'}
        </Button>
      </div>
    </form>
  );
}