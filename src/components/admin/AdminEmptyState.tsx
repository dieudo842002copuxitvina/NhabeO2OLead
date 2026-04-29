'use client';

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export default function AdminEmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: AdminEmptyStateProps) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100/60 px-8 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2E7D32]/10">
        <Icon className="h-8 w-8 text-[#2E7D32]" />
      </div>
      <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-900">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      <Button asChild className="mt-7 rounded-xl bg-[#2E7D32] px-5 hover:bg-[#25672a]">
        <Link href={ctaHref}>
          {ctaLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
