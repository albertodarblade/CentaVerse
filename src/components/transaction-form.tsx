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
import type { Tag, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Settings, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState } from "react";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "La cantidad debe ser positiva." }),
  description: z.string().min(2, {
    message: "La descripción debe tener al menos 2 caracteres.",
  }),
  tags: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Tienes que seleccionar al menos una etiqueta.",
  }),
});

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'type'>) => void;
  tags: Tag[];
  onAddTag: (tagName: string) => void;
  onUpdateTag: (tagId: string, newName: string) => void;
  onDeleteTag: (tagId: string) => void;
}

export default function TransactionForm({ onAddTransaction, tags, onAddTag, onUpdateTag, onDeleteTag }: TransactionFormProps) {
  const { toast } = useToast();
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<{ id: string, name: string } | null>(null);

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

  const handleAddTag = () => {
    if (newTagName.trim() !== "" && !tags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      onAddTag(newTagName.trim());
      setNewTagName("");
      toast({ title: "Etiqueta añadida", description: `La etiqueta "${newTagName.trim()}" ha sido creada.` });
    }
  };

  const handleUpdateTag = () => {
    if (editingTag && editingTag.name.trim() !== "") {
      onUpdateTag(editingTag.id, editingTag.name.trim());
      setEditingTag(null);
      toast({ title: "Etiqueta actualizada" });
    }
  };
  
  const handleDeleteTag = (tagId: string) => {
    onDeleteTag(tagId);
    toast({ title: "Etiqueta eliminada", variant: 'destructive' });
  };
  
  const tagIcons = tags.reduce((acc, tag) => {
      acc[tag.name] = tag.icon;
      return acc;
    }, {} as { [key: string]: React.ReactNode });

  return (
    <>
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
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FormLabel>Etiquetas</FormLabel>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Dialog open={isManageTagsOpen} onOpenChange={setIsManageTagsOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Gestionar Etiquetas
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gestionar Etiquetas</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Nueva etiqueta" 
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                              />
                              <Button onClick={handleAddTag}>Añadir</Button>
                            </div>
                            <div className="space-y-2">
                              {tags.map(tag => (
                                <div key={tag.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                                  {editingTag?.id === tag.id ? (
                                    <Input
                                      value={editingTag.name}
                                      onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateTag()}
                                      onBlur={handleUpdateTag}
                                      autoFocus
                                    />
                                  ) : (
                                    <span className="flex items-center gap-2">
                                      {tag.icon}
                                      {tag.name}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingTag({ id: tag.id, name: tag.name })}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDeleteTag(tag.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                          const isSelected = field.value?.includes(tag.name);
                          return (
                            <Button
                              key={tag.id}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const newValue = isSelected
                                  ? field.value?.filter((value) => value !== tag.name)
                                  : [...(field.value || []), tag.name];
                                field.onChange(newValue);
                              }}
                              className="rounded-full"
                            >
                              {tag.icon}
                              {tag.name}
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
    </>
  );
}
