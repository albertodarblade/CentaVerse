'use client';

import { useState } from 'react';
import type { Tag } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, Trash2, Plus, Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, MoreHorizontal, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote, Calendar, ArrowLeft } from 'lucide-react';
import React from 'react';

const iconMap: { [key: string]: React.ReactNode } = {
  Briefcase: <Briefcase />, User: <User />, Lightbulb: <Lightbulb />, AlertTriangle: <AlertTriangle />, Utensils: <Utensils />, Car: <Car />, Home: <Home />, Clapperboard: <Clapperboard />, ShoppingCart: <ShoppingCart />, HeartPulse: <HeartPulse />, Plane: <Plane />, Gift: <Gift />, BookOpen: <BookOpen />, PawPrint: <PawPrint />, Gamepad2: <Gamepad2 />, Music: <Music />, Shirt: <Shirt />, Dumbbell: <Dumbbell />, Coffee: <Coffee />, Phone: <Phone />, Mic: <Mic />, Film: <Film />, School: <School />, Banknote: <Banknote />, Calendar: <Calendar />, MoreHorizontal: <MoreHorizontal />,
};
const iconNames = Object.keys(iconMap);

const colors = [ 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'cyan', 'blue', 'violet', 'fuchsia', 'black' ];

const tagSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  icon: z.string(),
  color: z.string(),
  order: z.number().optional(),
});

const formSchema = z.object({
  tags: z.array(tagSchema),
});

const newTagFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  icon: z.string(),
  color: z.string(),
});

interface TagManagerProps {
  tags: (Tag & { iconNode?: React.ReactNode })[];
  onAddTag: (tag: Omit<Tag, 'id' | 'order'>) => Promise<void>;
  onUpdateTag: (tag: Tag) => Promise<void>;
  onDeleteTag: (tag: Tag) => Promise<void>;
  onReorderTags: (tags: Tag[]) => Promise<void>;
  onClose: () => void;
}

export default function TagManager({ tags, onAddTag, onUpdateTag, onDeleteTag, onReorderTags, onClose }: TagManagerProps) {
  const [draggedTag, setDraggedTag] = useState<Tag | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { tags: tags.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) },
  });
  
  const { fields, move } = useFieldArray({ control: form.control, name: "tags" });

  const newTagForm = useForm<z.infer<typeof newTagFormSchema>>({
    resolver: zodResolver(newTagFormSchema),
    defaultValues: { name: '', icon: 'MoreHorizontal', color: 'blue' },
  });

  const handleDragStart = (index: number) => setDraggedTag(fields[index]);

  const handleDrop = (index: number) => {
    if (draggedTag) {
      const fromIndex = fields.findIndex(f => f.id === draggedTag.id);
      if (fromIndex > -1) move(fromIndex, index);
      setDraggedTag(null);
    }
  };
  
  const handleSaveChanges = async () => {
    const updatedTags = form.getValues('tags').map((tag, index) => ({ ...tag, order: index }));
    await onReorderTags(updatedTags as Tag[]);
    onClose();
  };
  
  const handleAddNewTag = async (values: z.infer<typeof newTagFormSchema>) => {
    await onAddTag(values);
    setIsAddDialogOpen(false);
    newTagForm.reset({ name: '', icon: 'MoreHorizontal', color: 'blue' });
  };
  
  const handleDeleteExistingTag = async (tag: Tag) => await onDeleteTag(tag);
  const handleUpdate = async (values: z.infer<typeof newTagFormSchema>) => {
    if (editingTag) {
      await onUpdateTag({ ...editingTag, ...values });
      setEditingTag(null);
    }
  };
  
  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag);
    newTagForm.reset({ name: tag.name, icon: tag.icon, color: tag.color });
  };
  
  const AddEditDialog = ({ open, onOpenChange, onSubmit, dialogTitle, buttonText }: any) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <Form {...newTagForm}>
          <form onSubmit={newTagForm.handleSubmit(onSubmit)} className="space-y-4">
             <FormField control={newTagForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <div className="flex gap-4">
                  <FormField control={newTagForm.control} name="icon" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>Icono</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger>{React.cloneElement(iconMap[field.value] as React.ReactElement, { className: 'w-5 h-5' })}</SelectTrigger></FormControl>
                          <SelectContent><ScrollArea className="h-64">{iconNames.map(icon => (
                              <SelectItem key={icon} value={icon}><div className="flex items-center gap-2">{React.cloneElement(iconMap[icon] as React.ReactElement, { className: 'w-5 h-5' })}<span>{icon}</span></div></SelectItem>
                          ))}</ScrollArea></SelectContent>
                      </Select></FormItem>
                  )}/>
                  <FormField control={newTagForm.control} name="color" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel>Color</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><div className="w-5 h-5 rounded-full" style={{ backgroundColor: `hsl(var(--tag-${field.value}))`}} /></SelectTrigger></FormControl>
                          <SelectContent>{colors.map(color => (
                              <SelectItem key={color} value={color}><div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full" style={{ backgroundColor: `hsl(var(--tag-${color}))`}} /><span>{color}</span></div></SelectItem>
                          ))}</SelectContent>
                      </Select></FormItem>
                  )}/>
              </div>
            <Button type="submit">{buttonText}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <h2 className="text-xl font-bold">Gestionar Etiquetas</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div 
              key={field.id}
              className="flex items-center gap-4 p-2 rounded-lg bg-card border"
              draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(index)}
              onClick={() => openEditDialog(field as Tag)}
            >
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: `hsl(var(--tag-${field.color}))` }}>
                  {React.cloneElement(iconMap[field.icon] as React.ReactElement, { className: 'w-6 h-6', style: {color: `hsl(var(--tag-${field.color}-foreground))`}})}
              </div>
              <span className="flex-grow font-medium">{field.name}</span>
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={(e) => e.stopPropagation()}><Trash2 /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
                      <AlertDialogDescription>Las transacciones asociadas pasarán a "Sin categoría". Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteExistingTag(field as Tag)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              <Button variant="ghost" size="icon" className="cursor-move">
                  <MoreVertical />
              </Button>
            </div>
          ))}
        </div>
      </main>
      
      <AddEditDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSubmit={handleAddNewTag} dialogTitle="Añadir Nueva Etiqueta" buttonText="Añadir Etiqueta" />
      <AddEditDialog open={!!editingTag} onOpenChange={(isOpen) => !isOpen && setEditingTag(null)} onSubmit={handleUpdate} dialogTitle="Editar Etiqueta" buttonText="Guardar Cambios" />

      <div className="relative p-4">
          <Button className="w-full" onClick={handleSaveChanges}>OK</Button>
          <Button size="icon" className="rounded-full absolute right-6 -top-5" onClick={() => setIsAddDialogOpen(true)}>
            <Plus />
          </Button>
      </div>
    </div>
  );
}
