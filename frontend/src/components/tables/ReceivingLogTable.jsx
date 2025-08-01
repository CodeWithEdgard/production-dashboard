// src/components/tables/ReceivingLogTable.jsx
import React from "react";
import { MoreHorizontal, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// <<< MUDANÇA 1: Adicionar o novo status de Requisição >>>
const statusVariantMap = {
  Conferido: "default",
  "Aguardando Conferência": "secondary",
  Rejeitado: "destructive",
  Pendente: "outline",
  "Requisitado (Urgente)": "destructive", // Status para as requisições
};

// <<< MUDANÇA 2: Adicionar a nova prop 'onLinkRequisition' >>>
export function ReceivingLogTable({
  data = [],
  urgentItemIds = [],
  onViewDetails,
  onStartConference,
  onResolvePendency,
  onLinkRequisition, // A nova função que vem da página principal
}) {
  // --- As funções de formatação completas (sem cortes) ---
  const formatCurrency = (value) => {
    if (!value) return "-";
    // Tenta converter para número e verifica se é válido
    const number = parseFloat(value);
    if (isNaN(number)) return "-";
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fila de Trabalho - Recebimento</CardTitle>
        <CardDescription>
          Acompanhe todos os materiais recebidos e pendentes de conferência.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Identificador</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Nº Pedido/OP</TableHead>
              <TableHead className="text-right">Valor NF</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-center">Volume</TableHead>
              <TableHead>Data Conferência</TableHead>
              <TableHead>Recebido por</TableHead>
              <TableHead>Conferido por</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan="11" className="h-24 text-center">
                  Nenhuma requisição ou recebimento na fila.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const isUrgent =
                  urgentItemIds.includes(item.id) || item.isRequisition;

                return (
                  <TableRow
                    key={item.id}
                    className={
                      isUrgent ? "bg-amber-100 dark:bg-amber-900/30" : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isUrgent && (
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        )}
                        <Badge
                          variant={statusVariantMap[item.status] || "default"}
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Células de dados que se adaptam se o item é uma requisição */}
                    <TableCell className="font-medium">
                      {item.nfNumber}
                    </TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.orderNumber || "-"}</TableCell>
                    <TableCell className="text-right">
                      {item.isRequisition ? "-" : formatCurrency(item.nfValue)}
                    </TableCell>
                    <TableCell>{formatDateTime(item.entryDate)}</TableCell>
                    <TableCell className="text-center">
                      {item.nfVolume || "-"}
                    </TableCell>
                    <TableCell>{formatDate(item.conferenceDate)}</TableCell>
                    <TableCell>{item.receivedBy || "-"}</TableCell>
                    <TableCell>{item.conferredBy || "-"}</TableCell>

                    {/* <<< MUDANÇA 3: Menu de Ações Inteligente >>> */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>

                          {/* Ação específica para Requisições */}
                          {item.isRequisition ? (
                            <DropdownMenuItem
                              onSelect={() => onLinkRequisition(item)}
                            >
                              <strong>Dar Entrada (Vincular NF)</strong>
                            </DropdownMenuItem>
                          ) : (
                            // Ações para Recebimentos Normais (seu código original)
                            <>
                              {item.status === "Aguardando Conferência" && (
                                <DropdownMenuItem
                                  onSelect={() => onStartConference(item)}
                                >
                                  Iniciar Conferência
                                </DropdownMenuItem>
                              )}
                              {item.status === "Pendente" && (
                                <DropdownMenuItem
                                  onSelect={() => onResolvePendency(item)}
                                  className="text-yellow-600"
                                >
                                  Resolver Pendência
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onSelect={() => onViewDetails(item)}
                              >
                                Ver Detalhes
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
