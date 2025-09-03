'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Tag, Transaction, Income } from '@/lib/types';
import Header from './header';
import TransactionForm from './transaction-form';
import TransactionsList from './transactions-list';
import AIInsights from './ai-insights';
import MonthlySummary from './monthly-summary';
import MonthlyIncome from './monthly-income';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, addTag, updateTag, deleteTag, updateTagOrder, addIncome, updateIncome, deleteIncome } from '@/app/actions';
import { Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, MoreHorizontal, Plus, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

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
}

export default function Dashboard({ initialTransactions, initialTags, initialIncomes }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [incomes, setIncomes] = useState<Income[]>(initialIncomes);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
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
    const handlePopState = (event: PopStateEvent) => {
      if (isFormOpen && event.state?.modal !== 'transaction-form') {
        setIsFormOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isFormOpen]);
  
  const onTransactionUpdate = useCallback((updatedTransaction: Transaction) => {
    setAllTransactions(currentTransactions =>
      currentTransactions.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
  }, []);

  const handleSetIsFormOpen = (open: boolean) => {
    if (open) {
      // Push a state to history when opening the modal
      if (window.history.state?.modal !== 'transaction-form') {
        window.history.pushState({ modal: 'transaction-form' }, '');
      }
    } else {
      // Go back in history if the current state is the one we pushed
      if (window.history.state?.modal === 'transaction-form') {
        window.history.back();
      }
    }
    setIsFormOpen(open);
  }

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'type'>) => {
    try {
      await addTransaction(transaction);
      // This will be revalidated from the server, no need to manually update state
      handleSetIsFormOpen(false);
    } catch (error) {
       toast({
        title: "Error",
        description: "No se pudo añadir la transacción.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateTransaction = async (transaction: Transaction, closeModal: boolean = true) => {
    try {
      await updateTransaction(transaction);
      onTransactionUpdate(transaction);
      if (closeModal) {
          handleSetIsFormOpen(false);
          setEditingTransaction(null);
      }
    } catch (error) {
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

  const handleAddTag = async (tagName: string, iconName: string) => {
    try {
      await addTag({ name: tagName, icon: iconName });
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
        // No toast for this to avoid being noisy during edits
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
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el ingreso.",
        variant: "destructive"
      });
    }
  };
  
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

  const loadMoreTransactions = useCallback(async () => {
    if (isLoading || !hasMore || searchTerm || activeTag !== 'all') return;
    setIsLoading(true);
    const nextPage = page + 1;
    const newTransactions = await getTransactions(nextPage);
    if (newTransactions.length > 0) {
      setAllTransactions(prev => [...prev, ...newTransactions]);
      setPage(nextPage);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [page, hasMore, isLoading, searchTerm, activeTag]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <div className="p-4 md:p-6">
        <MonthlySummary transactions={allTransactions} />
      </div>
      <Header 
        onSearch={setSearchTerm} 
        tags={tagsWithIcons} 
        activeTag={activeTag} 
        onSetActiveTag={setActiveTag}
      />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Tabs defaultValue="all-expenses">
          <TabsList className="mb-4">
            <TabsTrigger value="all-expenses">Todos los gastos</TabsTrigger>
            <TabsTrigger value="monthly-income">Ingresos</TabsTrigger>
            <TabsTrigger value="ai-insights">Perspectivas de la IA</TabsTrigger>
          </TabsList>
          <TabsContent value="all-expenses">
            <TransactionsList 
              transactions={filteredTransactions} 
              tagMap={tagMap}
              onTransactionClick={handleOpenFormForEdit}
              loadMoreTransactions={loadMoreTransactions}
              hasMore={hasMore}
              isLoading={isLoading}
              isFiltered={!!searchTerm || activeTag !== 'all'}
            />
          </TabsContent>
           <TabsContent value="monthly-income">
            <MonthlyIncome 
              incomes={incomes}
              onAddIncome={handleAddIncome}
              onUpdateIncome={handleUpdateIncome}
              onDeleteIncome={handleDeleteIncome}
            />
          </TabsContent>
          <TabsContent value="ai-insights">
            <AIInsights transactions={allTransactions} />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isFormOpen} onOpenChange={handleSetIsFormOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg" onClick={handleOpenFormForCreate}>
            <Plus className="h-8 w-8" />
            <span className="sr-only">Añadir Gasto</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
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
    </div>
  );
}
