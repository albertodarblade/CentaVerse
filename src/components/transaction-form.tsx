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
import { Checkbox } from "./ui/checkbox";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  category: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one category.",
  }),
});

const expenseCategories = ["Food", "Transport", "Housing", "Entertainment", "Shopping", "Health", "Other"];

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
      category: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTransaction(values);
    toast({
      title: "Transaction added",
      description: `Your expense of $${values.amount} has been recorded.`,
    });
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Add a New Expense</CardTitle>
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
                    <FormLabel>Amount</FormLabel>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder={'e.g., Dinner with friends'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Category</FormLabel>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {expenseCategories.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="category"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto">Add Expense</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
