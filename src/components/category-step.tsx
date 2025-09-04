'use client';

import type { Tag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { X } from "lucide-react";

type FormTag = Tag & {
  iconNode: React.ReactNode;
};

interface CategoryStepProps {
  tags: FormTag[];
  onSelectCategory: (tag: Tag) => void;
  onClose: () => void;
}

export default function CategoryStep({ tags, onSelectCategory, onClose }: CategoryStepProps) {
  return (
    <div>
        <DialogHeader>
            <DialogTitle className="text-center font-headline text-2xl">Crear Gasto</DialogTitle>
            <DialogDescription className="text-center">
                Elige una categoría para tu nuevo gasto.
            </DialogDescription>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar</span>
            </Button>
        </DialogHeader>
        <div className="pt-6">
            <ScrollArea className="h-96">
                <div className="flex flex-col gap-2 pr-4">
                    {tags.map(tag => (
                        <button key={tag.id} onClick={() => onSelectCategory(tag)} className="category-button">
                             <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: `hsl(var(--tag-${tag.color}))`, color: `hsl(var(--tag-${tag.color}-foreground))` }}>
                                {tag.iconNode}
                            </div>
                            <span className="font-semibold text-lg">{tag.name}</span>
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    </div>
  );
}
