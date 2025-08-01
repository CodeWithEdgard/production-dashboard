// frontend/src/components/kanban/KanbanColumn.jsx

import React from 'react';
// Nós removemos o 'Card' daqui pois ele não é mais usado diretamente na coluna
import { CACard } from './CACard.jsx';

/**
 * Componente que renderiza uma coluna no painel Kanban.
 * @param {string} title - O título da coluna.
 * @param {Array} items - A lista de C.A.s a serem exibidos nesta coluna.
 * @param {function} onCardClick - A função a ser chamada quando um card é clicado.
 */
export function KanbanColumn({ title, items = [], onCardClick }) {
  return (
    // Contêiner principal da coluna
    <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg min-h-[200px]">
      
      {/* Cabeçalho da coluna com o título e a contagem de itens */}
      <h3 className="font-semibold text-lg tracking-tight">{title} ({items.length})</h3>
      
      {/* Contêiner para os cards, com espaçamento vertical */}
      <div className="flex flex-col gap-2">
        {items.length > 0 ? (
          // Se houver itens, mapeia cada um para um componente CACard
          items.map(item => (
            <CACard 
              key={item.id} 
              item={item}
              // Passa a função de clique para o card, envolvendo-a para enviar o item específico
              onClick={() => onCardClick(item)} 
            />
          ))
        ) : (
          // <<< O CÓDIGO QUE FALTAVA ESTÁ AQUI >>>
          // Se não houver itens, exibe uma mensagem de placeholder
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md">
            <p className="text-sm text-muted-foreground">
              Nenhum item nesta fila.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}