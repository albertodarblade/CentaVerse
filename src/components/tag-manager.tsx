'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Tag } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Pencil, Trash2, Plus, Briefcase, User, Lightbulb, AlertTriangle, Utensils, Car, Home, Clapperboard, ShoppingCart, HeartPulse, MoreHorizontal, Plane, Gift, BookOpen, PawPrint, Gamepad2, Music, Shirt, Dumbbell, Coffee, Phone, Mic, Film, School, Banknote, Calendar, ArrowLeft, Check, ChevronDown, Search, Pizza, Popcorn, Martini, Beer, Bus, Train, Ship, ShoppingBag, Tv, Building, Hotel, Bitcoin, Apple, Handshake, Leaf, Dog, Cat, Fish, GraduationCap, Pill, Stethoscope, Droplets, Baby, Wifi } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';


const iconCategories = {
  "Sugeridos": ["Utensils", "ShoppingCart", "Home", "Car", "HeartPulse", "Gift", "Briefcase", "Banknote"],
  "Comida y Bebida": ["Utensils", "Coffee", "Pizza", "Popcorn", "Martini", "Beer"],
  "Transporte": ["Car", "Bus", "Train", "Ship", "Plane"],
  "Hogar y Compras": ["Home", "ShoppingCart", "ShoppingBag", "Lightbulb"],
  "Entretenimiento y Ocio": ["Clapperboard", "Film", "Music", "Gamepad2", "Tv", "BookOpen"],
  "Salud y Bienestar": ["HeartPulse", "Pill", "Stethoscope", "Dumbbell", "Droplets"],
  "Animales": ["PawPrint", "Dog", "Cat", "Fish"],
  "Trabajo y Educación": ["Briefcase", "School", "GraduationCap"],
  "Personal y Social": ["User", "Gift", "Handshake", "Baby", "Phone"],
  "Varios": ["MoreHorizontal", "AlertTriangle", "Calendar", "Mic", "Building", "Hotel", "Bitcoin", "Apple", "Leaf", "Wifi"],
};

const iconMap: { [key: string]: React.ReactNode } = {
  Pencil: <Pencil />, Trash2: <Trash2 />, Plus: <Plus />, Briefcase: <Briefcase />, User: <User />, Lightbulb: <Lightbulb />, AlertTriangle: <AlertTriangle />, Utensils: <Utensils />, Car: <Car />, Home: <Home />, Clapperboard: <Clapperboard />, ShoppingCart: <ShoppingCart />, HeartPulse: <HeartPulse />, MoreHorizontal: <MoreHorizontal />, Plane: <Plane />, Gift: <Gift />, BookOpen: <BookOpen />, PawPrint: <PawPrint />, Gamepad2: <Gamepad2 />, Music: <Music />, Shirt: <Shirt />, Dumbbell: <Dumbbell />, Coffee: <Coffee />, Phone: <Phone />, Mic: <Mic />, Film: <Film />, School: <School />, Banknote: <Banknote />, Calendar: <Calendar />, ArrowLeft: <ArrowLeft />, Check: <Check />, ChevronDown: <ChevronDown />, Search: <Search />, Pizza: <Pizza />, Popcorn: <Popcorn />, Martini: <Martini />, Beer: <Beer />, Bus: <Bus />, Train: <Train />, Ship: <Ship />, ShoppingBag: <ShoppingBag />, Tv: <Tv />, Building: <Building />, Hotel: <Hotel />, Bitcoin: <Bitcoin />, Apple: <Apple />, Handshake: <Handshake />, Leaf: <Leaf />, Dog: <Dog />, Cat: <Cat />, Fish: <Fish />, GraduationCap: <GraduationCap />, Pill: <Pill />, Stethoscope: <Stethoscope />, Droplets: <Droplets />, Baby: <Baby />, Wifi: <Wifi />
};

const colors = [ 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'cyan', 'blue', 'violet', 'fuchsia', 'black' ];

const tagSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  icon: z.string(),
  color: z.string(),
  order: z.number().optional(),
});

const listFormSchema = z.object({
  tags: z.array(tagSchema),
});

const newTagFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  icon: z.string(),
  color: z.string(),
});

const IconSelector = ({ onSelect }: { onSelect: (icon: string) => void; }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return iconCategories;
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered: { [key: string]: string[] } = {};

    for (const category in iconCategories) {
      const matchingIcons = (iconCategories as any)[category].filter((icon: string) =>
        icon.toLowerCase().includes(lowerCaseSearch)
      );
      if (matchingIcons.length > 0) {
        filtered[category] = matchingIcons;
      }
    }
    return filtered;
  }, [searchTerm]);
  
  const handleIconClick = (icon: string) => {
    onSelect(icon);
  };

  return (
       <div className="flex flex-col h-full bg-background">
          <header className="p-4 border-b sticky top-0 bg-background z-10">
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar icono..."
                    className="w-full rounded-full bg-muted pl-10 pr-4 h-12 text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </header>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {Object.entries(filteredCategories).map(([category, icons]) => (
                <div key={category}>
                  <h3 className="text-md font-medium text-muted-foreground mb-3 px-2">{category}</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                    {icons.map(icon => (
                      <Button
                        key={icon}
                        variant="outline"
                        className="flex flex-col items-center justify-center h-24"
                        onClick={() => handleIconClick(icon)}
                      >
                        {React.cloneElement(iconMap[icon] as React.ReactElement, { className: 'w-8 h-8 mb-2' })}
                        <span className="text-xs text-muted-foreground">{icon}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
      </div>
  );
};


const AddEditView = ({
  onSubmit,
  onCancel,
  onDelete,
  initialData,
}: {
  onSubmit: (data: z.infer<typeof newTagFormSchema>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: Tag;
}) => {
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  const form = useForm<z.infer<typeof newTagFormSchema>>({
    resolver: zodResolver(newTagFormSchema),
    defaultValues: initialData || { name: '', icon: 'MoreHorizontal', color: 'blue' },
  });

  return (
     <div className="flex flex-col h-full bg-background">
      <header className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft />
        </Button>
        <h2 className="text-xl font-bold">{initialData ? 'Editar Etiqueta' : 'Añadir Etiqueta'}</h2>
      </header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
           <main className="flex-1 overflow-y-auto p-4 space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="form-control">
                    <FormControl>
                      <Input placeholder=" " {...field} />
                    </FormControl>
                    <FormLabel>Nombre</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icono</FormLabel>
                   <Sheet open={isIconSelectorOpen} onOpenChange={setIsIconSelectorOpen}>
                    <SheetTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          <div className="flex items-center gap-2">
                             {React.cloneElement(iconMap[field.value] as React.ReactElement, { className: 'w-5 h-5' })}
                             {field.value}
                          </div>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90%] p-0">
                      <SheetHeader className="sr-only">
                        <SheetTitle>Seleccionar Icono</SheetTitle>
                        <SheetDescription>Elige un icono para tu etiqueta.</SheetDescription>
                      </SheetHeader>
                      <IconSelector 
                        onSelect={(icon) => {
                          field.onChange(icon);
                          setIsIconSelectorOpen(false);
                        }}
                      />
                    </SheetContent>
                  </Sheet>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "w-8 h-8 rounded-full border-2",
                            field.value === color ? 'border-primary' : 'border-transparent'
                          )}
                          onClick={() => field.onChange(color)}
                        >
                           <div className="w-full h-full rounded-full" style={{ backgroundColor: `hsl(var(--tag-${color}))`}} />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </main>
           <div className="p-4 border-t space-y-2">
              <Button type="submit" className="w-full">{initialData ? 'Guardar Cambios' : 'Añadir Etiqueta'}</Button>
              {initialData && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar Etiqueta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
                      <AlertDialogDescription>Las transacciones asociadas pasarán a "Sin categoría". Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>Cancelar</Button>
           </div>
        </form>
      </Form>
    </div>
  );
};


interface TagManagerProps {
  tags: (Tag & { iconNode?: React.ReactNode })[];
  onAddTag: (tag: Omit<Tag, 'id' | 'order'>) => Promise<void>;
  onUpdateTag: (tag: Tag) => Promise<void>;
  onDeleteTag: (tag: Tag) => Promise<void>;
  onReorderTags: (tags: Tag[]) => Promise<void>;
  onClose: () => void;
}

export default function TagManager({ tags, onAddTag, onUpdateTag, onDeleteTag, onReorderTags, onClose }: TagManagerProps) {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [draggedTag, setDraggedTag] = useState<Tag | null>(null);

  const listForm = useForm<z.infer<typeof listFormSchema>>({
    defaultValues: { tags: tags.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) },
    resolver: zodResolver(listFormSchema),
  });
  
  useEffect(() => {
    listForm.reset({ tags: tags.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) });
  }, [tags, listForm]);
  
  const { fields, move } = useFieldArray({ control: listForm.control, name: "tags" });

  const handleDragStart = (index: number) => {
    setDraggedTag(fields[index]);
  };

  const handleDrop = (index: number) => {
    if (draggedTag) {
      const fromIndex = fields.findIndex(f => f.id === draggedTag.id);
      if (fromIndex !== -1 && fromIndex !== index) {
        move(fromIndex, index);
        const updatedTags = listForm.getValues('tags').map((tag, i) => ({ ...tag, order: i }));
        onReorderTags(updatedTags as Tag[]);
      }
      setDraggedTag(null);
    }
  };
  
  const handleAddNewTag = async (values: z.infer<typeof newTagFormSchema>) => {
    await onAddTag(values);
    setView('list');
  };

  const handleUpdateTag = async (values: z.infer<typeof newTagFormSchema>) => {
    if (editingTag) {
      await onUpdateTag({ ...editingTag, ...values });
      setView('list');
      setEditingTag(null);
    }
  };
  
  const handleDeleteTag = async () => {
    if (editingTag) {
      await onDeleteTag(editingTag);
      setView('list');
      setEditingTag(null);
    }
  };
  
  const openEditView = (tag: Tag) => {
    setEditingTag(tag);
    setView('edit');
  };

  if (view === 'add' || view === 'edit') {
    return (
      <AddEditView 
        initialData={view === 'edit' ? editingTag! : undefined}
        onSubmit={view === 'edit' ? handleUpdateTag : handleAddNewTag}
        onCancel={() => setView('list')}
        onDelete={view === 'edit' ? handleDeleteTag : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <h2 className="text-xl font-bold">Gestionar Etiquetas</h2>
      </header>
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4">
            {fields.map((field, index) => (
              <div 
                key={field.id}
                className="flex items-center gap-4 p-2 rounded-lg bg-card border"
                draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(index)}
              >
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: `hsl(var(--tag-${field.color}))` }}>
                    {React.cloneElement(iconMap[field.icon] as React.ReactElement, { className: 'w-6 h-6', style: {color: `hsl(var(--tag-${field.color}-foreground))`}})}
                </div>
                <span className="flex-grow font-medium">{field.name}</span>
                <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); openEditView(field as Tag)}}>
                    <Pencil />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-4 border-t space-y-2">
        <Button variant="secondary" className="w-full" onClick={() => setView('add')}>Crear Etiqueta</Button>
      </div>
    </div>
  );
}
