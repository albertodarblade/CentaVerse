'use client';

import { useState, useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import Header from './header';
import SummaryCards from './summary-cards';
import TransactionForm from './transaction-form';
import TransactionsList from './transactions-list';
import AIInsights from './ai-insights';

const initialTransactions: Transaction[] = [
    { id: '2', type: 'expense', amount: 1200, description: 'Apartment Rent', category: 'Housing', date: new Date('2024-07-01T10:00:00Z') },
    { id: '3', type: 'expense', amount: 150.75, description: 'Weekly Groceries', category: 'Food', date: new Date('2024-07-03T18:30:00Z') },
    { id: '5', type: 'expense', amount: 55.50, description: 'Dinner with friends', category: 'Entertainment', date: new Date('2024-07-06T20:00:00Z') },
    { id: '6', type: 'expense', amount: 80, description: 'Fuel for car', category: 'Transport', date: new Date('2024-07-08T08:00:00Z') },
    { id: '7', type: 'expense', amount: 250, description: 'New headphones', category: 'Shopping', date: new Date('2024-07-10T11:45:00Z') },
    { id: '8', type: 'expense', amount: 45, description: 'Movie tickets', category: 'Entertainment', date: new Date('2024-07-12T19:15:00Z') },
    { id: '9', type: 'expense', amount: 30, description: 'Pharmacy', category: 'Health', date: new Date('2024-07-14T16:00:00Z') },
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date' | 'type'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().getTime().toString(),
      date: new Date(),
      type: 'expense'
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const { totalExpenses } = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalExpenses: expenses,
    };
  }, [transactions]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <SummaryCards
          expenses={totalExpenses}
        />
        <div className="space-y-4">
            <TransactionForm onAddTransaction={addTransaction} />
            <TransactionsList transactions={transactions} />
        </div>
        <div>
            <AIInsights transactions={transactions} />
        </div>
      </main>
    </div>
  );
}
