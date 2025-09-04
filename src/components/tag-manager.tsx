'use client';

import { useState } from 'react';
import type { Tag } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Trash2, Plus, Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, MoreHorizontal, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote, Calendar } from 'lucide-react';
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
  order: z.number(),
});

const formSchema = z.object({
  tags: z.array(tagSchema),
});

type FormTag = Tag & {
  iconNode?: React.ReactNode;
};

interface TagManagerProps {
  tags: FormTag[];
  onAddTag: (tag: Omit<Tag, 'id' | 'order'>) => Promise<void>;
  onUpdateTag: (tag: Tag) => Promise<void>;
  onDeleteTag: (tag: Tag) => Promise<void>;
  onReorderTags: (tags: Tag[]) => Promise<void>;
  onClose: () => void;
}

export default function TagManager({ tags, onAddTag, onUpdateTag, onDeleteTag, onReorderTags, onClose }: TagManagerProps) {
  const [draggedTag, setDraggedTag] = useState<Tag | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tags: tags,
    },
  });
  
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "tags",
  });

  const handleDragStart = (index: number) => {
    setDraggedTag(fields[index]);
  };

  const handleDrop = (index: number) => {
    if (draggedTag) {
      const fromIndex = fields.findIndex(f => f.id === draggedTag.id);
      if (fromIndex > -1) {
        move(fromIndex, index);
      }
      setDraggedTag(null);
    }
  };
  
  const handleSaveChanges = async () => {
    const updatedTags = form.getValues('tags').map((tag, index) => ({ ...tag, order: index }));
    await onReorderTags(updatedTags);
    onClose();
  };
  
  const handleAddNew = () => {
    append({ name: '', icon: 'MoreHorizontal', color: 'black', order: fields.length });
  };
  
  const handleSaveNewTag = async (index: number) => {
     const newTag = form.getValues('tags')[index];
     if (newTag.name.trim() !== '') {
         await onAddTag({ name: newTag.name, icon: newTag.icon, color: newTag.color });
         remove(index); // Remove the temporary form row
     }
  }

  const handleUpdateExistingTag = async (index: number) => {
    const updatedTag = form.getValues('tags')[index];
    await onUpdateTag(updatedTag as Tag);
  }

  const handleDeleteExistingTag = async (index: number) => {
     const tagToDelete = fields[index];
     await onDeleteTag(tagToDelete as Tag);
     remove(index);
  }


  return (
    <>
      <DialogHeader>
        <DialogTitle>Gestionar Etiquetas</DialogTitle>
        <DialogDescription>
          Arrastra para reordenar, edita los campos y guarda tus cambios.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-4">
          <ScrollArea className="h-96 pr-4">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div 
                  key={field.id}
                  className="flex items-center gap-2 p-2 border rounded-lg bg-secondary/50"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                >
                  <GripVertical className="cursor-move text-muted-foreground" />

                  <FormField
                    control={form.control}
                    name={`tags.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input {...field} onBlur={() => field._id ? handleUpdateExistingTag(index) : null}/>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`tags.${index}.icon`}
                    render={({ field: selectField }) => (
                        <FormItem>
                            <Select onValueChange={(value) => { selectField.onChange(value); if(field._id) handleUpdateExistingTag(index); }} defaultValue={selectField.value}>
                                <FormControl>
                                    <SelectTrigger className="w-16 h-10">
                                        <SelectValue>
                                          {React.cloneElement(iconMap[selectField.value] as React.ReactElement, { className: 'w-5 h-5' })}
                                        </SelectValue>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <ScrollArea className="h-64">
                                      {iconNames.map(iconName => (
                                          <SelectItem key={iconName} value={iconName}>
                                              <div className="flex items-center gap-2">
                                                  {React.cloneElement(iconMap[iconName] as React.ReactElement, { className: 'w-5 h-5' })}
                                                  <span>{iconName}</span>
                                              </div>
                                          </SelectItem>
                                      ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tags.${index}.color`}
                    render={({ field: selectField }) => (
                        <FormItem>
                            <Select onValueChange={(value) => { selectField.onChange(value); if(field._id) handleUpdateExistingTag(index); }} defaultValue={selectField.value}>
                                <FormControl>
                                    <SelectTrigger className="w-16 h-10">
                                      <SelectValue>
                                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `hsl(var(--tag-${selectField.value}-foreground))`}} />
                                      </SelectValue>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {colors.map(color => (
                                        <SelectItem key={color} value={color}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: `hsl(var(--tag-${color}-foreground))`}} />
                                                <span>{color}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                  />

                  {field._id ? (
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button type="button" variant="ghost" size="icon"><Trash2 className="text-destructive" /></Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
                           <AlertDialogDescription>
                             Las transacciones asociadas pasarán a "Sin categoría". Esta acción no se puede deshacer.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancelar</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleDeleteExistingTag(index)}>Eliminar</AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                  ) : (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleSaveNewTag(index)}>
                        <Plus />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button type="button" variant="outline" className="w-full" onClick={handleAddNew}>
            Añadir Nueva Etiqueta
          </Button>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="button" onClick={handleSaveChanges}>Guardar Cambios</Button>
          </div>
        </form>
      </Form>
    </>
  );
}
