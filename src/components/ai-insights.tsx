'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { getAIInsightsAction } from "@/app/actions";
import type { Transaction, Income, RecurringExpense, Tag } from "@/lib/types";

interface AIInsightsProps {
  transactions: Transaction[];
  incomes: Income[];
  recurringExpenses: RecurringExpense[];
  tags: Tag[];
}

export default function AIInsights({ transactions, incomes, recurringExpenses, tags }: AIInsightsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState("");

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setInsights("");

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

    const categoryExpensesMap: { [key: string]: { totalAmount: number, expenses: { description: string, amount: number, isRecurring: boolean }[] } } = {};

    tags.forEach(tag => {
        categoryExpensesMap[tag.name] = {
            totalAmount: 0,
            expenses: []
        };
    });
    
    const unCategorizedExpenses: { description: string, amount: number, isRecurring: boolean }[] = [];

    monthlyTransactions.forEach(t => {
      if (t.tags.length > 0) {
        t.tags.forEach(tagName => {
          if (categoryExpensesMap[tagName]) {
            categoryExpensesMap[tagName].totalAmount += t.amount;
            categoryExpensesMap[tagName].expenses.push({ description: t.description, amount: t.amount, isRecurring: false });
          }
        });
      } else {
         unCategorizedExpenses.push({ description: t.description, amount: t.amount, isRecurring: false });
      }
    });

    recurringExpenses.forEach(re => {
      // For now, we'll add recurring expenses to an "Uncategorized" group for AI analysis.
      // A future improvement could be to allow tagging recurring expenses.
      unCategorizedExpenses.push({ description: re.description, amount: re.amount, isRecurring: true });
    });
    
    const categoryExpenses = Object.entries(categoryExpensesMap)
        .map(([category, data]) => ({ category, ...data }))
        .filter(c => c.totalAmount > 0);

    if (totalIncome === 0 && categoryExpenses.length === 0 && unCategorizedExpenses.length === 0) {
        setInsights("No hay suficientes datos para generar información. Por favor, añade algunas transacciones e ingresos.");
        setIsLoading(false);
        return;
    }

    const result = await getAIInsightsAction({ 
      totalIncome,
      categoryExpenses,
      unCategorizedExpenses
    });

    setInsights(result);
    setIsLoading(false);
  };

  return (
    <Card className="bg-transparent border-0 shadow-none">
      <CardHeader className="px-2">
        <CardTitle className="font-headline flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
          Asesor Financiero IA
        </CardTitle>
        <CardDescription>
          Obtén un análisis detallado por categoría de tus gastos del mes y recomendaciones personalizadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-2">
        <Button onClick={handleGenerateInsights} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            "Generar Información Detallada"
          )}
        </Button>
        {insights && (
          <div className="prose prose-sm max-w-none rounded-lg border bg-secondary/50 p-4 text-card-foreground">
            <p className="whitespace-pre-wrap">{insights}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
