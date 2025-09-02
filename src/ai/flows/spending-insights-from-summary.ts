'use server';

/**
 * @fileOverview Provides personalized insights and recommendations on how to improve financial habits based on income and expense data.
 *
 * - getSpendingInsights - A function that analyzes financial summaries to provide insights.
 * - SpendingInsightsInput - The input type for the getSpendingInsights function.
 * - SpendingInsightsOutput - The return type for the getSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpendingInsightsInputSchema = z.object({
  incomeSummary: z.string().describe('A summary of the user\u2019s income.'),
  expenseSummary: z.string().describe('A summary of the user\u2019s expenses.'),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights and recommendations on how to improve financial habits.'),
});
export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

export async function getSpendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {schema: SpendingInsightsInputSchema},
  output: {schema: SpendingInsightsOutputSchema},
  prompt: `You are a financial advisor providing insights to users based on their income and expense summaries.

  Analyze the income and expense summaries provided, and provide personalized insights and recommendations on how the user can improve their financial habits.

  Income Summary: {{{incomeSummary}}}
  Expense Summary: {{{expenseSummary}}}`,
});

const spendingInsightsFlow = ai.defineFlow(
  {
    name: 'spendingInsightsFlow',
    inputSchema: SpendingInsightsInputSchema,
    outputSchema: SpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
