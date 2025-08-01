// frontend/src/pages/RequisitionPage.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// --- API ---
import {
  createRequisition,
  getPendingRequisitions,
  fulfillRequisition,
} from "../api.js";

// --- Componentes ---
import { Button } from "@/components/ui/button.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer.jsx";
// <<< ADICIONE AS IMPORTAÇÕES DO AlertDialog >>>
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.jsx";
import { RequisitionForm } from "@/components/forms/RequisitionForm.jsx";
import { RequisitionTable } from "@/components/tables/RequisitionTable.jsx";

const PENDING_REQUISITIONS_QUERY_KEY = ["pendingRequisitions"];

export function RequisitionPage() {
  const queryClient = useQueryClient();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // <<< NOVO ESTADO para controlar o AlertDialog de confirmação >>>
  const [requisitionToFulfill, setRequisitionToFulfill] = useState(null);

  // --- BUSCA DE DADOS ---
  const {
    data: requisitions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: PENDING_REQUISITIONS_QUERY_KEY,
    queryFn: getPendingRequisitions,
  });

  /// --- MUTAÇÃO PARA CRIAR ---
  const createMutation = useMutation({
    mutationFn: createRequisition,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PENDING_REQUISITIONS_QUERY_KEY,
      });

      setDrawerOpen(false);

      toast.success("Requisição enviada com sucesso!");
    },

    onError: (err) => {
      toast.error("Falha ao criar requisição", {
        description:
          err.response?.data?.detail || "Ocorreu um erro inesperado.",
      });
    },
  });

  // --- MUTAÇÃO PARA FINALIZAR (FULFILL) ---
  const fulfillMutation = useMutation({
    mutationFn: fulfillRequisition,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PENDING_REQUISITIONS_QUERY_KEY,
      });
      toast.success("Requisição marcada como entregue!");
    },
    onError: (err) =>
      toast.error("Falha ao finalizar", {
        description: err.response?.data?.detail || "Erro inesperado.",
      }),
  });

  // --- HANDLERS ---

  // <<< O handler para o clique na tabela agora ABRE O DIÁLOGO >>>
  const handleFulfillClick = (requisitionId) => {
    const req = requisitions.find((r) => r.id === requisitionId);
    if (req) {
      setRequisitionToFulfill(req);
    }
  };

  // <<< NOVO HANDLER que é chamado pelo BOTÃO DE CONFIRMAÇÃO do diálogo >>>
  const handleConfirmFulfill = () => {
    if (requisitionToFulfill) {
      fulfillMutation.mutate(requisitionToFulfill.id);
      setRequisitionToFulfill(null); // Fecha o diálogo
    }
  };

  const handleSubmit = (formData) => createMutation.mutate(formData);

  if (isError)
    return <div className="p-8 text-red-500">Erro: {error.message}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Requisição de Materiais Urgentes
          </h1>
          <p className="text-muted-foreground">
            Crie e acompanhe o status de suas solicitações pendentes.
          </p>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>+ Nova Requisição</Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <RequisitionTable data={requisitions} onFulfill={handleFulfillClick} />
      )}

      {/* --- Drawer de criação --- */}
      <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-2xl">
            <DrawerHeader className="p-4">
              <DrawerTitle>Requisitar Material Urgente</DrawerTitle>
              <DrawerDescription>
                Crie uma requisição para um material faltante. O time de
                recebimento será notificado.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              {/* Renderiza o formulário e conecta suas ações aos nossos handlers */}
              <RequisitionForm
                onSubmit={handleSubmit}
                onCancel={() => setDrawerOpen(false)}
                isSubmitting={createMutation.isPending}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        open={!!requisitionToFulfill}
        onOpenChange={(isOpen) => !isOpen && setRequisitionToFulfill(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar Entrega da Requisição?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o item da lista de pendentes e não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 p-4 border rounded-lg bg-muted/50">
            <p className="text-sm">
              <strong>Material:</strong>{" "}
              {requisitionToFulfill?.materialDescription}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Para a OP:</strong> {requisitionToFulfill?.orderNumber}
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRequisitionToFulfill(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmFulfill}
              disabled={fulfillMutation.isPending}
            >
              {fulfillMutation.isPending
                ? "Confirmando..."
                : "Sim, confirmar entrega"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
