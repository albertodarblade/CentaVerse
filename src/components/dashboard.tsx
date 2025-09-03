'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Tag, Transaction } from '@/lib/types';
import Header from './header';
import TransactionForm from './transaction-form';
import TransactionsList from './transactions-list';
import AIInsights from './ai-insights';
import { addTransaction, updateTransaction, deleteTransaction } from '@/app/actions';
import { Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, MoreHorizontal, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const initialTags: Tag[] = [
    { id: "trabajo", name: "Trabajo", icon: <Briefcase className="h-4 w-4" /> },
    { id: "personal", name: "Personal", icon: <User className="h-4 w-4" /> },
    { id: "ideas", name: "Ideas", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "urgente", name: "Urgente", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "comida", name: "Comida", icon: <Utensils className="h-4 w-4" /> },
    { id: "transporte", name: "Transporte", icon: <Car className="h-4 w-4" /> },
    { id: "vivienda", name: "Vivienda", icon: <Home className="h-4 w-4" /> },
    { id: "entretenimiento", name: "Entretenimiento", icon: <Clapperboard className="h-4 w-4" /> },
    { id: "compras", name: "Compras", icon: <ShoppingCart className="h-4 w-4" /> },
    { id: "salud", name: "Salud", icon: <HeartPulse className="h-4 w-4" /> },
    { id: "otro", name: "Otro", icon: <MoreHorizontal className="h-4 w-4" /> },
];

export default function Dashboard({ initialTransactions }: { initialTransactions: Transaction[] }) {
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

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'date' | 'type'>) => {
    try {
      await addTransaction(transaction);
      toast({
        title: "Transacción añadida",
        description: `Tu gasto de Bs. ${transaction.amount} ha sido registrado.`,
      });
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
      if (closeModal) {
          toast({
            title: "Transacción actualizada",
            description: `Tu gasto de Bs. ${transaction.amount} ha sido actualizado.`,
          });
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
      toast({
        title: "Transacción eliminada",
        variant: "destructive",
      });
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

  const addTag = (tagName: string, icon: React.ReactNode) => {
    const newTag: Tag = {
      id: tagName.toLowerCase().replace(/\s/g, '-'),
      name: tagName,
      icon: icon
    };
    setTags(prev => [...prev, newTag]);
  }

  const updateTag = (tagId: string, newName: string, newIcon: React.ReactNode) => {
    const oldName = tags.find(t => t.id === tagId)?.name;
    setTags(prev => prev.map(tag => tag.id === tagId ? { ...tag, name: newName, icon: newIcon } : tag));
    setTransactions(prev => prev.map(t => ({
      ...t,
      tags: t.tags.map(tag => tag === oldName ? newName : tag)
    })));
  };

  const deleteTag = (tagId: string) => {
    const tagName = tags.find(t => t.id === tagId)?.name;
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    setTransactions(prev => prev.map(t => ({
      ...t,
      tags: t.tags.filter(tag => tag !== tagName)
    })));
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
      acc[tag.name] = tag.icon;
      return acc;
    }, {} as { [key: string]: React.ReactNode });
  }, [tags]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <Header 
        onSearch={setSearchTerm} 
        tags={tags} 
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
            tags={tags}
            onAddTag={addTag}
            onUpdateTag={updateTag}
            onDeleteTag={deleteTag}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
