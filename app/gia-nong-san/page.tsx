import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  ChevronRight,
  Newspaper,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import ProductCard from '../store/ProductCard';
import { PRODUCTS_DATA } from '@/data/products';

type QueryValue = string | string[] | undefined;

type PageProps = {
  searchParams?: Record<string, QueryValue>;
};

type TabKey = 'all' | 'coffee' | 'pepper' | 'rice' | 'fruit';
type CommodityKey = 'coffee-robusta' | 'pepper' | 'rice-ir50404' | 'durian-ri6';

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  minutesAgo: number;
};

type ProvincePrice = {
  province: string;
  price: number;
  changePct: number;
  trend: number[];
};

type MarketRow = {
  slug: string;
  icon: string;
  name: string;
  tab: TabKey;
  region: string;
  price: number;
  unit: string;
  changePct: number;
  trend: number[];
  commodity: CommodityKey;
};

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'coffee', label: 'Cà Phê' },
  { key: 'pepper', label: 'Hồ Tiêu' },
  { key: 'rice', label: 'Lúa Gạo' },
  { key: 'fruit', label: 'Trái Cây' },
];

const COMMODITY_OPTIONS: Array<{ key: CommodityKey; label: string }> = [
  { key: 'coffee-robusta', label: 'Cà phê Robusta' },
  { key: 'pepper', label: 'Hồ tiêu đen' },
  { key: 'rice-ir50404', label: 'Lúa IR50404' },
  { key: 'durian-ri6', label: 'Sầu riêng Ri6' },
];

const FEATURED_NEWS: NewsItem = {
  id: 'news-featured',
  title: 'Giá cà phê nội địa tăng phiên thứ 4 liên tiếp do nguồn cung Tây Nguyên chậm ra hàng',
  excerpt:
    'Do mưa trái mùa kéo dài tại Gia Lai và Đắk Lắk, lượng hàng giao về kho thấp hơn kế hoạch. Nhiều đại lý nâng giá mua thêm 800-1.200 đ/kg.',
  source: 'Trung tâm phân tích Nhà Bè Agri',
  minutesAgo: 45,
};

const TOP_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Hồ tiêu xuất khẩu phục hồi, biên độ giá nội địa tăng nhẹ 1.8%',
    excerpt: 'Nhu cầu giao tháng 5 tăng ở nhóm doanh nghiệp chế biến.',
    source: 'Agri Trade Desk',
    minutesAgo: 70,
  },
  {
    id: 'news-2',
    title: 'Lúa gạo ĐBSCL giữ đà ổn định, thương lái ưu tiên hàng chất lượng cao',
    excerpt: 'Giá lúa thơm tăng chậm nhưng bền vững trong 3 ngày gần nhất.',
    source: 'Bản tin vùng miền',
    minutesAgo: 95,
  },
  {
    id: 'news-3',
    title: 'Sầu riêng nghịch vụ bắt đầu thu hoạch, biên lợi nhuận dự kiến cải thiện',
    excerpt: 'Sản lượng chưa cao, thị trường Trung Quốc vẫn mua đều.',
    source: 'O2O Dealer Network',
    minutesAgo: 130,
  },
];

const REGION_PRICE_MAP: Record<CommodityKey, ProvincePrice[]> = {
  'coffee-robusta': [
    { province: 'Đắk Lắk', price: 109500, changePct: 1.9, trend: [105, 106, 107, 108, 109, 109.2, 109.5] },
    { province: 'Gia Lai', price: 108700, changePct: 1.2, trend: [104, 105, 106, 107, 107.5, 108.1, 108.7] },
    { province: 'Lâm Đồng', price: 107900, changePct: 0.8, trend: [103.5, 104.2, 105.4, 106.3, 106.9, 107.1, 107.9] },
    { province: 'Đắk Nông', price: 108200, changePct: 1.1, trend: [104, 104.9, 105.2, 106.7, 107.4, 107.9, 108.2] },
    { province: 'Kon Tum', price: 106800, changePct: -0.4, trend: [106.9, 107.2, 107.1, 106.9, 106.7, 106.8, 106.8] },
    { province: 'Bình Phước', price: 107200, changePct: 0.3, trend: [106.8, 106.9, 107, 107.2, 107.1, 107.1, 107.2] },
  ],
  pepper: [
    { province: 'Đắk Nông', price: 151000, changePct: 1.6, trend: [146, 147, 148, 149, 150, 150.5, 151] },
    { province: 'Gia Lai', price: 149800, changePct: 1.1, trend: [145, 146, 147, 148, 149, 149.2, 149.8] },
    { province: 'Đồng Nai', price: 148500, changePct: 0.4, trend: [146, 146.5, 147, 147.4, 147.9, 148.2, 148.5] },
    { province: 'Bà Rịa - Vũng Tàu', price: 152300, changePct: 2.2, trend: [146.4, 147.2, 148.6, 149.1, 150.3, 151, 152.3] },
    { province: 'Bình Phước', price: 147700, changePct: -0.6, trend: [148.2, 148.4, 148.5, 148.1, 147.9, 147.6, 147.7] },
    { province: 'Quảng Trị', price: 147200, changePct: -0.9, trend: [148.9, 148.7, 148.1, 147.8, 147.5, 147.3, 147.2] },
  ],
  'rice-ir50404': [
    { province: 'An Giang', price: 9050, changePct: 0.3, trend: [8.8, 8.8, 8.9, 8.9, 9, 9, 9.05] },
    { province: 'Kiên Giang', price: 9120, changePct: 0.5, trend: [8.8, 8.9, 8.9, 9, 9, 9.05, 9.12] },
    { province: 'Đồng Tháp', price: 8960, changePct: -0.4, trend: [9.1, 9, 9, 8.98, 8.97, 8.96, 8.96] },
    { province: 'Long An', price: 9020, changePct: 0.1, trend: [8.9, 8.95, 8.98, 9, 9.01, 9.02, 9.02] },
    { province: 'Cần Thơ', price: 9080, changePct: 0.4, trend: [8.9, 8.94, 8.99, 9.02, 9.04, 9.05, 9.08] },
    { province: 'Sóc Trăng', price: 8940, changePct: -0.6, trend: [9.1, 9.03, 8.99, 8.97, 8.95, 8.94, 8.94] },
  ],
  'durian-ri6': [
    { province: 'Đắk Lắk', price: 95500, changePct: 2.1, trend: [89, 90, 91.5, 92.3, 93.6, 94.2, 95.5] },
    { province: 'Đắk Nông', price: 94800, changePct: 1.8, trend: [88.5, 89.7, 90.9, 91.5, 92.9, 93.6, 94.8] },
    { province: 'Tiền Giang', price: 93500, changePct: 0.9, trend: [90.4, 91, 91.8, 92.6, 93, 93.2, 93.5] },
    { province: 'Bến Tre', price: 92800, changePct: 0.4, trend: [91, 91.4, 91.8, 92, 92.2, 92.4, 92.8] },
    { province: 'Lâm Đồng', price: 92100, changePct: -0.8, trend: [93.5, 93.1, 92.8, 92.7, 92.4, 92.2, 92.1] },
    { province: 'Đồng Nai', price: 91800, changePct: -1.1, trend: [93.2, 92.8, 92.5, 92.1, 91.9, 91.8, 91.8] },
  ],
};

const MARKET_ROWS: MarketRow[] = [
  {
    slug: 'ca-phe-robusta',
    icon: '☕',
    name: 'Cà phê Robusta',
    tab: 'coffee',
    region: 'Đắk Lắk',
    price: 109500,
    unit: 'đ/kg',
    changePct: 1.9,
    trend: [105, 106, 107, 108, 109, 109.2, 109.5],
    commodity: 'coffee-robusta',
  },
  {
    slug: 'ca-phe-arabica',
    icon: '🌿',
    name: 'Cà phê Arabica',
    tab: 'coffee',
    region: 'Lâm Đồng',
    price: 121300,
    unit: 'đ/kg',
    changePct: 1.2,
    trend: [117, 118, 118.9, 119.5, 120, 120.6, 121.3],
    commodity: 'coffee-robusta',
  },
  {
    slug: 'ho-tieu-den',
    icon: '🌶️',
    name: 'Hồ tiêu đen loại 500g/l',
    tab: 'pepper',
    region: 'Bà Rịa - Vũng Tàu',
    price: 152300,
    unit: 'đ/kg',
    changePct: 2.2,
    trend: [146.4, 147.2, 148.6, 149.1, 150.3, 151, 152.3],
    commodity: 'pepper',
  },
  {
    slug: 'ho-tieu-trang',
    icon: '🧂',
    name: 'Hồ tiêu trắng',
    tab: 'pepper',
    region: 'Gia Lai',
    price: 188500,
    unit: 'đ/kg',
    changePct: -0.4,
    trend: [191, 190.6, 190.1, 189.4, 189, 188.7, 188.5],
    commodity: 'pepper',
  },
  {
    slug: 'lua-ir50404',
    icon: '🌾',
    name: 'Lúa IR50404',
    tab: 'rice',
    region: 'An Giang',
    price: 9050,
    unit: 'đ/kg',
    changePct: 0.3,
    trend: [8.8, 8.8, 8.9, 8.9, 9, 9, 9.05],
    commodity: 'rice-ir50404',
  },
  {
    slug: 'gao-st25',
    icon: '🍚',
    name: 'Gạo ST25 thành phẩm',
    tab: 'rice',
    region: 'Sóc Trăng',
    price: 25800,
    unit: 'đ/kg',
    changePct: 0.7,
    trend: [24.8, 25, 25.1, 25.2, 25.4, 25.6, 25.8],
    commodity: 'rice-ir50404',
  },
  {
    slug: 'sau-rieng-ri6',
    icon: '🥭',
    name: 'Sầu riêng Ri6',
    tab: 'fruit',
    region: 'Đắk Lắk',
    price: 95500,
    unit: 'đ/kg',
    changePct: 2.1,
    trend: [89, 90, 91.5, 92.3, 93.6, 94.2, 95.5],
    commodity: 'durian-ri6',
  },
  {
    slug: 'sau-rieng-thai',
    icon: '🥇',
    name: 'Sầu riêng Thái',
    tab: 'fruit',
    region: 'Tiền Giang',
    price: 112000,
    unit: 'đ/kg',
    changePct: 1.5,
    trend: [105, 106.5, 107, 108.2, 109.3, 110.6, 112],
    commodity: 'durian-ri6',
  },
  {
    slug: 'xoai-cat-chu',
    icon: '🥭',
    name: 'Xoài cát chu',
    tab: 'fruit',
    region: 'Đồng Tháp',
    price: 31200,
    unit: 'đ/kg',
    changePct: -1.3,
    trend: [33, 32.8, 32.5, 32.1, 31.8, 31.5, 31.2],
    commodity: 'durian-ri6',
  },
];

export const metadata: Metadata = {
  title: 'Giá Nông Sản Hôm Nay | Agri Dashboard Nhà Bè Agri',
  description:
    'Agri Dashboard theo dõi giá nông sản theo vùng miền, biến động 7 ngày, công cụ tính lợi nhuận và gợi ý vật tư nâng cao năng suất.',
  alternates: {
    canonical: '/gia-nong-san',
  },
};

function pickParam(value: QueryValue) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactVnd(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} triệu`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)} nghìn`;
  return value.toLocaleString('vi-VN');
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (points.length === 0) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const width = 120;
  const height = 36;
  const step = points.length === 1 ? width : width / (points.length - 1);

  const normalized = points.map((point, index) => {
    const x = index * step;
    const y = max === min ? height / 2 : ((max - point) / (max - min)) * (height - 4) + 2;
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-9 w-full" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" points={normalized.join(' ')} />
    </svg>
  );
}

function buildHref(base: URLSearchParams, patch: Record<string, string>) {
  const next = new URLSearchParams(base.toString());
  Object.entries(patch).forEach(([key, value]) => {
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
  });
  const query = next.toString();
  return query ? `/gia-nong-san?${query}` : '/gia-nong-san';
}

function sectionCardClassName() {
  return 'rounded-2xl bg-white p-5 shadow-sm md:p-6';
}

export default function GiaNongSanPage({ searchParams }: PageProps) {
  const urlParams = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    const selected = pickParam(value);
    if (selected) urlParams.set(key, selected);
  });

  const selectedCommodityQuery = pickParam(searchParams?.item);
  const selectedCommodity =
    COMMODITY_OPTIONS.find((option) => option.key === selectedCommodityQuery)?.key ?? 'coffee-robusta';
  const selectedTabQuery = pickParam(searchParams?.tab);
  const activeTab = TABS.find((tab) => tab.key === selectedTabQuery)?.key ?? 'all';

  const profitCommodityQuery = pickParam(searchParams?.profitItem);
  const profitCommodity =
    COMMODITY_OPTIONS.find((option) => option.key === profitCommodityQuery)?.key ?? selectedCommodity;

  const quantityValue = toNumber(pickParam(searchParams?.qty), 0);
  const quantityUnit = pickParam(searchParams?.qtyUnit) === 'ton' ? 'ton' : 'kg';
  const estimatedCost = Math.max(toNumber(pickParam(searchParams?.cost), 0), 0);
  const quantityKg = quantityUnit === 'ton' ? quantityValue * 1000 : quantityValue;

  const commodityRows = MARKET_ROWS.filter((row) => row.commodity === profitCommodity);
  const avgUnitPrice =
    commodityRows.length > 0
      ? commodityRows.reduce((sum, row) => sum + row.price, 0) / commodityRows.length
      : MARKET_ROWS[0].price;

  const estimatedRevenue = quantityKg * avgUnitPrice;
  const estimatedProfit = Math.max(estimatedRevenue - estimatedCost, 0);
  const showUpgradeCta = estimatedProfit > 50_000_000;

  const mapRows = REGION_PRICE_MAP[selectedCommodity];
  const maxMapPrice = Math.max(...mapRows.map((row) => row.price));
  const minMapPrice = Math.min(...mapRows.map((row) => row.price));

  const tableRows = activeTab === 'all' ? MARKET_ROWS : MARKET_ROWS.filter((row) => row.tab === activeTab);
  const topGainers = [...MARKET_ROWS].sort((a, b) => b.changePct - a.changePct).slice(0, 3);
  const topLosers = [...MARKET_ROWS].sort((a, b) => a.changePct - b.changePct).slice(0, 3);
  const crossSellProducts = PRODUCTS_DATA.filter((product) =>
    ['HARDWARE', 'FERTILIZER', 'SOLAR'].includes(product.category),
  ).slice(0, 6);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-2xl bg-white p-5 shadow-sm md:p-6">
          <nav className="mb-3 flex items-center gap-1 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">Giá nông sản</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Agri Dashboard: Giá Nông Sản Thời Gian Thực</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600 md:text-base">
            Theo dõi giá theo vùng miền, nhận diện xu hướng tăng giảm theo ngày và gợi ý đầu tư vật tư ngay trong cùng một màn hình.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <section className={sectionCardClassName()}>
              <header className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 md:text-xl">
                  <Newspaper className="h-5 w-5 text-[#4CAF50]" />
                  Tin Tức Thị Trường & Phân Tích
                </h2>
                <Link href="/tri-thuc" className="text-sm font-semibold text-[#2E7D32] hover:underline">
                  Xem tất cả
                </Link>
              </header>

              <div className="grid gap-4 lg:grid-cols-5">
                <article className="overflow-hidden rounded-2xl border border-gray-100 lg:col-span-3">
                  <div
                    className="h-52 w-full bg-cover bg-center md:h-60"
                    style={{
                      backgroundImage:
                        "linear-gradient(120deg, rgba(17,24,39,0.35), rgba(17,24,39,0.15)), url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80')",
                    }}
                  />
                  <div className="space-y-2 p-4">
                    <h3 className="text-lg font-bold leading-snug text-gray-900">{FEATURED_NEWS.title}</h3>
                    <p className="text-sm text-gray-600">{FEATURED_NEWS.excerpt}</p>
                    <p className="text-xs font-medium text-gray-500">
                      {FEATURED_NEWS.source} • {FEATURED_NEWS.minutesAgo} phút trước
                    </p>
                  </div>
                </article>

                <div className="space-y-3 lg:col-span-2">
                  {TOP_NEWS.map((item) => (
                    <article key={item.id} className="rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50">
                      <h3 className="text-sm font-bold leading-snug text-gray-900">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600">{item.excerpt}</p>
                      <p className="mt-2 text-xs font-medium text-gray-500">
                        {item.source} • {item.minutesAgo} phút trước
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className={sectionCardClassName()}>
              <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-gray-900 md:text-xl">Bản Đồ Giá Vùng Miền</h2>
                <form action="/gia-nong-san" method="get" className="flex items-center gap-2">
                  <input type="hidden" name="tab" value={activeTab} />
                  <label htmlFor="region-item" className="text-sm font-medium text-gray-600">
                    Chọn mặt hàng
                  </label>
                  <select
                    id="region-item"
                    name="item"
                    defaultValue={selectedCommodity}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-green-100"
                  >
                    {COMMODITY_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Áp dụng
                  </button>
                </form>
              </header>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {mapRows.map((row) => {
                  const isHighest = row.price === maxMapPrice;
                  const isLowest = row.price === minMapPrice;
                  const badgeClassName = isHighest
                    ? 'bg-green-700 text-white'
                    : isLowest
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700';
                  const cardClassName = isHighest
                    ? 'border-green-300'
                    : isLowest
                      ? 'border-red-200'
                      : 'border-gray-100';

                  return (
                    <article key={row.province} className={`rounded-xl border ${cardClassName} p-4`}>
                      <header className="mb-3 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{row.province}</h3>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeClassName}`}>
                          {isHighest ? 'Cao nhất' : isLowest ? 'Thấp nhất' : 'Trung bình'}
                        </span>
                      </header>

                      <p className="text-xl font-bold text-gray-900">{formatVnd(row.price)}</p>
                      <p className={`mt-1 text-xs font-semibold ${row.changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.changePct >= 0 ? '+' : ''}
                        {row.changePct.toFixed(1)}%
                      </p>
                      <div className="mt-3">
                        <Sparkline points={row.trend} color={row.changePct >= 0 ? '#16a34a' : '#dc2626'} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className={sectionCardClassName()}>
              <header className="mb-4 space-y-3">
                <h2 className="text-lg font-bold text-gray-900 md:text-xl">Bảng Giá Nông Sản Chi Tiết</h2>
                <nav className="flex flex-wrap gap-2" aria-label="Lọc nhóm mặt hàng">
                  {TABS.map((tab) => (
                    <Link
                      key={tab.key}
                      href={buildHref(urlParams, { tab: tab.key })}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        activeTab === tab.key
                          ? 'border-[#4CAF50] bg-green-50 text-[#2E7D32]'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </nav>
              </header>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="pb-3 font-semibold">Nông sản</th>
                      <th className="pb-3 font-semibold">Khu vực</th>
                      <th className="pb-3 font-semibold">Giá hôm nay</th>
                      <th className="pb-3 font-semibold">Biến động</th>
                      <th className="pb-3 font-semibold">Xu hướng 7 ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.slug} className="border-t border-gray-100">
                        <td className="py-3 pr-3">
                          <Link href={`/gia-nong-san/${row.slug}`} className="inline-flex items-center gap-2 hover:text-[#2E7D32]">
                            <span className="text-lg">{row.icon}</span>
                            <span className="font-semibold text-gray-900">{row.name}</span>
                          </Link>
                        </td>
                        <td className="py-3 pr-3 text-gray-600">{row.region}</td>
                        <td className="py-3 pr-3 font-bold text-gray-900">
                          {formatVnd(row.price)} <span className="text-xs font-medium text-gray-500">/{row.unit}</span>
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              row.changePct >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {row.changePct >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            {row.changePct >= 0 ? '+' : ''}
                            {row.changePct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3">
                          <Sparkline points={row.trend} color={row.changePct >= 0 ? '#16a34a' : '#dc2626'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={sectionCardClassName()}>
              <header className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 md:text-xl">Vật tư & Thiết bị nâng cao năng suất</h2>
                <p className="mt-1 text-sm text-gray-600">Gợi ý nhanh theo bối cảnh thị trường để tối ưu chi phí đầu vào.</p>
              </header>

              <div className="flex snap-x snap-mandatory flex-nowrap gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {crossSellProducts.map((product) => (
                  <div key={product.id} className="w-[240px] shrink-0 snap-start">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <section className={sectionCardClassName()}>
                <header className="mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[#4CAF50]" />
                  <h2 className="text-lg font-bold text-gray-900">Công Cụ Tính Lợi Nhuận</h2>
                </header>

                <form action="/gia-nong-san" method="get" className="space-y-3">
                  <input type="hidden" name="tab" value={activeTab} />
                  <input type="hidden" name="item" value={selectedCommodity} />

                  <div className="space-y-1">
                    <label htmlFor="profit-item" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Mặt hàng
                    </label>
                    <select
                      id="profit-item"
                      name="profitItem"
                      defaultValue={profitCommodity}
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-green-100"
                    >
                      {COMMODITY_OPTIONS.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="qty" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Sản lượng
                      </label>
                      <input
                        id="qty"
                        name="qty"
                        type="number"
                        min="0"
                        step="0.1"
                        defaultValue={quantityValue || ''}
                        placeholder="0"
                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="qty-unit" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Đơn vị
                      </label>
                      <select
                        id="qty-unit"
                        name="qtyUnit"
                        defaultValue={quantityUnit}
                        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-green-100"
                      >
                        <option value="kg">Kg</option>
                        <option value="ton">Tấn</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="cost" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Chi phí ước tính (VNĐ)
                    </label>
                    <input
                      id="cost"
                      name="cost"
                      type="number"
                      min="0"
                      step="1000"
                      defaultValue={estimatedCost || ''}
                      placeholder="Nhập chi phí sản xuất"
                      className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#4CAF50] focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Tính ngay
                  </button>
                </form>

                <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Dự kiến thu về</p>
                  <p className="mt-1 text-2xl font-bold text-[#4CAF50]">{formatVnd(estimatedRevenue)}</p>
                  <p className="mt-1 text-xs text-green-800">Lợi nhuận tạm tính: {formatVnd(estimatedProfit)}</p>
                  <p className="mt-2 text-xs text-green-800">
                    Giá tham chiếu: {formatVnd(avgUnitPrice)} /kg • Sản lượng quy đổi: {quantityKg.toLocaleString('vi-VN')} kg
                  </p>
                </div>

                {showUpgradeCta ? (
                  <Link
                    href="/store"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#2E7D32] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#256A29]"
                  >
                    Trúng giá! Nâng cấp ngay Hệ thống tưới tự động
                  </Link>
                ) : null}
              </section>

              <section className={sectionCardClassName()}>
                <h2 className="mb-4 text-lg font-bold text-gray-900">Top Tăng / Giảm Hôm Nay</h2>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700">
                      <TrendingUp className="h-4 w-4" />
                      Tăng mạnh
                    </p>
                    <ul className="space-y-2">
                      {topGainers.map((item) => (
                        <li key={`gain-${item.slug}`} className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          <span className="text-xs font-bold text-green-700">+{item.changePct.toFixed(1)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                      <TrendingDown className="h-4 w-4" />
                      Giảm mạnh
                    </p>
                    <ul className="space-y-2">
                      {topLosers.map((item) => (
                        <li key={`loss-${item.slug}`} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          <span className="text-xs font-bold text-red-700">{item.changePct.toFixed(1)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>

        <footer className="mt-6 rounded-2xl bg-white p-4 text-xs text-gray-500 shadow-sm">
          Bảng giá mang tính tham khảo nội bộ theo mạng lưới đại lý cập nhật trong ngày. Biến động tuyệt đối hiện tại:{' '}
          <span className="font-semibold text-gray-700">{formatCompactVnd(estimatedRevenue)}</span>.
        </footer>
      </div>
    </main>
  );
}
