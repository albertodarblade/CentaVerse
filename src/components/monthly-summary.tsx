
'use client';

import { useMemo, useState, useEffect } from 'react';
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
  incomes: Income[];
}

const COLORS = {
    income: 'hsl(var(--chart-1))',
    expenses: 'hsl(var(--chart-2))',
};

export default function MonthlySummary({ transactions, incomes }: MonthlySummaryProps) {
  const [formattedTotalIncome, setFormattedTotalIncome] = useState<string | null>(null);
  const [formattedTotalExpenses, setFormattedTotalExpenses] = useState<string | null>(null);
  
  const { totalIncome, totalExpenses, chartData } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        t.type === 'expense' &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    const totalExpenses = monthlyTransactions
      .reduce((sum, t) => sum + t.amount, 0);

    let chartData = [];
    if (totalIncome > 0 || totalExpenses > 0) {
        chartData.push({ name: 'Ingresos', value: totalIncome, fill: COLORS.income });
        chartData.push({ name: 'Gastos', value: totalExpenses, fill: COLORS.expenses });
    }
    
    chartData = chartData.filter(d => d.value > 0);

    return { totalIncome, totalExpenses, chartData };
  }, [transactions, incomes]);
  
  useEffect(() => {
    setFormattedTotalIncome(new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(totalIncome));
    setFormattedTotalExpenses(new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(totalExpenses));
  }, [totalIncome, totalExpenses]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="flex flex-col space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2.5 w-1 rounded-full" style={{ backgroundColor: COLORS.income }}/>
                Ingresos
              </div>
              <p className="text-xl font-bold">
                {formattedTotalIncome}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2.5 w-1 rounded-full" style={{ backgroundColor: COLORS.expenses }}/>
                Gastado
              </div>
              <p className="text-xl font-bold">
                {formattedTotalExpenses}
              </p>
            </div>
          </div>
          <div className="h-40">
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
                        formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value as number)}
                        hideLabel 
                    />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="70%"
                    outerRadius="100%"
                    strokeWidth={0}
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
