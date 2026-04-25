"use client";

import { Home, Calculator, Newspaper, MapPin } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Item {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  match?: (path: string) => boolean;
}

const items: Item[] = [
  { label: 'Trang chủ', to: '/',          icon: Home,      match: (p) => p === '/' },
  { label: 'Tính toán', to: '/cong-cu',   icon: Calculator,match: (p) => p.startsWith('/cong-cu') },
  { label: 'Tin tức',   to: '/tin-tuc',   icon: Newspaper, match: (p) => p.startsWith('/tin-tuc') || p.startsWith('/thi-truong') },
  { label: 'Đại lý',    to: '/dai-ly',    icon: MapPin,    match: (p) => p.startsWith('/dai-ly') },
];

/**
 * Mobile-only Bottom Navigation (Shopee/Grab style).
 * Glassmorphism background, animated active indicator, 56px touch targets.
 */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      data-app-bottomnav="true"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Điều hướng chính"
    >
      <div className="glass border-t border-border/40 rounded-t-2xl">
        <ul className="grid grid-cols-4">
          {items.map((it) => {
            const active = it.match ? it.match(pathname || '/') : pathname === it.to;
            const Icon = it.icon;
            return (
              <li key={it.to}>
                <Link
                  href={it.to}
                  onClick={() => {
                    // Smooth scroll to top when switching primary tab
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="bottomnav-pill"
                      className="absolute top-1 h-1 w-8 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={cn('w-5 h-5', active && 'scale-110 transition-transform')} />
                  <span>{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
