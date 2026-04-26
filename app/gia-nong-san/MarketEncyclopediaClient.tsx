import Link from 'next/link';
import { MapPin, Search, ShieldCheck } from 'lucide-react';
import { MOCK_CROP_CATEGORIES, MOCK_CROPS, MOCK_PRICE_RECORDS } from '@/data/mockMarket';
import type { CropCategory, CropItem, PriceRecord } from '../../types/market';
import { cn } from '@/lib/utils';
import { CropRowCard, type CropRowCardData } from './_components/CropRowCard';

type Props = {
  searchParams?: {
    q?: string | string[];
    category?: string | string[];
  };
};

type CropMarketRow = {
  crop: CropItem;
  category: CropCategory;
  records: PriceRecord[];
  averagePrice: number;
  averageChange: number;
  previousAveragePrice: number;
  latestRecord: PriceRecord | null;
};

const ALL_CATEGORY_ID = 'all';

function formatPrice(value: number, unit?: string) {
  const normalizedUnit = unit ?? 'đ/kg';
  return `${Math.round(value).toLocaleString('vi-VN')} ${normalizedUnit}`;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function pickString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function buildCropRows(): CropMarketRow[] {
  return MOCK_CROPS.map((crop) => {
    const category =
      MOCK_CROP_CATEGORIES.find((item) => item.id === crop.category_id) ?? MOCK_CROP_CATEGORIES[0];
    const records = MOCK_PRICE_RECORDS.filter((record) => record.crop_id === crop.id);
    const averagePrice =
      records.length > 0 ? records.reduce((sum, record) => sum + record.price, 0) / records.length : 0;
    const averageChange =
      records.length > 0
        ? records.reduce((sum, record) => sum + record.change_percentage, 0) / records.length
        : 0;
    const previousAveragePrice =
      records.length > 0
        ? records.reduce((sum, record) => sum + record.price / (1 + record.change_percentage / 100), 0) /
          records.length
        : 0;
    const latestRecord = [...records].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return Number(b.is_verified) - Number(a.is_verified);
    })[0] ?? null;

    return {
      crop,
      category,
      records,
      averagePrice,
      averageChange,
      previousAveragePrice,
      latestRecord,
    };
  });
}

function toRowCardData(row: CropMarketRow): CropRowCardData {
  return {
    name: row.crop.name,
    slug: row.crop.slug,
    province: row.latestRecord?.province ?? 'Đang cập nhật',
    price: row.averagePrice,
    unit: row.latestRecord?.unit ?? 'đ/kg',
    changeVnd: row.averagePrice - row.previousAveragePrice,
    changePct: row.averageChange,
  };
}

function buildFilterHref(searchValue: string, categoryId?: string) {
  const query = new URLSearchParams();
  const trimmed = searchValue.trim();

  if (trimmed) query.set('q', trimmed);
  if (categoryId && categoryId !== ALL_CATEGORY_ID) query.set('category', categoryId);

  const suffix = query.toString();
  return suffix ? `/gia-nong-san?${suffix}` : '/gia-nong-san';
}

export default function MarketEncyclopediaClient({ searchParams }: Props) {
  const rows = buildCropRows();
  const searchValue = pickString(searchParams?.q).trim();
  const categoryQuery = pickString(searchParams?.category).trim();
  const hasValidCategory = MOCK_CROP_CATEGORIES.some((category) => category.id === categoryQuery);
  const activeCategory = hasValidCategory ? categoryQuery : ALL_CATEGORY_ID;
  const normalizedQuery = normalizeText(searchValue);

  const filteredRows = rows.filter((row) => {
    if (activeCategory !== ALL_CATEGORY_ID && row.category.id !== activeCategory) return false;
    if (!normalizedQuery) return true;

    const searchable = normalizeText(
      [row.crop.name, row.category.name, row.latestRecord?.province, ...row.records.map((record) => record.province)]
        .filter(Boolean)
        .join(' '),
    );

    return searchable.includes(normalizedQuery);
  });

  const trendingRows = rows.filter((row) => row.crop.tier === 1);
  const isLongList = filteredRows.length > 50;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="bg-gray-50 px-4 py-12 md:py-16">
        <header className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-green-600">Agri-OS Market Data</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
            Bảng Giá Nông Sản Trực Tuyến
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Tra cứu nhanh giá thu mua nông sản theo nhóm ngành, tỉnh thành và biến động trong ngày.
          </p>

          <form method="get" action="/gia-nong-san" className="relative mx-auto mt-8 max-w-3xl">
            {activeCategory !== ALL_CATEGORY_ID ? <input type="hidden" name="category" value={activeCategory} /> : null}
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <label htmlFor="market-search" className="sr-only">
              Tìm kiếm nông sản
            </label>
            <input
              id="market-search"
              name="q"
              defaultValue={searchValue}
              placeholder="Nhập tên nông sản bạn muốn xem giá... (VD: Sầu riêng, Cà phê)"
              className="h-16 w-full rounded-xl border border-gray-200 bg-white pl-14 pr-5 text-base font-medium text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
            />
          </form>
        </header>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5">
          <p>
            <span className="block text-xs font-black uppercase tracking-[0.22em] text-gray-400">Mặt hàng chủ lực</span>
            <span className="mt-1 block text-lg font-black text-gray-900">Bảng điện trending</span>
          </p>
          <p className="hidden text-sm font-medium text-gray-500 sm:block">{trendingRows.length} mặt hàng tier 1</p>
        </header>

        <ul className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 pb-5" role="list">
          {trendingRows.map((row) => (
            <li key={row.crop.id} className="min-w-[220px] list-none rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <article>
                <p className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-wide text-gray-400">{row.category.name}</span>
                    <span className="mt-1 block text-sm font-black text-gray-900">{row.crop.name}</span>
                  </span>
                  {row.latestRecord?.is_verified ? (
                    <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                  ) : null}
                </p>
                <p className="mt-4 text-lg font-black text-gray-900">{formatPrice(row.averagePrice, row.latestRecord?.unit)}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {row.latestRecord?.province ?? 'Đang cập nhật'}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-gray-50 px-4 py-8 md:py-10">
        <header className="mx-auto mb-6 max-w-7xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <nav aria-label="Lọc nhóm ngành nông sản">
            <ul className="flex gap-2 overflow-x-auto pb-1" role="list">
              <li className="list-none">
                <Link
                  href={buildFilterHref(searchValue)}
                  className={cn(
                    'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-bold transition',
                    activeCategory === ALL_CATEGORY_ID
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50',
                  )}
                >
                  Tất cả
                </Link>
              </li>
              {MOCK_CROP_CATEGORIES.map((category) => (
                <li key={category.id} className="list-none">
                  <Link
                    href={buildFilterHref(searchValue, category.id)}
                    className={cn(
                      'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-bold transition',
                      activeCategory === category.id
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50',
                    )}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <section className="mx-auto max-w-7xl">
          <header className="mb-4">
            <p className="text-sm font-bold text-gray-900">{filteredRows.length} mặt hàng đang hiển thị</p>
            <p className="mt-1 text-xs text-gray-500">Dữ liệu mock phục vụ thử nghiệm UI Agri-OS.</p>
          </header>

          {filteredRows.length > 0 ? (
            <ul
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              role="list"
              itemScope
              itemType="https://schema.org/ItemList"
            >
              {filteredRows.map((row, index) => (
                <CropRowCard
                  key={row.crop.id}
                  item={toRowCardData(row)}
                  index={index}
                  useContentVisibility={isLongList}
                  disablePrefetch={isLongList}
                />
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <span className="block text-lg font-black text-gray-900">Không tìm thấy mặt hàng phù hợp</span>
              <span className="mt-2 block text-sm text-gray-500">Thử đổi từ khóa hoặc chọn lại nhóm ngành.</span>
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
