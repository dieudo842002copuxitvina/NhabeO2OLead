// Edge function: system-health
// Live ping for /admin/integrations Live Status panel.
// Checks: n8n webhook, GA4 config, BigQuery export, Google Maps key, Facebook CAPI.

import { corsHeaders } from 'jsr:@supabase/supabase-js@2/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface HealthResult {
  service: string;
  label: string;
  status: 'ok' | 'down' | 'not_configured';
  detail: string;
  latency_ms?: number;
}

async function pingUrl(url: string, timeoutMs = 4000): Promise<{ ok: boolean; status: number; ms: number; err?: string }> {
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    let r = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
    if (r.status === 405 || r.status === 404) {
      r = await fetch(url, { method: 'OPTIONS', signal: ctrl.signal });
    }
    clearTimeout(timer);
    return { ok: r.status < 500, status: r.status, ms: Date.now() - t0 };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, status: 0, ms: Date.now() - t0, err: e instanceof Error ? e.message : String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: settings } = await supabase
    .from('app_settings')
    .select('key,value')
    .in('key', ['n8n_webhook_url', 'ga4_config', 'bi_export_config', 'fb_capi_config', 'tiktok_config']);
  const map = new Map((settings ?? []).map((s) => [s.key, s.value]));

  const results: HealthResult[] = [];

  // ---- n8n webhook ----
  const n8nVal = map.get('n8n_webhook_url') as { url?: string } | string | undefined;
  const n8nUrl = typeof n8nVal === 'string' ? n8nVal : n8nVal?.url ?? '';
  if (!n8nUrl) {
    results.push({ service: 'n8n', label: 'n8n Webhook', status: 'not_configured', detail: 'Chưa cấu hình URL' });
  } else {
    const p = await pingUrl(n8nUrl);
    results.push({
      service: 'n8n',
      label: 'n8n Webhook',
      status: p.ok ? 'ok' : 'down',
      detail: p.ok ? `HTTP ${p.status}` : (p.err ?? `HTTP ${p.status}`),
      latency_ms: p.ms,
    });
  }

  // ---- GA4 ----
  const ga4 = map.get('ga4_config') as { measurement_id?: string; api_secret?: string } | undefined;
  if (!ga4?.measurement_id) {
    results.push({ service: 'ga4', label: 'Google Analytics 4', status: 'not_configured', detail: 'Thiếu measurement_id' });
  } else {
    const ok = !!ga4.api_secret;
    results.push({
      service: 'ga4',
      label: 'Google Analytics 4',
      status: ok ? 'ok' : 'not_configured',
      detail: ok ? `MID ${ga4.measurement_id}` : 'Thiếu api_secret cho Measurement Protocol',
    });
  }

  // ---- BigQuery export ----
  const bi = map.get('bi_export_config') as { enabled?: boolean; bi_export_webhook_url?: string } | undefined;
  if (!bi?.enabled) {
    results.push({ service: 'bigquery', label: 'BigQuery Export', status: 'not_configured', detail: 'Chưa bật export' });
  } else if (!bi.bi_export_webhook_url) {
    results.push({ service: 'bigquery', label: 'BigQuery Export', status: 'not_configured', detail: 'Thiếu webhook URL' });
  } else {
    const p = await pingUrl(bi.bi_export_webhook_url);
    results.push({
      service: 'bigquery',
      label: 'BigQuery Export',
      status: p.ok ? 'ok' : 'down',
      detail: p.ok ? `HTTP ${p.status}` : (p.err ?? `HTTP ${p.status}`),
      latency_ms: p.ms,
    });
  }

  // ---- Google Maps Distance Matrix ----
  const mapsKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!mapsKey) {
    results.push({ service: 'maps', label: 'Google Maps · Distance Matrix', status: 'not_configured', detail: 'Chưa cấu hình GOOGLE_MAPS_API_KEY (fallback Haversine)' });
  } else {
    const t0 = Date.now();
    try {
      // Lightweight check: tiny request, just to validate key
      const r = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=10.82,106.63&destinations=10.83,106.64&key=${mapsKey}`,
        { signal: AbortSignal.timeout(4000) },
      );
      const j = await r.json();
      const ok = j.status === 'OK';
      results.push({
        service: 'maps',
        label: 'Google Maps · Distance Matrix',
        status: ok ? 'ok' : 'down',
        detail: ok ? `Status ${j.status}` : `${j.status}: ${j.error_message ?? 'unknown'}`,
        latency_ms: Date.now() - t0,
      });
    } catch (e) {
      results.push({
        service: 'maps',
        label: 'Google Maps · Distance Matrix',
        status: 'down',
        detail: e instanceof Error ? e.message : String(e),
        latency_ms: Date.now() - t0,
      });
    }
  }

  // ---- Facebook CAPI (env var > app_settings fallback) ----
  const fbCfg = (map.get('fb_capi_config') ?? {}) as { pixel_id?: string; capi_token?: string };
  const fbToken = Deno.env.get('FB_CAPI_TOKEN') || fbCfg.capi_token?.trim();
  const fbPixelId = Deno.env.get('FB_PIXEL_ID') || fbCfg.pixel_id?.trim();
  if (!fbToken || !fbPixelId) {
    results.push({
      service: 'fb_capi',
      label: 'Facebook Conversions API',
      status: 'not_configured',
      detail: !fbPixelId ? 'Thiếu FB_PIXEL_ID' : 'Thiếu FB_CAPI_TOKEN',
    });
  } else {
    const t0 = Date.now();
    try {
      // Validate token via Graph API debug endpoint
      const r = await fetch(
        `https://graph.facebook.com/v19.0/${fbPixelId}?access_token=${fbToken}&fields=id,name`,
        { signal: AbortSignal.timeout(4000) },
      );
      const j = await r.json();
      const ok = !!j.id;
      results.push({
        service: 'fb_capi',
        label: 'Facebook Conversions API',
        status: ok ? 'ok' : 'down',
        detail: ok ? `Pixel "${j.name ?? j.id}" hợp lệ` : (j.error?.message ?? `HTTP ${r.status}`),
        latency_ms: Date.now() - t0,
      });
    } catch (e) {
      results.push({
        service: 'fb_capi',
        label: 'Facebook Conversions API',
        status: 'down',
        detail: e instanceof Error ? e.message : String(e),
        latency_ms: Date.now() - t0,
      });
    }
  }

  // ---- TikTok Pixel (env var > app_settings fallback) ----
  const ttCfg = (map.get('tiktok_config') ?? {}) as { pixel_id?: string; access_token?: string };
  const ttToken = Deno.env.get('TIKTOK_ACCESS_TOKEN') || ttCfg.access_token?.trim();
  const ttPixel = Deno.env.get('TIKTOK_PIXEL_ID') || ttCfg.pixel_id?.trim();
  if (!ttToken || !ttPixel) {
    results.push({
      service: 'tiktok',
      label: 'TikTok Events API',
      status: 'not_configured',
      detail: !ttPixel ? 'Thiếu TIKTOK_PIXEL_ID' : 'Thiếu TIKTOK_ACCESS_TOKEN',
    });
  } else {
    results.push({
      service: 'tiktok',
      label: 'TikTok Events API',
      status: 'ok',
      detail: `Pixel ${ttPixel.slice(0, 8)}… đã cấu hình`,
    });
  }

  return new Response(JSON.stringify({ checked_at: new Date().toISOString(), results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
