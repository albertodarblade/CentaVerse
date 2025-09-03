'use server';

import { getSpendingInsights, SpendingInsightsInput } from '@/ai/flows/spending-insights-from-summary';
import { revalidatePath } from 'next/cache';
import { Tag, Transaction } from '@/lib/types';
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
        const { id, _id, ...transactionData } = transaction;
        const objectId = _id ? new ObjectId(_id) : new ObjectId(id);
        await db.collection('transactions').updateOne(
            { _id: objectId },
            { $set: transactionData }
        );
        revalidatePath('/');
    } catch (error) {
        console.error("Error updating transaction:", error);
        throw new Error("Failed to update transaction.");
    }
}

export async function deleteTransaction(transaction: Transaction) {
    try {
        const db = await getDb();
        const { id, _id } = transaction;
        const objectId = _id ? new ObjectId(_id) : new ObjectId(id);
        await db.collection('transactions').deleteOne({ _id: objectId });
        revalidatePath('/');
    } catch (error) {
        console.error("Error deleting transaction:", error);
        throw new Error("Failed to delete transaction.");
    }
}

export async function getTags(): Promise<Tag[]> {
    try {
        const db = await getDb();
        const tags = await db.collection('tags').find({}).toArray();
        return JSON.parse(JSON.stringify(tags)).map((t: any) => ({
            ...t,
            id: t._id.toString(),
        }));
    } catch (error) {
        console.error("Error fetching tags:", error);
        return [];
    }
}

export async function addTag(tag: Omit<Tag, 'id'>) {
    try {
        const db = await getDb();
        await db.collection('tags').insertOne(tag);
        revalidatePath('/');
    } catch (error) {
        console.error("Error adding tag:", error);
        throw new Error("Failed to add tag.");
    }
}

export async function updateTag(tag: Tag) {
    try {
        const db = await getDb();
        const { id, _id, ...tagData } = tag;
        const objectId = _id ? new ObjectId(_id) : new ObjectId(id);

        const oldTag = await db.collection('tags').findOne({ _id: objectId });
        if (!oldTag) {
            throw new Error("Tag not found.");
        }
        const oldName = oldTag.name;

        await db.collection('tags').updateOne(
            { _id: objectId },
            { $set: tagData }
        );

        if (oldName !== tag.name) {
             await db.collection('transactions').updateMany(
                { tags: oldName },
                { $set: { "tags.$[elem]": tag.name } },
                { arrayFilters: [{ "elem": oldName }] }
            );
        }

        revalidatePath('/');
    } catch (error) {
        console.error("Error updating tag:", error);
        throw new Error("Failed to update tag.");
    }
}

export async function deleteTag(tag: Tag) {
    try {
        const db = await getDb();
        const { id, _id } = tag;
        const objectId = _id ? new ObjectId(_id) : new ObjectId(id);
        
        await db.collection('transactions').updateMany(
            { tags: tag.name },
            { $pull: { tags: tag.name } }
        );

        await db.collection('tags').deleteOne({ _id: objectId });
        
        revalidatePath('/');
    } catch (error) {
        console.error("Error deleting tag:", error);
        throw new Error("Failed to delete tag.");
    }
}
