/**
 * Marketing BI Analytics
 * Aggregates tracking events + leads into:
 *   - CAPI breakdown by ad source
 *   - Conversion Funnel (visit → calc → call/zalo)
 *   - Dealer Ranking (response rate, close rate, QA flag)
 */

import { getEventLog, type AdSource } from './tracking';
import { getLeads } from './leads';
import { dealers } from '@/data/mock';

export interface CapiRow {
  adSource: AdSource;
  label: string;
  pageViews: number;
  productViews: number;
  callClicks: number;
  zaloClicks: number;
  inquiries: number;
  totalConversions: number; // call + zalo + inquiry
  cvr: number;              // conversions / pageViews (%)
}

const SOURCE_LABEL: Record<AdSource, string> = {
  facebook: 'Facebook Ads',
  tiktok: 'TikTok Ads',
  google: 'Google Ads',
  organic: 'Organic Search',
  direct: 'Direct / Other',
};

export function getCapiBreakdown(rangeMs?: number): CapiRow[] {
  const cutoff = rangeMs ? Date.now() - rangeMs : 0;
  const log = getEventLog().filter(e => e.timestamp >= cutoff);
  const sources: AdSource[] = ['facebook', 'tiktok', 'google', 'organic', 'direct'];

  return sources.map(s => {
    const subset = log.filter(e => e.adSource === s);
    const pageViews = subset.filter(e => e.event === 'page_view').length;
    const productViews = subset.filter(e => e.event === 'product_view').length;
    const callClicks = subset.filter(e => e.event === 'call_click').length;
    const zaloClicks = subset.filter(e => e.event === 'zalo_click').length;
    const inquiries = subset.filter(e => e.event === 'inquiry_submit').length;
    const totalConversions = callClicks + zaloClicks + inquiries;
    const cvr = pageViews > 0 ? (totalConversions / pageViews) * 100 : 0;
    return {
      adSource: s,
      label: SOURCE_LABEL[s],
      pageViews, productViews, callClicks, zaloClicks, inquiries,
      totalConversions, cvr: Math.round(cvr * 10) / 10,
    };
  });
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
  pctOfPrev: number; // drop-off vs previous stage
  pctOfTotal: number;
}

export function getConversionFunnel(rangeMs?: number): FunnelStage[] {
  const cutoff = rangeMs ? Date.now() - rangeMs : 0;
  const log = getEventLog().filter(e => e.timestamp >= cutoff);

  const visits = log.filter(e => e.event === 'page_view').length;
  const productViews = log.filter(e => e.event === 'product_view').length;
  const calcUsed = log.filter(e => e.event === 'calculator_used').length;
  const calcLead = log.filter(e => e.event === 'calculator_lead_submit').length;
  const callOrZalo = log.filter(e => e.event === 'call_click' || e.event === 'zalo_click').length;

  const stages = [
    { key: 'visit', label: 'Truy cập trang', count: visits },
    { key: 'product', label: 'Xem sản phẩm', count: productViews },
    { key: 'calc', label: 'Dùng máy tính ROI', count: calcUsed },
    { key: 'lead', label: 'Submit lead Calculator', count: calcLead },
    { key: 'cta', label: 'Bấm Gọi / Zalo Đại lý', count: callOrZalo },
  ];

  return stages.map((s, i) => ({
    ...s,
    pctOfPrev: i === 0 || stages[i - 1].count === 0 ? 100 : Math.round((s.count / stages[i - 1].count) * 1000) / 10,
    pctOfTotal: visits === 0 ? 0 : Math.round((s.count / visits) * 1000) / 10,
  }));
}

export interface DealerRanking {
  dealerId: string;
  dealerName: string;
  region: string;
  totalLeads: number;
  contacted: number;
  won: number;
  responseRate: number; // % of leads with status != 'new'
  closeRate: number;    // % of leads with status === 'won'
  avgResponseMin: number; // mock
  qaFlag: boolean;      // closeRate < 10% AND totalLeads >= 5
  rank: number;
}

export function getDealerRanking(): DealerRanking[] {
  const leads = getLeads();
  const rows: DealerRanking[] = dealers.map(d => {
    const dealerLeads = leads.filter(l => l.dealerId === d.id);
    const total = dealerLeads.length;
    // For dealers with no real leads, simulate based on totalOrders for richer demo
    const simulated = total === 0;
    const simTotal = simulated ? Math.max(5, Math.floor(d.totalOrders / 8)) : total;
    const simContacted = simulated
      ? Math.floor(simTotal * (0.55 + (d.rating - 4) * 0.15))
      : dealerLeads.filter(l => l.status !== 'new').length;
    const simWon = simulated
      ? Math.floor(simTotal * (0.05 + (d.rating - 4) * 0.08))
      : dealerLeads.filter(l => l.status === 'won').length;
    const responseRate = simTotal === 0 ? 0 : Math.round((simContacted / simTotal) * 1000) / 10;
    const closeRate = simTotal === 0 ? 0 : Math.round((simWon / simTotal) * 1000) / 10;
    const avgResponseMin = Math.max(3, Math.round(60 - d.rating * 10 + (simulated ? Math.random() * 20 : 0)));
    return {
      dealerId: d.id,
      dealerName: d.name,
      region: d.region,
      totalLeads: simTotal,
      contacted: simContacted,
      won: simWon,
      responseRate,
      closeRate,
      avgResponseMin,
      qaFlag: closeRate < 10 && simTotal >= 5,
      rank: 0,
    };
  });

  // Rank by responseRate desc, then closeRate desc
  rows.sort((a, b) => b.responseRate - a.responseRate || b.closeRate - a.closeRate);
  rows.forEach((r, i) => { r.rank = i + 1; });
  return rows;
}

export function getQAFlaggedDealers(): DealerRanking[] {
  return getDealerRanking().filter(d => d.qaFlag);
}
