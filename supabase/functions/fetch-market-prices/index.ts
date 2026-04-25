/**
 * fetch-market-prices — stub edge function for ingesting commodity prices.
 *
 * In production: replace generateMockPrice() with a real fetch to a public market API
 * (e.g. AgroMonitor, gia-nong-san.vn scrape, or partner JSON feed).
 * Currently inserts a +/- 3% random walk from yesterday's price for the seeded crops,
 * so the AI banner stays "alive" during cron runs.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CropConfig { key: string; label: string; province: string; basePrice: number }

const CROPS: CropConfig[] = [
  { key: 'sau_rieng', label: 'Sầu riêng Ri6', province: 'Đắk Lắk', basePrice: 96000 },
  { key: 'ca_phe', label: 'Cà phê Robusta', province: 'Đắk Lắk', basePrice: 110000 },
  { key: 'tieu', label: 'Hồ tiêu', province: 'Đắk Lắk', basePrice: 152000 },
];

function randomWalk(prev: number): number {
  const drift = (Math.random() - 0.45) * 0.06; // slight upward bias
  return Math.round(prev * (1 + drift) / 500) * 500;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'missing env' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const today = new Date().toISOString().slice(0, 10);
  const inserted: Array<{ crop_key: string; price_vnd: number }> = [];
  const errors: string[] = [];

  for (const crop of CROPS) {
    try {
      // Look up most recent price to compute random walk
      const { data: latest } = await supabase
        .from('market_prices')
        .select('price_vnd')
        .eq('crop_key', crop.key)
        .eq('province', crop.province)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const prev = latest?.price_vnd ?? crop.basePrice;
      const next = randomWalk(Number(prev));

      const { error } = await supabase.from('market_prices').upsert({
        crop_key: crop.key,
        crop_label: crop.label,
        province: crop.province,
        price_vnd: next,
        unit: 'kg',
        recorded_at: today,
        source: 'cron',
      }, { onConflict: 'crop_key,province,recorded_at' });
      if (error) errors.push(`${crop.key}: ${error.message}`);
      else inserted.push({ crop_key: crop.key, price_vnd: next });
    } catch (e) {
      errors.push(`${crop.key}: ${(e as Error).message}`);
    }
  }

  return new Response(JSON.stringify({ inserted, errors, ran_at: new Date().toISOString() }), {
    status: errors.length ? 207 : 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
