import Dashboard from "@/components/dashboard";
import clientPromise from "@/lib/mongodb";
import type { Transaction, Tag } from "@/lib/types";
import { getTags } from "@/app/actions";

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
  
  return (
    <Dashboard initialTransactions={transactions} initialTags={tags} />
  );
}
