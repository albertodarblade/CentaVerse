'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Transaction, Tag } from "@/lib/types";
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { es } from "date-fns/locale";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { formatTransactionDate, cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface TransactionsListProps {
  transactions: Transaction[];
  tagMap: { [key: string]: Tag & { iconNode: React.ReactNode } };
  onTransactionClick: (transaction: Transaction) => void;
  loadMoreTransactions: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isFiltered: boolean;
}

const TransactionListItem = ({ transaction, onClick, tagMap }: { transaction: Transaction, onClick: (transaction: Transaction) => void, tagMap: { [key: string]: Tag & { iconNode: React.ReactNode } }}) => {
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
                {transaction.tags.map((tagName) => {
                    const tag = tagMap[tagName];
                    if (!tag) return null;
                    return (
                        <div 
                            key={tagName} 
                            className={cn(
                                "inline-flex items-center rounded-full border bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            )}
                        >
                            {tag.iconNode}
                            <span className="ml-1">{tag.name}</span>
                        </div>
                    )
                })}
            </div>
        </div>
        <div className="text-right ml-4">
            <p className="font-bold text-lg">{formattedAmount}</p>
            <p className="text-sm text-muted-foreground">{formattedTime}</p>
        </div>
    </div>
  );
}

export default function TransactionsList({ transactions, tagMap, onTransactionClick, loadMoreTransactions, hasMore, isLoading, isFiltered }: TransactionsListProps) {
  const [groupedTransactions, setGroupedTransactions] = useState<{ [key: string]: Transaction[] }>({});
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFiltered) {
        loadMoreTransactions();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMoreTransactions, isFiltered]);


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
  
  if (transactions.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-bold tracking-tight text-muted-foreground">No se encontraron gastos</h3>
        <p className="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o filtros.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, transactionsForDate], dateIndex) => (
        <div key={date}>
          <h3 className="text-md font-medium text-muted-foreground mb-2 px-4">{date}</h3>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            {transactionsForDate.map((transaction, index) => {
              const isLastElement = dateIndex === Object.keys(groupedTransactions).length - 1 && index === transactionsForDate.length - 1;
              return (
                <React.Fragment key={transaction.id}>
                    <div ref={isLastElement ? lastElementRef : null}>
                        <TransactionListItem 
                          transaction={transaction}
                          onClick={onTransactionClick}
                          tagMap={tagMap}
                        />
                    </div>
                  {index < transactionsForDate.length - 1 && <div className="border-b" />}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      ))}
       {isLoading && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {!hasMore && !isFiltered && transactions.length > 0 && (
        <p className="text-center text-muted-foreground">No hay más transacciones</p>
      )}
    </div>
  );
}
