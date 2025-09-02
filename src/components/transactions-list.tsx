import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { ArrowDownCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface TransactionsListProps {
  transactions: Transaction[];
}

export default function TransactionsList({ transactions }: TransactionsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseTransactions.length > 0 ? (
                expenseTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <ArrowDownCircle className="h-5 w-5 text-red-500" />
                  </TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {transaction.category.map(cat => (
                        <Badge key={cat} variant="outline">{cat}</Badge>
                      ))}
                    </div>
                  </TableCell>
                   <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell className={`text-right font-semibold text-red-600`}>
                    -
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No expenses yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
