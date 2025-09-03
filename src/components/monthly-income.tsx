

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Income } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useDebounce } from 'use-debounce';

const formSchema = z.object({
  description: z.string().min(2, { message: "La descripción debe tener al menos 2 caracteres." }),
  amount: z.coerce.number().positive({ message: "La cantidad debe ser positiva." }).int({ message: "La cantidad no puede incluir céntimos." }),
});

interface MonthlyIncomeProps {
  incomes: Income[];
  onAddIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  onUpdateIncome: (income: Income) => Promise<void>;
  onDeleteIncome: (incomeId: string) => Promise<void>;
}

export default function MonthlyIncome({ incomes, onAddIncome, onUpdateIncome, onDeleteIncome }: MonthlyIncomeProps) {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await onAddIncome(values);
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

  const IncomeRow = ({ income }: { income: Income }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(income.description);
    const [editedAmount, setEditedAmount] = useState(income.amount.toString());
    const [debouncedDescription] = useDebounce(editedDescription, 500);
    const [debouncedAmount] = useDebounce(editedAmount, 500);
    const [formattedAmount, setFormattedAmount] = useState<string | null>(null);

    useEffect(() => {
        setFormattedAmount(new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(income.amount));
    }, [income.amount]);

    const handleUpdate = async () => {
        const amountNumber = parseInt(debouncedAmount, 10);
        if (debouncedDescription !== income.description || amountNumber !== income.amount) {
            await onUpdateIncome({ ...income, description: debouncedDescription, amount: amountNumber });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedDescription(income.description);
        setEditedAmount(income.amount.toString());
        setIsEditing(false);
    }

    return (
        <div className="flex items-center justify-between p-4 border-b">
            {isEditing ? (
                <>
                    <Input value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} className="mr-2"/>
                    <Input type="number" value={editedAmount} onChange={(e) => setEditedAmount(e.target.value)} className="w-32" />
                    <Button variant="ghost" size="icon" onClick={handleUpdate}><Check className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={handleCancel}><X className="h-4 w-4"/></Button>
                </>
            ) : (
                <>
                    <span className="flex-1">{income.description}</span>
                    <span className="font-bold mr-4">
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
                            <AlertDialogTitle>¿Eliminar ingreso?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteIncome(income.id)}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Añadir Nuevo Ingreso</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="p. ej., Salario mensual" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                     <FormControl>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            Bs.
                            </span>
                            <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={field.value > 0 ? new Intl.NumberFormat('es-BO').format(field.value) : ''}
                            onChange={(e) => handleAmountChange(e, field)}
                            className="pl-10"
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Añadir Ingreso</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          {incomes.length > 0 ? (
            <div className="divide-y">
                {incomes.map((income) => <IncomeRow key={income.id} income={income} />)}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay ingresos registrados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
