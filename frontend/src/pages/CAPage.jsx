// frontend/src/pages/CAPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { getComunicadosAlteracao, createComunicadoAlteracao, getComunicadoAlteracaoById } from '../api.js';

import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { KanbanColumn } from '@/components/kanban/KanbanColumn.jsx';
import { CACreateForm } from '@/components/forms/CACreateForm.jsx';
import { DetailsPanel } from '@/components/details/DetailsPanel.jsx';

export function CAPage() {
  const queryClient = useQueryClient();
  
  // Estados para controlar os painéis (drawers)
  const [isCreateDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [viewingCAId, setViewingCAId] = useState(null);

  // Query para buscar os dados do Kanban
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['comunicados_kanban'],
    queryFn: () => getComunicadosAlteracao({ page: 1, page_size: 500 }),
  });

  // Lógica de filtro para o Kanban
  const allItems = data?.items || [];
  const pendingAnalysisItems = allItems.filter(item => item.status === "Pendente de Análise de Estoque");
  const awaitingPurchaseItems = allItems.filter(item => item.status === "Aguardando Compra");
  const readyForExecutionItems = allItems.filter(item => item.status === "Pronto para Execução");

  // --- Mutação para CRIAR C.A. ---
  const createCAMutation = useMutation({
    mutationFn: createComunicadoAlteracao,
    onSuccess: (newData) => {
      queryClient.invalidateQueries({ queryKey: ['comunicados_kanban'] });
      setCreateDrawerOpen(false);
      toast.success("C.A. Criado com Sucesso!");
    },
    onError: (err) => toast.error("Falha ao Criar C.A.", {
      description: err.response?.data?.detail || "Erro inesperado.",
    }),
  });

  // --- Handlers ---
  const handleCardClick = (item) => setViewingCAId(item.id);
  const handleCreateSubmit = (formData) => createCAMutation.mutate(formData);
  
  // --- Renderização ---
  if (isError) {
      return <div className="p-8 text-red-500">Erro ao carregar o painel: {error.message}</div>;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Kanban - C.A.</h1>
          <p className="text-muted-foreground">Acompanhe o fluxo de trabalho dos Comunicados de Alteração.</p>
        </div>
        <Button onClick={() => setCreateDrawerOpen(true)}>
          + Novo Comunicado
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <KanbanColumn 
                title="Análise de Estoque" 
                items={pendingAnalysisItems} 
                onCardClick={handleCardClick}
            />
            <KanbanColumn 
                title="Aguardando Compra" 
                items={awaitingPurchaseItems} 
                onCardClick={handleCardClick}
            />
            <KanbanColumn 
                title="Pronto para Execução" 
                items={readyForExecutionItems}
                onCardClick={handleCardClick} 
            />
        </div>
      )}

      {/* Drawer de CRIAÇÃO */}
      <Drawer open={isCreateDrawerOpen} onOpenChange={setCreateDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-3xl h-[90vh] flex flex-col">
            <DrawerHeader className="p-4 flex-shrink-0">
              <DrawerTitle>Novo Comunicado de Alteração</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto">
              <CACreateForm 
                onSubmit={handleCreateSubmit}
                onCancel={() => setCreateDrawerOpen(false)}
                isSubmitting={createCAMutation.isPending}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Drawer de DETALHES */}
      <Drawer open={!!viewingCAId} onOpenChange={(isOpen) => !isOpen && setViewingCAId(null)}>
        <DrawerContent>
            <DetailsPanel caId={viewingCAId} />
        </DrawerContent>
      </Drawer>
    </div>
  );
}