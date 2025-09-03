import Dashboard from "@/components/dashboard";
import clientPromise from "@/lib/mongodb";
import type { Transaction, Tag, Income } from "@/lib/types";
import { getTags, getIncomes, getTransactions } from "@/app/actions";

export default async function Home() {
  const transactions: Transaction[] = await getTransactions(1, 30);
  const tags: Tag[] = await getTags();
  const incomes: Income[] = await getIncomes();
  
  return (
    <Dashboard initialTransactions={transactions} initialTags={tags} initialIncomes={incomes} />
  );
}
