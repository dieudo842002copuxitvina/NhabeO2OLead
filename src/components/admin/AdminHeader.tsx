'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, Volume2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as 'light' | 'dark' | null;
    const initial = stored ?? 'dark';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('admin-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  // Mock search results
  const searchResults = searchQuery.length > 1
    ? [
        { type: 'lead', label: `Lead: Nguyễn Văn ${searchQuery}`, sub: 'Đắk Lắk · Sầu riêng' },
        { type: 'dealer', label: `Đại lý Nông Phát`, sub: 'Đồng Nai · Active' },
        { type: 'product', label: `Ống PE Ø20mm`, sub: 'SKU: PE-020 · ₫45,000' },
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
      {/* Left: Title */}
      <div>
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative">
          <div
            className={cn(
              'flex items-center rounded-xl border border-border/50 bg-muted/50 transition-all duration-300',
              searchOpen ? 'w-80' : 'w-56'
            )}
          >
            <Search className="ml-3 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Tìm khách hàng, đại lý..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="w-full border-0 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <kbd className="mr-2 hidden rounded-md border border-border/50 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </div>

          {/* Search Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-border/50 bg-popover shadow-xl animate-in fade-in slide-in-from-top-2">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold uppercase',
                      r.type === 'lead'
                        ? 'bg-red-500/10 text-red-400'
                        : r.type === 'dealer'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-blue-500/10 text-blue-400'
                    )}
                  >
                    {r.type[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.label}</p>
                    <p className="text-[11px] text-muted-foreground">{r.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        </Button>

        {/* Sound Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl"
        >
          <Volume2 className="h-4 w-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl"
          id="theme-toggle"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border/50" />

        {/* User mini */}
        <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/50">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2E7D32] text-[10px] font-bold text-white">
            NB
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
