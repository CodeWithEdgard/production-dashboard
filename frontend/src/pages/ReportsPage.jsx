
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RecentOrdersTable } from "@/components/tables/RecentOrdersTable"; // Reutilizando a tabela!

export function ReportsPage() {
  const [date, setDate] = useState({
    from: new Date(),
    to: new Date(),
  });

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold">Gerador de Relatórios</h1>

      {/* Seção de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros do Relatório</CardTitle>
          <CardDescription>Selecione o período para gerar o relatório de produção.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          {/* Seletor de Datas */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button>Gerar Relatório</Button>
        </CardContent>
      </Card>
      
      {/* Seção de Resultados */}
      <div className="pt-4">
        {/* Aqui reutilizamos a tabela que já tínhamos feito.
            No futuro, os dados dela viriam do filtro acima. */}
        <RecentOrdersTable />
      </div>
    </div>
  );
}