'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { Transaction } from "@/lib/types";
import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";

interface ExpenseChartProps {
  transactions: Transaction[];
}

const chartConfig = {
  expenses: {
    label: "Expenses",
  },
  housing: { label: "Housing", color: "hsl(var(--chart-1))" },
  food: { label: "Food", color: "hsl(var(--chart-2))" },
  transport: { label: "Transport", color: "hsl(var(--chart-3))" },
  entertainment: { label: "Entertainment", color: "hsl(var(--chart-4))" },
  shopping: { label: "Shopping", color: "hsl(var(--chart-5))" },
  health: { label: "Health", color: "hsl(var(--chart-1))" },
  other: { label: "Other", color: "hsl(var(--chart-2))" },
};


export default function ExpenseChart({ transactions }: ExpenseChartProps) {
  const expenseData = useMemo(() => {
    const expenseByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expenseByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
      fill: chartConfig[category.toLowerCase() as keyof typeof chartConfig]?.color || chartConfig.other.color,
    }));
  }, [transactions]);

  const totalExpenses = useMemo(() => expenseData.reduce((acc, curr) => acc + curr.value, 0), [expenseData]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Expense Breakdown</CardTitle>
        <CardDescription>A look at where your money is going.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {expenseData.length > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                 {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No expense data to display.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
