
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

const COLORS = {
    income: 'hsl(var(--chart-1))',
    expenses: 'hsl(var(--chart-2))',
};

export default function MonthlySummary({ transactions }: MonthlySummaryProps) {
  const { totalIncome, totalExpenses, chartData } = useMemo(() => {
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

    const totalIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    let chartData = [];
    if (totalIncome > 0) {
        chartData.push({ name: 'Ingresos', value: totalIncome, fill: COLORS.income });
    }
    if (totalExpenses > 0) {
        chartData.push({ name: 'Gastos', value: totalExpenses, fill: COLORS.expenses });
    }
    
    chartData = chartData.filter(d => d.value > 0);

    return { totalIncome, totalExpenses, chartData };
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
                config={{
                    income: { label: 'Ingresos', color: COLORS.income },
                    expenses: { label: 'Gastos', color: COLORS.expenses },
                }}
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
                <span>Balance</span>
                <span>
                     {new Intl.NumberFormat('es-BO', {
                        style: 'currency',
                        currency: 'BOB',
                    }).format(totalIncome - totalExpenses)}
                </span>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
