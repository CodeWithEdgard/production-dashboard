// frontend/src/components/tables/RequisitionTable.jsx
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.jsx";
import { formatDateTime } from "@/utils/formatters.js";
import { Badge } from "@/components/ui/badge.jsx";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";

export function RequisitionTable({ data = [], onFulfill }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisições Pendentes</CardTitle>
        <CardDescription>
          Esta é a lista de materiais urgentes que ainda não chegaram.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Material Solicitado</TableHead>
              {/* <<< NOVAS COLUNAS ADICIONADAS AO CABEÇALHO >>> */}
              <TableHead>Obra</TableHead>
              <TableHead>Sub-item</TableHead>
              <TableHead>Ordem de Produção (OP)</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Data da Solicitação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                {/* <<< ColSpan atualizado para o novo número de colunas (8) >>> */}
                <TableCell colSpan="8" className="h-24 text-center">
                  Nenhuma requisição pendente no momento.
                </TableCell>
              </TableRow>
            ) : (
              data.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <Badge variant={req.isFulfilled ? "default" : "secondary"}>
                      {req.isFulfilled ? "Atendida" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {req.materialDescription}
                  </TableCell>

                  {/* <<< NOVAS CÉLULAS PARA EXIBIR OS DADOS >>> */}
                  <TableCell>{req.obra}</TableCell>
                  <TableCell>{req.sub_item || "-"}</TableCell>

                  <TableCell>{req.orderNumber}</TableCell>
                  <TableCell>{req.requestedBy}</TableCell>
                  <TableCell>{formatDateTime(req.requestDate)}</TableCell>
                  <TableCell className="text-right">
                    {!req.isFulfilled && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => onFulfill(req.id)}>
                            Marcar como Entregue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
