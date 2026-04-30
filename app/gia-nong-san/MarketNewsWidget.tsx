'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { MOCK_MARKET_NEWS, type CmsArticle } from '@/data/marketNews';

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export default function MarketNewsWidget({
  articles = MOCK_MARKET_NEWS,
}: {
  articles?: CmsArticle[];
}) {
  return (
    <section
      aria-labelledby="market-news-heading"
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)]"
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Nội dung giữ chân người đọc
        </p>
        <h2 id="market-news-heading" className="text-2xl font-black tracking-tight text-slate-900">
          Góc Nhìn Chuyên Gia & Tin Thị Trường
        </h2>
        <p className="max-w-3xl text-base leading-7 text-slate-500">
          Các bài phân tích chuẩn SEO, sẵn sàng map trực tiếp với CMS Admin để tăng thời gian onsite và mở rộng hành
          trình đọc sâu theo từng nhóm nông sản.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            aria-label={article.seo_title}
            className="group block h-full"
            title={article.seo_title}
          >
            <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <Image
                  src={article.cover_image}
                  alt={article.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3">
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {article.category}
                  </span>
                </div>

                <h3 className="line-clamp-2 text-xl font-black leading-8 text-slate-900 transition group-hover:text-emerald-700">
                  {article.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">{article.excerpt}</p>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <time
                    dateTime={article.published_at}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500"
                  >
                    <CalendarDays className="h-4 w-4" />
                    {formatPublishedDate(article.published_at)}
                  </time>

                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                    Đọc phân tích
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
