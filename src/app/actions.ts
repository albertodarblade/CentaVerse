'use server';

import { getSpendingInsights, SpendingInsightsInput } from '@/ai/flows/spending-insights-from-summary';
import { revalidatePath } from 'next/cache';
import { Tag, Transaction, Income, RecurringExpense } from '@/lib/types';
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

export async function getTransactions(page: number, limit: number = 30, date?: string): Promise<Transaction[]> {
    try {
        const db = await getDb();

        let query = {};
        if (date) {
            const selectedDate = new Date(date);
            // Set to the beginning of the day
            selectedDate.setHours(0, 0, 0, 0);

            const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            // Set to the end of the day
            endDate.setHours(23, 59, 59, 999);

            query = {
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            };
        }

        const transactions = await db.collection("transactions")
            .find(query)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        return JSON.parse(JSON.stringify(transactions)).map((t: any) => ({
            ...t,
            id: t._id.toString(),
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'type'>) {
  try {
    const db = await getDb();
    const newTransaction: Omit<Transaction, 'id'> & { type: 'expense' | 'income' } = {
        ...transaction,
        type: 'expense'
    };
    const result = await db.collection('transactions').insertOne(newTransaction);
    
    const insertedDoc = await db.collection('transactions').findOne({ _id: result.insertedId });
    return JSON.parse(JSON.stringify({ ...insertedDoc, id: insertedDoc?._id.toString() }));

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
        
        const updateData = {
          ...transactionData,
          date: new Date(transactionData.date)
        };

        await db.collection('transactions').updateOne(
            { _id: objectId },
            { $set: updateData }
        );
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
    } catch (error)
    {
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

export async function addTag(tag: Omit<Tag, 'id' | 'order'> & {order?: number}) {
    try {
        const db = await getDb();
        const count = await db.collection('tags').countDocuments();
        const newTag = { 
            ...tag, 
            order: count,
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
                { tag: oldName },
                { $set: { "tag": tagData.name } }
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
            { tag: tag.name },
            { $set: { tag: "Sin categoría" } }
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

export async function getRecurringExpenses(): Promise<RecurringExpense[]> {
    try {
        const db = await getDb();
        const expenses = await db.collection('recurring_expenses').find({}).toArray();
        return JSON.parse(JSON.stringify(expenses)).map((e: any) => ({
            ...e,
            id: e._id.toString(),
        }));
    } catch (error) {
        console.error("Error fetching recurring expenses:", error);
        return [];
    }
}

export async function addRecurringExpense(expense: Omit<RecurringExpense, 'id'>) {
    try {
        const db = await getDb();
        await db.collection('recurring_expenses').insertOne(expense);
        revalidatePath('/');
    } catch (error) {
        console.error("Error adding recurring expense:", error);
        throw new Error("Failed to add recurring expense.");
    }
}

export async function updateRecurringExpense(expense: RecurringExpense) {
    try {
        const db = await getDb();
        const { id, _id, ...expenseData } = expense;
        const objectId = _id ? new ObjectId(_id) : new ObjectId(id);
        await db.collection('recurring_expenses').updateOne(
            { _id: objectId },
            { $set: expenseData }
        );
        revalidatePath('/');
    } catch (error) {
        console.error("Error updating recurring expense:", error);
        throw new Error("Failed to update recurring expense.");
    }
}

export async function deleteRecurringExpense(expenseId: string) {
    try {
        const db = await getDb();
        const objectId = new ObjectId(expenseId);
        await db.collection('recurring_expenses').deleteOne({ _id: objectId });
        revalidatePath('/');
    } catch (error) {
        console.error("Error deleting recurring expense:", error);
        throw new Error("Failed to delete recurring expense.");
    }
}
