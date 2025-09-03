import Dashboard from "@/components/dashboard";
import clientPromise from "@/lib/mongodb";
import type { Transaction, Tag, Income, RecurringExpense } from "@/lib/types";
import { getTags, getIncomes, getTransactions, getRecurringExpenses } from "@/app/actions";

export default async function Home() {
  const transactions: Transaction[] = await getTransactions(1, 30);
  const tags: Tag[] = await getTags();
  const incomes: Income[] = await getIncomes();
  const recurringExpenses: RecurringExpense[] = await getRecurringExpenses();
  
  return (
    <Dashboard 
      initialTransactions={transactions} 
      initialTags={tags} 
      initialIncomes={incomes}
      initialRecurringExpenses={recurringExpenses}
    />
  );
}
