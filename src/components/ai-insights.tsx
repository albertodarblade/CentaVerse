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
      .map((t) => `${t.description} in ${t.category} ($${t.amount})`)
      .join(', ');
    
    if (!incomeSummary && !expenseSummary) {
        setInsights("Not enough data to generate insights. Please add some transactions.");
        setIsLoading(false);
        return;
    }

    const result = await getAIInsightsAction({ 
      incomeSummary: `Income sources: ${incomeSummary || 'None'}`,
      expenseSummary: `Expenses: ${expenseSummary || 'None'}`
    });

    setInsights(result);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Financial Advisor
        </CardTitle>
        <CardDescription>
          Get personalized insights and recommendations on how to improve your financial habits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateInsights} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Insights"
          )}
        </Button>
        {insights && (
          <div className="prose prose-sm max-w-none rounded-lg border bg-muted/50 p-4 text-card-foreground">
            <p className="whitespace-pre-wrap">{insights}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
