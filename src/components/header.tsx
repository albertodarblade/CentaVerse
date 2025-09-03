import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type { Tag } from "@/lib/types";

interface HeaderProps {
  onSearch: (term: string) => void;
  tags: (Tag & { iconNode: React.ReactNode })[];
  activeTag: string;
  onSetActiveTag: (tagId: string) => void;
}

export default function Header({ onSearch, tags, activeTag, onSetActiveTag }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-auto flex-col gap-4 border-b bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar gastos..."
          className="w-full rounded-full bg-muted pl-10 pr-4 h-12 text-lg"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
            variant={activeTag === 'all' ? 'default' : 'secondary'}
            className="rounded-full"
            onClick={() => onSetActiveTag('all')}
          >
            Todas
        </Button>
        {tags.map((tag) => {
          const isSelected = activeTag === tag.name;
          return (
            <button
              key={tag.id}
              onClick={() => onSetActiveTag(tag.name)}
              className={cn(
                  "flex-shrink-0 flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors",
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
          )
        })}
      </div>
    </header>
  );
}
