'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Tag, Transaction } from '@/lib/types';
import Header from './header';
import TransactionForm from './transaction-form';
import TransactionsList from './transactions-list';
import AIInsights from './ai-insights';
import { addTransaction, updateTransaction, deleteTransaction, addTag, updateTag, deleteTag } from '@/app/actions';
import { Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, MoreHorizontal, Plus, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote } from "lucide-react";
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
  MoreHorizontal: <MoreHorizontal className="h-4 w-4" />,
};

interface DashboardProps {
  initialTransactions: Transaction[];
  initialTags: Tag[];
}

export default function Dashboard({ initialTransactions, initialTags }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  useEffect(() => {
    setTags(initialTags.sort((a, b) => a.order - b.order));
  }, [initialTags]);
  
  const onTransactionUpdate = useCallback((updatedTransaction: Transaction) => {
    setTransactions(currentTransactions =>
      currentTransactions.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
  }, []);

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'date' | 'type'>) => {
    try {
      await addTransaction(transaction);
      setIsFormOpen(false);
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
          setIsFormOpen(false);
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
      setIsFormOpen(false);
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
    setIsFormOpen(true);
  }

  const handleOpenFormForEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  }
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
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
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const searchTermMatch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const tagMatch = activeTag === 'all' || transaction.tags.includes(activeTag);
      return searchTermMatch && tagMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, activeTag]);

  const tagIcons = useMemo(() => {
    return tags.reduce((acc, tag) => {
      acc[tag.name] = iconMap[tag.icon] || <MoreHorizontal className="h-4 w-4" />;
      return acc;
    }, {} as { [key: string]: React.ReactNode });
  }, [tags]);

  const tagsWithIcons = useMemo(() => {
    return tags.map(tag => ({...tag, iconNode: iconMap[tag.icon] || <MoreHorizontal className="h-4 w-4" />}));
  }, [tags]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <Header 
        onSearch={setSearchTerm} 
        tags={tagsWithIcons} 
        activeTag={activeTag} 
        onSetActiveTag={setActiveTag}
      />
      <main className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="all-expenses">
          <TabsList className="mb-4">
            <TabsTrigger value="all-expenses">Todos los gastos</TabsTrigger>
            <TabsTrigger value="ai-insights">Perspectivas de la IA</TabsTrigger>
          </TabsList>
          <TabsContent value="all-expenses">
            <TransactionsList 
              transactions={filteredTransactions} 
              tagIcons={tagIcons}
              onTransactionClick={handleOpenFormForEdit}
            />
          </TabsContent>
          <TabsContent value="ai-insights">
            <AIInsights transactions={transactions} />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
