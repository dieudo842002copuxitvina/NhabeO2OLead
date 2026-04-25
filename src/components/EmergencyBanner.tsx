"use client";

import Link from 'next/link';
import { useControlCenter } from '@/contexts/ControlCenterContext';
import { EMERGENCY_PRESETS } from '@/lib/emergencyMode';
import { AlertTriangle, Phone, ArrowRight } from 'lucide-react';
import { GEO_CONFIG } from '@/lib/geo';

export default function EmergencyBanner() {
  const { config } = useControlCenter();
  const em = config.emergency;
  if (em.mode === 'off') return null;
  const preset = EMERGENCY_PRESETS[em.mode];
  const headline = em.customHeadline?.trim() || preset.headline;

  return (
    <div className={`relative border-y-2 ${preset.bannerClass}`}>
      <div className="container py-3 md:py-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle className={`w-5 h-5 ${preset.iconClass}`} />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sm md:text-base leading-tight">{headline}</p>
            <p className="text-xs opacity-90 mt-0.5 line-clamp-2">{preset.subheadline}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <a
            href={`tel:${GEO_CONFIG.HOTLINE}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-background/95 text-foreground text-xs font-semibold hover:bg-background"
          >
            <Phone className="w-3.5 h-3.5" />
            {GEO_CONFIG.HOTLINE_DISPLAY}
          </a>
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-background/20 hover:bg-background/30 text-xs font-semibold"
          >
            Xem ngay <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
