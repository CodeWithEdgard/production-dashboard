// frontend/src/components/toolbars/ReceivingToolbar.jsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Componente "burro": recebe o estado dos filtros e as funções para atualizá-los
export function ReceivingToolbar({ filters, setFilters }) {
  
  const handleInputChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status: status === 'all' ? '' : status, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', status: '', page: 1 });
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-muted/50">
      <Input
        placeholder="Buscar por NF, Fornecedor ou Pedido..."
            value={filters.search}
            onChange={handleInputChange}
            className="max-w-sm"
      />
      <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          <SelectItem value="Aguardando Conferência">Aguardando Conferência</SelectItem>
          <SelectItem value="Conferido">Conferido</SelectItem>
          <SelectItem value="Pendente">Pendente</SelectItem>
          <SelectItem value="Rejeitado">Rejeitado</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.isClientMaterial || 'all'} onValueChange={(value) => setFilters(prev => ({...prev, isClientMaterial: value, page: 1}))}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de Material" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Materiais</SelectItem>
          <SelectItem value="true">Do Cliente</SelectItem>
          
        </SelectContent>
      </Select>
      <Button variant="ghost" onClick={clearFilters}>Limpar</Button>
    </div>
  );
}