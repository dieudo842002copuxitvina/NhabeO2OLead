/**
 * Shadow Profiling — theo dõi hành vi xem (commodity, category) trong localStorage
 * để cá nhân hóa banner trang chủ.
 */

export type CommodityKey = 'sau-rieng' | 'ca-phe' | 'tieu' | 'lua' | 'cao-su';

const KEY = 'agriflow_shadow_profile';

interface Profile {
  commodityViews: Partial<Record<CommodityKey, number>>;
  categoryViews: Record<string, number>;
  lastUpdated: number;
}

function load(): Profile {
  if (typeof window === 'undefined') return { commodityViews: {}, categoryViews: {}, lastUpdated: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { commodityViews: {}, categoryViews: {}, lastUpdated: 0 };
}

function save(p: Profile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* noop */ }
}

const subs = new Set<() => void>();

export function trackCommodityView(commodity: CommodityKey) {
  const p = load();
  p.commodityViews[commodity] = (p.commodityViews[commodity] ?? 0) + 1;
  p.lastUpdated = Date.now();
  save(p);
  subs.forEach(fn => fn());
}

export function trackCategoryView(category: string) {
  const p = load();
  p.categoryViews[category] = (p.categoryViews[category] ?? 0) + 1;
  p.lastUpdated = Date.now();
  save(p);
  subs.forEach(fn => fn());
}

export function getProfile(): Profile { return load(); }

export function topCommodity(): CommodityKey | null {
  const v = load().commodityViews;
  const entries = Object.entries(v) as [CommodityKey, number][];
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][1] >= 2 ? entries[0][0] : null; // require ≥2 views
}

export function subscribeProfile(fn: () => void): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}
