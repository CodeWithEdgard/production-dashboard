
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Dados de exemplo
const orders = [
  { id: 'ORD-001', product: 'Componente A-12', quantity: 1200, status: 'Concluído' },
  { id: 'ORD-002', product: 'Estrutura B-4', quantity: 800, status: 'Em Progresso' },
  { id: 'ORD-003', product: 'Painel C-8', quantity: 2500, status: 'Concluído' },
  { id: 'ORD-004', product: 'Componente A-12', quantity: 1100, status: 'Aguardando' },
  { id: 'ORD-005', product: 'Montagem D-1', quantity: 500, status: 'Concluído' },
];

// Mapeamento de status para estilos do Badge
const statusStyles = {
  'Concluído': 'default',
  'Em Progresso': 'secondary',
  'Aguardando': 'outline',
};

export function RecentOrdersTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos de Produção Recentes</CardTitle>
        <CardDescription>Acompanhe os últimos 5 pedidos processados.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Pedido</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell className="text-right">{order.quantity}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}