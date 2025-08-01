// frontend/src/pages/ReceivingPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// --- API ---
import {
  getRecebimentos,
  createRecebimento,
  updateRecebimento,
  resolveRecebimento,
  rejectRecebimentoEntry,
  getPendingRequisitions, // Adicionada
} from "../api.js";

// --- UI Components ---
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.jsx";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { ReceivingToolbar } from "@/components/toolbars/ReceivingToolbar.jsx";
import { ReceivingLogTable } from "@/components/tables/ReceivingLogTable.jsx";
import { PaginationControls } from "@/components/pagination/PaginationControls.jsx";
import { formatCurrency, formatDateTime } from "@/utils/formatters.js";
import { AlertTriangle } from "lucide-react";

// --- Forms ---
import { ReceivingRegistrationForm } from "@/components/forms/ReceivingRegistrationForm.jsx";
import { ConferenceForm } from "@/components/forms/ConferenceForm.jsx";
import { ResolvePendencyForm } from "@/components/forms/ResolvePendencyForm.jsx";
import { RejectionForm } from "@/components/forms/RejectionForm.jsx";
import { RequisitionForm } from "@/components/forms/RequisitionForm.jsx";
import { ReceivingDetailsView } from "@/components/details/ReceivingDetailsView.jsx";

export function ReceivingPage() {
  const queryClient = useQueryClient();

  // --- Estados de Controle da UI ---
  const [activeAction, setActiveAction] = useState({ type: null, data: null });
  const [itemToConfirm, setItemToConfirm] = useState(null);
  const [itemToReject, setItemToReject] = useState(null);
  const [itemToResolve, setItemToResolve] = useState(null);
  const [isRequisitionDrawerOpen, setRequisitionDrawerOpen] = useState(false);
  const [urgentVisibleItems, setUrgentVisibleItems] = useState([]);

  // --- Estado Único para Filtros ---
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    isClientMaterial: "all",
    page: 1,
  });

  // --- Única Fonte de Dados (useQueries) ---
  const [recebimentosQuery, requisitionsQuery] = useQueries({
    queries: [
      {
        queryKey: ["recebimentos", filters],
        queryFn: () => getRecebimentos(filters),
        placeholderData: (p) => p,
      },
      {
        queryKey: ["pendingRequisitions"],
        queryFn: getPendingRequisitions,
      },
    ],
  });

  const isLoading = recebimentosQuery.isLoading || requisitionsQuery.isLoading;
  const isError = recebimentosQuery.isError || requisitionsQuery.isError;
  const error = recebimentosQuery.error || requisitionsQuery.error;

  // Extrai os dados de forma segura
  const recebimentos = useMemo(
    () => recebimentosQuery.data?.items || [],
    [recebimentosQuery.data]
  );

  // 2. Memoriza a lista de requisições.
  const pendingRequisitions = useMemo(
    () => requisitionsQuery.data || [],
    [requisitionsQuery.data]
  );

  const totalItems = recebimentosQuery.data?.total || 0;

  useEffect(() => {
    if (recebimentos.length > 0 && pendingRequisitions.length > 0) {
      const pendingOrderNumbers = new Set(
        pendingRequisitions.map((req) => String(req.orderNumber).trim())
      );
      const urgentMatches = recebimentos.filter(
        (rec) =>
          rec.orderNumber &&
          pendingOrderNumbers.has(String(rec.orderNumber).trim())
      );
      setUrgentVisibleItems(urgentMatches);
    } else {
      setUrgentVisibleItems([]);
    }
  }, [recebimentos, pendingRequisitions]);
  // --- Definição Única de TODAS as Mutações ---

  const createMutation = useMutation({
    mutationFn: createRecebimento,
    onSuccess: (newData) => {
      // 'newData' é o recebimento recém-criado
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      setActiveAction({ type: null, data: null });

      const receivedOrderNumber = newData.orderNumber;
      let isUrgent = false;

      // Se o novo recebimento tem uma OP...
      if (receivedOrderNumber) {
        // ...procuramos na nossa lista de requisições por uma correspondência.
        const match = pendingRequisitions.find(
          (req) =>
            String(req.orderNumber).trim() ===
            String(receivedOrderNumber).trim()
        );
        if (match) {
          isUrgent = true;
        }
      }

      // Mostra o toast correto com base no resultado da verificação.
      if (isUrgent) {
        toast.warning("Alerta de Material Urgente!", {
          description: `A OP ${receivedOrderNumber} deste recebimento corresponde a uma requisição pendente.`,
          duration: 8000,
        });
      } else {
        toast.success("Recebimento Registrado!", {
          description: `NF nº ${newData.nfNumber} registrada com sucesso.`,
        });
      }
    },
    onError: (err) => {
      toast.error("Falha ao Registrar", {
        description:
          err.response?.data?.detail || "Ocorreu um erro inesperado.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRecebimento,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      setActiveAction({ type: null, data: null });
      toast.success("Conferência Concluída!", {
        description: `Status atualizado para: ${data.status}`,
      });
    },
    onError: (err) =>
      toast.error("Falha ao Salvar Conferência", {
        description: err.response?.data?.detail,
      }),
  });

  const resolveMutation = useMutation({
    mutationFn: resolveRecebimento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      setItemToResolve(null);
      toast.success("Tratativa registrada com sucesso!");
    },
    onError: (err) =>
      toast.error("Erro ao resolver pendência", {
        description: err.response?.data?.detail,
      }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectRecebimentoEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      setItemToReject(null);
      setItemToConfirm(null);
      toast.success("Entrada rejeitada com sucesso!");
    },
    onError: (err) =>
      toast.error("Falha ao Rejeitar", {
        description: err.response?.data?.detail,
      }),
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
  const handleProceedToConference = () => {
    setActiveAction({ type: "CONFERENCE", data: itemToConfirm });
    setItemToConfirm(null);
  };
  const handleConfirmRejection = (rejectionData) => {
    rejectMutation.mutate({ id: itemToReject.id, data: rejectionData });
  };
  const handleSaveResolution = (resolutionData) => {
    resolveMutation.mutate({ id: itemToResolve.id, data: resolutionData });
  };

  if (isError)
    return <div className="p-8 text-red-500">{`Erro: ${error?.message}`}</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recebimento de Materiais</h1>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              setActiveAction({
                type: "REGISTER",
                data: { pendingRequisitions: pendingRequisitions },
              })
            }
          >
            + Registrar Recebimento
          </Button>
        </div>
      </div>

      {!isLoading && urgentVisibleItems.length > 0 && (
        <Alert
          variant="default"
          className="border-amber-500 text-amber-800 dark:border-amber-600 dark:text-amber-300"
        >
          <AlertTriangle className="h-4 w-4 !text-amber-600" />
          <AlertTitle className="font-semibold">
            Atenção: Material Urgente na Tela!
          </AlertTitle>
          <AlertDescription>
            O recebimento para a OP{" "}
            <strong>
              {urgentVisibleItems.map((item) => item.orderNumber).join(", ")}
            </strong>{" "}
            corresponde a uma requisição urgente.
          </AlertDescription>
        </Alert>
      )}

      <ReceivingToolbar filters={filters} setFilters={setFilters} />

      <div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            <ReceivingLogTable
              data={recebimentos}
              urgentItemIds={urgentVisibleItems.map((item) => item.id)}
              onStartConference={handleStartConference}
              onViewDetails={(item) =>
                setActiveAction({ type: "DETAILS", data: item })
              }
              onResolvePendency={(item) => setItemToResolve(item)}
            />
            <PaginationControls
              currentPage={filters.page}
              totalItems={totalItems}
              onPageChange={(newPage) =>
                setFilters((prev) => ({ ...prev, page: newPage }))
              }
            />
          </>
        )}
      </div>

      {/* Os Drawers continuam funcionando exatamente da mesma forma */}
      <Drawer
        open={!!activeAction.type}
        onOpenChange={(isOpen) =>
          !isOpen && setActiveAction({ type: null, data: null })
        }
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-2xl p-4">
            {activeAction.type === "REGISTER" && (
              <>
                <DrawerHeader>
                  <DrawerTitle>Registro de Entrada</DrawerTitle>
                  <DrawerDescription>
                    Preencha os dados da nota fiscal que acabou de chegar.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="overflow-y-auto p-4">
                  <ReceivingRegistrationForm
                    pendingRequisitions={
                      activeAction.data?.pendingRequisitions || []
                    }
                    initialData={activeAction.data || {}}
                    onSubmit={handleSaveRegistration}
                    onCancel={() => setActiveAction({ type: null, data: null })}
                    isSubmitting={createMutation.isPending}
                  />
                </div>
              </>
            )}
            {activeAction.type === "CONFERENCE" && (
              <>
                <DrawerHeader>
                  <DrawerTitle>Conferência de Recebimento</DrawerTitle>
                  <DrawerDescription>
                    NF {activeAction.data?.nfNumber} | Fornecedor:{" "}
                    {activeAction.data?.supplier}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="overflow-y-auto p-4">
                  <ConferenceForm
                    initialData={activeAction.data}
                    onSubmit={handleSaveConference}
                    onCancel={() => setActiveAction({ type: null, data: null })}
                    isSubmitting={updateMutation.isPending}
                  />
                </div>
              </>
            )}
            {activeAction.type === "DETAILS" && (
              <>
                <DrawerHeader>
                  <DrawerTitle>
                    Detalhes: NF {activeAction.data.nfNumber}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto p-4">
                  <ReceivingDetailsView
                    item={activeAction.data}
                    onResolvePendency={() => {
                      setItemToResolve(activeAction.data);
                      setActiveAction({ type: null, data: null });
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isRequisitionDrawerOpen}
        onOpenChange={setRequisitionDrawerOpen}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-2xl p-4">
            <DrawerHeader>
              <DrawerTitle>Requisitar Material Urgente</DrawerTitle>
            </DrawerHeader>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={!!itemToResolve}
        onOpenChange={(isOpen) => !isOpen && setItemToResolve(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Tratativa de Pendência</DialogTitle>
            <DialogDescription>
              Descreva a solução aplicada para o problema identificado na NF{" "}
              {itemToResolve?.nfNumber}.
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

      <AlertDialog
        open={!!itemToConfirm}
        onOpenChange={(isOpen) => !isOpen && setItemToConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar Conferência?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirme os dados de entrada antes de prosseguir. Esta ação não
              poderá ser desfeita.
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
                <p>{itemToConfirm?.orderNumber || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">Valor da NF:</p>
                <p>{formatCurrency(itemToConfirm?.nfValue)}</p>
              </div>
              <div>
                <p className="font-semibold">Volume Declarado:</p>
                <p>{itemToConfirm?.nfVolume || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">Recebido por:</p>
                <p>{itemToConfirm?.receivedBy || "N/A"}</p>
              </div>
            </div>
            <div>
              <p className="font-semibold">Data de Entrada:</p>
              <p>{formatDateTime(itemToConfirm?.entryDate)}</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={handleInitiateRejection}>
              Rejeitar Entrada
            </Button>
            <AlertDialogAction onClick={handleProceedToConference}>
              Confirmar e Iniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!itemToReject}
        onOpenChange={(isOpen) => !isOpen && setItemToReject(null)}
      >
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
