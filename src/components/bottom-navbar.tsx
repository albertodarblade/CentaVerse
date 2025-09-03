'use client';

import { Landmark, TrendingUp, Sparkles, SlidersHorizontal, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavbarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

export default function BottomNavbar({ activeView, setActiveView }: BottomNavbarProps) {
    const navItems = [
        { id: 'all-expenses', label: 'Gastos', icon: <Landmark className="h-6 w-6" /> },
        { id: 'recurring', label: 'Recurrentes', icon: <Repeat className="h-6 w-6" /> },
        { id: 'ai-insights', label: 'IA', icon: <Sparkles className="h-6 w-6" /> },
        { id: 'advanced', label: 'Avanzado', icon: <SlidersHorizontal className="h-6 w-6" /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm">
            <div className="flex h-20 items-center justify-around">
                {navItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors"
                        >
                            <div className={cn('transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')}>
                                {item.icon}
                            </div>
                            <span className={cn('transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')}>
                                {item.label}
                            </span>
                             {isActive && <div className="h-1 w-6 rounded-full bg-primary" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
