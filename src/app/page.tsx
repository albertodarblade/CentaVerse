import Dashboard from "@/components/dashboard";
import clientPromise from "@/lib/mongodb";
import type { Transaction, Tag, Income } from "@/lib/types";
import { getTags, getIncomes } from "@/app/actions";

async function getTransactions() {
  try {
    const client = await clientPromise;
    const db = client.db("centaverse");
    const transactions = await db.collection("transactions").find({}).sort({ date: -1 }).toArray();

    return JSON.parse(JSON.stringify(transactions)).map((t: any) => ({
      ...t,
      id: t._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export default async function Home() {
  const transactions: Transaction[] = await getTransactions();
  const tags: Tag[] = await getTags();
  const incomes: Income[] = await getIncomes();
  
  return (
    <Dashboard initialTransactions={transactions} initialTags={tags} initialIncomes={incomes} />
  );
}
