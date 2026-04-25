import type { Product } from '@/data/types';
import type { EmergencyConfig, EmergencyMode } from '@/contexts/ControlCenterContext';

export interface EmergencyPreset {
  mode: EmergencyMode;
  label: string;
  emoji: string;
  headline: string;
  subheadline: string;
  /** Tailwind classes for banner accent */
  bannerClass: string;
  iconClass: string;
}

export const EMERGENCY_PRESETS: Record<Exclude<EmergencyMode, 'off'>, EmergencyPreset> = {
  flood: {
    mode: 'flood',
    label: 'Lũ lụt / Ngập úng',
    emoji: '🌊',
    headline: '⚠️ Chế độ KHẨN CẤP — Lũ lụt',
    subheadline: 'Ưu tiên máy bơm xả lũ, bơm chìm, hệ thoát nước. Liên hệ đại lý gần nhất ngay.',
    bannerClass: 'bg-gradient-to-r from-info via-info to-info/70 text-info-foreground border-info',
    iconClass: 'text-info-foreground',
  },
  drought: {
    mode: 'drought',
    label: 'Hạn hán / Thiếu nước',
    emoji: '☀️',
    headline: '⚠️ Chế độ KHẨN CẤP — Hạn hán',
    subheadline: 'Ưu tiên hệ tưới nhỏ giọt, tiết kiệm nước, phun mưa. Tư vấn miễn phí 24/7.',
    bannerClass: 'bg-gradient-to-r from-warning via-warning to-warning/70 text-warning-foreground border-warning',
    iconClass: 'text-warning-foreground',
  },
};

/** Score a product for the active emergency mode. Higher = more relevant. */
export function emergencyScore(p: Product, em: EmergencyConfig): number {
  if (em.mode === 'off') return 0;
  const haystack = `${p.name} ${p.category_id} ${p.description ?? ''} ${(p.tags ?? []).join(' ')}`.toLowerCase();
  const keywords = em.mode === 'flood' ? em.flood_keywords : em.drought_keywords;
  return keywords.reduce((acc, k) => (k && haystack.includes(k.toLowerCase()) ? acc + 1 : acc), 0);
}

/**
 * Re-order products: matched products go to top (sorted by score desc),
 * others keep their original order. Off → returns input untouched.
 */
export function applyEmergencyBoost(items: Product[], em: EmergencyConfig): Product[] {
  if (em.mode === 'off') return items;
  const scored = items.map((p, i) => ({ p, i, s: emergencyScore(p, em) }));
  const matched = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.i - b.i);
  const rest = scored.filter((x) => x.s === 0).sort((a, b) => a.i - b.i);
  return [...matched.map((x) => x.p), ...rest.map((x) => x.p)];
}
