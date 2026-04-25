/**
 * AgriFlow Connect — O2O Event Tracking + CAPI attribution
 * Tracks user interactions with ad-source attribution (UTM-based) for marketing BI.
 */
import { ga4Track } from './ga4Client';

export type TrackEvent =
  | 'page_view'
  | 'product_view'
  | 'dealer_view'
  | 'call_click'
  | 'zalo_click'
  | 'inquiry_submit'
  | 'category_click'
  | 'search'
  | 'dealer_card_expand'
  | 'calculator_used'
  | 'calculator_lead_submit'
  | 'installer_contact'
  | 'article_view'
  | 'article_product_click'
  | 'case_study_view'
  | 'case_study_product_click'
  | 'news_click'
  | 'field_video_click'
  | 'solutions_search'
  | 'lead_submit'
  | 'product_inquiry_click';

export type AdSource = 'facebook' | 'tiktok' | 'google' | 'organic' | 'direct';

interface TrackPayload {
  event: TrackEvent;
  productId?: string;
  dealerId?: string;
  dealerName?: string;
  productName?: string;
  category?: string;
  searchQuery?: string;
  source?: string;
  adSource?: AdSource;
  utmCampaign?: string;
  customerProvince?: string;
  phone?: string;
  installerId?: string;
  timestamp: number;
  [key: string]: unknown;
}

const STORAGE_KEY = 'agriflow_event_log_v1';
const ATTR_KEY = 'agriflow_attribution_v1';
const CLICK_IDS_KEY = 'agriflow_click_ids_v1';

interface Attribution {
  adSource: AdSource;
  utmCampaign?: string;
  landedAt: number;
}

/** Click IDs from ad platforms — required for accurate CAPI/Ads attribution. */
export interface ClickIds {
  gclid?: string;   // Google Ads
  fbclid?: string;  // Meta/Facebook
  ttclid?: string;  // TikTok
  capturedAt?: number;
}

// ===================== Attribution =====================

/**
 * Capture ad source from UTM params + click IDs (gclid/fbclid/ttclid) on first visit.
 * Persists to localStorage so all subsequent events get tagged.
 */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return { adSource: 'direct', landedAt: Date.now() };

  const params = new URLSearchParams(window.location.search);

  // ---- Click IDs: capture-once-then-persist; refresh if newer present ----
  try {
    const incoming: ClickIds = {};
    const gclid = params.get('gclid');
    const fbclid = params.get('fbclid');
    const ttclid = params.get('ttclid');
    if (gclid) incoming.gclid = gclid;
    if (fbclid) incoming.fbclid = fbclid;
    if (ttclid) incoming.ttclid = ttclid;
    if (Object.keys(incoming).length > 0) {
      const existing = getClickIds();
      const merged: ClickIds = { ...existing, ...incoming, capturedAt: Date.now() };
      localStorage.setItem(CLICK_IDS_KEY, JSON.stringify(merged));
    }
  } catch { /* noop */ }

  try {
    const existing = localStorage.getItem(ATTR_KEY);
    if (existing) return JSON.parse(existing);
  } catch { /* noop */ }

  const utmSource = (params.get('utm_source') || '').toLowerCase();
  const utmCampaign = params.get('utm_campaign') || undefined;
  const referrer = document.referrer.toLowerCase();

  let adSource: AdSource = 'direct';
  // Click IDs are a stronger signal than utm_source
  if (params.get('fbclid') || utmSource.includes('facebook') || utmSource.includes('fb') || utmSource.includes('meta') || referrer.includes('facebook')) adSource = 'facebook';
  else if (params.get('ttclid') || utmSource.includes('tiktok') || utmSource.includes('tt') || referrer.includes('tiktok')) adSource = 'tiktok';
  else if (params.get('gclid') || utmSource.includes('google') || utmSource.includes('gads') || referrer.includes('google')) adSource = 'google';
  else if (referrer && !referrer.includes(window.location.hostname)) adSource = 'organic';

  const attr: Attribution = { adSource, utmCampaign, landedAt: Date.now() };
  try { localStorage.setItem(ATTR_KEY, JSON.stringify(attr)); } catch { /* noop */ }
  return attr;
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return { adSource: 'direct', landedAt: Date.now() };
  try {
    const raw = localStorage.getItem(ATTR_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return captureAttribution();
}

export function getClickIds(): ClickIds {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CLICK_IDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return {};
}

// ===================== Event Log =====================

function loadLog(): TrackPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return seedEvents();
}

function seedEvents(): TrackPayload[] {
  const now = Date.now();
  const sources: AdSource[] = ['facebook', 'tiktok', 'google', 'organic', 'direct'];
  const seed: TrackPayload[] = [];
  // Generate ~3 days of mock events with realistic distribution
  const eventsPerDay = 80;
  for (let day = 0; day < 3; day++) {
    for (let i = 0; i < eventsPerDay; i++) {
      const adSource = sources[Math.floor(Math.random() * sources.length)];
      const ts = now - day * 86400000 - Math.floor(Math.random() * 86400000);
      // Funnel distribution: 100 page → 35 calc → 12 click
      const r = Math.random();
      let event: TrackEvent = 'page_view';
      if (r < 0.45) event = 'page_view';
      else if (r < 0.65) event = 'product_view';
      else if (r < 0.80) event = 'calculator_used';
      else if (r < 0.90) event = 'calculator_lead_submit';
      else if (r < 0.96) event = 'call_click';
      else event = 'zalo_click';
      seed.push({ event, adSource, timestamp: ts, source: '/seed' });
    }
  }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); } catch { /* noop */ }
  return seed;
}

let logCache: TrackPayload[] | null = null;
const logSubscribers = new Set<() => void>();

function getLog(): TrackPayload[] {
  if (!logCache) logCache = loadLog();
  return logCache;
}

function persistLog() {
  if (!logCache) return;
  // cap at 5000 events
  if (logCache.length > 5000) logCache = logCache.slice(-5000);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(logCache)); } catch { /* noop */ }
  logSubscribers.forEach(fn => fn());
}

export function subscribeEvents(fn: () => void): () => void {
  logSubscribers.add(fn);
  return () => { logSubscribers.delete(fn); };
}

export function trackEvent(event: TrackEvent, data?: Omit<TrackPayload, 'event' | 'timestamp' | 'adSource' | 'utmCampaign'>) {
  const attr = getAttribution();
  const payload: TrackPayload = {
    event,
    ...data,
    adSource: attr.adSource,
    utmCampaign: attr.utmCampaign,
    timestamp: Date.now(),
  };
  const list = getLog();
  list.push(payload);
  logCache = list;
  persistLog();

  // Fire-and-forget server-side tracking (CAPI + GA4 MP + internal log + n8n forward)
  if (typeof window !== 'undefined') {
    const eventId = `${event}-${payload.timestamp}-${Math.random().toString(36).slice(2, 8)}`;
    const clickIds = getClickIds();

    // Client-side GA4 (gtag) — duplicates to GA4 with same event_id for dedup with server-side
    ga4Track(event, {
      ...data,
      event_id: eventId,
      ad_source: attr.adSource,
      utm_campaign: attr.utmCampaign,
      gclid: clickIds.gclid,
      fbclid: clickIds.fbclid,
      ttclid: clickIds.ttclid,
    });

    const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    if (projectId) {
      const url = `https://${projectId}.supabase.co/functions/v1/track-event`;
      void fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: event,
          event_id: eventId,
          url: window.location.href,
          referrer: document.referrer,
          payload: {
            ...data,
            adSource: attr.adSource,
            utmCampaign: attr.utmCampaign,
            // Click IDs forwarded server-side for FB CAPI fbc/fbp + Google Ads gclid
            ...(clickIds.gclid ? { gclid: clickIds.gclid } : {}),
            ...(clickIds.fbclid ? { fbclid: clickIds.fbclid } : {}),
            ...(clickIds.ttclid ? { ttclid: clickIds.ttclid } : {}),
          },
        }),
      }).catch(() => { /* swallow — tracking must never break UX */ });
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[AgriFlow Track] ${event}`, { ...data, adSource: attr.adSource });
  }
}

export function getEventLog(): TrackPayload[] {
  return [...getLog()];
}

export function getEventStats() {
  const log = getLog();
  return {
    calls: log.filter(e => e.event === 'call_click').length,
    zalos: log.filter(e => e.event === 'zalo_click').length,
    inquiries: log.filter(e => e.event === 'inquiry_submit').length,
    productViews: log.filter(e => e.event === 'product_view').length,
    total: log.length,
  };
}
