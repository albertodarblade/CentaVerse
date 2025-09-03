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
import { Pencil, Trash2, MoreHorizontal, Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote, GripVertical, Plus, Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  DialogDescription
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useDebounce } from 'use-debounce';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { updateTagOrder } from "@/app/actions";

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
  amount: z.coerce.number().positive({ message: "La cantidad debe ser positiva." }).int({ message: "La cantidad no puede incluir céntimos." }),
  description: z.string().min(2, {
    message: "La descripción debe tener al menos 2 caracteres.",
  }),
  tags: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Tienes que seleccionar al menos una etiqueta.",
  }),
});

type FormTag = Tag & {
  iconNode: React.ReactNode;
};

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'type'>) => Promise<void>;
  onUpdateTransaction: (transaction: Transaction, closeModal?: boolean) => Promise<void>;
  onDeleteTransaction: (transaction: Transaction) => Promise<void>;
  transactionToEdit: Transaction | null;
  tags: FormTag[];
  onAddTag: (tagName: string, iconName: string) => Promise<void>;
  onUpdateTag: (tag: Tag) => Promise<void>;
  onDeleteTag: (tag: Tag) => Promise<void>;
  onClose: () => void;
}

export default function TransactionForm({ onAddTransaction, onUpdateTransaction, onDeleteTransaction, transactionToEdit, tags, onAddTag, onUpdateTag, onDeleteTag, onClose }: TransactionFormProps) {
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [editingTags, setEditingTags] = useState<FormTag[]>([]);

  useEffect(() => {
    setEditingTags(tags);
  }, [tags]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: transactionToEdit ? {
      amount: transactionToEdit.amount,
      description: transactionToEdit.description,
      tags: transactionToEdit.tags,
    } : {
      amount: 0,
      description: "",
      tags: [],
    },
  });
  
  const watchedValues = form.watch();
  const [debouncedValues] = useDebounce(watchedValues, 1000);
  
  const [initialValues, setInitialValues] = useState(transactionToEdit);
  
  useEffect(() => {
    if (transactionToEdit) {
      const initial = {
        amount: transactionToEdit.amount,
        description: transactionToEdit.description,
        tags: transactionToEdit.tags,
      };
      setInitialValues(initial as Transaction);
      form.reset(initial);
    } else {
      form.reset({
        amount: 0,
        description: "",
        tags: [],
      });
    }
  }, [transactionToEdit, form]);


  useEffect(() => {
    if (transactionToEdit && initialValues) {
      const hasChanged = 
        debouncedValues.amount !== initialValues.amount ||
        debouncedValues.description !== initialValues.description ||
        JSON.stringify(debouncedValues.tags.sort()) !== JSON.stringify(initialValues.tags.sort());

      if (form.formState.isDirty && hasChanged) {
        setAutosaveStatus('saving');
        form.trigger().then(async (isValid) => {
          if (isValid) {
            const updatedTransaction = { ...transactionToEdit, ...debouncedValues };
            await onUpdateTransaction(updatedTransaction, false);
            setInitialValues(updatedTransaction); // Update initial values to current
            setAutosaveStatus('saved');
            setTimeout(() => setAutosaveStatus('idle'), 2000);
          } else {
            setAutosaveStatus('idle');
          }
        });
      }
    }
  }, [debouncedValues, transactionToEdit, onUpdateTransaction, form, initialValues]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (transactionToEdit) {
      // When the "Close" button is clicked in edit mode
      onClose();
    } else {
      setIsSubmitting(true);
      await onAddTransaction(values);
      setIsSubmitting(false);
    }
  }

  const handleDelete = async () => {
    if(transactionToEdit) {
      setIsSubmitting(true);
      await onDeleteTransaction(transactionToEdit);
      setIsSubmitting(false);
    }
  }
  
  const handleAddNewTag = async () => {
    const newTagName = 'Nueva etiqueta';
    const newTagIcon = 'MoreHorizontal';
    await onAddTag(newTagName, newTagIcon);
  };
  
  const handleUpdateTagName = (tag: FormTag, newName: string) => {
    if (tag.name !== newName) {
      onUpdateTag({ ...tag, name: newName });
    }
  };
  
  const handleUpdateTagIcon = (tag: FormTag, iconName: string) => {
    if (tag.icon !== iconName) {
      onUpdateTag({ ...tag, icon: iconName });
    }
  };

  const handleDeleteTag = (tag: Tag) => {
    onDeleteTag(tag);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTags = Array.from(editingTags);
    const [reorderedItem] = newTags.splice(source.index, 1);
    newTags.splice(destination.index, 0, reorderedItem);
    
    setEditingTags(newTags);
    updateTagOrder(newTags);
  };

  const IconPicker = ({ onSelect, children }: { onSelect: (iconName: string) => void, children: React.ReactNode }) => (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-background border-border">
        <div className="grid grid-cols-5 gap-2">
          {iconList.map(icon => (
            <Button
              key={icon.name}
              variant="ghost"
              size="icon"
              onClick={() => onSelect(icon.name)}
              className="h-8 w-8"
            >
              {icon.component}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
  
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

  const AutosaveStatus = () => {
    if (!transactionToEdit) return null;

    if (autosaveStatus === 'saving') {
      return (
        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        </div>
      );
    }
    if (autosaveStatus === 'saved') {
      return (
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle className="mr-2 h-4 w-4" />
          Guardado
        </div>
      );
    }
    return <div className="h-6" />;
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl">{transactionToEdit ? 'Editar Gasto' : 'Añadir Nuevo Gasto'}</DialogTitle>
        <DialogDescription>
          {transactionToEdit ? 'Los cambios se guardan automáticamente.' : 'Rellena los detalles de tu nuevo gasto.'}
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
                  <FormLabel>Monto (Bs.)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={new Intl.NumberFormat('es-BO').format(field.value || 0)}
                      onChange={(e) => handleAmountChange(e, field)}
                      disabled={isSubmitting}
                    />
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
                    <Input placeholder={'p. ej., Cena con amigos'} {...field} disabled={isSubmitting} />
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
                    <div className="space-y-4 py-4">
                       <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="tags">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                              {editingTags.map((tag, index) => (
                                <Draggable key={tag.id} draggableId={tag.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="flex items-center gap-2"
                                    >
                                      <div {...provided.dragHandleProps} className="cursor-grab">
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <IconPicker onSelect={(iconName) => handleUpdateTagIcon(tag, iconName)}>
                                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                                          {tag.iconNode}
                                        </Button>
                                      </IconPicker>
                                      <Input
                                        defaultValue={tag.name}
                                        onBlur={(e) => handleUpdateTagName(tag, e.target.value)}
                                        className="h-10"
                                      />
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:text-destructive">
                                            <Trash2 className="h-5 w-5" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Esto eliminará la etiqueta de todas las transacciones. Esta acción no se puede deshacer.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteTag(tag)}>Eliminar</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                      <Button variant="outline" className="w-full" onClick={handleAddNewTag}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir nueva etiqueta
                      </Button>
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
                            if (isSubmitting) return;
                            const newValue = isSelected
                              ? field.value?.filter((value) => value !== tag.name)
                              : [...(field.value || []), tag.name];
                            field.onChange(newValue);
                          }}
                          className="rounded-full"
                        >
                          {tag.iconNode}
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
          <div className="flex items-center justify-between gap-2">
            {transactionToEdit ? (
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
                      </Aler tDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            ): <div/>}
            <Button type="submit" className="w-full" disabled={isSubmitting || autosaveStatus === 'saving'}>
              {isSubmitting ? 'Guardando...' : (transactionToEdit ? 'Cerrar' : 'Añadir Gasto')}
            </Button>
          </div>
           <AutosaveStatus />
        </form>
      </Form>
    </>
  );
}
