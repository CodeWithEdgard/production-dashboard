// frontend/src/pages/CADetailPage.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StockMovementForm } from "@/components/forms/StockMovementForm.jsx";

// --- Funções da API ---
import {
  getComunicadoAlteracaoById,
  updateItemStockStatus,
  createStockMovement,
} from "../api.js";

// --- Componentes de UI ---
import { Button } from "@/components/ui/button.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.jsx";
import { ArrowLeft } from "lucide-react";
import { CADetailsView } from "@/components/details/CADetailsView.jsx"; // A visualização geral
import { ItemActionRow } from "@/components/details/ItemActionRow.jsx"; // A linha de ação
import { StockMovementForm } from "@/components/forms/StockMovementForm.jsx"; // O formulário de devolução

export function CADetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Estado para controlar qual item está sendo movimentado (para abrir o Dialog)
  const [movementItem, setMovementItem] = useState(null);

  // --- Query para buscar os dados do C.A. ---
  const {
    data: ca,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["comunicado", id],
    queryFn: () => getComunicadoAlteracaoById(id),
  });

  // --- Mutação para atualizar o status de um item ---
  const updateStatusMutation = useMutation({
    mutationFn: updateItemStockStatus,
    onSuccess: (updatedItem) => {
      // Atualiza os caches para refletir a mudança
      queryClient.invalidateQueries({ queryKey: ["comunicado", id] });
      queryClient.invalidateQueries({ queryKey: ["comunicados_kanban"] }); // Invalida o kanban também
      toast.success(
        `Status do item "${updatedItem.material_description}" atualizado!`
      );
    },
    onError: (err) => {
      toast.error("Falha ao atualizar status", {
        description: err.response?.data?.detail || "Erro inesperado.",
      });
    },
  });

  // --- Mutação para criar um movimento de estoque ---
  const createMovementMutation = useMutation({
    mutationFn: createStockMovement,
    onSuccess: () => {
      // Quando o movimento é bem-sucedido, atualizamos o status do item correspondente
      updateStatusMutation.mutate({
        itemId: movementItem.id,
        status: "Devolvido ao Estoque",
      });
      setMovementItem(null); // Fecha o Dialog
      toast.success("Devolução registrada com sucesso!");
    },
    onError: (err) => {
      toast.error("Falha ao registrar devolução", {
        description: err.response?.data?.detail || "Erro inesperado.",
      });
    },
  });

  // --- Handlers para as ações ---
  const handleUpdateStatus = (itemId, status) => {
    updateStatusMutation.mutate({ itemId, status });
  };

  const handleRegisterMovement = (item) => {
    setMovementItem(item); // Abre o Dialog de registro de movimento
  };

  const handleSaveMovement = (formData) => {
    // Monta o payload final para a API de criação de movimento
    const payload = {
      ...formData,
      ca_id: ca.id,
      item_description: movementItem.material_description,
      movement_type: "SAIDA_DA_OBRA",
    };
    createMovementMutation.mutate(payload);
  };

  // --- Renderização dos estados de loading e erro ---
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (isError)
    return (
      <div className="p-8 text-red-500">
        Erro ao carregar C.A.: {error.message}
      </div>
    );
  if (!ca) return <div className="p-8">Comunicado não encontrado.</div>;

  // --- Renderização da página com sucesso ---
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/ca">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {ca.title || `Comunicado de Alteração #${ca.id}`}
          </h1>
          <p className="text-muted-foreground">
            Obra: {ca.obra} | OP: {ca.op}
          </p>
        </div>
      </div>

      {/* Exibe os detalhes gerais do C.A. (engenheiro, motivo, etc) */}
      <CADetailsView item={ca} />

      {/* --- SEÇÃO DE AÇÕES DO ALMOXARIFE --- */}
      <div className="p-4 border rounded-lg space-y-4">
        <h3 className="text-xl font-semibold">Análise e Ações de Estoque</h3>
        <div className="space-y-3">
          {ca.items.map((item) => (
            <ItemActionRow
              key={item.id}
              item={item}
              onUpdateStatus={handleUpdateStatus}
              onRegisterMovement={handleRegisterMovement}
            />
          ))}
        </div>
      </div>

      {/* --- DIALOG PARA REGISTRAR A DEVOLUÇÃO DE MATERIAL --- */}
      <Dialog
        open={!!movementItem}
        onOpenChange={(isOpen) => !isOpen && setMovementItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Devolução de Material</DialogTitle>
            <DialogDescription>
              Informe os detalhes da devolução para o item:{" "}
              {movementItem?.material_description}
            </DialogDescription>
          </DialogHeader>
          {movementItem && (
            <StockMovementForm
              item={movementItem}
              onSubmit={handleSaveMovement}
              onCancel={() => setMovementItem(null)}
              isSubmitting={createMovementMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
