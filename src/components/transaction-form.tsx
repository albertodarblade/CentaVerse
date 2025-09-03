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
import { Pencil, Trash2, MoreHorizontal, Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote, Plus, Loader2, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import React, { useState, useEffect, useCallback } from "react";
import {
  DialogDescription
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useDebounce } from 'use-debounce';
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

const ManageTagsDialogContent = ({ tags: initialTags, onAddTag, onUpdateTag, onDeleteTag, onOpenChange, onReorderTags }: {
  tags: FormTag[];
  onAddTag: () => Promise<void>;
  onUpdateTag: (tag: FormTag, data: Partial<FormTag>) => void;
  onDeleteTag: (tag: Tag) => void;
  onOpenChange: (open: boolean) => void;
  onReorderTags: (tags: FormTag[]) => void;
}) => {
  const [editingTags, setEditingTags] = useState<FormTag[]>(initialTags);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    setEditingTags(initialTags.map(tag => ({
        ...tag,
        iconNode: iconList.find(i => i.name === tag.icon)?.component || <MoreHorizontal className="h-4 w-4" />
    })));
  }, [initialTags]);

  const handleUpdateTagName = (tag: FormTag, newName: string) => {
    if (tag.name !== newName) {
        const updatedTag = { ...tag, name: newName };
        setEditingTags(currentTags => currentTags.map(t => t.id === tag.id ? updatedTag : t));
        onUpdateTag(updatedTag, { name: newName });
    }
  };

  const handleUpdateTagIcon = (tagToUpdate: FormTag, iconName: string) => {
    if (tagToUpdate.icon !== iconName) {
      const updatedTag = {
          ...tagToUpdate,
          icon: iconName,
          iconNode: iconList.find(i => i.name === iconName)?.component || <MoreHorizontal className="h-4 w-4" />
      };
      setEditingTags(currentTags => currentTags.map(t => t.id === tagToUpdate.id ? updatedTag : t));
      onUpdateTag(updatedTag, { icon: iconName });
    }
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
    onReorderTags(newTags);
  };

  const DebouncedInput = ({ tag }: { tag: FormTag }) => {
      const [value, setValue] = useState(tag.name);
      const [debouncedValue] = useDebounce(value, 1000);

      useEffect(() => {
          setValue(tag.name);
      }, [tag.name]);

      useEffect(() => {
          if (debouncedValue !== tag.name) {
            handleUpdateTagName(tag, debouncedValue);
          }
      }, [debouncedValue, tag]);

      return <Input value={value} onChange={e => setValue(e.target.value)} className="h-10" />
  }

  return (
      <DialogContent onOpenChange={(open) => {
        if (isIconPickerOpen) return;
        onOpenChange(open);
      }}>
        <DialogHeader>
          <DialogTitle>Gestionar Etiquetas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {editingTags.map((tag, index) => (
              <div key={tag.id} className="flex items-center gap-2">
                <IconPicker onSelect={(iconName) => handleUpdateTagIcon(tag, iconName)} onOpenChange={setIsIconPickerOpen}>
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                        {tag.iconNode}
                    </Button>
                </IconPicker>
                <DebouncedInput tag={tag} />
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
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={onAddTag}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir nueva etiqueta
          </Button>
        </div>
      </DialogContent>
  )
}

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
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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

  const [initialValues, setInitialValues] = useState<Omit<Transaction, 'id' | 'date' | 'type' | '_id'> | null>(transactionToEdit);
  
  const formRef = React.useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if (transactionToEdit) {
      const initial = {
        amount: transactionToEdit.amount,
        description: transactionToEdit.description,
        tags: transactionToEdit.tags,
      };
      setInitialValues(initial);
      form.reset(initial);
    } else {
      setInitialValues(null);
      form.reset({
        amount: 0,
        description: "",
        tags: [],
      });
    }
  }, [transactionToEdit, form]);

  const onUpdateTransactionStable = useCallback(onUpdateTransaction, []);

  useEffect(() => {
    if (transactionToEdit && initialValues && !isManageTagsOpen && !isIconPickerOpen) {
      const hasChanged =
        debouncedValues.amount !== initialValues.amount ||
        debouncedValues.description !== initialValues.description ||
        JSON.stringify(debouncedValues.tags.sort()) !== JSON.stringify(initialValues.tags.sort());

      if (form.formState.isDirty && hasChanged && formRef.current?.contains(document.activeElement)) {
        setAutosaveStatus('saving');
        form.trigger().then(async (isValid) => {
          if (isValid) {
            const updatedTransaction = { ...transactionToEdit, ...debouncedValues };
            await onUpdateTransactionStable(updatedTransaction, false);
            setInitialValues(debouncedValues); // Update initial values to current
            setAutosaveStatus('saved');
            setTimeout(() => setAutosaveStatus('idle'), 2000);
          } else {
            setAutosaveStatus('idle');
          }
        });
      }
    }
  }, [debouncedValues, transactionToEdit, onUpdateTransactionStable, form, initialValues, isManageTagsOpen, isIconPickerOpen]);


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

  const handleUpdateTag = (tag: Tag, data: Partial<Tag>) => {
      onUpdateTag({ ...tag, ...data });
  };

  const handleDeleteTag = (tag: Tag) => {
    onDeleteTag(tag);
  };

  const handleReorderTags = (tags: FormTag[]) => {
    updateTagOrder(tags);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4" ref={formRef}>
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
                      value={field.value ? new Intl.NumberFormat('es-BO').format(field.value) : ''}
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
                      <ManageTagsDialogContent
                          tags={tags}
                          onAddTag={handleAddNewTag}
                          onUpdateTag={handleUpdateTag}
                          onDeleteTag={handleDeleteTag}
                          onOpenChange={setIsManageTagsOpen}
                          onReorderTags={handleReorderTags}
                      />
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
          </div>

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
                      </AlertDialogDescription>
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
