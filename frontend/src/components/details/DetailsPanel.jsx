// frontend/src/components/details/DetailsPanel.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComunicadoAlteracaoById } from '../../api.js';

import { Skeleton } from "@/components/ui/skeleton.jsx";
import { DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer.jsx";
// O componente CADetailsView que criamos antes, para exibir os itens
import { CADetailsView } from './CADetailsView.jsx';

// Este componente recebe o ID do C.A. para buscar os dados.
export function DetailsPanel({ caId, onClose }) {
  const { data: ca, isLoading, isError, error } = useQuery({
    // A query só é executada se caId tiver um valor.
    enabled: !!caId,
    // A chave inclui o ID para que cada C.A. tenha seu próprio cache.
    queryKey: ['comunicado', caId], 
    queryFn: () => getComunicadoAlteracaoById(caId),
  });

  // Se não houver caId (o Drawer está fechando), não renderiza nada
  if (!caId) return null;

  return (
    <div className="mx-auto w-full max-w-4xl h-[90vh] flex flex-col p-4">
      {isLoading && <Skeleton className="h-full w-full rounded-lg" />}
      {isError && <div className="p-8 text-red-500 text-center">Erro ao carregar C.A.: {error.message}</div>}
      
      {ca && (
        <>
          <DrawerHeader>
            <DrawerTitle>{ca.title || `Comunicado de Alteração #${ca.id}`}</DrawerTitle>
            <DrawerDescription>
              Obra: {ca.obra} | OP: {ca.op} | Status: {ca.status}
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">
            <CADetailsView item={ca} />
            
            {/* Futuramente, os botões de ação do almoxarife virão aqui */}
            {/* Ex: <StockAnalysisActions ca={ca} /> */}
          </div>
        </>
      )}
    </div>
  );
}