"use client";

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { trackEvent } from '@/lib/tracking';

interface ZaloFABProps {
  /** Full Zalo URL or '#' to disable navigation. */
  href?: string;
  /** Optional label for the tooltip bubble. */
  label?: string;
}

/**
 * ZaloFAB — Floating action button fixed to bottom-right.
 * - Visible on all pages via PublicLayout.
 * - Sits above BottomNav using --bottomnav-h + --safe-bottom CSS vars.
 * - Pulses softly to draw attention; expands tooltip on hover.
 */
export default function ZaloFAB({ href = '#', label = 'Chat Zalo' }: ZaloFABProps) {
  const onClick = () => {
    trackEvent('zalo_click', { source: 'fab_global' });
  };

  return (
    <motion.a
      href={href}
      target={href !== '#' ? '_blank' : undefined}
      rel={href !== '#' ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      aria-label="Liên hệ qua Zalo"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.6 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="group fixed right-4 z-40 flex items-center gap-2"
      style={{
        bottom: 'calc(var(--bottomnav-h, 5rem) + var(--safe-bottom, 0px) + 1.25rem)',
      }}
    >
      {/* Tooltip — appears on hover (desktop) */}
      <span className="hidden md:inline-flex items-center bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all">
        {label}
      </span>

      <span className="relative flex">
        {/* Pulse ring */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[#0068FF] opacity-50 animate-ping"
        />
        {/* Solid button — Zalo blue */}
        <span
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl ring-4 ring-background"
          style={{ backgroundColor: '#0068FF' }}
        >
          <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.2} />
        </span>
      </span>
    </motion.a>
  );
}
