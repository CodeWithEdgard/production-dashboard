
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.jsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.jsx";
import { formatDateTime } from '@/utils/formatters.js';

const statusVariantMap = {
  'Pendente de Análise de Estoque': 'secondary',
  'Aguardando Compra': 'outline',
  'Pronto para Execução': 'default',
  'Concluído': 'default', 
  'Cancelado': 'destructive'
};

export function CATable({ data = [], onViewDetails }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comunicados de Alteração</CardTitle>
        <CardDescription>Lista de todos os comunicados abertos e concluídos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Obra</TableHead>
              <TableHead>Ordem de Produção</TableHead>
              <TableHead>Requisitante</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead><span className="sr-only">Ações</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow><TableCell colSpan="6" className="h-24 text-center">Nenhum C.A. encontrado.</TableCell></TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><Badge variant={statusVariantMap[item.status]}>{item.status}</Badge></TableCell>
                  <TableCell>{item.obra}</TableCell>
                  <TableCell>{item.op}</TableCell>
                  <TableCell>{item.requester_info}</TableCell>
                  <TableCell>{formatDateTime(item.creation_date)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onViewDetails(item)}>Ver Detalhes</DropdownMenuItem>
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