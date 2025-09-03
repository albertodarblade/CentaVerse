'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import React, { useState, useEffect } from "react";

interface TransactionsListProps {
  transactions: Transaction[];
  tagIcons: { [key: string]: React.ReactNode };
  onTransactionClick: (transaction: Transaction) => void;
}

const cardColors = [
  "bg-pink-100/60 border-pink-300/80",
  "bg-blue-100/60 border-blue-300/80",
  "bg-green-100/60 border-green-300/80",
  "bg-purple-100/60 border-purple-300/80",
  "bg-yellow-100/60 border-yellow-300/80",
];

const TransactionCard = ({ transaction, color, onClick, tagIcons }: { transaction: Transaction, color: string, onClick: (transaction: Transaction) => void, tagIcons: { [key: string]: React.ReactNode }}) => {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(formatDistanceToNow(new Date(transaction.date), { addSuffix: true, locale: es }));
  }, [transaction.date]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(amount);
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${color}`}
      onClick={() => onClick(transaction)}
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold">{transaction.description}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground h-4">
          {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-bold text-foreground">
          {formatCurrency(transaction.amount)}
        </div>
        <div className="flex flex-wrap gap-2">
          {transaction.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
               {tagIcons[tag] || null}
               <span>{tag}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )

}

export default function TransactionsList({ transactions, tagIcons, onTransactionClick }: TransactionsListProps) {
  
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-bold tracking-tight text-muted-foreground">No se encontraron gastos</h3>
        <p className="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o filtros.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {transactions.map((transaction, index) => (
        <TransactionCard 
          key={transaction.id} 
          transaction={transaction}
          color={cardColors[index % cardColors.length]}
          onClick={onTransactionClick}
          tagIcons={tagIcons}
        />
      ))}
    </div>
  );
}
