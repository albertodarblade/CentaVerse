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

const ExpenseDetailSchema = z.object({
  description: z.string().describe('The description of the expense.'),
  amount: z.number().describe('The amount of the expense.'),
  isRecurring: z.boolean().describe('Whether the expense is recurring.'),
});

const CategoryExpenseSchema = z.object({
  category: z.string().describe('The name of the category.'),
  totalAmount: z.number().describe('The total amount spent in this category.'),
  expenses: z.array(ExpenseDetailSchema).describe('A list of expenses in this category.'),
});

const SpendingInsightsInputSchema = z.object({
  totalIncome: z.number().describe('The user’s total monthly income.'),
  categoryExpenses: z.array(CategoryExpenseSchema).describe('A list of expenses grouped by category for the current month.'),
  unCategorizedExpenses: z.array(ExpenseDetailSchema).describe('A list of expenses that do not belong to any category.'),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights and recommendations on how to improve financial habits. Provide a detailed breakdown per category.'),
});
export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

export async function getSpendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {schema: SpendingInsightsInputSchema},
  output: {schema: SpendingInsightsOutputSchema},
  prompt: `You are a financial advisor providing insights to users based on their income and expense data for the current month.

  Analyze the income and categorized expense data provided. Provide personalized insights and recommendations on how the user can improve their financial habits.
  Your analysis should be detailed and broken down by category. Include both regular and recurring expenses in your analysis.

  Total Monthly Income: {{{totalIncome}}}
  
  Categorized Expenses:
  {{#each categoryExpenses}}
  - Category: {{{category}}}
    - Total: {{{totalAmount}}}
    - Details:
      {{#each expenses}}
      - {{{description}}}: {{{amount}}} {{#if isRecurring}}(Recurring){{/if}}
      {{/each}}
  {{/each}}

  {{#if unCategorizedExpenses.length}}
  Uncategorized Expenses:
    {{#each unCategorizedExpenses}}
    - {{{description}}}: {{{amount}}} {{#if isRecurring}}(Recurring){{/if}}
    {{/each}}
  {{/if}}
  `,
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
