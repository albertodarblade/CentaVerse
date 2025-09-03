'use server';

import { getSpendingInsights, SpendingInsightsInput } from '@/ai/flows/spending-insights-from-summary';
import { revalidatePath } from 'next/cache';
import { Transaction } from '@/lib/types';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db("centaverse");
}

export async function getAIInsightsAction(input: SpendingInsightsInput) {
  try {
    const result = await getSpendingInsights(input);
    return result.insights;
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return 'An error occurred while generating insights. Please try again later.';
  }
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'date' | 'type'>) {
  try {
    const db = await getDb();
    const newTransaction: Omit<Transaction, 'id'> & { type: 'expense' | 'income' } = {
        ...transaction,
        date: new Date(),
        type: 'expense'
    };
    await db.collection('transactions').insertOne(newTransaction);
    revalidatePath('/');
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw new Error("Failed to add transaction.");
  }
}

export async function updateTransaction(transaction: Transaction) {
    try {
        const db = await getDb();
        const { id, ...transactionData } = transaction;
        await db.collection('transactions').updateOne(
            { _id: new ObjectId(id) },
            { $set: transactionData }
        );
        revalidatePath('/');
    } catch (error) {
        console.error("Error updating transaction:", error);
        throw new Error("Failed to update transaction.");
    }
}

export async function deleteTransaction(transactionId: string) {
    try {
        const db = await getDb();
        await db.collection('transactions').deleteOne({ _id: new ObjectId(transactionId) });
        revalidatePath('/');
    } catch (error) {
        console.error("Error deleting transaction:", error);
        throw new Error("Failed to delete transaction.");
    }
}
