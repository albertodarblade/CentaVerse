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
  prompt: `Eres un asesor financiero que da consejos a los usuarios basándose en sus datos de ingresos y gastos del mes actual. Tu respuesta debe ser en español.

  Analiza los datos de ingresos y gastos categorizados proporcionados. Ofrece información y recomendaciones personalizadas, directas y sencillas sobre cómo el usuario puede mejorar sus hábitos financieros.
  Tu análisis debe ser detallado y desglosado por categoría. Incluye tanto los gastos regulares como los recurrentes en tu análisis. Sé conciso y ve al grano.

  Ingreso Total Mensual: {{{totalIncome}}}
  
  Gastos Categorizados:
  {{#each categoryExpenses}}
  - Categoría: {{{category}}}
    - Total: {{{totalAmount}}}
    - Detalles:
      {{#each expenses}}
      - {{{description}}}: {{{amount}}} {{#if isRecurring}}(Recurrente){{/if}}
      {{/each}}
  {{/each}}

  {{#if unCategorizedExpenses.length}}
  Gastos sin Categorizar:
    {{#each unCategorizedExpenses}}
    - {{{description}}}: {{{amount}}} {{#if isRecurring}}(Recurrente){{/if}}
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
