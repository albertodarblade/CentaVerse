
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import type { Transaction, Income } from '@/lib/types';
import { format } from 'date-fns';

interface MonthlySummaryProps {
  transactions: Transaction[];
}

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export default function MonthlySummary({ transactions }: MonthlySummaryProps) {
  const { income, expenses, chartData, totalIncome } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const incomeTransactions = monthlyTransactions.filter((t) => t.type === 'income');
    const expenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeBySource = incomeTransactions.reduce((acc, t) => {
        const source = t.description || 'Ingreso';
        if (!acc[source]) {
            acc[source] = 0;
        }
        acc[source] += t.amount;
        return acc;
    }, {} as {[key: string]: number});
    
    const totalIncome = Object.values(incomeBySource).reduce((sum, amount) => sum + amount, 0);

    let chartData = [
        ...Object.entries(incomeBySource).map(([name, value], index) => ({
            name,
            value,
            fill: COLORS[index % COLORS.length]
        })),
    ];
    
    if (expenses > 0) {
        chartData.push({ name: 'Gastos', value: expenses, fill: 'hsl(var(--destructive))' });
    }

    chartData = chartData.filter(d => d.value > 0);

    return { income: totalIncome, expenses, chartData, totalIncome };
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de {format(new Date(), 'MMMM')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-48 md:h-64">
             <ChartContainer
                config={{}}
                className="mx-auto aspect-square h-full"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        formatter={(value, name) => `${name}: ${new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value as number)}`}
                        hideLabel 
                    />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    strokeWidth={5}
                  >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
          </div>
          <div className="flex flex-col justify-center space-y-4">
             {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <div className="flex-1 text-sm text-muted-foreground">{item.name}</div>
                    <div className="text-sm font-bold">
                        {new Intl.NumberFormat('es-BO', {
                            style: 'currency',
                            currency: 'BOB',
                        }).format(item.value)}
                    </div>
                </div>
             ))}
             <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
                <span>Total Ingresos</span>
                <span>
                     {new Intl.NumberFormat('es-BO', {
                        style: 'currency',
                        currency: 'BOB',
                    }).format(totalIncome)}
                </span>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
