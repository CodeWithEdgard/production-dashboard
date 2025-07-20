// src/components/tables/ReceivingLogTable.jsx
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from 'lucide-react';

// Mapeamento de status para estilos do Badge
const statusVariantMap = {
  'Conferido': 'default',
  'Aguardando Conferência': 'secondary',
  'Rejeitado': 'destructive',
  'Pendente': 'outline',
  'Requisitado': 'destructive'
};

/**
 * Uma tabela que exibe logs de recebimento.
 * @param {object[]} data - A lista de recebimentos para exibir.
 * @param {function} onViewDetails - Função a ser chamada ao clicar em 'Ver Detalhes'.
 * @param {function} onStartConference - Função a ser chamada ao clicar em 'Iniciar Conferência'.
 */
export function ReceivingLogTable({ data, onViewDetails, onStartConference, onResolvePendency }) {
  const formatCurrency = (value) => {
    if (!value) return '-';
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fila de Trabalho - Recebimento</CardTitle>
        <CardDescription>Acompanhe todos os materiais recebidos e pendentes de conferência.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {/* ... O cabeçalho da tabela continua o mesmo ... */}
              <TableHead>Status</TableHead>
              <TableHead>Nº NF</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Nº Pedido</TableHead>
              <TableHead className="text-right">Valor NF</TableHead>
              <TableHead>Horário do Recebimento</TableHead>
              <TableHead className="text-center">Volume</TableHead>
              <TableHead>Data Conferência</TableHead>
              <TableHead>Recebido por</TableHead>
              <TableHead>Conferido por</TableHead>
              <TableHead><span className="sr-only">Ações</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan="11" className="h-24 text-center">
                  Nenhum recebimento registrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  {/* ... Células da tabela continuam as mesmas ... */}
                  <TableCell>
                    <Badge variant={statusVariantMap[item.status] || 'default'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.nfNumber}</TableCell>
                  <TableCell>{item.supplier || '-'}</TableCell>
                  <TableCell>{item.orderNumber || '-'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.nfValue)}</TableCell>
                  <TableCell>{formatDateTime(item.entryDate)}</TableCell>
                  <TableCell className="text-center">{item.nfVolume || '-'}</TableCell>
                  <TableCell>{formatDate(item.conferenceDate)}</TableCell>
                  <TableCell>{item.receivedBy || '-'}</TableCell>
                  <TableCell>{item.conferredBy || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>

                        {item.status === 'Aguardando Conferência' && (
                          <DropdownMenuItem onSelect={() => onStartConference(item)}>
                            Iniciar Conferência
                          </DropdownMenuItem>
                        )}

                        {/* <<< MUDANÇA 3: Adicionar o novo item de menu condicionalmente >>> */}
                        {item.status === 'Pendente' && (
                          <DropdownMenuItem onSelect={() => onResolvePendency(item)} className="text-yellow-600 focus:text-yellow-700">
                            Resolver Pendência
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onSelect={() => onViewDetails(item)}>
                          Ver Detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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