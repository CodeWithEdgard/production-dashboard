// src/pages/DashboardPage.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductionChart } from "@/components/charts/ProductionChart"; 
import { RecentOrdersTable } from "@/components/tables/RecentOrdersTable";
import { ReceivingPage } from "./ReceivingPage";

export function DashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-4">
      <h1 className="text-3xl font-bold">Visão Geral da Produção</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Card de Eficiência Geral do Equipamento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Geral do Equipamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+2.1% em relação ao mês passado</p>
          </CardContent>
        </Card>

        {/* Card de Unidades Produzidas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Produzidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,250</div>
            <p className="text-xs text-muted-foreground">Meta do dia: 12,000</p>
          </CardContent>
        </Card>

        {/* Card de Taxa de Rejeição */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1.2%</div>
            <p className="text-xs text-muted-foreground">Limite aceitável:  2%</p>
          </CardContent>
        </Card>

        {/* Card de Status da Linha */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status da Linha 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">Operando há 4 horas sem paradas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
           <ProductionChart/>
        </Card>

        <div className="lg:col-span-3">
           <RecentOrdersTable/>
        </div>
        
      </div>

    </div>
  );
}