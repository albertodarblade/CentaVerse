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
import { Pencil, Trash2, MoreHorizontal, Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote, Plus, ArrowUp, ArrowDown, ArrowLeft, Check, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  DialogDescription
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

const colorList = [
    'black', 'red', 'orange', 'amber', 'yellow', 'lime',
    'green', 'cyan', 'blue', 'violet', 'fuchsia'
];

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "La cantidad debe ser positiva." }).int({ message: "La cantidad no puede incluir céntimos." }),
  description: z.string().min(2, {
    message: "La descripción debe tener al menos 2 caracteres.",
  }),
  tags: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Tienes que seleccionar al menos una etiqueta.",
  }),
  date: z.date(),
});

type FormTag = Tag & {
  iconNode: React.ReactNode;
};

const IconPicker = ({ onSelect, children, onOpenChange }: { onSelect: (iconName: string) => void, children: React.ReactNode, onOpenChange: (open: boolean) => void }) => (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-background border-border">
        <div className="grid grid-cols-5 gap-2">
          {iconList.map(icon => (
            <Button
              key={icon.name}
              variant="ghost"
              size="icon"
              onClick={() => {
                onSelect(icon.name)
              }}
              className="h-8 w-8"
            >
              {icon.component}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
);

const ColorPicker = ({ selectedColor, onSelect }: { selectedColor: string, onSelect: (color: string) => void }) => {
    return (
        <div className="flex items-center gap-2">
            {colorList.map(color => (
                <button
                    key={color}
                    type="button"
                    className="h-6 w-6 rounded-full border-2"
                    style={{ 
                        backgroundColor: `hsl(var(--tag-${color}))`,
                        borderColor: color === selectedColor ? `hsl(var(--tag-${color}))` : 'hsl(var(--border))'
                    }}
                    onClick={() => onSelect(color)}
                >
                    {color === selectedColor && <Check className="h-4 w-4 mx-auto text-white" />}
                </button>
            ))}
        </div>
    );
};

const ManageTagsDialogContent = ({ tags: initialTags, onAddTag, onUpdateTag, onDeleteTag, onReorderTags, onSaveChanges, onOpenChange }: {
  tags: FormTag[];
  onAddTag: () => Promise<void>;
  onUpdateTag: (tag: FormTag) => void;
  onDeleteTag: (tag: Tag) => void;
  onReorderTags: (tags: FormTag[]) => void;
  onSaveChanges: (tags: FormTag[]) => void;
  onOpenChange: (open: boolean) => void;
}) => {
  const [editingTags, setEditingTags] = useState<FormTag[]>([]);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    setEditingTags(initialTags.map(tag => ({
        ...tag,
        iconNode: iconList.find(i => i.name === tag.icon)?.component || <MoreHorizontal className="h-4 w-4" />
    })));
  }, [initialTags]);

  const handleUpdateTagName = (tagId: string, newName: string) => {
    setEditingTags(currentTags => currentTags.map(t => t.id === tagId ? { ...t, name: newName } : t));
  };

  const handleUpdateTagIcon = (tagToUpdate: FormTag, iconName: string) => {
    const updatedTag = {
        ...tagToUpdate,
        icon: iconName,
        iconNode: iconList.find(i => i.name === iconName)?.component || <MoreHorizontal className="h-4 w-4" />
    };
    setEditingTags(currentTags => currentTags.map(t => t.id === tagToUpdate.id ? updatedTag : t));
  };
  
   const handleUpdateTagColor = (tagToUpdate: FormTag, color: string) => {
    const updatedTag = { ...tagToUpdate, color };
    setEditingTags(currentTags => currentTags.map(t => t.id === tagToUpdate.id ? updatedTag : t));
  };

  const handleReorder = (tagId: string, direction: 'up' | 'down') => {
    const newTags = Array.from(editingTags);
    const index = newTags.findIndex(t => t.id === tagId);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newTags.length) return;
    const [reorderedItem] = newTags.splice(index, 1);
    newTags.splice(newIndex, 0, reorderedItem);
    setEditingTags(newTags);
  };

  const handleSaveChangesClick = () => {
    onSaveChanges(editingTags);
    onOpenChange(false);
  }

  return (
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} onInteractOutside={(e) => {
        if (isIconPickerOpen) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>Gestionar Etiquetas</DialogTitle>
           <DialogClose onClick={() => onOpenChange(false)} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            {editingTags.map((tag, index) => (
              <div key={tag.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconPicker onSelect={(iconName) => handleUpdateTagIcon(tag, iconName)} onOpenChange={setIsIconPickerOpen}>
                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                            {tag.iconNode}
                        </Button>
                    </IconPicker>
                    <Input value={tag.name} onChange={(e) => handleUpdateTagName(tag.id, e.target.value)} className="h-10" />
                    <div className="flex flex-col">
                      <Button
                        variant="ghost" size="icon" className="h-5 w-5"
                        onClick={() => handleReorder(tag.id, 'up')}
                        disabled={index === 0}
                      ><ArrowUp className="h-4 w-4" /></Button>
                      <Button
                        variant="ghost" size="icon" className="h-5 w-5"
                        onClick={() => handleReorder(tag.id, 'down')}
                        disabled={index === editingTags.length - 1}
                      ><ArrowDown className="h-4 w-4" /></Button>
                    </div>
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
                          <AlertDialogAction onClick={() => onDeleteTag(tag)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <ColorPicker selectedColor={tag.color} onSelect={(color) => handleUpdateTagColor(tag, color)} />
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={onAddTag}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir nueva etiqueta
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveChangesClick}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
  )
}

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'type'>) => Promise<void>;
  onUpdateTransaction: (transaction: Transaction) => Promise<void>;
  onDeleteTransaction: (transaction: Transaction) => Promise<void>;
  transactionToEdit: Transaction | null;
  tags: FormTag[];
  onAddTag: (tagName: string, iconName: string) => Promise<void>;
  onUpdateTag: (tag: Tag) => Promise<void>;
  onDeleteTag: (tag: Tag) => Promise<void>;
  onClose: () => void;
  onReorderTags: (tags: FormTag[]) => void;
}

export default function TransactionForm({ onAddTransaction, onUpdateTransaction, onDeleteTransaction, transactionToEdit, tags, onAddTag, onUpdateTag, onDeleteTag, onClose, onReorderTags }: TransactionFormProps) {
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedAmount, setFormattedAmount] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: transactionToEdit ? {
      amount: transactionToEdit.amount,
      description: transactionToEdit.description,
      tags: transactionToEdit.tags,
      date: new Date(transactionToEdit.date),
    } : {
      amount: 0,
      description: "",
      tags: [],
      date: new Date(),
    },
  });
  
  useEffect(() => {
    if (transactionToEdit) {
      form.reset({
        amount: transactionToEdit.amount,
        description: transactionToEdit.description,
        tags: transactionToEdit.tags,
        date: new Date(transactionToEdit.date),
      });
    } else {
      form.reset({
        amount: 0,
        description: "",
        tags: [],
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


  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isManageTagsOpen && event.state?.modal !== 'manage-tags') {
        setIsManageTagsOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isManageTagsOpen]);

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

  const handleAddNewTag = async () => {
    const newTagName = 'Nueva etiqueta';
    const newTagIcon = 'MoreHorizontal';
    await onAddTag(newTagName, newTagIcon);
  };
  
  const handleSaveChangesForTags = (updatedTags: FormTag[]) => {
    const reorderPromises = onReorderTags(updatedTags);
    const updatePromises = updatedTags.map(tag => onUpdateTag(tag));
    Promise.all([reorderPromises, ...updatePromises]);
  }

  const handleDeleteTag = (tag: Tag) => {
    onDeleteTag(tag);
  };

  const handleReorderTags = (tags: FormTag[]) => {
    onReorderTags(tags);
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

  const handleSetIsManageTagsOpen = (open: boolean) => {
    if (open) {
      if (window.history.state?.modal !== 'manage-tags') {
        window.history.pushState({ modal: 'manage-tags' }, '');
      }
    } else {
      if (window.history.state?.modal === 'manage-tags') {
        window.history.back();
      }
    }
    setIsManageTagsOpen(open);
  }

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
                  <div className="relative">
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
                      className="h-24 w-full border-none bg-transparent text-center text-6xl font-bold tracking-tighter shadow-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
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
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <Dialog open={isManageTagsOpen} onOpenChange={handleSetIsManageTagsOpen}>
                      <DialogTrigger asChild>
                        <div className="mb-4 flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-2">
                                <FormLabel className="cursor-pointer group-hover:text-primary">Etiquetas</FormLabel>
                                <Pencil className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </div>
                        </div>
                      </DialogTrigger>
                      <ManageTagsDialogContent
                          tags={tags}
                          onAddTag={handleAddNewTag}
                          onUpdateTag={onUpdateTag}
                          onDeleteTag={handleDeleteTag}
                          onReorderTags={onReorderTags}
                          onSaveChanges={handleSaveChangesForTags}
                          onOpenChange={handleSetIsManageTagsOpen}
                      />
                  </Dialog>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const isSelected = field.value?.includes(tag.name);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              if (isSubmitting) return;
                              const newValue = isSelected
                                ? field.value?.filter((value) => value !== tag.name)
                                : [...(field.value || []), tag.name];
                              field.onChange(newValue);
                            }}
                            className={cn(
                                "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors",
                                isSelected 
                                    ? 'text-white' 
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            )}
                            style={isSelected ? { 
                                backgroundColor: `hsl(var(--tag-${tag.color}))`,
                                color: `hsl(var(--tag-${tag.color}-foreground))`
                            } : {}}
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
