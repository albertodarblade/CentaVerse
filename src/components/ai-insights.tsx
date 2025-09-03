'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { getAIInsightsAction } from "@/app/actions";
import type { Transaction } from "@/lib/types";

interface AIInsightsProps {
  transactions: Transaction[];
}

export default function AIInsights({ transactions }: AIInsightsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState("");

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setInsights("");

    const incomeSummary = transactions
      .filter((t) => t.type === 'income')
      .map((t) => `${t.description} ($${t.amount})`)
      .join(', ');
      
    const expenseSummary = transactions
      .filter((t) => t.type === 'expense')
      .map((t) => `${t.description} in ${t.tags.join('/')} ($${t.amount})`)
      .join(', ');
    
    if (!incomeSummary && !expenseSummary) {
        setInsights("No hay suficientes datos para generar información. Por favor, añade algunas transacciones.");
        setIsLoading(false);
        return;
    }

    const result = await getAIInsightsAction({ 
      incomeSummary: `Fuentes de ingresos: ${incomeSummary || 'Ninguna'}`,
      expenseSummary: `Gastos: ${expenseSummary || 'Ninguno'}`
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
          Obtén información y recomendaciones personalizadas sobre cómo mejorar tus hábitos financieros.
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
            "Generar Información"
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
