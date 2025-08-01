// frontend/src/components/details/ItemActionRow.jsx
import React from 'react';
import { Button } from '@/components/ui/button.jsx';
import { ArrowUp, ArrowDown } from 'lucide-react';

export function ItemActionRow({ item, onUpdateStatus, onRegisterMovement }) {
  const isAdd = item.action_type === 'ADICIONAR';
  const isPending = item.stock_status === 'Pendente de Verificação';

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        {isAdd ? <ArrowUp className="h-6 w-6 text-green-500"/> : <ArrowDown className="h-6 w-6 text-red-500"/>}
        <div>
          <p className="font-semibold">{item.quantity}x {item.material_description}</p>
          <p className="text-sm text-muted-foreground">Status: <span className="font-medium">{item.stock_status}</span></p>
        </div>
      </div>
      <div className="flex gap-2">
        {isAdd && isPending && (
          <>
            <Button size="sm" onClick={() => onUpdateStatus(item.id, 'Verificado - Compra Necessária')}>🛒 Enviar p/ Compras</Button>
            <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(item.id, 'Verificado - Em Estoque')}>✅ Em Estoque</Button>
          </>
        )}
        {!isAdd && item.stock_status !== "Devolvido ao Estoque" && (
          <Button size="sm" onClick={() => onRegisterMovement(item)}>↪️ Registrar Devolução</Button>
        )}
      </div>
    </div>
  );
}