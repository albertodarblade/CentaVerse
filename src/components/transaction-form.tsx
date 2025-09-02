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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, MoreHorizontal } from "lucide-react";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "La cantidad debe ser positiva." }),
  description: z.string().min(2, {
    message: "La descripción debe tener al menos 2 caracteres.",
  }),
  tags: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Tienes que seleccionar al menos una etiqueta.",
  }),
});

const expenseTags = ["Trabajo", "Personal", "Ideas", "Urgente", "Comida", "Transporte", "Vivienda", "Entretenimiento", "Compras", "Salud", "Otro"];

const tagIcons: { [key: string]: React.ReactNode } = {
    "Trabajo": <Briefcase className="h-4 w-4" />,
    "Personal": <User className="h-4 w-4" />,
    "Ideas": <Lightbulb className="h-4 w-4" />,
    "Urgente": <AlertTriangle className="h-4 w-4" />,
    "Comida": <Utensils className="h-4 w-4" />,
    "Transporte": <Car className="h-4 w-4" />,
    "Vivienda": <Home className="h-4 w-4" />,
    "Entretenimiento": <Clapperboard className="h-4 w-4" />,
    "Compras": <ShoppingCart className="h-4 w-4" />,
    "Salud": <HeartPulse className="h-4 w-4" />,
    "Otro": <MoreHorizontal className="h-4 w-4" />,
};

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'type'>) => void;
}

export default function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
      tags: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTransaction(values);
    toast({
      title: "Transacción añadida",
      description: `Tu gasto de ${values.amount}€ ha sido registrado.`,
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Añadir Nuevo Gasto</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder={'p. ej., Cena con amigos'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4 flex items-center gap-2">
                    <FormLabel>Etiquetas</FormLabel>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {expenseTags.map((tag) => {
                        const isSelected = field.value?.includes(tag);
                        return (
                          <Button
                            key={tag}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newValue = isSelected
                                ? field.value?.filter((value) => value !== tag)
                                : [...(field.value || []), tag];
                              field.onChange(newValue);
                            }}
                            className="rounded-full"
                          >
                            {tagIcons[tag]}
                            {tag}
                          </Button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto">Añadir Gasto</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
