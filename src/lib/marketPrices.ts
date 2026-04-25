/**
 * Live market price helpers — used by AI Insight banner + Market page.
 * Reads from public.market_prices (RLS allows public select).
 */
import { supabase } from '@/integrations/supabase/client';

export interface MarketPriceRow {
  id: string;
  crop_key: string;
  crop_label: string;
  province: string;
  price_vnd: number;
  unit: string;
  recorded_at: string;
}

export interface PriceTrend {
  crop_key: string;
  crop_label: string;
  province: string;
  latest: number;
  previous: number;
  pctChange: number;
  unit: string;
  series: { date: string; price: number }[];
}

/** Fetch latest 30 days of prices grouped by crop+province, return computed trend. */
export async function fetchPriceTrends(): Promise<PriceTrend[]> {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .gte('recorded_at', since.toISOString().slice(0, 10))
    .order('recorded_at', { ascending: true });
  if (error || !data) return [];

  const grouped = new Map<string, MarketPriceRow[]>();
  (data as MarketPriceRow[]).forEach((row) => {
    const k = `${row.crop_key}__${row.province}`;
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(row);
  });

  const trends: PriceTrend[] = [];
  grouped.forEach((rows) => {
    if (rows.length === 0) return;
    const latest = rows[rows.length - 1];
    const oldest = rows[0];
    const pct = oldest.price_vnd > 0
      ? ((latest.price_vnd - oldest.price_vnd) / oldest.price_vnd) * 100
      : 0;
    trends.push({
      crop_key: latest.crop_key,
      crop_label: latest.crop_label,
      province: latest.province,
      latest: Number(latest.price_vnd),
      previous: Number(oldest.price_vnd),
      pctChange: +pct.toFixed(1),
      unit: latest.unit,
      series: rows.map((r) => ({ date: r.recorded_at, price: Number(r.price_vnd) })),
    });
  });
  return trends.sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange));
}
