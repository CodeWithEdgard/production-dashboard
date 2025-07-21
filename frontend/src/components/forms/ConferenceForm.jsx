// frontend/src/components/forms/ConferenceForm.jsx

import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils.js";

// --- Importação dos componentes de UI necessários ---
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// <<< Novos componentes para o DatePicker >>>
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// --- Componente auxiliar para o DatePicker ---
function DatePicker({ date, onDateChange }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus />
      </PopoverContent>
    </Popover>
  );
}

export function ConferenceForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  
  const [conferredBy, setConferredBy] = useState('');

  // <<< MUDANÇA: O estado agora usa objetos Date >>>
  const [details, setDetails] = useState({
    // Inicia com objetos Date, não com strings
    expectedDate: new Date(), 
    deliveryDate: new Date(),
    punctual: true,
    issueType: 'sem pendência',
    issueDescription: '',
    isClientMaterial: false,
    refusedMaterial: false,
  });

  useEffect(() => {
    // A lógica de pontualidade fica mais simples
    if (details.expectedDate && details.deliveryDate) {
        setDetails(prev => ({ ...prev, punctual: prev.deliveryDate <= prev.expectedDate }));
    }
  }, [details.expectedDate, details.deliveryDate]);
  
  // Handler genérico para Select, Checkbox, Textarea, etc.
  const handleDetailsChange = (key, value) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!conferredBy) { /* ... */ }

    const finalPayload = {
      conferredBy: conferredBy,
      details: {
        ...details,
        // Converte os objetos Date para strings ISO na hora de enviar
        expectedDate: details.expectedDate.toISOString(),
        deliveryDate: details.deliveryDate.toISOString(),
      }
    };
    onSubmit(finalPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... (Cabeçalho com NF e Fornecedor, campo 'Conferido Por') ... */}
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


        {/* --- <<< SEÇÃO PONTUALIDADE ATUALIZADA >>> --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="expectedDate">Data Prevista</Label>
                <DatePicker 
                  date={details.expectedDate}
                  onDateChange={(newDate) => handleDetailsChange('expectedDate', newDate)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="deliveryDate">Data da Entrega Real</Label>
                <DatePicker 
                  date={details.deliveryDate}
                  onDateChange={(newDate) => handleDetailsChange('deliveryDate', newDate)}
                />
            </div>
        </div>

        {/* --- SEÇÃO QUALIDADE E MATERIAL --- */}
        <div className="space-y-2">
            <Label htmlFor="issueType">Pendência de Qualidade</Label>
             <Select onValueChange={(value) => handleDetailsChange('issueType', value)} defaultValue={details.issueType}>
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
              onChange={(e) => handleDetailsChange('issueDescription', e.target.value)}
              required 
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="isClientMaterial" checked={details.isClientMaterial} onCheckedChange={(checked) => handleDetailsChange('isClientMaterial', checked)} />
                <Label htmlFor="isClientMaterial">Material do Cliente?</Label>
            </div>
            {/* O Checkbox 'refusedMaterial' está aqui, apenas ocultado se você o comentou */}
            {/* ... */}
        </div>
      </div>
      
      {/* ... (Botões de Ação do Formulário) ... */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Concluir Conferência'}
        </Button>
      </div>
    </form>
  );
}