/**
 * Client wrapper for distance-matrix edge function with sessionStorage cache.
 * Cache key rounded to ~1km (0.01 degree) to maximize hit rate.
 */
import { supabase } from '@/integrations/supabase/client';

export interface MatrixDest { id: string; lat: number; lng: number }
export interface MatrixResult { id: string; distance_m: number; duration_s: number | null; source: 'google' | 'haversine' }
export interface MatrixResponse { source: 'google' | 'haversine'; results: MatrixResult[] }

const MEM_CACHE = new Map<string, MatrixResponse>();

function cacheKey(origin: { lat: number; lng: number }, dests: MatrixDest[]): string {
  const o = `${origin.lat.toFixed(2)},${origin.lng.toFixed(2)}`;
  const d = dests.map((x) => x.id).sort().join('|');
  return `dm:${o}:${d}`;
}

export async function fetchDistanceMatrix(
  origin: { lat: number; lng: number },
  destinations: MatrixDest[],
): Promise<MatrixResponse> {
  if (destinations.length === 0) return { source: 'haversine', results: [] };

  const key = cacheKey(origin, destinations);
  if (MEM_CACHE.has(key)) return MEM_CACHE.get(key)!;
  try {
    const fromSession = sessionStorage.getItem(key);
    if (fromSession) {
      const parsed = JSON.parse(fromSession) as MatrixResponse;
      MEM_CACHE.set(key, parsed);
      return parsed;
    }
  } catch { /* noop */ }

  try {
    const { data, error } = await supabase.functions.invoke('distance-matrix', {
      body: { origin, destinations: destinations.slice(0, 25), mode: 'driving' },
    });
    if (error || !data) throw error ?? new Error('empty');
    const resp = data as MatrixResponse;
    MEM_CACHE.set(key, resp);
    try { sessionStorage.setItem(key, JSON.stringify(resp)); } catch { /* noop */ }
    return resp;
  } catch {
    // Local Haversine fallback so UI never blocks
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const haversine = (b: { lat: number; lng: number }) => {
      const dLat = toRad(b.lat - origin.lat);
      const dLng = toRad(b.lng - origin.lng);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(origin.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };
    const results = destinations.map((d) => ({
      id: d.id, distance_m: Math.round(haversine(d)), duration_s: null,
      source: 'haversine' as const,
    })).sort((a, b) => a.distance_m - b.distance_m);
    return { source: 'haversine', results };
  }
}
