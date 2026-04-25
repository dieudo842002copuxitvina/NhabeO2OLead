// BI Export → BigQuery via n8n
// Reads recent calculator_leads + tracking_events, packages as BigQuery-friendly JSON,
// and POSTs to a dedicated n8n webhook (configurable in app_settings: bi_export_webhook_url).
// Designed to be triggered by pg_cron (e.g. nightly).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportSettings {
  bi_export_webhook_url?: string;
  enabled?: boolean;
  lookback_hours?: number;
  bq_dataset?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const startedAt = new Date().toISOString();
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Manual override via body (Test from UI)
    let dryRun = false;
    if (req.method === 'POST') {
      try {
        const b = await req.json();
        dryRun = !!b?.dry_run;
      } catch { /* ignore */ }
    }

    const { data: settingRow } = await supabase
      .from('app_settings').select('value').eq('key', 'bi_export_config').maybeSingle();
    const cfg = (settingRow?.value ?? {}) as ExportSettings;

    if (!cfg.enabled && !dryRun) {
      return new Response(JSON.stringify({ ok: false, status: 'disabled' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lookbackMs = (cfg.lookback_hours ?? 24) * 3600 * 1000;
    const since = new Date(Date.now() - lookbackMs).toISOString();

    const [leadsRes, eventsRes] = await Promise.all([
      supabase.from('calculator_leads')
        .select('id,created_at,customer_province,crop,area_m2,water_source,pump_hp,pipe_meters,nozzle_count,total_cost,status,dealer_id')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5000),
      supabase.from('tracking_events')
        .select('id,created_at,event_name,event_id,url,fb_status,tiktok_status')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(10000),
    ]);

    // Strip PII for BI: no customer_name, no phone, no IP
    const payload = {
      exported_at: startedAt,
      window: { since, until: new Date().toISOString() },
      target: { dataset: cfg.bq_dataset ?? 'agriflow', tables: ['calculator_leads', 'tracking_events'] },
      counts: {
        calculator_leads: leadsRes.data?.length ?? 0,
        tracking_events: eventsRes.data?.length ?? 0,
      },
      calculator_leads: leadsRes.data ?? [],
      tracking_events: eventsRes.data ?? [],
    };

    if (dryRun) {
      return new Response(JSON.stringify({ ok: true, dry_run: true, ...payload }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = cfg.bi_export_webhook_url?.trim();
    if (!url) {
      return new Response(JSON.stringify({ ok: false, status: 'no-webhook-url', counts: payload.counts }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const status = res.ok ? 'ok' : `error:${res.status}`;

    // Log this run
    await supabase.from('app_settings').upsert({
      key: 'bi_export_last_run',
      value: { at: startedAt, status, counts: payload.counts },
    });

    return new Response(JSON.stringify({ ok: res.ok, status, counts: payload.counts }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
