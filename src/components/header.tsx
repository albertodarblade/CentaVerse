import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface HeaderProps {
  onSearch: (term: string) => void;
  tags: { id: string; name: string; iconNode: React.ReactNode }[];
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
        {tags.map((tag) => (
          <Button
            key={tag.id}
            variant={activeTag === tag.name ? 'default' : 'secondary'}
            className="rounded-full flex-shrink-0"
            onClick={() => onSetActiveTag(tag.name)}
          >
            {tag.iconNode}
            {tag.name}
          </Button>
        ))}
      </div>
    </header>
  );
}
