'use client';

import {
  Card,
} from "@/components/ui/card";
import type { Transaction, Tag } from "@/lib/types";
import { format } from 'date-fns';
import { es } from "date-fns/locale";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { formatTransactionDate, cn } from '@/lib/utils';
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
  const [formattedAmount, setFormattedAmount] = useState<string | null>(null);

  useEffect(() => {
    setFormattedAmount(
        `-Bs${new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(transaction.amount)}`
    );
  }, [transaction.amount]);

  const tag = transaction.tags.length > 0 ? tagMap[transaction.tags[0]] : null;
  
  return (
    <Card
        className="p-4 cursor-pointer transition-colors hover:bg-muted/50"
        onClick={() => onClick(transaction)}
    >
      <div className="flex items-center">
          <div className="flex-1 flex items-center gap-4">
              {tag && (
                <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    `bg-tag-${tag.color}`
                )}>
                  <div className={cn(
                      "h-6 w-6",
                      `text-tag-${tag.color}-foreground`
                  )}>
                    {React.cloneElement(tag.iconNode as React.ReactElement, { className: 'h-6 w-6' })}
                  </div>
                </div>
              )}
              <p className="font-semibold text-base">{transaction.description}</p>
          </div>
          <div className="text-right ml-4">
              <p className="font-bold text-base text-foreground">{formattedAmount}</p>
          </div>
      </div>
    </Card>
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

  const dateKeys = Object.keys(groupedTransactions);

  return (
    <div className="space-y-4">
      {dateKeys.map((date, dateIndex) => (
        <div key={date}>
          <h3 className="text-md font-medium text-muted-foreground mb-3 px-2">{date}</h3>
          <div className="space-y-2">
            {groupedTransactions[date].map((transaction, index) => {
              const isLastElement = dateIndex === dateKeys.length - 1 && index === groupedTransactions[date].length - 1;
              return (
                <div key={transaction.id} ref={isLastElement ? lastElementRef : null}>
                    <TransactionListItem 
                      transaction={transaction}
                      onClick={onTransactionClick}
                      tagMap={tagMap}
                    />
                </div>
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
