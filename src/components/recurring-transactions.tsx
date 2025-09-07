'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Income, RecurringExpense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, Edit, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDebounce } from 'use-debounce';

const formSchema = z.object({
  description: z.string().min(2, { message: "La descripción debe tener al menos 2 caracteres." }),
  amount: z.coerce.number().positive({ message: "La cantidad debe ser positiva." }).int({ message: "La cantidad no puede incluir céntimos." }),
});

interface RecurringTransactionsProps {
  incomes: Income[];
  onAddIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  onUpdateIncome: (income: Income) => Promise<void>;
  onDeleteIncome: (incomeId: string) => Promise<void>;
  recurringExpenses: RecurringExpense[];
  onAddRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => Promise<void>;
  onUpdateRecurringExpense: (expense: RecurringExpense) => Promise<void>;
  onDeleteRecurringExpense: (expenseId: string) => Promise<void>;
}

const EditableRow = ({ item, onUpdate, onDelete }: { item: Income | RecurringExpense, onUpdate: (item: any) => Promise<void>, onDelete: (id: string) => Promise<void> }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(item.description);
    const [editedAmount, setEditedAmount] = useState(item.amount.toString());
    const [debouncedDescription] = useDebounce(editedDescription, 500);
    const [debouncedAmount] = useDebounce(editedAmount, 500);
    const [formattedAmount, setFormattedAmount] = useState<string | null>(null);

    useEffect(() => {
        setFormattedAmount(new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(item.amount));
    }, [item.amount]);

    const handleUpdate = async () => {
        const amountNumber = parseInt(debouncedAmount, 10);
        if (debouncedDescription !== item.description || amountNumber !== item.amount) {
            if (!isNaN(amountNumber) && amountNumber > 0 && debouncedDescription.length >= 2) {
              await onUpdate({ ...item, description: debouncedDescription, amount: amountNumber });
            }
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedDescription(item.description);
        setEditedAmount(item.amount.toString());
        setIsEditing(false);
    }

    return (
        <div className="grid grid-cols-[1fr,auto] items-center gap-x-4 p-4 border-b">
            {isEditing ? (
                <>
                    <div className="space-y-2">
                         <Input 
                            value={editedDescription} 
                            onChange={(e) => setEditedDescription(e.target.value)}
                         />
                         <Input 
                            type="number" 
                            value={editedAmount} 
                            onChange={(e) => setEditedAmount(e.target.value)}
                         />
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={handleUpdate}><Check className="h-4 w-4 text-green-500"/></Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel}><X className="h-4 w-4 text-red-500"/></Button>
                    </div>
                </>
            ) : (
                <>
                    <span className="flex-1 truncate">{item.description}</span>
                    <div className="flex items-center gap-1">
                        <span className="font-bold mr-2">
                            {formattedAmount}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4"/></Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar recurrente?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(item.id)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </>
            )}
        </div>
    )
}

const AddNewForm = ({ onAddItem, itemType }: { onAddItem: (item: any) => Promise<void>, itemType: 'income' | 'expense' }) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { description: "", amount: 0 },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await onAddItem(values);
        form.reset();
    };
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
        const value = e.target.value;
        const digitsOnly = value.replace(/[^0-9]/g, '');
        if (digitsOnly) {
        const numberValue = parseInt(digitsOnly, 10);
        field.onChange(numberValue);
        } else {
        field.onChange(0);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Añadir Nuevo {itemType === 'income' ? 'Ingreso' : 'Gasto'} Recurrente</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                          <div className="form-control">
                            <FormControl>
                              <Input placeholder=" " {...field} />
                            </FormControl>
                            <FormLabel>Descripción</FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                          <div className="form-control">
                            <FormControl>
                                <div className="relative flex items-center">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-lg font-bold text-muted-foreground/30 pointer-events-none z-10">
                                      Bs.
                                    </span>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder=" "
                                        value={field.value > 0 ? new Intl.NumberFormat('es-BO').format(field.value) : ''}
                                        onChange={(e) => handleAmountChange(e, field)}
                                        className="pl-12 text-lg"
                                    />
                                </div>
                            </FormControl>
                             <FormLabel>Monto</FormLabel>
                          </div>
                          <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit">Añadir {itemType === 'income' ? 'Ingreso' : 'Gasto'}</Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default function RecurringTransactions({ 
    incomes, 
    onAddIncome, 
    onUpdateIncome, 
    onDeleteIncome,
    recurringExpenses,
    onAddRecurringExpense,
    onUpdateRecurringExpense,
    onDeleteRecurringExpense
}: RecurringTransactionsProps) {

  const totalIncomes = useMemo(() => incomes.reduce((sum, income) => sum + income.amount, 0), [incomes]);
  const totalRecurringExpenses = useMemo(() => recurringExpenses.reduce((sum, expense) => sum + expense.amount, 0), [recurringExpenses]);

  const [formattedTotalIncomes, setFormattedTotalIncomes] = useState<string | null>(null);
  const [formattedTotalRecurringExpenses, setFormattedTotalRecurringExpenses] = useState<string | null>(null);

  useEffect(() => {
    setFormattedTotalIncomes(new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(totalIncomes));
    setFormattedTotalRecurringExpenses(new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(totalRecurringExpenses));
  }, [totalIncomes, totalRecurringExpenses]);


  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-bold">Ingresos Recurrentes</h2>
        </div>
        <AddNewForm onAddItem={onAddIncome} itemType="income" />
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Lista de Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {incomes.length > 0 ? (
              <div className="divide-y">
                  {incomes.map((income) => 
                    <EditableRow 
                        key={income.id} 
                        item={income}
                        onUpdate={onUpdateIncome}
                        onDelete={onDeleteIncome}
                    />
                  )}
              </div>
            ) : (
              <p className="text-muted-foreground p-6">No hay ingresos recurrentes registrados.</p>
            )}
          </CardContent>
           {incomes.length > 0 && (
            <CardFooter className="flex justify-end p-4 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total de Ingresos Recurrentes</p>
                <p className="text-lg font-bold">{formattedTotalIncomes}</p>
              </div>
            </CardFooter>
           )}
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold">Gastos Recurrentes</h2>
        </div>
        <AddNewForm onAddItem={onAddRecurringExpense} itemType="expense" />
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Lista de Gastos Recurrentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recurringExpenses.length > 0 ? (
              <div className="divide-y">
                  {recurringExpenses.map((expense) => 
                    <EditableRow 
                        key={expense.id} 
                        item={expense}
                        onUpdate={onUpdateRecurringExpense}
                        onDelete={onDeleteRecurringExpense}
                    />
                  )}
              </div>
            ) : (
              <p className="text-muted-foreground p-6">No hay gastos recurrentes registrados.</p>
            )}
          </CardContent>
           {recurringExpenses.length > 0 && (
            <CardFooter className="flex justify-end p-4 border-t">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total de Gastos Recurrentes</p>
                    <p className="text-lg font-bold">{formattedTotalRecurringExpenses}</p>
                </div>
            </CardFooter>
           )}
        </Card>
      </div>
    </div>
  );
}
