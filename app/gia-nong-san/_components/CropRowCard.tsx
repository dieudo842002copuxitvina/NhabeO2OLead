import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, MapPin, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CropRowCardData = {
  name: string;
  slug: string;
  province: string;
  price: number;
  unit: string;
  changeVnd: number;
  changePct: number;
};

type Props = {
  item: CropRowCardData;
  index: number;
  useContentVisibility: boolean;
  disablePrefetch: boolean;
};

type ChangeState = 'up' | 'down' | 'flat';

function resolveChangeState(changeVnd: number, changePct: number): ChangeState {
  if (Math.abs(changePct) < 0.05 || Math.abs(changeVnd) < 1) {
    return 'flat';
  }
  return changePct >= 0 ? 'up' : 'down';
}

export function CropRowCard({ item, index, useContentVisibility, disablePrefetch }: Props) {
  const changeState = resolveChangeState(item.changeVnd, item.changePct);
  const absChangeVnd = Math.round(Math.abs(item.changeVnd)).toLocaleString('vi-VN');
  const absChangePct = Math.abs(item.changePct).toFixed(1);
  const formattedPrice = `${Math.round(item.price).toLocaleString('vi-VN')} ${item.unit}`;
  const ariaLabel = `Xem chi tiết lịch sử giá ${item.name} tại ${item.province}`;
  const linkTitle = `Xem lịch sử giá ${item.name} tại ${item.province}`;
  const lazyStyle: CSSProperties | undefined = useContentVisibility
    ? { contentVisibility: 'auto', containIntrinsicSize: '72px' }
    : undefined;

  return (
    <li
      itemProp="itemListElement"
      itemScope
      itemType="https://schema.org/PriceSpecification"
      className="list-none border-b border-gray-100 bg-white last:border-b-0"
      style={lazyStyle}
    >
      <meta itemProp="price" content={String(Math.round(item.price))} />
      <meta itemProp="priceCurrency" content="VND" />
      <meta itemProp="eligibleRegion" content={item.province} />
      <meta itemProp="position" content={String(index + 1)} />

      <article className="bg-white">
        <Link
          href={`/gia-nong-san/${item.slug}`}
          prefetch={disablePrefetch ? false : undefined}
          aria-label={ariaLabel}
          title={linkTitle}
          className="flex flex-row items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
        >
          <p className="min-w-0 flex-1">
            <span itemProp="name" className="block truncate text-base font-bold text-gray-900">
              {item.name}
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span itemProp="areaServed" className="truncate">
                {item.province}
              </span>
            </span>
          </p>

          <span className="shrink-0 text-right">
            <span className="block text-base font-bold text-gray-900">{formattedPrice}</span>
            <span className="mt-1 inline-flex justify-end">
              {changeState === 'flat' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                  <Minus className="h-3.5 w-3.5" />
                  0đ (0.0%)
                </span>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                    changeState === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
                  )}
                >
                  {changeState === 'up' ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {changeState === 'up' ? '+' : '-'}
                  {absChangeVnd}đ ({changeState === 'up' ? '+' : '-'}
                  {absChangePct}%)
                </span>
              )}
            </span>
          </span>
        </Link>
      </article>
    </li>
  );
}
