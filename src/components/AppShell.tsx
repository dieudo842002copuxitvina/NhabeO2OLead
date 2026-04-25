"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';
import { useLayoutMetrics } from '@/hooks/useLayoutMetrics';

interface AppShellProps {
  children: ReactNode;
}

/**
 * AppShell — page wrapper.
 * - Measures Header + BottomNav heights into CSS vars (--header-h, --bottomnav-h)
 * - Honors iOS safe-area insets (--safe-top, --safe-bottom)
 * - Reserves bottom padding equal to BottomNav + safe-area on mobile
 * - Sets min-height = 100dvh − header − bottomnav so full-bleed pages don't
 *   underlap the nav or get cut off by the notch.
 */
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  useLayoutMetrics();

  return (
    <>
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="pb-24 md:pb-8"
        style={{
          minHeight:
            'calc(100dvh - var(--header-h, 56px) - var(--bottomnav-h, 0px))',
          paddingBottom:
            'calc(var(--bottomnav-h, 0px) + var(--safe-bottom, 0px) + 1.5rem)',
        }}
      >
        {children}
      </motion.main>
      <BottomNav />
    </>
  );
}
