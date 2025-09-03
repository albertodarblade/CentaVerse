'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Tag, Transaction, Income, RecurringExpense } from '@/lib/types';
import Header from './header';
import TransactionForm from './transaction-form';
import TransactionsList from './transactions-list';
import AIInsights from './ai-insights';
import MonthlySummary from './monthly-summary';
import RecurringTransactions from './recurring-transactions';
import BottomNavbar from './bottom-navbar';
import { 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  addTag, 
  updateTag, 
  deleteTag, 
  updateTagOrder, 
  addIncome, 
  updateIncome, 
  deleteIncome,
  getRecurringExpenses,
  addRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense
} from '@/app/actions';
import { Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, MoreHorizontal, Plus, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { useToast } from "@/hooks/use-toast";
import { useDebouncedCallback } from 'use-debounce';

const iconMap: { [key: string]: React.ReactNode } = {
  Briefcase: <Briefcase className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
  Lightbulb: <Lightbulb className="h-4 w-4" />,
  AlertTriangle: <AlertTriangle className="h-4 w-4" />,
  Utensils: <Utensils className="h-4 w-4" />,
  Car: <Car className="h-4 w-4" />,
  Home: <Home className="h-4 w-4" />,
  Clapperboard: <Clapperboard className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  HeartPulse: <HeartPulse className="h-4 w-4" />,
  Plane: <Plane className="h-4 w-4" />,
  Gift: <Gift className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  PawPrint: <PawPrint className="h-4 w-4" />,
  Gamepad2: <Gamepad2 className="h-4 w-4" />,
  Music: <Music className="h-4 w-4" />,
  Shirt: <Shirt className="h-4 w-4" />,
  Dumbbell: <Dumbbell className="h-4 w-4" />,
  Coffee: <Coffee className="h-4 w-4" />,
  Phone: <Phone className="h-4 w-4" />,
  Mic: <Mic className="h-4 w-4" />,
  Film: <Film className="h-4 w-4" />,
  School: <School className="h-4 w-4" />,
  Banknote: <Banknote className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  MoreHorizontal: <MoreHorizontal className="h-4 w-4" />,
};

interface DashboardProps {
  initialTransactions: Transaction[];
  initialTags: Tag[];
  initialIncomes: Income[];
  initialRecurringExpenses: RecurringExpense[];
}

export default function Dashboard({ initialTransactions, initialTags, initialIncomes, initialRecurringExpenses }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(initialRecurringExpenses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [activeView, setActiveView] = useState('all-expenses');
  const { toast } = useToast();
  
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(initialTransactions);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAllTransactions(initialTransactions);
    setPage(1);
    setHasMore(initialTransactions.length > 0);
  }, [initialTransactions]);

  useEffect(() => {
    setTags(initialTags.sort((a, b) => a.order - b.order));
  }, [initialTags]);
  
  useEffect(() => {
    setIncomes(initialIncomes);
  }, [initialIncomes]);

  useEffect(() => {
    setRecurringExpenses(initialRecurringExpenses);
  }, [initialRecurringExpenses]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isFormOpen && event.state?.modal !== 'transaction-form') {
        setIsFormOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isFormOpen]);
  
  const handleSetIsFormOpen = (open: boolean) => {
    if (open) {
      if (window.history.state?.modal !== 'transaction-form') {
        window.history.pushState({ modal: 'transaction-form' }, '');
      }
    } else {
      if (window.history.state?.modal === 'transaction-form') {
        window.history.back();
      }
    }
    setIsFormOpen(open);
  }

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'type'>) => {
    const tempId = `temp-${Date.now()}`;
    const newTransactionOptimistic: Transaction = {
      ...transaction,
      id: tempId,
      _id: tempId,
      type: 'expense',
      date: new Date(transaction.date)
    };

    setAllTransactions(current => [newTransactionOptimistic, ...current]);
    handleSetIsFormOpen(false);

    try {
      const savedTransaction = await addTransaction(transaction);
      setAllTransactions(current => 
        current.map(t => t.id === tempId ? savedTransaction : t)
      );
    } catch (error) {
      setAllTransactions(current => current.filter(t => t.id !== tempId));
      toast({
        title: "Error",
        description: "No se pudo añadir la transacción.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateTransaction = async (transaction: Transaction) => {
    const originalTransactions = [...allTransactions];
    setAllTransactions(current => current.map(t => t.id === transaction.id ? transaction : t));
    handleSetIsFormOpen(false);
    setEditingTransaction(null);

    try {
      await updateTransaction(transaction);
    } catch (error) {
      setAllTransactions(originalTransactions);
      toast({
        title: "Error",
        description: "No se pudo actualizar la transacción.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      await deleteTransaction(transaction);
      setAllTransactions(current => current.filter(t => t.id !== transaction.id));
      handleSetIsFormOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la transacción.",
        variant: "destructive"
      });
    }
  }

  const handleOpenFormForCreate = () => {
    setEditingTransaction(null);
    handleSetIsFormOpen(true);
  }

  const handleOpenFormForEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    handleSetIsFormOpen(true);
  }
  
  const handleCloseForm = () => {
    handleSetIsFormOpen(false);
    setEditingTransaction(null);
  }

  const handleAddTag = async (tag: Omit<Tag, 'id' | 'order'>) => {
    try {
      await addTag(tag);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir la etiqueta.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTag = async (tag: Tag) => {
    try {
        await updateTag(tag);
    } catch (error) {
        toast({
            title: "Error",
            description: "No se pudo actualizar la etiqueta.",
            variant: "destructive"
        });
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    try {
        await deleteTag(tag);
    } catch (error) {
        toast({
            title: "Error",
            description: "No se pudo eliminar la etiqueta.",
            variant: "destructive"
        });
    }
  };

  const handleReorderTags = async (tags: Tag[]) => {
    try {
      await updateTagOrder(tags);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo reordenar las etiquetas.",
        variant: "destructive"
      });
    }
  };

  const handleAddIncome = async (income: Omit<Income, 'id'>) => {
    try {
      await addIncome(income);
      const updatedIncomes = await getIncomes();
      setIncomes(updatedIncomes);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir el ingreso.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateIncome = async (income: Income) => {
    try {
      await updateIncome(income);
       const updatedIncomes = await getIncomes();
      setIncomes(updatedIncomes);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el ingreso.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    try {
      await deleteIncome(incomeId);
      const updatedIncomes = await getIncomes();
      setIncomes(updatedIncomes);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el ingreso.",
        variant: "destructive"
      });
    }
  };

    const handleAddRecurringExpense = async (expense: Omit<RecurringExpense, 'id'>) => {
    try {
      await addRecurringExpense(expense);
      const updatedExpenses = await getRecurringExpenses();
      setRecurringExpenses(updatedExpenses);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir el gasto recurrente.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateRecurringExpense = async (expense: RecurringExpense) => {
    try {
      await updateRecurringExpense(expense);
      const updatedExpenses = await getRecurringExpenses();
      setRecurringExpenses(updatedExpenses);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el gasto recurrente.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRecurringExpense = async (expenseId: string) => {
    try {
      await deleteRecurringExpense(expenseId);
      const updatedExpenses = await getRecurringExpenses();
      setRecurringExpenses(updatedExpenses);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto recurrente.",
        variant: "destructive"
      });
    }
  };
  
  const unFilteredTransactions = useMemo(() => {
    return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      const searchTermMatch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const tagMatch = activeTag === 'all' || transaction.tags.includes(activeTag);
      return searchTermMatch && tagMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, searchTerm, activeTag]);

  const tagMap = useMemo(() => {
    return tags.reduce((acc, tag) => {
      acc[tag.name] = {
        ...tag,
        iconNode: iconMap[tag.icon] || <MoreHorizontal className="h-4 w-4" />
      };
      return acc;
    }, {} as { [key: string]: Tag & { iconNode: React.ReactNode } });
  }, [tags]);

  const tagsWithIcons = useMemo(() => {
    return tags.map(tag => ({...tag, iconNode: iconMap[tag.icon] || <MoreHorizontal className="h-4 w-4" />}));
  }, [tags]);

  const loadMoreTransactions = useDebouncedCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    const nextPage = page + 1;
    const newTransactions = await getTransactions(nextPage, 30);
    if (newTransactions.length > 0) {
      setAllTransactions(prev => [...prev, ...newTransactions]);
      setPage(nextPage);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, 500);

  const renderContent = () => {
    switch (activeView) {
      case 'all-expenses':
        return (
          <TransactionsList 
            transactions={unFilteredTransactions} 
            tagMap={tagMap}
            onTransactionClick={handleOpenFormForEdit}
            loadMoreTransactions={loadMoreTransactions}
            hasMore={hasMore}
            isLoading={isLoading}
            isFiltered={false}
          />
        );
      case 'recurring':
        return (
          <RecurringTransactions
            incomes={incomes}
            onAddIncome={handleAddIncome}
            onUpdateIncome={handleUpdateIncome}
            onDeleteIncome={handleDeleteIncome}
            recurringExpenses={recurringExpenses}
            onAddRecurringExpense={handleAddRecurringExpense}
            onUpdateRecurringExpense={handleUpdateRecurringExpense}
            onDeleteRecurringExpense={handleDeleteRecurringExpense}
          />
        );
      case 'ai-insights':
        return <AIInsights transactions={allTransactions} />;
      case 'advanced':
        return (
          <div className="space-y-4">
            <Header 
              onSearch={setSearchTerm} 
              tags={tagsWithIcons} 
              activeTag={activeTag} 
              onSetActiveTag={setActiveTag}
            />
            <TransactionsList 
              transactions={filteredTransactions} 
              tagMap={tagMap}
              onTransactionClick={handleOpenFormForEdit}
              loadMoreTransactions={() => {}}
              hasMore={false}
              isLoading={false}
              isFiltered={true}
            />
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <div className="p-4 md:p-6">
        <MonthlySummary transactions={allTransactions} incomes={incomes} recurringExpenses={recurringExpenses} />
      </div>
      
      <main className="flex-1 p-4 md:p-6 space-y-6 mb-24">
        {renderContent()}
      </main>

      <Dialog open={isFormOpen} onOpenChange={handleSetIsFormOpen}>
        {(activeView === 'all-expenses' || activeView === 'advanced') && (
            <DialogTrigger asChild>
              <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50">
                <Button variant="default" size="icon" className="h-16 w-16 rounded-full shadow-lg" onClick={handleOpenFormForCreate}>
                  <Plus className="h-8 w-8" />
                  <span className="sr-only">Añadir Gasto</span>
                </Button>
              </div>
            </DialogTrigger>
        )}
        <DialogContent>
          <TransactionForm 
            onAddTransaction={handleAddTransaction} 
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            transactionToEdit={editingTransaction}
            tags={tagsWithIcons}
            onAddTag={handleAddTag}
            onUpdateTag={handleUpdateTag}
            onDeleteTag={handleDeleteTag}
            onReorderTags={handleReorderTags}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
      <BottomNavbar activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}
