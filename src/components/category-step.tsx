'use client';

import type { Tag } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import TagManager from "./tag-manager";

type FormTag = Tag & {
  iconNode: React.ReactNode;
};

interface CategoryStepProps {
  tags: FormTag[];
  onSelectCategory: (tag: Tag) => void;
  onClose: () => void;
  onAddTag: (tag: Omit<Tag, 'id' | 'order'>) => Promise<void>;
  onUpdateTag: (tag: Tag) => Promise<void>;
  onDeleteTag: (tag: Tag) => Promise<void>;
  onReorderTags: (tags: Tag[]) => Promise<void>;
}

export default function CategoryStep({ 
  tags, 
  onSelectCategory, 
  onClose,
  onAddTag,
  onUpdateTag,
  onDeleteTag,
  onReorderTags,
}: CategoryStepProps) {
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  return (
    <div className="pt-8">
        <DialogHeader>
          <div className="flex justify-between items-center px-6 pb-4">
              <div className="text-left">
                <DialogTitle className="font-headline text-2xl">Categoría</DialogTitle>
                <DialogDescription>
                    Elige una categoría para tu nuevo gasto.
                </DialogDescription>
              </div>
              <Sheet open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">Editar</Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90%] p-0">
                   <TagManager 
                     tags={tags}
                     onAddTag={onAddTag}
                     onUpdateTag={onUpdateTag}
                     onDeleteTag={onDeleteTag}
                     onReorderTags={onReorderTags}
                     onClose={() => setIsTagManagerOpen(false)}
                   />
                </SheetContent>
              </Sheet>
            </div>
        </DialogHeader>
        <div className="pt-2">
            <ScrollArea className="h-96">
                <div className="flex flex-col gap-2 px-6 pb-6">
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
