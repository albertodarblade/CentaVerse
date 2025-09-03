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

interface TransactionsListProps {
  transactions: Transaction[];
  tagIcons: { [key: string]: React.ReactNode };
}

const cardColors = [
  "bg-pink-100/60 border-pink-300/80",
  "bg-blue-100/60 border-blue-300/80",
  "bg-green-100/60 border-green-300/80",
  "bg-purple-100/60 border-purple-300/80",
  "bg-yellow-100/60 border-yellow-300/80",
];

export default function TransactionsList({ transactions, tagIcons }: TransactionsListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };
  
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
        <Card key={transaction.id} className={`${cardColors[index % cardColors.length]}`}>
          <CardHeader>
            <CardTitle className="text-lg font-bold">{transaction.description}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {formatDate(transaction.date)}
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
      ))}
    </div>
  );
}
