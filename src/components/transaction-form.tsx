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
import type { Tag, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, MoreHorizontal, Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DialogDescription
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

const iconList = [
  { name: 'Briefcase', component: <Briefcase className="h-4 w-4" /> },
  { name: 'User', component: <User className="h-4 w-4" /> },
  { name: 'Lightbulb', component: <Lightbulb className="h-4 w-4" /> },
  { name: 'AlertTriangle', component: <AlertTriangle className="h-4 w-4" /> },
  { name: 'Utensils', component: <Utensils className="h-4 w-4" /> },
  { name: 'Car', component: <Car className="h-4 w-4" /> },
  { name: 'Home', component: <Home className="h-4 w-4" /> },
  { name: 'Clapperboard', component: <Clapperboard className="h-4 w-4" /> },
  { name: 'ShoppingCart', component: <ShoppingCart className="h-4 w-4" /> },
  { name: 'HeartPulse', component: <HeartPulse className="h-4 w-4" /> },
  { name: 'Plane', component: <Plane className="h-4 w-4" /> },
  { name: 'Gift', component: <Gift className="h-4 w-4" /> },
  { name: 'BookOpen', component: <BookOpen className="h-4 w-4" /> },
  { name: 'PawPrint', component: <PawPrint className="h-4 w-4" /> },
  { name: 'Gamepad2', component: <Gamepad2 className="h-4 w-4" /> },
  { name: 'Music', component: <Music className="h-4 w-4" /> },
  { name: 'Shirt', component: <Shirt className="h-4 w-4" /> },
  { name: 'Dumbbell', component: <Dumbbell className="h-4 w-4" /> },
  { name: 'Coffee', component: <Coffee className="h-4 w-4" /> },
  { name: 'Phone', component: <Phone className="h-4 w-4" /> },
  { name: 'Mic', component: <Mic className="h-4 w-4" /> },
  { name: 'Film', component: <Film className="h-4 w-4" /> },
  { name: 'School', component: <School className="h-4 w-4" /> },
  { name: 'Banknote', component: <Banknote className="h-4 w-4" /> },
  { name: 'MoreHorizontal', component: <MoreHorizontal className="h-4 w-4" /> },
];

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
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
  transactionToEdit: Transaction | null;
  tags: Tag[];
  onAddTag: (tagName: string, icon: React.ReactNode) => void;
  onUpdateTag: (tagId: string, newName: string, newIcon: React.ReactNode) => void;
  onDeleteTag: (tagId: string) => void;
  onClose: () => void;
}

export default function TransactionForm({ onAddTransaction, onUpdateTransaction, onDeleteTransaction, transactionToEdit, tags, onAddTag, onUpdateTag, onDeleteTag, onClose }: TransactionFormProps) {
  const { toast } = useToast();
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagIcon, setNewTagIcon] = useState(iconList[iconList.length - 1].component);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: "",
      tags: [],
    },
  });

  useEffect(() => {
    if (transactionToEdit) {
      form.reset({
        amount: transactionToEdit.amount,
        description: transactionToEdit.description,
        tags: transactionToEdit.tags,
      });
    } else {
      form.reset({
        amount: 0,
        description: "",
        tags: [],
      });
    }
  }, [transactionToEdit, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (transactionToEdit) {
      onUpdateTransaction({ ...transactionToEdit, ...values });
      toast({
        title: "Transacción actualizada",
        description: `Tu gasto de ${values.amount}€ ha sido actualizado.`,
      });
    } else {
      onAddTransaction(values);
      toast({
        title: "Transacción añadida",
        description: `Tu gasto de ${values.amount}€ ha sido registrado.`,
      });
    }
    onClose();
  }

  const handleDelete = () => {
    if(transactionToEdit) {
      onDeleteTransaction(transactionToEdit.id);
      toast({
        title: "Transacción eliminada",
        variant: "destructive",
      });
      onClose();
    }
  }

  const handleAddTag = () => {
    if (newTagName.trim() !== "" && !tags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase())) {
      onAddTag(newTagName.trim(), newTagIcon);
      setNewTagName("");
      setNewTagIcon(iconList[iconList.length - 1].component);
      toast({ title: "Etiqueta añadida", description: `La etiqueta "${newTagName.trim()}" ha sido creada.` });
    }
  };

  const handleUpdateTag = () => {
    if (editingTag && editingTag.name.trim() !== "") {
      onUpdateTag(editingTag.id, editingTag.name.trim(), editingTag.icon);
      setEditingTag(null);
      toast({ title: "Etiqueta actualizada" });
    }
  };
  
  const handleDeleteTag = (tagId: string) => {
    onDeleteTag(tagId);
    toast({ title: "Etiqueta eliminada", variant: 'destructive' });
  };

  const IconPicker = ({ onSelect, children }: { onSelect: (icon: React.ReactNode) => void, children: React.ReactNode }) => (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-background border-border">
        <div className="grid grid-cols-5 gap-2">
          {iconList.map(icon => (
            <Button
              key={icon.name}
              variant="ghost"
              size="icon"
              onClick={() => onSelect(icon.component)}
              className="h-8 w-8"
            >
              {icon.component}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl">{transactionToEdit ? 'Editar Gasto' : 'Añadir Nuevo Gasto'}</DialogTitle>
        <DialogDescription>
          {transactionToEdit ? 'Modifica los detalles de tu gasto.' : 'Rellena los detalles de tu nuevo gasto.'}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad (€)</FormLabel>
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
                <FormItem>
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
                <Dialog open={isManageTagsOpen} onOpenChange={setIsManageTagsOpen}>
                  <div className="mb-4 flex items-center justify-between">
                      <div className="flex cursor-pointer items-center gap-2 group" onClick={() => setIsManageTagsOpen(true)}>
                        <FormLabel className="cursor-pointer group-hover:text-primary">Etiquetas</FormLabel>
                        <Pencil className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                  </div>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Gestionar Etiquetas</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <IconPicker onSelect={setNewTagIcon}>
                          <Button variant="outline" size="icon" className="h-10 w-10">{newTagIcon}</Button>
                        </IconPicker>
                        <Input 
                          placeholder="Nueva etiqueta" 
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        />
                        <Button onClick={handleAddTag}>Añadir</Button>
                      </div>
                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {tags.map(tag => (
                          <div key={tag.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                            {editingTag?.id === tag.id ? (
                              <>
                                <IconPicker onSelect={(icon) => setEditingTag({ ...editingTag, icon })}>
                                  <Button variant="outline" size="icon" className="h-8 w-8">{editingTag.icon}</Button>
                                </IconPicker>
                                <Input
                                  value={editingTag.name}
                                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateTag()}
                                  onBlur={handleUpdateTag}
                                  autoFocus
                                  className="h-8"
                                />
                              </>
                            ) : (
                              <span className="flex items-center gap-2">
                                {tag.icon}
                                {tag.name}
                              </span>
                            )}

                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingTag(tag)}>
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
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isSelected = field.value?.includes(tag.name);
                      return (
                        <Button
                          key={tag.id}
                          type="button"
                          variant={isSelected ? "default" : "secondary"}
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
          <div className="flex justify-between gap-2">
            {transactionToEdit && (
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="w-full">
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
            )}
            <Button type="submit" className="w-full">{transactionToEdit ? 'Guardar Cambios' : 'Añadir Gasto'}</Button>
          </div>
        </form>
      </Form>
    </>
  );
}
