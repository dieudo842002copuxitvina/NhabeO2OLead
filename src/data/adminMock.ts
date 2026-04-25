/**
 * Mock pending dealer applications + commission tiers + lead seed for admin demo.
 */
import type { Dealer } from '@/data/types';

export interface PendingDealer {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  province: string;
  address: string;
  appliedAt: number;
  expectedSKUs: number;
  hasShop: boolean;
  notes?: string;
}

export const pendingDealers: PendingDealer[] = [
  {
    id: 'pd-1', name: 'Đại lý Nông Việt', ownerName: 'Trần Văn Hải', phone: '0912000111',
    province: 'Đắk Lắk', address: '88 Nguyễn Tất Thành, Buôn Ma Thuột',
    appliedAt: Date.now() - 1000 * 60 * 60 * 6, expectedSKUs: 25, hasShop: true,
    notes: 'Đã có cửa hàng VTNN 5 năm, muốn mở rộng sang IoT.',
  },
  {
    id: 'pd-2', name: 'AgriHub Bến Tre', ownerName: 'Nguyễn Thị Lan', phone: '0978111222',
    province: 'Bến Tre', address: '12 Đồng Khởi, TP. Bến Tre',
    appliedAt: Date.now() - 1000 * 60 * 60 * 22, expectedSKUs: 15, hasShop: true,
  },
  {
    id: 'pd-3', name: 'Smart Farm Đắk Nông', ownerName: 'Lê Quốc Bình', phone: '0934222333',
    province: 'Đắk Nông', address: '45 Hùng Vương, Gia Nghĩa',
    appliedAt: Date.now() - 1000 * 60 * 60 * 50, expectedSKUs: 30, hasShop: false,
    notes: 'Showroom đang xây dựng, dự kiến khai trương cuối tháng.',
  },
  {
    id: 'pd-4', name: 'Tưới Tiêu Long An', ownerName: 'Phạm Minh Tú', phone: '0967333444',
    province: 'Long An', address: '230 QL1A, Bến Lức',
    appliedAt: Date.now() - 1000 * 60 * 60 * 72, expectedSKUs: 20, hasShop: true,
  },
];

/* Commission tiers — % trên giá trị đơn hoàn thành */
export interface CommissionTier {
  id: string;
  label: string;
  minRevenue: number;       // VND/tháng
  rate: number;             // %
  color: string;
}

export const commissionTiers: CommissionTier[] = [
  { id: 't-bronze',  label: 'Bronze',   minRevenue: 0,           rate: 5,  color: 'bg-orange-500/15 text-orange-600' },
  { id: 't-silver',  label: 'Silver',   minRevenue: 500_000_000, rate: 7,  color: 'bg-slate-400/20 text-slate-600' },
  { id: 't-gold',    label: 'Gold',     minRevenue: 1_500_000_000, rate: 9, color: 'bg-accent/20 text-accent' },
  { id: 't-platinum',label: 'Platinum', minRevenue: 3_000_000_000, rate: 12, color: 'bg-primary/15 text-primary' },
];

export function tierOf(revenue: number): CommissionTier {
  return [...commissionTiers].reverse().find(t => revenue >= t.minRevenue) ?? commissionTiers[0];
}

/* Mock additional historical leads for analytics (not via DealerCTA) */
export interface HistoricalLead {
  dealerId: string;
  province: string;
  channel: 'zalo' | 'call' | 'inquiry';
  status: 'new' | 'contacted' | 'won' | 'lost';
  productCategory: string;
  daysAgo: number;
}

// Generate a richer dataset for heatmap & funnel
export const historicalLeads: HistoricalLead[] = (() => {
  const dealersSeed: { id: string; province: string }[] = [
    { id: 'd-1', province: 'Đồng Nai' },
    { id: 'd-2', province: 'Lâm Đồng' },
    { id: 'd-3', province: 'Tây Ninh' },
    { id: 'd-4', province: 'Cần Thơ' },
    { id: 'd-6', province: 'Bình Dương' },
  ];
  // unmatched-area leads (no dealer yet) — drives "expansion" insight
  const gapProvinces = ['Đắk Lắk', 'Gia Lai', 'Kiên Giang', 'An Giang', 'Bến Tre'];
  const channels: HistoricalLead['channel'][] = ['zalo', 'call', 'inquiry'];
  const statuses: HistoricalLead['status'][] = ['new', 'contacted', 'won', 'won', 'lost'];
  const cats = ['Hệ thống tưới', 'Máy bơm', 'Cảm biến IoT', 'Điều khiển'];

  const out: HistoricalLead[] = [];
  let seed = 1;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // dealer leads
  dealersSeed.forEach((d, idx) => {
    const count = 30 + Math.floor(rand() * 60) + idx * 5;
    for (let i = 0; i < count; i++) {
      out.push({
        dealerId: d.id, province: d.province,
        channel: channels[Math.floor(rand() * channels.length)],
        status: statuses[Math.floor(rand() * statuses.length)],
        productCategory: cats[Math.floor(rand() * cats.length)],
        daysAgo: Math.floor(rand() * 30),
      });
    }
  });
  // gap leads (no dealer assigned)
  gapProvinces.forEach((p, idx) => {
    const count = 12 + Math.floor(rand() * 25) + idx * 2;
    for (let i = 0; i < count; i++) {
      out.push({
        dealerId: '__gap__', province: p,
        channel: channels[Math.floor(rand() * channels.length)],
        status: 'new',
        productCategory: cats[Math.floor(rand() * cats.length)],
        daysAgo: Math.floor(rand() * 30),
      });
    }
  });
  return out;
})();
