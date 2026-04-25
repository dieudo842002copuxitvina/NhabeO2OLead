import { dealers } from '@/data/mock';
import type { Dealer } from '@/data/types';

/** Convert dealer name to URL-safe slug. */
export function dealerSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function findDealerBySlug(slug: string): Dealer | undefined {
  return dealers.find(d => dealerSlug(d.name) === slug);
}
