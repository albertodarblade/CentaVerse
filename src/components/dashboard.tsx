'use client';

import { useState, useMemo } from 'react';
import type { Tag, Transaction } from '@/lib/types';
import Header from './header';
import TransactionForm from './transaction-form';
import TransactionsList from './transactions-list';
import AIInsights from './ai-insights';
import { Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, MoreHorizontal, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialTransactions: Transaction[] = [
    { id: '1', type: 'expense', amount: 50, description: 'Salario Mensual', tags: ['Trabajo'], date: new Date('2024-07-01T09:00:00Z') },
    { id: '2', type: 'expense', amount: 1200, description: 'Alquiler de Apartamento', tags: ['Vivienda'], date: new Date('2024-07-01T10:00:00Z') },
    { id: '3', type: 'expense', amount: 150.75, description: 'Compras Semanales', tags: ['Comida'], date: new Date('2024-07-03T18:30:00Z') },
    { id: '4', type: 'expense', amount: 25, description: 'Suscripción a Netflix', tags: ['Entretenimiento'], date: new Date('2024-07-05T12:00:00Z') },
    { id: '5', type: 'expense', amount: 55.50, description: 'Cena con amigos', tags: ['Comida', 'Entretenimiento'], date: new Date('2024-07-06T20:00:00Z') },
    { id: '6', type: 'expense', amount: 80, description: 'Gasolina para el coche', tags: ['Transporte'], date: new Date('2024-07-08T08:00:00Z') },
    { id: '7', type: 'expense', amount: 250, description: 'Auriculares nuevos', tags: ['Compras'], date: new Date('2024-07-10T11:45:00Z') },
    { id: '8', type: 'expense', amount: 45, description: 'Entradas de cine', tags: ['Entretenimiento'], date: new Date('2024-07-12T19:15:00Z') },
    { id: '9', type: 'expense', amount: 30, description: 'Farmacia', tags: ['Salud'], date: new Date('2024-07-14T16:00:00Z') },
];

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

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date' | 'type'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().getTime().toString(),
      date: new Date(),
      type: 'expense'
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    setIsFormOpen(false);
  };

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
    });
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
            <TransactionsList transactions={filteredTransactions} tagIcons={tagIcons} />
          </TabsContent>
          <TabsContent value="ai-insights">
            <AIInsights transactions={transactions} />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-8 w-8" />
            <span className="sr-only">Añadir Gasto</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <TransactionForm 
            onAddTransaction={addTransaction} 
            tags={tags}
            onAddTag={addTag}
            onUpdateTag={updateTag}
            onDeleteTag={deleteTag}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
