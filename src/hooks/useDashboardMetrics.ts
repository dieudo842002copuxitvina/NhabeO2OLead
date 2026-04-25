"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/* =========================================================================
 * useDashboardMetrics — central data layer for the Admin Executive Dashboard
 * Pulls from: tracking_events, calculator_leads, products, app_settings.
 * ========================================================================= */

export interface SparkPoint { date: string; value: number }

export interface KpiBlock {
  totalLeads: number;          // calculator_leads in window
  totalLeadsSpark: SparkPoint[];
  cvr: number;                 // % conversion (call+zalo clicks) / page_views
  cvrSpark: SparkPoint[];
  leadValue: number;           // sum(total_cost) of calculator_leads
  leadValueSpark: SparkPoint[];
  totalEvents: number;         // raw activity volume (proxy for traffic)
  eventsSpark: SparkPoint[];
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  pct: number;     // % of stage 1
  dropPct: number; // % drop from previous stage (0 for stage 1)
}

export interface ActivityItem {
  id: string;
  ts: string;
  kind: 'lead' | 'event';
  title: string;
  detail: string;
  source: string;        // adSource / event source
  syncStatus: 'ok' | 'pending' | 'error' | 'na';
}

const DAYS = 7;

function startOfDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function emptySpark(): SparkPoint[] {
  const out: SparkPoint[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ date: startOfDay(d), value: 0 });
  }
  return out;
}
function bucketByDay<T extends { created_at: string }>(
  rows: T[],
  pick: (r: T) => number = () => 1,
): SparkPoint[] {
  const base = emptySpark();
  const idx = new Map(base.map((p, i) => [p.date, i]));
  rows.forEach((r) => {
    const day = r.created_at.slice(0, 10);
    const i = idx.get(day);
    if (i !== undefined) base[i].value += pick(r);
  });
  return base;
}

interface RawEvent {
  id: string;
  event_name: string;
  created_at: string;
  url: string | null;
  payload: unknown;
  fb_status: string | null;
  tiktok_status: string | null;
}

interface RawLead {
  id: string;
  created_at: string;
  customer_name: string;
  customer_province: string | null;
  crop: string;
  area_m2: number;
  total_cost: number;
  dealer_id: string | null;
  status: string;
}

export function useDashboardMetrics() {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<KpiBlock | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [refreshTs, setRefreshTs] = useState(Date.now());

  const refresh = useCallback(() => setRefreshTs(Date.now()), []);

  useEffect(() => {
    let cancelled = false;
    const since = new Date();
    since.setDate(since.getDate() - DAYS);
    const sinceIso = since.toISOString();

    (async () => {
      setLoading(true);
      try {
        const [{ data: events }, { data: leads }] = await Promise.all([
          supabase.from('tracking_events')
            .select('id,event_name,created_at,url,payload,fb_status,tiktok_status')
            .gte('created_at', sinceIso)
            .order('created_at', { ascending: false })
            .limit(2000),
          supabase.from('calculator_leads')
            .select('id,created_at,customer_name,customer_province,crop,area_m2,total_cost,dealer_id,status')
            .gte('created_at', sinceIso)
            .order('created_at', { ascending: false })
            .limit(500),
        ]);
        if (cancelled) return;
        const evs: RawEvent[] = (events ?? []) as RawEvent[];
        const lds: RawLead[] = (leads ?? []) as RawLead[];

        // ---- Funnel (last 7 days, distinct event_name buckets) ----
        const isStage = {
          traffic: (e: RawEvent) => e.event_name === 'page_view',
          engage: (e: RawEvent) =>
            e.event_name === 'product_view' ||
            e.event_name === 'view_market_data' ||
            e.event_name === 'article_view',
          intent: (e: RawEvent) =>
            e.event_name === 'calculator_used' ||
            e.event_name === 'use_calculator' ||
            e.event_name === 'calculator_lead_submit',
          convert: (e: RawEvent) =>
            e.event_name === 'call_click' ||
            e.event_name === 'zalo_click' ||
            e.event_name === 'click_call_dealer' ||
            e.event_name === 'click_zalo_lead' ||
            e.event_name === 'inquiry_submit',
        };
        const counts = {
          traffic: evs.filter(isStage.traffic).length,
          engage: evs.filter(isStage.engage).length,
          intent: evs.filter(isStage.intent).length + lds.length,
          convert: evs.filter(isStage.convert).length,
        };
        const stages: FunnelStage[] = [
          { key: 'traffic', label: 'Traffic (Ads/SEO)', count: counts.traffic, pct: 100, dropPct: 0 },
          { key: 'engage', label: 'Engagement (xem SP/blog)', count: counts.engage, pct: 0, dropPct: 0 },
          { key: 'intent', label: 'Intent (dùng máy tính)', count: counts.intent, pct: 0, dropPct: 0 },
          { key: 'convert', label: 'Conversion (gọi/Zalo)', count: counts.convert, pct: 0, dropPct: 0 },
        ];
        const top = Math.max(stages[0].count, 1);
        stages.forEach((s, i) => {
          s.pct = Math.round((s.count / top) * 1000) / 10;
          if (i > 0) {
            const prev = stages[i - 1].count || 1;
            s.dropPct = Math.max(0, Math.round((1 - s.count / prev) * 1000) / 10);
          }
        });

        // ---- KPI ----
        const cvrSeries = emptySpark().map((p) => {
          const dayEvs = evs.filter((e) => e.created_at.slice(0, 10) === p.date);
          const traffic = dayEvs.filter(isStage.traffic).length || 1;
          const conv = dayEvs.filter(isStage.convert).length;
          return { date: p.date, value: Math.round((conv / traffic) * 1000) / 10 };
        });
        const cvrToday = cvrSeries[cvrSeries.length - 1].value;

        setKpi({
          totalLeads: lds.length,
          totalLeadsSpark: bucketByDay(lds),
          cvr: cvrToday,
          cvrSpark: cvrSeries,
          leadValue: lds.reduce((s, l) => s + Number(l.total_cost || 0), 0),
          leadValueSpark: bucketByDay(lds, (l) => Number(l.total_cost || 0)),
          totalEvents: evs.length,
          eventsSpark: bucketByDay(evs),
        });
        setFunnel(stages);

        // ---- Activity stream (mix latest 25 leads + events) ----
        type Source = { adSource?: string; source?: string; productName?: string; dealerName?: string; crop?: string };
        const activityItems: ActivityItem[] = [
          ...lds.slice(0, 12).map<ActivityItem>((l) => ({
            id: `lead-${l.id}`,
            ts: l.created_at,
            kind: 'lead',
            title: `${l.customer_name} · ${l.crop} ${(l.area_m2 / 10000).toFixed(1)}ha`,
            detail: `${l.customer_province ?? '—'} · Dự toán ${formatVnd(Number(l.total_cost))}`,
            source: l.dealer_id ? 'gắn đại lý' : 'chưa gán',
            syncStatus: l.dealer_id ? 'ok' : 'pending',
          })),
          ...evs.slice(0, 30).map<ActivityItem>((e) => {
            const p = (e.payload ?? {}) as Source;
            const fb = e.fb_status?.startsWith('success') || e.fb_status?.startsWith('skipped') ? 'ok' : (e.fb_status ? 'error' : 'na');
            const tt = e.tiktok_status?.startsWith('success') || e.tiktok_status?.startsWith('skipped') ? 'ok' : (e.tiktok_status ? 'error' : 'na');
            const sync: ActivityItem['syncStatus'] =
              fb === 'error' || tt === 'error' ? 'error' : 'ok';
            return {
              id: `evt-${e.id}`,
              ts: e.created_at,
              kind: 'event',
              title: prettyEventName(e.event_name),
              detail: p.dealerName ?? p.productName ?? p.crop ?? (e.url ? new URL(e.url).pathname : '—'),
              source: p.adSource ?? p.source ?? 'direct',
              syncStatus: sync,
            };
          }),
        ]
          .sort((a, b) => b.ts.localeCompare(a.ts))
          .slice(0, 25);
        setActivity(activityItems);
      } catch (err) {
        console.error('[dashboard] load error', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [refreshTs]);

  // Realtime: refresh on new lead/event
  useEffect(() => {
    const ch = supabase
      .channel('dashboard-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calculator_leads' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tracking_events' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refresh]);

  return { loading, kpi, funnel, activity, refresh };
}

function formatVnd(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`;
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function prettyEventName(name: string): string {
  const map: Record<string, string> = {
    page_view: 'Xem trang',
    product_view: 'Xem sản phẩm',
    call_click: 'Bấm gọi',
    zalo_click: 'Bấm Zalo',
    click_call_dealer: 'Gọi đại lý',
    click_zalo_lead: 'Zalo đại lý',
    inquiry_submit: 'Gửi yêu cầu',
    calculator_used: 'Dùng máy tính',
    use_calculator: 'Dùng máy tính',
    calculator_lead_submit: 'Tạo lead máy tính',
    view_market_data: 'Xem giá nông sản',
    article_view: 'Xem bài viết',
  };
  return map[name] ?? name;
}
