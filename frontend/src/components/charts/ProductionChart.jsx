
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Dados de exemplo
const data = [
  { hour: '10:00', produced: 400 },
  { hour: '11:00', produced: 300 },
  { hour: '12:00', produced: 450 },
  { hour: '13:00', produced: 280 },
  { hour: '14:00', produced: 500 },
  { hour: '15:00', produced: 430 },
  { hour: '16:00', produced: 380 },
];

export function ProductionChart() {    
  return (
    <Card className="col-span-1 lg:col-span2">
      <CardHeader>
        <CardTitle>Produção por Hora</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{top: 5, right: 20, left: -10, bottom: 5}} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
        }} />
        <Legend wrapperStyle={{ fontSize: '14'}} />
        <Bar dataKey="produced" name="Unidades Produzidas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />

        </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}