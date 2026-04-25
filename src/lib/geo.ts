/**
 * AgriFlow Connect — Geo-Matching Engine
 * Haversine algorithm + expanding radius + stock-priority ranking
 */

export interface GeoCoord {
  lat: number;
  lng: number;
}

export interface GeoMatchResult<T> {
  item: T;
  distance: number; // km
}

const EARTH_RADIUS_KM = 6371;

/** Haversine distance between two coordinates in km */
export function haversineDistance(a: GeoCoord, b: GeoCoord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Geo-match: find items within radius, sorted by distance, return top N
 */
export function geoMatch<T>(
  origin: GeoCoord,
  items: T[],
  getCoord: (item: T) => GeoCoord,
  radiusKm = 50,
  topN = 3
): GeoMatchResult<T>[] {
  return items
    .map(item => ({
      item,
      distance: Math.round(haversineDistance(origin, getCoord(item)))
    }))
    .filter(r => r.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, topN);
}

/**
 * Expanding radius search: 15km → 30km → 50km
 * Returns first non-empty result set, plus the radius used.
 */
export function expandingRadiusSearch<T>(
  origin: GeoCoord,
  items: T[],
  getCoord: (item: T) => GeoCoord,
  topN = 3,
  steps: number[] = [15, 30, 50]
): { results: GeoMatchResult<T>[]; radiusUsed: number; expanded: boolean } {
  for (let i = 0; i < steps.length; i++) {
    const r = steps[i];
    const found = geoMatch(origin, items, getCoord, r, topN);
    if (found.length > 0) {
      return { results: found, radiusUsed: r, expanded: i > 0 };
    }
  }
  return { results: [], radiusUsed: steps[steps.length - 1], expanded: true };
}

/**
 * Stock-priority ranking: in_stock first, then by distance.
 * Threshold: stock > 0 AND stock >= inStockThreshold → "in_stock", else "on_order".
 */
export type StockStatus = 'in_stock' | 'on_order';

export function getStockStatus(stock: number | undefined, inStockThreshold = 1): StockStatus {
  return (stock ?? 0) >= inStockThreshold ? 'in_stock' : 'on_order';
}

export function rankByStockThenDistance<T>(
  results: GeoMatchResult<T>[],
  getStock: (item: T) => number | undefined,
  inStockThreshold = 1
): Array<GeoMatchResult<T> & { stockStatus: StockStatus }> {
  return results
    .map(r => ({ ...r, stockStatus: getStockStatus(getStock(r.item), inStockThreshold) }))
    .sort((a, b) => {
      if (a.stockStatus !== b.stockStatus) return a.stockStatus === 'in_stock' ? -1 : 1;
      return a.distance - b.distance;
    });
}

/* =========================================================================
   Composite scoring (Admin-tunable weights)
   Score = W1*distance + W2*stockGap + W3*reputationGap, normalized 0..1.
   Lower = better.
   ========================================================================= */

export interface CompositeRankInput<T> {
  result: GeoMatchResult<T>;
  stock: number;        // current stock for the product (or aggregate)
  reputation: number;   // 0..1 (1 = best)
}

export interface CompositeRankOutput<T> extends GeoMatchResult<T> {
  stockStatus: StockStatus;
  score: number;        // 0..1
}

export interface RankWeights { distance: number; stock: number; reputation: number }

const DEFAULT_RANK_WEIGHTS: RankWeights = { distance: 0.6, stock: 0.25, reputation: 0.15 };

function normalizeW(w: RankWeights): RankWeights {
  const s = w.distance + w.stock + w.reputation || 1;
  return { distance: w.distance / s, stock: w.stock / s, reputation: w.reputation / s };
}

export function rankByComposite<T>(
  inputs: CompositeRankInput<T>[],
  weights: RankWeights = DEFAULT_RANK_WEIGHTS,
  opts: { maxRadiusKm?: number; inStockThreshold?: number; stockSaturation?: number } = {},
): CompositeRankOutput<T>[] {
  const w = normalizeW(weights);
  const maxR = opts.maxRadiusKm ?? GEO_CONFIG.MAX_RADIUS_KM;
  const sat = opts.stockSaturation ?? 20; // stock at/above this counts as "fully in stock"
  const thr = opts.inStockThreshold ?? GEO_CONFIG.IN_STOCK_THRESHOLD;

  return inputs
    .map((i) => {
      const distance01 = Math.min(1, Math.max(0, i.result.distance / maxR));
      const stock01 = 1 - Math.min(1, Math.max(0, i.stock / sat));
      const reputation01 = 1 - Math.min(1, Math.max(0, i.reputation));
      const score = w.distance * distance01 + w.stock * stock01 + w.reputation * reputation01;
      return {
        ...i.result,
        stockStatus: getStockStatus(i.stock, thr),
        score,
      };
    })
    .sort((a, b) => a.score - b.score);
}

/** Default user location (HCM area) */
export const DEFAULT_LOCATION: GeoCoord = { lat: 10.82, lng: 106.63 };

/** Geo-matching config */
export const GEO_CONFIG = {
  RADIUS_STEPS: [15, 30, 50] as number[],
  MIN_RADIUS_KM: 15,
  MAX_RADIUS_KM: 50,
  DEFAULT_RADIUS_KM: 30,
  TOP_N: 3,
  IN_STOCK_THRESHOLD: 1,
  HOTLINE: '1900636737',
  HOTLINE_DISPLAY: '1900 636 737',
};

