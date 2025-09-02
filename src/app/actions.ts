'use server';

import { getSpendingInsights, SpendingInsightsInput } from '@/ai/flows/spending-insights-from-summary';

export async function getAIInsightsAction(input: SpendingInsightsInput) {
  try {
    const result = await getSpendingInsights(input);
    return result.insights;
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return 'An error occurred while generating insights. Please try again later.';
  }
}
