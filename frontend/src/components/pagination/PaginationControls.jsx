// frontend/src/components/pagination/PaginationControls.jsx
import React from 'react';
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 10; // Deve ser o mesmo que o page_size do backend

export function PaginationControls({ totalItems, currentPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) return null; // Não mostra nada se só tem uma página

  return (
    <div className="flex items-center justify-end gap-2 mt-4">
      <span>Página {currentPage} de {totalPages}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Próxima
      </Button>
    </div>
  );
}