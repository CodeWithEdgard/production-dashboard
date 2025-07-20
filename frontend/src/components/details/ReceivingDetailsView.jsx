// frontend/src/components/details/ReceivingDetailsView.jsx
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { Button } from "@/components/ui/button"; // Garanta que o Button esteja importado

// Componente auxiliar reutilizável para mostrar um par de Label + Valor
const DetailItem = ({ label, children }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <div className="text-lg font-semibold">{children || '-'}</div>
  </div>
);

// Mapeamento de status para estilos do Badge
const statusVariantMap = {
  'Conferido': 'default',
  'Aguardando Conferência': 'secondary',
  'Rejeitado': 'destructive',
  'Pendente': 'outline'
};

// Recebemos a nova prop 'onResolvePendency'
export function ReceivingDetailsView({ item, onResolvePendency }) {
  if (!item) return null;

  const { details } = item;

  return (
    <div className="space-y-8 p-2">

      {/* --- SEÇÃO 1: INFORMAÇÕES GERAIS (Seu código, sem alterações) --- */}
      <section>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Informações Gerais</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <DetailItem label="Nº da NF">{item.nfNumber}</DetailItem>
          <DetailItem label="Fornecedor">{item.supplier}</DetailItem>
          <DetailItem label="Nº do Pedido">{item.orderNumber}</DetailItem>
          <DetailItem label="Valor da NF">{formatCurrency(item.nfValue)}</DetailItem>
          <DetailItem label="Volume Declarado">{item.nfVolume}</DetailItem>
          <DetailItem label="Recebido por">{item.receivedBy}</DetailItem>
          <DetailItem label="Data de Entrada">{formatDateTime(item.entryDate)}</DetailItem>
          <DetailItem label="Status Atual">
            <Badge variant={statusVariantMap[item.status] || 'default'} className="text-md">
              {item.status}
            </Badge>
          </DetailItem>
        </div>
      </section>
      
      {/* --- SEÇÃO 2: DETALHES DA CONFERÊNCIA (Seu código, sem alterações) --- */}
      {details ? (
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Detalhes da Conferência</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DetailItem label="Data da Conferência">{formatDateTime(item.conferenceDate)}</DetailItem>
            <DetailItem label="Conferido por">{item.conferredBy}</DetailItem>
            <DetailItem label="Data Prevista">{formatDate(details.expectedDate)}</DetailItem>
            <DetailItem label="Data da Entrega">{formatDate(details.deliveryDate)}</DetailItem>
            <DetailItem label="Entrega Pontual?">
              <span className={details.punctual ? 'text-green-600' : 'text-red-600'}>
                {details.punctual ? "Sim" : "Não"}
              </span>
            </DetailItem>
            <DetailItem label="Tipo de Pendência">{details.issueType}</DetailItem>
            <DetailItem label="Pendência Resolvida?">{details.issueResolved ? "Sim" : "Não"}</DetailItem>
            <DetailItem label="Material do Cliente?">{details.isClientMaterial ? "Sim" : "Não"}</DetailItem>
            <DetailItem label="Material Recusado?">
                <span className={details.refusedMaterial ? 'text-red-600' : 'text-green-600'}>
                    {details.refusedMaterial ? "Sim" : "Não"}
                </span>
            </DetailItem>
            <div className="col-span-full">
              <DetailItem label="Observação sobre Pontualidade">{details.supplierNote}</DetailItem>
            </div>
            {/* <<< ADICIONADO: Exibe a descrição da pendência se houver >>> */}
            {details.issueDescription && (
              <div className="col-span-full">
                <DetailItem label="Descrição da Pendência (Conferente)">
                    <p className="text-lg font-normal bg-muted p-3 rounded-md">{details.issueDescription}</p>
                </DetailItem>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
          Este recebimento ainda não foi conferido.
        </div>
      )}

      {/* --- <<< NOVA SEÇÃO 3: TRATATIVA (SÓ APARECE SE FOI RESOLVIDO) >>> --- */}
      {item.resolvedBy && (
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-green-700">Pendência Resolvida</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DetailItem label="Resolvido por">{item.resolvedBy}</DetailItem>
            <DetailItem label="Data da Resolução">{formatDateTime(item.resolvedDate)}</DetailItem>
          </div>
          <div className="mt-4 col-span-full">
            <DetailItem label="Descrição da Tratativa (Gestor)">
              <p className="text-lg font-normal bg-muted p-3 rounded-md">{item.resolutionNotes}</p>
            </DetailItem>
          </div>
        </section>
      )}

      {/* --- <<< NOVA SEÇÃO 4: AÇÕES (SÓ APARECE SE ESTIVER PENDENTE) >>> --- */}
      {item.status === 'Pendente' && (
        <div className="pt-6 flex justify-end">
            <Button onClick={onResolvePendency}>
                Resolver Pendência
            </Button>
        </div>
      )}
    </div>
  );
}