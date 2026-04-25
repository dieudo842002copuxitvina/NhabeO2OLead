'use client';

import { useMemo, useState } from 'react';
import { Grid3X3, List, Search, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { MOCK_CROP_CATEGORIES, MOCK_CROPS, MOCK_PRICE_RECORDS } from '@/data/mockMarket';
import type { CropCategory, CropItem, PriceRecord } from '../../types/market';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

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

function ChangeBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
        isUp ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {isUp ? '+' : ''}
      {value.toFixed(1)}%
    </span>
  );
}

function CropPriceCard({ row }: { row: CropMarketRow }) {
  const changeValue = row.averagePrice - row.previousAveragePrice;
  const isUp = row.averageChange >= 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={row.crop.image_url}
          alt={row.crop.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-600 shadow-sm">
            {row.category.name}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-gray-900">{row.crop.name}</h2>
            <p className="mt-1 text-xs font-medium text-gray-500">
              {row.latestRecord?.province ?? 'Đang cập nhật'}
            </p>
          </div>
          {row.crop.tier === 1 ? (
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-600">
              Chủ lực
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Giá trung bình hôm nay</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <p className="text-2xl font-black text-gray-900">
              {formatPrice(row.averagePrice, row.latestRecord?.unit)}
            </p>
            <ChangeBadge value={row.averageChange} />
          </div>

          <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-gray-600">So với hôm qua</span>
              <span className={cn('font-bold', isUp ? 'text-green-500' : 'text-red-500')}>
                {isUp ? '+' : ''}
                {Math.round(changeValue).toLocaleString('vi-VN')} {row.latestRecord?.unit ?? 'đ/kg'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function TrendingCard({ row }: { row: CropMarketRow }) {
  return (
    <div className="min-w-[210px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{row.category.name}</p>
          <h3 className="mt-1 text-sm font-black text-gray-900">{row.crop.name}</h3>
        </div>
        {row.latestRecord?.is_verified ? <ShieldCheck className="h-4 w-4 shrink-0 text-green-600" /> : null}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-lg font-black text-gray-900">{formatPrice(row.averagePrice, row.latestRecord?.unit)}</p>
        <ChangeBadge value={row.averageChange} />
      </div>
    </div>
  );
}

export default function MarketEncyclopediaClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);

  const rows = useMemo(() => buildCropRows(), []);
  const trendingRows = useMemo(() => rows.filter((row) => row.crop.tier === 1), [rows]);

  const filteredRows = useMemo(() => {
    const query = normalizeText(searchQuery.trim());

    return rows.filter((row) => {
      if (activeCategory !== ALL_CATEGORY_ID && row.category.id !== activeCategory) return false;
      if (!query) return true;

      const searchable = normalizeText(
        [
          row.crop.name,
          row.category.name,
          row.latestRecord?.province,
          ...row.records.map((record) => record.province),
        ]
          .filter(Boolean)
          .join(' '),
      );

      return searchable.includes(query);
    });
  }, [activeCategory, rows, searchQuery]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="bg-gray-50 px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-green-600">Agri-OS Market Data</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
            Bảng Giá Nông Sản Trực Tuyến
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Tra cứu nhanh giá thu mua nông sản theo nhóm ngành, tỉnh thành và biến động trong ngày.
          </p>

          <div className="relative mx-auto mt-8 max-w-3xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nhập tên nông sản bạn muốn xem giá... (VD: Sầu riêng, Cà phê)"
              className="h-16 w-full rounded-xl border border-gray-200 bg-white pl-14 pr-5 text-base font-medium text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">Mặt hàng chủ lực</p>
              <h2 className="mt-1 text-lg font-black text-gray-900">Bảng điện trending</h2>
            </div>
            <p className="hidden text-sm font-medium text-gray-500 sm:block">
              {trendingRows.length} mặt hàng tier 1
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {trendingRows.map((row) => (
              <TrendingCard key={row.crop.id} row={row} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              <button
                type="button"
                onClick={() => setActiveCategory(ALL_CATEGORY_ID)}
                className={cn(
                  'min-h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition',
                  activeCategory === ALL_CATEGORY_ID
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50',
                )}
              >
                Tất cả
              </button>
              {MOCK_CROP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    'min-h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition',
                    activeCategory === category.id
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50',
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold transition',
                  viewMode === 'grid' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-900',
                )}
                aria-pressed={viewMode === 'grid'}
              >
                <Grid3X3 className="h-4 w-4" />
                Lưới
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold transition',
                  viewMode === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-900',
                )}
                aria-pressed={viewMode === 'list'}
              >
                <List className="h-4 w-4" />
                Danh sách
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-900">{filteredRows.length} mặt hàng đang hiển thị</p>
              <p className="mt-1 text-xs text-gray-500">Dữ liệu mock phục vụ thử nghiệm UI Agri-OS.</p>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRows.map((row) => (
                <CropPriceCard key={row.crop.id} row={row} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-black uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-4">Nông sản</th>
                      <th className="px-5 py-4">Nhóm ngành</th>
                      <th className="px-5 py-4">Tỉnh/Thành phố cập nhật gần nhất</th>
                      <th className="px-5 py-4 text-right">Giá thu mua</th>
                      <th className="px-5 py-4 text-right">Biến động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRows.map((row) => (
                      <tr key={row.crop.id} className="bg-white hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={row.crop.image_url}
                              alt={row.crop.name}
                              className="h-12 w-12 rounded-md object-cover"
                              loading="lazy"
                            />
                            <div>
                              <p className="font-black text-gray-900">{row.crop.name}</p>
                              <p className="text-xs font-medium text-gray-500">
                                {row.crop.tier === 1 ? 'Sản phẩm chủ lực' : 'Sản phẩm thường'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700">{row.category.name}</td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">{row.latestRecord?.province ?? 'Đang cập nhật'}</div>
                          <div className="mt-1 text-xs text-gray-500">{row.latestRecord?.date ?? ''}</div>
                        </td>
                        <td className="px-5 py-4 text-right font-black text-gray-900">
                          {formatPrice(row.averagePrice, row.latestRecord?.unit)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ChangeBadge value={row.averageChange} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-lg font-black text-gray-900">Không tìm thấy mặt hàng phù hợp</p>
              <p className="mt-2 text-sm text-gray-500">Thử đổi từ khóa hoặc chọn lại nhóm ngành.</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
