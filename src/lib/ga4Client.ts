/**
 * GA4 client-side (gtag.js) bootstrap.
 * Reads measurement_id from public app_settings (ga4_config) and injects gtag script lazily.
 * Mirrors server-side events fired by track-event edge function (event_id deduplication).
 */
import { supabase } from '@/integrations/supabase/client';

let initialized = false;
let measurementId: string | null = null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

async function fetchMeasurementId(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('app_settings').select('value').eq('key', 'ga4_config').maybeSingle();
    const cfg = data?.value as { measurement_id?: string } | null;
    return cfg?.measurement_id?.trim() || null;
  } catch {
    return null;
  }
}

function injectScript(id: string) {
  if (document.querySelector(`script[data-ga4="${id}"]`)) return;
  const s = document.createElement('script');
  s.async = true;
  s.dataset.ga4 = id;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.gtag = function gtag(...args: unknown[]) { (window.dataLayer as any[]).push(args); };
  window.gtag('js', new Date());
  // SPA: send first page_view manually below; disable auto so we control on route changes
  window.gtag('config', id, { send_page_view: false, anonymize_ip: true });
}

/** Send a SPA page_view to GA4. Call on route change. */
export function ga4PageView(path?: string) {
  if (typeof window === 'undefined' || !window.gtag || !measurementId) return;
  const page_path = path ?? window.location.pathname + window.location.search;
  window.gtag('event', 'page_view', {
    page_path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export async function initGA4() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  const id = await fetchMeasurementId();
  if (!id) return;
  measurementId = id;
  injectScript(id);
}

/** Augment server-side event with a parallel client-side gtag event so realtime appears in GA4. */
export function ga4Track(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !window.gtag || !measurementId) return;
  // Sanitize event name (GA4 allows letters/digits/underscores, max 40)
  const safe = eventName.replace(/[^a-z0-9_]/gi, '_').slice(0, 40);
  // Capture device + screen info (location is best-effort, only if user already shared)
  const screen = `${window.screen.width}x${window.screen.height}`;
  const lang = navigator.language;
  const params2: Record<string, unknown> = { ...params, device_screen: screen, device_lang: lang };
  window.gtag('event', safe, params2);
}
