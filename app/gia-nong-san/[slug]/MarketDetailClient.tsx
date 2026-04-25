'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDown, ArrowUp, ExternalLink, ShieldCheck } from 'lucide-react';
import type { CropMarketDetail } from './market-detail-data';
import { formatMarketPrice } from './market-detail-data';
import { cn } from '@/lib/utils';

type SortMode = 'desc' | 'asc';
type RangeMode = 7 | 30;

function formatCurrency(value: number) {
  return Math.round(value).toLocaleString('vi-VN');
}

function ChangePill({ value }: { value: number }) {
  const isUp = value >= 0;
  const Icon = isUp ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-black',
        isUp ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500',
      )}
    >
      <Icon className="h-4 w-4" />
      {isUp ? '+' : ''}
      {value.toFixed(1)}%
    </span>
  );
}

function MetricBlock({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: 'neutral' | 'up' | 'down';
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">{label}</p>
      <p
        className={cn(
          'mt-3 text-3xl font-black tracking-tight md:text-4xl',
          tone === 'up' ? 'text-green-500' : tone === 'down' ? 'text-red-500' : 'text-gray-900',
        )}
      >
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm font-medium text-gray-500">{detail}</p> : null}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Ngày {label}</p>
      <p className="mt-1 text-base font-black text-gray-900">{formatCurrency(payload[0].value)} đ</p>
    </div>
  );
}

export default function MarketDetailClient({ detail }: { detail: CropMarketDetail }) {
  const [sortMode, setSortMode] = useState<SortMode>('desc');
  const [rangeMode, setRangeMode] = useState<RangeMode>(30);

  const unit = detail.records[0]?.unit ?? 'đ/kg';
  const isUp = detail.averageChange >= 0;
  const chartData = rangeMode === 7 ? detail.chart30d.slice(-7) : detail.chart30d;

  const sortedRecords = useMemo(() => {
    return [...detail.records].sort((a, b) => (sortMode === 'desc' ? b.price - a.price : a.price - b.price));
  }, [detail.records, sortMode]);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricBlock
          label="Giá trung bình"
          value={formatMarketPrice(detail.averagePrice, unit)}
          detail="Tính từ các bản ghi địa phương hôm nay"
        />
        <MetricBlock
          label="Biến động"
          value={`${isUp ? '+' : ''}${detail.averageChange.toFixed(1)}%`}
          detail={isUp ? 'Giá tăng so với phiên trước' : 'Giá giảm so với phiên trước'}
          tone={isUp ? 'up' : 'down'}
        />
        <MetricBlock
          label="Giá cao nhất"
          value={detail.highestRecord ? formatMarketPrice(detail.highestRecord.price, detail.highestRecord.unit) : 'N/A'}
          detail={detail.highestRecord?.province}
          tone="up"
        />
        <MetricBlock
          label="Giá thấp nhất"
          value={detail.lowestRecord ? formatMarketPrice(detail.lowestRecord.price, detail.lowestRecord.unit) : 'N/A'}
          detail={detail.lowestRecord?.province}
          tone="down"
        />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-green-600">Phân tích xu hướng</p>
            <h2 className="mt-2 text-2xl font-black text-gray-900">Biểu đồ giá {detail.crop.name}</h2>
          </div>
          <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1">
            {[7, 30].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setRangeMode(range as RangeMode)}
                className={cn(
                  'h-9 rounded-md px-4 text-sm font-bold transition',
                  rangeMode === range ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-900',
                )}
              >
                {range} ngày
              </button>
            ))}
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                tickLine={false}
                axisLine={false}
                width={56}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#4CAF50"
                strokeWidth={3}
                fill="url(#priceGradient)"
                activeDot={{ r: 5, fill: '#4CAF50', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border border-green-100 bg-green-50 p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-green-600">O2O Lead Engine</p>
            <h2 className="mt-2 text-2xl font-black text-gray-900">
              Giải pháp & Vật tư khuyên dùng cho {detail.crop.name}
            </h2>
          </div>
          <Link
            href="/store"
            className="inline-flex h-11 items-center justify-center rounded-md bg-green-600 px-4 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Xem cửa hàng
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {detail.recommendedProducts.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-lg border border-green-100 bg-white shadow-sm">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="mb-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-green-600">
                  {product.type === 'FERTILIZER' ? 'Phân bón hòa tan' : 'Thiết bị tưới'}
                </div>
                <h3 className="line-clamp-2 min-h-12 text-sm font-black leading-6 text-gray-900">{product.name}</h3>
                <p className="mt-2 text-base font-black text-green-600">
                  {product.price.toLocaleString('vi-VN')} đ
                </p>
                <Link
                  href="/store"
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-green-600 px-3 text-sm font-bold text-white transition hover:bg-green-700"
                >
                  Xem chi tiết
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">Dữ liệu địa phương</p>
            <h2 className="mt-2 text-2xl font-black text-gray-900">So sánh giá theo tỉnh thành</h2>
          </div>
          <button
            type="button"
            onClick={() => setSortMode((current) => (current === 'desc' ? 'asc' : 'desc'))}
            className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Sắp xếp: {sortMode === 'desc' ? 'Cao xuống thấp' : 'Thấp lên cao'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-xs font-black uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4">Tỉnh/Thành phố</th>
                <th className="px-5 py-4 text-right">Giá thu mua</th>
                <th className="px-5 py-4 text-right">Biến động</th>
                <th className="px-5 py-4">Nguồn giá</th>
                <th className="px-5 py-4">Ngày cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedRecords.map((record) => (
                <tr key={record.id} className="bg-white hover:bg-gray-50">
                  <td className="px-5 py-4 font-black text-gray-900">{record.province}</td>
                  <td className="px-5 py-4 text-right font-black text-gray-900">
                    {formatMarketPrice(record.price, record.unit)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ChangePill value={record.change_percentage} />
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                        record.is_verified ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {record.is_verified ? <ShieldCheck className="h-3.5 w-3.5" /> : null}
                      {record.is_verified ? 'Hệ thống xác thực' : 'Cộng đồng báo giá'}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-600">{record.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

