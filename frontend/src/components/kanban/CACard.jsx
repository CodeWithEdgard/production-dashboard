// frontend/src/components/kanban/CACard.jsx
import React from 'react';
import { format } from 'date-fns';

// O Card é projetado para ser clicável e chamar a função que recebe via props.
export function CACard({ item, onClick }) {
  
  // Lógica para determinar o texto principal
  const addedItem = item.item_adicionado;
  const removedItem = item.item_removido;
  let primaryActionText = "Alteração";
  if (addedItem && !removedItem) primaryActionText = `Adicionar: ${addedItem.material_description}`;
  else if (!addedItem && removedItem) primaryActionText = `Remover: ${removedItem.material_description}`;
  else if (addedItem && removedItem) primaryActionText = `Substituir Item`;

  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      role="button" // Melhora a acessibilidade
      tabIndex={0}  // Permite focar com o teclado
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" title={primaryActionText}>
          {primaryActionText}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Obra: {item.obra} | OP: {item.op} | por: {item.requester_info}
        </p>
      </div>
      <div className="flex items-center space-x-4 ml-4">
        <span className="text-xs text-muted-foreground">
          {format(new Date(item.creation_date), "dd/MM/yy")}
        </span>
      </div>
    </div>
  );
}