
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

interface MonthlySummaryProps {
  transactions: Transaction[];
}

const chartConfig = {
  income: {
    label: 'Ingresos',
    color: 'hsl(var(--chart-1))',
  },
  expense: {
    label: 'Gastos',
    color: 'hsl(var(--chart-2))',
  },
};

export default function MonthlySummary({ transactions }: MonthlySummaryProps) {
  const { income, expenses, chartData } = useMemo(() => {
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

    const income = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const chartData = [
      { name: 'income', value: income, fill: chartConfig.income.color },
      { name: 'expense', value: expenses, fill: chartConfig.expense.color },
    ].filter(d => d.value > 0);

    return { income, expenses, chartData };
  }, [transactions]);

  const total = income + expenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de {format(new Date(), 'MMMM')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-center space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[--chart-1]" />
              <div className="text-sm text-muted-foreground">Ingresos</div>
            </div>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat('es-BO', {
                style: 'currency',
                currency: 'BOB',
              }).format(income)}
            </div>

            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-[--chart-2]" />
              <div className="text-sm text-muted-foreground">Gastos</div>
            </div>
            <div className="text-3xl font-bold">
              {new Intl.NumberFormat('es-BO', {
                style: 'currency',
                currency: 'BOB',
              }).format(expenses)}
            </div>
          </div>
          <div className="h-48">
             <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-full"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
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
        </div>
      </CardContent>
    </Card>
  );
}
