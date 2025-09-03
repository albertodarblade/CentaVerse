'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { es } from "date-fns/locale";
import React, { useState, useEffect } from "react";
import { formatTransactionDate } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

interface TransactionsListProps {
  transactions: Transaction[];
  tagIcons: { [key: string]: React.ReactNode };
  onTransactionClick: (transaction: Transaction) => void;
}

const TransactionListItem = ({ transaction, onClick, tagIcons }: { transaction: Transaction, onClick: (transaction: Transaction) => void, tagIcons: { [key: string]: React.ReactNode }}) => {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);
  const [formattedAmount, setFormattedAmount] = useState<string | null>(null);

  useEffect(() => {
    setFormattedTime(format(new Date(transaction.date), 'p', { locale: es }));
    setFormattedAmount(
        new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(transaction.amount)
    );
  }, [transaction.date, transaction.amount]);
  
  return (
    <div
      className="flex items-center p-4 rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => onClick(transaction)}
    >
        <div className="flex-1 space-y-1">
            <p className="font-semibold">{transaction.description}</p>
            <div className="flex flex-wrap gap-1">
                {transaction.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal flex items-center gap-1">
                        {tagIcons[tag]}
                        {tag}
                    </Badge>
                ))}
            </div>
        </div>
        <div className="text-right ml-4">
            <p className="font-bold text-lg">{formattedAmount}</p>
            <p className="text-sm text-muted-foreground">{formattedTime}</p>
        </div>
    </div>
  );
}

export default function TransactionsList({ transactions, tagIcons, onTransactionClick }: TransactionsListProps) {
  const [groupedTransactions, setGroupedTransactions] = useState<{ [key: string]: Transaction[] }>({});

  useEffect(() => {
    const groupTransactionsByDate = (transactions: Transaction[]) => {
      return transactions.reduce((acc, transaction) => {
        const dateKey = formatTransactionDate(new Date(transaction.date));
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(transaction);
        return acc;
      }, {} as { [key: string]: Transaction[] });
    };

    setGroupedTransactions(groupTransactionsByDate(transactions));
  }, [transactions]);
  
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-bold tracking-tight text-muted-foreground">No se encontraron gastos</h3>
        <p className="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o filtros.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, transactionsForDate]) => (
        <div key={date}>
          <h3 className="text-md font-medium text-muted-foreground mb-2 px-4">{date}</h3>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            {transactionsForDate.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <TransactionListItem 
                  transaction={transaction}
                  onClick={onTransactionClick}
                  tagIcons={tagIcons}
                />
                {index < transactionsForDate.length - 1 && <div className="border-b" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
