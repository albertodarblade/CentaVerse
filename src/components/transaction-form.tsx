'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Transaction, Tag } from "@/lib/types";
import { Trash2, ArrowLeft, CalendarIcon, CalculatorIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import React, { useState, useEffect } from "react";
import {
  DialogDescription
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Calculator from "./calculator";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "La cantidad debe ser positiva." }).int({ message: "La cantidad no puede incluir céntimos." }),
  description: z.string().min(2, {
    message: "La descripción debe tener al menos 2 caracteres.",
  }),
  tag: z.string().min(1, {
    message: "Tienes que seleccionar una etiqueta.",
  }),
  date: z.date(),
});

type FormTag = Tag & {
  iconNode: React.ReactNode;
};

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'type'>) => Promise<void>;
  onUpdateTransaction: (transaction: Transaction) => Promise<void>;
  onDeleteTransaction: (transaction: Transaction) => Promise<void>;
  transactionToEdit: Transaction | null;
  tags: FormTag[];
  onClose: () => void;
}

export default function TransactionForm({ 
  onAddTransaction, 
  onUpdateTransaction, 
  onDeleteTransaction, 
  transactionToEdit, 
  tags, 
  onClose, 
}: TransactionFormProps) {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedAmount, setFormattedAmount] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: transactionToEdit ? {
      amount: transactionToEdit.amount,
      description: transactionToEdit.description,
      tag: transactionToEdit.tag,
      date: new Date(transactionToEdit.date),
    } : {
      amount: 0,
      description: "",
      tag: "",
      date: new Date(),
    },
  });
  
  useEffect(() => {
    if (transactionToEdit) {
      form.reset({
        amount: transactionToEdit.amount,
        description: transactionToEdit.description,
        tag: transactionToEdit.tag,
        date: new Date(transactionToEdit.date),
      });
    } else {
      form.reset({
        amount: 0,
        description: "",
        tag: "",
        date: new Date(),
      });
    }
  }, [transactionToEdit, form]);
  
  const watchedAmount = form.watch('amount');
  useEffect(() => {
    if (watchedAmount > 0) {
        setFormattedAmount(new Intl.NumberFormat('es-BO').format(watchedAmount));
    } else {
        setFormattedAmount('');
    }
  }, [watchedAmount]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (transactionToEdit) {
      await onUpdateTransaction({ ...transactionToEdit, ...values });
    } else {
      await onAddTransaction(values);
    }
    setIsSubmitting(false);
    onClose();
  }

  const handleDelete = async () => {
    if(transactionToEdit) {
      setIsSubmitting(true);
      await onDeleteTransaction(transactionToEdit);
      setIsSubmitting(false);
    }
  }

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
    <>
      <DialogHeader className="relative">
        <Button variant="ghost" size="icon" className="absolute -top-2 -left-2" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver</span>
        </Button>
        <DialogTitle className="font-headline text-2xl text-center">{transactionToEdit ? 'Editar Gasto' : 'Añadir Nuevo Gasto'}</DialogTitle>
        <DialogDescription className="text-center">
          {transactionToEdit ? 'Edita los detalles de tu gasto.' : 'Rellena los detalles de tu nuevo gasto.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative flex items-center">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-4xl font-bold text-muted-foreground/30 pointer-events-none z-10">
                      Bs.
                    </span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={formattedAmount !== null ? formattedAmount : ''}
                      onChange={(e) => handleAmountChange(e, field)}
                      disabled={isSubmitting}
                      className="h-24 w-full border-none bg-transparent text-center text-7xl font-bold tracking-tighter shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                     <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="absolute right-0 h-12 w-12 text-muted-foreground">
                                <CalculatorIcon className="h-6 w-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <Calculator
                                onConfirm={(value) => {
                                    form.setValue('amount', value);
                                    setIsCalculatorOpen(false);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                  </div>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder={'p. ej., Cena con amigos'} {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                           disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Elige una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const isSelected = field.value === tag.name;
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              if (isSubmitting) return;
                              field.onChange(tag.name);
                            }}
                            className={cn(
                                "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                                isSelected 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            )}
                          >
                            {tag.iconNode}
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-4">
             {transactionToEdit ? (
               <>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <AlertDialog>
                   <AlertDialogTrigger asChild>
                     <Button type="button" variant="destructive" className="w-full" disabled={isSubmitting}>
                       <Trash2 className="mr-2 h-4 w-4" />
                       Eliminar
                     </Button>
                   </AlertDialogTrigger>
                   <AlertDialogContent>
                     <AlertDialogHeader>
                       <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                       <AlertDialogDescription>
                         Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción.
                       </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                       <AlertDialogCancel>Cancelar</AlertDialogCancel>
                       <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                     </AlertDialogFooter>
                   </AlertDialogContent>
                 </AlertDialog>
               </>
             ) : (
               <Button type="submit" className="w-full" disabled={isSubmitting}>
                 {isSubmitting ? 'Guardando...' : 'Añadir Gasto'}
               </Button>
             )}
           </div>
           <div className="h-6" />
        </form>
      </Form>
    </>
  );
}
