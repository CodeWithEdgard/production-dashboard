// frontend/src/pages/ReceivingPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecebimentos, createRecebimento, updateRecebimento, resolveRecebimento, rejectRecebimentoEntry } from '../api';

// --- Nossos Componentes ---
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReceivingRegistrationForm } from '@/components/forms/ReceivingRegistrationForm';
import { ReceivingLogTable } from '@/components/tables/ReceivingLogTable';
import { ConferenceForm } from '@/components/forms/ConferenceForm';
import { ReceivingDetailsView } from '@/components/details/ReceivingDetailsView';
import { ReceivingToolbar } from '@/components/toolbars/ReceivingToolbar';
import { PaginationControls } from '@/components/pagination/PaginationControls';
import { ResolvePendencyForm } from '@/components/forms/ResolvePendencyForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RejectionForm } from '@/components/forms/RejectionForm';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ReceivingPage() {
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState({ type: null, data: null });
  const [itemToResolve, setItemToResolve] = useState(null);
  const [itemToConfirm, setItemToConfirm] = useState(null);
  const [itemToReject, setItemToReject] = useState(null);
  const [itemToConference, setItemToConference] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    isClientMaterial: 'all',
    page: 1,
  });

  // <<< A QUERY CORRETA E REATIVA >>>
  const { data, isLoading, isError, error } = useQuery({
    // A chave da query INCLUI o objeto de filtros.
    // Sempre que 'filters' mudar, o TanStack buscará os novos dados.
    queryKey: ['recebimentos', filters],
    // A função de busca RECEBE os filtros atuais.
    queryFn: () => getRecebimentos(filters),
    // Melhora a experiência do usuário, mantendo os dados antigos visíveis durante a recarga.
    placeholderData: (previousData) => previousData,
  });

  // Extraímos os dados da resposta da query de forma segura.
  const receivingList = data?.items || [];
  const totalItems = data?.total || 0;

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: createRecebimento,
    onSuccess: (data) => { // 'data' é a resposta bem-sucedida da API
      // Invalida a query para que a tabela seja atualizada
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      
      // Fecha o Drawer de registro
      setActiveAction({ type: null, data: null });

      // <<< ADICIONADO: Feedback de sucesso >>>
      toast.success("Recebimento Registrado!", {
          description: `A Nota Fiscal nº ${data.nfNumber} foi registrada e enviada para conferência.`,
      });
    },
    onError: (err) => {
      // Usa o 'toast' de erro que já implementamos
      toast.error("Falha ao Registrar", {
          description: err.response?.data?.detail || "Ocorreu um erro inesperado.",
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: updateRecebimento,
    onSuccess: (data) => {
      // Invalida a query para que a tabela seja atualizada
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      
      // Fecha o Drawer de conferência
      setActiveAction({ type: null, data: null });
      
      // <<< ADICIONADO: Feedback de sucesso >>>
      toast.success("Conferência Concluída!", {
          description: `O recebimento da NF nº ${data.nfNumber} foi atualizado para o status: ${data.status}.`,
      });
    },
    onError: (err) => {
      toast.error("Falha ao Salvar Conferência", {
          description: err.response?.data?.detail || "Ocorreu um erro inesperado.",
      });
    },
  });

  // --- Handlers ---
  const handleSaveRegistration = (formData) => createMutation.mutate(formData);
  const handleSaveConference = (conferenceData) => {
    updateMutation.mutate({ id: activeAction.data.id, data: conferenceData });
  };
  const handleStartConference = (item) => setItemToConfirm(item);

  const handleInitiateRejection = () => {
    setItemToReject(itemToConfirm); 
    setItemToConfirm(null);         
  };
  

  const resolveMutation = useMutation({
  mutationFn: resolveRecebimento,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
    setItemToResolve(null); 
  },
  onError: (err) => toast.error("Erro", { description: err.response?.detail || "Ocorreu um erro inesperado.",})
});

  const handleSaveResolution = (resolutionData) => {
  resolveMutation.mutate({ id: itemToResolve.id, data: resolutionData });
};

const handleRejectEntry = () => {
    // Pede uma justificativa ao usuário
    const reason = prompt("Por favor, digite o motivo da rejeição:");
    if (reason && reason.trim() !== "") {
      const rejectData = {
        rejectedBy: "Usuário do Frontend", 
        rejectionReason: reason,
      };
      rejectMutation.mutate({ id: itemToConference.id, data: rejectData });
    } else if (reason !== null) { // Evita alerta se o usuário clicou em "Cancelar"
      alert("A justificativa é obrigatória para rejeitar uma entrada.");
    }
  };
  
  // A função que avança para a conferência
  const handleProceedToConference = () => {
    setActiveAction({ type: 'CONFERENCE', data: itemToConfirm });
    setItemToConfirm(null);
  };

  const handleConfirmRejection = (rejectionData) => {
    rejectMutation.mutate({ id: itemToReject.id, data: rejectionData });
  };

  const rejectMutation = useMutation({
    mutationFn: rejectRecebimentoEntry,
    onSuccess: () => {
      // 1. Invalida a query para que a tabela seja atualizada com o novo status
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      
      // <<< A LINHA QUE FALTAVA ESTÁ AQUI >>>
      // 2. Atualiza o estado da UI para fechar o Dialog de Rejeição
      setItemToReject(null); 
      
      // 3. (Bônus) Dá um feedback visual de sucesso para o usuário
      toast.success("Entrada rejeitada com sucesso!");
    },
    onError: (err) => {
        toast.error("Falha ao Rejeitar", {
            description: err.response?.data?.detail || "Ocorreu um erro inesperado.",
        });
    },
  });
  

  if (isError) return <div className="p-8 text-red-500">Erro: {error.message}</div>;
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recebimento de Materiais</h1>
        
        <div className="flex items-center ... gap-2">

        <Button onClick={() => setActiveAction({ type: 'REGISTER', data: null })}>
          + Registrar Novo Recebimento
        </Button>

      </div>
        
        </div>
      
      {/* A toolbar recebe e atualiza o estado dos filtros */}
      <ReceivingToolbar filters={filters} setFilters={setFilters} />
      
      <div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            <ReceivingLogTable 
              data={receivingList}
              
              onViewDetails={(item) => setActiveAction({ type: 'DETAILS', data: item })}
              onResolvePendency={(item) => setItemToResolve(item)}
              onStartConference={handleStartConference}
            />
            {/* A paginação recebe e atualiza a página no estado dos filtros */}
            <PaginationControls
              currentPage={filters.page}
              totalItems={totalItems}
              onPageChange={(newPage) => setFilters(prev => ({ ...prev, page: newPage }))}
            />
          </>
        )}
      </div>

      {/* Os Drawers continuam funcionando exatamente da mesma forma */}
      <Drawer open={!!activeAction.type} onOpenChange={(isOpen) => !isOpen && setActiveAction({ type: null, data: null })}>
          <DrawerContent>
             <div className="mx-auto w-full max-w-2xl p-4">
               {activeAction.type === 'REGISTER' && (
                 <>
                  <DrawerHeader><DrawerTitle>Registro de Entrada</DrawerTitle></DrawerHeader>
                  <ReceivingRegistrationForm 
                    onSubmit={handleSaveRegistration}
                    onCancel={() => setActiveAction({ type: null, data: null })}
                    isSubmitting={createMutation.isPending}
                  />
                 </>
               )}
               {activeAction.type === 'CONFERENCE' && (
                 <>
                  <DrawerHeader><DrawerTitle>Conferência de Recebimento</DrawerTitle></DrawerHeader>
                  <ConferenceForm
                    initialData={activeAction.data}
                    onSubmit={handleSaveConference}
                    onCancel={() => setActiveAction({ type: null, data: null })}
                    isSubmitting={updateMutation.isPending}
                  />
                 </>
               )}
               {activeAction.type === 'DETAILS' && (
                 <>
                  <DrawerHeader><DrawerTitle>Detalhes do Recebimento: NF {activeAction.data.nfNumber}</DrawerTitle></DrawerHeader>
                  <ReceivingDetailsView item={activeAction.data} />
                 </>
               )}
             </div>
          </DrawerContent>
        </Drawer>

        <Dialog open={!!itemToResolve} onOpenChange={(isOpen) => !isOpen && setItemToResolve(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Tratativa de Pendência</DialogTitle>
            <DialogDescription>
              Descreva a solução aplicada para o problema identificado na NF {itemToResolve?.nfNumber}.
            </DialogDescription>
          </DialogHeader>
          {itemToResolve && (
            <ResolvePendencyForm
              item={itemToResolve}
              onSubmit={handleSaveResolution}
              onCancel={() => setItemToResolve(null)}
              isSubmitting={resolveMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToConfirm} onOpenChange={(isOpen) => !isOpen && setItemToConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar Conferência?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirme os dados de entrada antes de prosseguir. Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-sm p-4 border rounded-lg bg-muted/50 space-y-2">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="font-semibold">Nº NF:</p>
      <p>{itemToConfirm?.nfNumber}</p>
    </div>
    <div>
      <p className="font-semibold">Fornecedor:</p>
      <p>{itemToConfirm?.supplier}</p>
    </div>
    <div>
      <p className="font-semibold">Nº Pedido:</p>
      <p>{itemToConfirm?.orderNumber || 'N/A'}</p>
    </div>
    <div>
      <p className="font-semibold">Valor da NF:</p>
      <p>{formatCurrency(itemToConfirm?.nfValue)}</p>
    </div>
    <div>
      <p className="font-semibold">Volume Declarado:</p>
      <p>{itemToConfirm?.nfVolume || 'N/A'}</p>
    </div>
    <div>
      <p className="font-semibold">Recebido por:</p>
      <p>{itemToConfirm?.receivedBy || 'N/A'}</p>
    </div>
  </div>
  <div>
      <p className="font-semibold">Data de Entrada:</p>
      <p>{formatDateTime(itemToConfirm?.entryDate)}</p>
  </div>
</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={handleInitiateRejection}>Rejeitar Entrada</Button>
            <AlertDialogAction onClick={handleProceedToConference}>Confirmar e Iniciar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!itemToReject} onOpenChange={(isOpen) => !isOpen && setItemToReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Entrada</DialogTitle>
            <DialogDescription>
              Forneça a justificativa para a rejeição desta nota fiscal.
            </DialogDescription>
          </DialogHeader>
          {itemToReject && (
            <RejectionForm
              item={itemToReject}
              onSubmit={handleConfirmRejection}
              onCancel={() => setItemToReject(null)}
              isSubmitting={rejectMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      


    </div>
  );
}