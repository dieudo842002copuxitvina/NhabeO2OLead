'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPinned } from 'lucide-react';
import { MOCK_HOT_PRODUCTS, type ProductCardData } from '@/data/hotProducts';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function O2OProductSlider({
  products = MOCK_HOT_PRODUCTS,
}: {
  products?: ProductCardData[];
}) {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const scrollSlider = (direction: 'prev' | 'next') => {
    if (!sliderRef.current) {
      return;
    }

    const amount = sliderRef.current.clientWidth * 0.82;
    sliderRef.current.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      aria-labelledby="o2o-products-heading"
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Trưng bày phần cứng theo mùa vụ
          </p>
          <h2 id="o2o-products-heading" className="text-2xl font-black tracking-tight text-slate-900">
            Thiết Bị Nông Nghiệp Mùa Vụ
          </h2>
          <p className="max-w-3xl text-base leading-7 text-slate-500">
            Chọn nhanh các thiết bị và vật tư công nghệ cao đang được quan tâm nhiều, sau đó đi vào PDP để định tuyến
            đại lý báo giá gần nhất theo mô hình O2O.
          </p>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => scrollSlider('prev')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollSlider('next')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="o2o-slider mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <article
            key={product.id}
            className="flex min-w-[280px] max-w-[320px] flex-1 snap-start flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
          >
            <div className="relative aspect-[16/11] overflow-hidden bg-slate-100">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 85vw, (max-width: 1280px) 40vw, 320px"
              />
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {product.brand}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{product.sku}</span>
              </div>

              <h3 className="text-xl font-black leading-8 text-slate-900">{product.name}</h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">{product.short_specs.join(' | ')}</p>

              <div className="mt-5">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Giá tham khảo</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{formatCurrency(product.base_price)}</p>
              </div>

              <div className="mt-auto pt-5">
                <Link
                  href={`/san-pham/${product.slug}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF6C00] px-5 py-3 text-base font-bold text-white transition hover:brightness-95"
                >
                  <MapPinned className="h-5 w-5" />
                  Tìm Đại Lý Báo Giá
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <style jsx>{`
        .o2o-slider::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
