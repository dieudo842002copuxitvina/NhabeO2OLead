// Server-side tracking: log event to Cloud + fire FB CAPI + TikTok Pixel + GA4 Measurement Protocol
// + async forward to n8n webhook for downstream automation.
//
// PII safety: phone/email in payload are SHA-256 hashed before being sent to FB CAPI
// (per Meta's advanced matching guidelines). Raw values are NEVER forwarded to ad networks.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EventBody {
  event_name: string;
  event_id?: string;
  url?: string;
  referrer?: string;
  payload?: Record<string, unknown>;
  user_id?: string;
  session_id?: string;
  client_id?: string; // GA4 client_id (cid)
}

// ===================== PII helpers =====================

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Vietnam phone normalization: strip spaces, leading +84 → 0, then E.164 (+84xxxxxxxxx). */
function normalizeVnPhone(raw: string): string {
  let p = raw.replace(/\D/g, '');
  if (p.startsWith('84')) p = p.slice(2);
  if (p.startsWith('0')) p = p.slice(1);
  return '+84' + p;
}

interface HashedPii {
  ph?: string;  // hashed phone (E.164)
  em?: string;  // hashed email
}

async function hashPiiFromPayload(payload: Record<string, unknown>): Promise<HashedPii> {
  const out: HashedPii = {};
  const phoneRaw =
    (payload.phone as string | undefined) ??
    (payload.customer_phone as string | undefined) ??
    ((payload.customer as Record<string, unknown> | undefined)?.phone as string | undefined);
  const emailRaw =
    (payload.email as string | undefined) ??
    (payload.customer_email as string | undefined) ??
    ((payload.customer as Record<string, unknown> | undefined)?.email as string | undefined);
  if (typeof phoneRaw === 'string' && phoneRaw.trim() && !phoneRaw.includes('*')) {
    out.ph = await sha256Hex(normalizeVnPhone(phoneRaw));
  }
  if (typeof emailRaw === 'string' && emailRaw.includes('@')) {
    out.em = await sha256Hex(emailRaw);
  }
  return out;
}

/** Strip raw PII from an object (deep, shallow keys only — payload is flat). */
function stripPii<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const PII_KEYS = new Set(['phone', 'email', 'customer_phone', 'customer_email', 'customer']);
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (PII_KEYS.has(k)) continue;
    clean[k] = v;
  }
  return clean;
}

// ===================== Channel firers =====================

async function fireFacebookCAPI(
  event: EventBody, ip: string, ua: string, hashed: HashedPii,
  fbCfg?: { pixel_id?: string; capi_token?: string },
): Promise<string> {
  const pixelId = Deno.env.get('FB_PIXEL_ID') || fbCfg?.pixel_id?.trim();
  const token = Deno.env.get('FB_CAPI_TOKEN') || fbCfg?.capi_token?.trim();
  if (!pixelId || !token) return 'skipped:no-credentials';
  const payload = (event.payload ?? {}) as Record<string, unknown>;
  const fbc = payload.fbclid ? `fb.1.${Date.now()}.${payload.fbclid}` : undefined;
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: event.event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event.event_id,
          event_source_url: event.url,
          action_source: 'website',
          user_data: {
            client_ip_address: ip,
            client_user_agent: ua,
            ...(hashed.ph ? { ph: [hashed.ph] } : {}),
            ...(hashed.em ? { em: [hashed.em] } : {}),
            ...(fbc ? { fbc } : {}),
          },
          custom_data: stripPii(payload),
        }],
      }),
    });
    return res.ok ? 'ok' : `error:${res.status}`;
  } catch (e) {
    return `exception:${(e as Error).message.slice(0, 80)}`;
  }
}

async function fireTikTokPixel(
  event: EventBody, ip: string, ua: string, hashed: HashedPii,
  ttCfg?: { pixel_id?: string; access_token?: string },
): Promise<string> {
  const pixelCode = Deno.env.get('TIKTOK_PIXEL_ID') || ttCfg?.pixel_id?.trim();
  const token = Deno.env.get('TIKTOK_ACCESS_TOKEN') || ttCfg?.access_token?.trim();
  if (!pixelCode || !token) return 'skipped:no-credentials';
  const payload = (event.payload ?? {}) as Record<string, unknown>;
  try {
    const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: { 'Access-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pixel_code: pixelCode,
        event: event.event_name,
        event_id: event.event_id,
        timestamp: new Date().toISOString(),
        context: {
          user_agent: ua,
          ip,
          page: { url: event.url, referrer: event.referrer },
          ...(payload.ttclid ? { ad: { callback: payload.ttclid as string } } : {}),
          ...(hashed.ph || hashed.em ? { user: { ...(hashed.ph && { phone: hashed.ph }), ...(hashed.em && { email: hashed.em }) } } : {}),
        },
        properties: stripPii(payload),
      }),
    });
    return res.ok ? 'ok' : `error:${res.status}`;
  } catch (e) {
    return `exception:${(e as Error).message.slice(0, 80)}`;
  }
}

/** GA4 Measurement Protocol — Server-side event. */
async function fireGA4(
  event: EventBody,
  cfg: { measurement_id?: string; api_secret?: string },
): Promise<string> {
  const mid = cfg.measurement_id?.trim();
  const secret = cfg.api_secret?.trim();
  if (!mid || !secret) return 'skipped:no-credentials';
  try {
    const cid = event.client_id || event.session_id || crypto.randomUUID();
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${mid}&api_secret=${secret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: cid,
          events: [{
            name: event.event_name.replace(/[^a-z0-9_]/gi, '_').slice(0, 40),
            params: {
              event_id: event.event_id,
              page_location: event.url,
              page_referrer: event.referrer,
              ...stripPii((event.payload ?? {}) as Record<string, unknown>),
            },
          }],
        }),
      },
    );
    return res.ok ? 'ok' : `error:${res.status}`;
  } catch (e) {
    return `exception:${(e as Error).message.slice(0, 80)}`;
  }
}

/**
 * Async forward to n8n webhook (configured in app_settings.n8n_webhook_url).
 * Non-blocking: returns immediately if URL not configured. Uses short timeout
 * so a slow webhook never delays the main response.
 */
async function fireN8n(event: EventBody, webhookUrl: string | undefined): Promise<string> {
  if (!webhookUrl || !webhookUrl.trim()) return 'skipped:no-url';
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        source: 'agriflow_track_event',
        event_name: event.event_name,
        event_id: event.event_id,
        url: event.url,
        referrer: event.referrer,
        // Forward FULL payload (including PII) to n8n — it's our private automation, not an ad network.
        payload: event.payload ?? {},
        ts: new Date().toISOString(),
      }),
    });
    clearTimeout(timer);
    return res.ok ? 'ok' : `error:${res.status}`;
  } catch (e) {
    return `exception:${(e as Error).message.slice(0, 60)}`;
  }
}

// ===================== Handler =====================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as EventBody;
    if (!body.event_name) {
      return new Response(JSON.stringify({ error: 'event_name required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '';
    const ua = req.headers.get('user-agent') ?? '';
    const eventId = body.event_id ?? crypto.randomUUID();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Read tracking_enabled + ga4_config + n8n_webhook_url + fb_capi_config + tiktok_config in parallel
    const { data: settings } = await supabase
      .from('app_settings').select('key,value').in('key',
        ['tracking_enabled', 'ga4_config', 'n8n_webhook_url', 'fb_capi_config', 'tiktok_config']);
    const settingsMap = new Map((settings ?? []).map((s) => [s.key, s.value as Record<string, unknown>]));
    const enabled = (settingsMap.get('tracking_enabled') ?? {}) as {
      facebook?: boolean; tiktok?: boolean; internal?: boolean; ga4?: boolean; n8n?: boolean;
    };
    const ga4Cfg = (settingsMap.get('ga4_config') ?? {}) as {
      measurement_id?: string; api_secret?: string;
    };
    const fbCfg = (settingsMap.get('fb_capi_config') ?? {}) as {
      pixel_id?: string; capi_token?: string;
    };
    const ttCfg = (settingsMap.get('tiktok_config') ?? {}) as {
      pixel_id?: string; access_token?: string;
    };
    const n8nCfg = (settingsMap.get('n8n_webhook_url') ?? {}) as { url?: string };

    // Hash PII once for both ad networks
    const hashed = await hashPiiFromPayload((body.payload ?? {}) as Record<string, unknown>);

    // Fire all channels in parallel
    const [fbStatus, ttStatus, gaStatus, n8nStatus] = await Promise.all([
      enabled.facebook !== false ? fireFacebookCAPI({ ...body, event_id: eventId }, ip, ua, hashed, fbCfg) : Promise.resolve('disabled'),
      enabled.tiktok !== false ? fireTikTokPixel({ ...body, event_id: eventId }, ip, ua, hashed, ttCfg) : Promise.resolve('disabled'),
      enabled.ga4 !== false ? fireGA4({ ...body, event_id: eventId }, ga4Cfg) : Promise.resolve('disabled'),
      enabled.n8n !== false ? fireN8n({ ...body, event_id: eventId }, n8nCfg.url) : Promise.resolve('disabled'),
    ]);

    if (enabled.internal !== false) {
      // Internal log: keep raw payload (admin-only RLS) for debugging, but tag sync statuses.
      await supabase.from('tracking_events').insert({
        event_name: body.event_name,
        event_id: eventId,
        user_id: body.user_id ?? null,
        session_id: body.session_id ?? null,
        url: body.url ?? null,
        referrer: body.referrer ?? null,
        user_agent: ua,
        ip_address: ip,
        payload: {
          ...(body.payload ?? {}),
          ga4_status: gaStatus,
          n8n_status: n8nStatus,
          pii_hashed: { ph: !!hashed.ph, em: !!hashed.em },
        },
        fb_status: fbStatus,
        tiktok_status: ttStatus,
      });
    }

    return new Response(JSON.stringify({
      ok: true, event_id: eventId,
      fb: fbStatus, tiktok: ttStatus, ga4: gaStatus, n8n: n8nStatus,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
