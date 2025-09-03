'use server';

import { getSpendingInsights, SpendingInsightsInput } from '@/ai/flows/spending-insights-from-summary';
import { revalidatePath } from 'next/cache';
import { Tag, Transaction, Income } from '@/lib/types';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const TAG_COLORS = [
    'red', 'orange', 'amber', 'yellow', 'lime', 
    'green', 'cyan', 'blue', 'violet', 'fuchsia'
];

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
        const tags = await db.collection('tags').find({}).sort({ order: 1 }).toArray();
        return JSON.parse(JSON.stringify(tags)).map((t: any) => ({
            ...t,
            id: t._id.toString(),
        }));
    } catch (error) {
        console.error("Error fetching tags:", error);
        return [];
    }
}

export async function addTag(tag: Omit<Tag, 'id' | 'order' | 'color'> & {order?: number}) {
    try {
        const db = await getDb();
        const count = await db.collection('tags').countDocuments();
        const newTag = { 
            ...tag, 
            order: count,
            color: 'black'
        };
        await db.collection('tags').insertOne(newTag);
        revalidatePath('/');
    } catch (error) {
        console.error("Error adding tag:", error);
        throw new Error("Failed to add tag.");
    }
}

export async function updateTag(tag: any) {
    try {
        const db = await getDb();
        const { _id, id, iconNode, ...tagData } = tag;
        const objectId = new ObjectId(_id);
        
        const oldTag = await db.collection('tags').findOne({ _id: objectId });
        if (!oldTag) {
            throw new Error("Tag not found.");
        }
        const oldName = oldTag.name;

        await db.collection('tags').updateOne(
            { _id: objectId },
            { $set: tagData }
        );

        if (oldName !== tagData.name) {
             await db.collection('transactions').updateMany(
                { tags: oldName },
                { $set: { "tags.$[elem]": tagData.name } },
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

export async function updateTagOrder(tags: Tag[]) {
    try {
        const db = await getDb();
        const bulkOps = tags.map((tag, index) => ({
            updateOne: {
                filter: { _id: new ObjectId(tag._id) },
                update: { $set: { order: index } }
            }
        }));
        if (bulkOps.length > 0) {
            await db.collection('tags').bulkWrite(bulkOps);
        }
        revalidatePath('/');
    } catch (error) {
        console.error("Error updating tag order:", error);
        throw new Error("Failed to update tag order.");
    }
}

export async function getIncomes(): Promise<Income[]> {
    try {
        const db = await getDb();
        const incomes = await db.collection('incomes').find({}).toArray();
        return JSON.parse(JSON.stringify(incomes)).map((i: any) => ({
            ...i,
            id: i._id.toString(),
        }));
    } catch (error) {
        console.error("Error fetching incomes:", error);
        return [];
    }
}

export async function addIncome(income: Omit<Income, 'id'>) {
    try {
        const db = await getDb();
        await db.collection('incomes').insertOne(income);

        const newTransaction: Omit<Transaction, 'id'> = {
            ...income,
            type: 'income',
            tags: ['Ingreso'],
            date: new Date(),
        };

        await db.collection('transactions').insertOne(newTransaction);
        revalidatePath('/');
    } catch (error) {
        console.error("Error adding income:", error);
        throw new Error("Failed to add income.");
    }
}

export async function updateIncome(income: Income) {
    try {
        const db = await getDb();
        const { id, _id, ...incomeData } = income;
        const objectId = _id ? new ObjectId(_id) : new ObjectId(id);
        await db.collection('incomes').updateOne(
            { _id: objectId },
            { $set: incomeData }
        );
        revalidatePath('/');
    } catch (error) {
        console.error("Error updating income:", error);
        throw new Error("Failed to update income.");
    }
}

export async function deleteIncome(incomeId: string) {
    try {
        const db = await getDb();
        const objectId = new ObjectId(incomeId);
        await db.collection('incomes').deleteOne({ _id: objectId });
        revalidatePath('/');
    } catch (error) {
        console.error("Error deleting income:", error);
        throw new Error("Failed to delete income.");
    }
}