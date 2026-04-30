import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { MOCK_MARKET_NEWS } from '@/data/marketNews';

function getArticleBySlug(slug: string) {
  return MOCK_MARKET_NEWS.find((article) => article.slug === slug);
}

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function generateStaticParams() {
  return MOCK_MARKET_NEWS.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Bài viết không tồn tại | Nhà Bè Agri',
      description: 'Nội dung bạn tìm kiếm hiện chưa có trong thư viện Nhà Bè Agri.',
    };
  }

  return {
    title: article.seo_title,
    description: article.seo_description,
    openGraph: {
      title: article.seo_title,
      description: article.seo_description,
      images: [article.cover_image],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)] sm:p-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại trang Blog
          </Link>

          <div className="mt-6">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {article.category}
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              {article.title}
            </h1>

            <time
              dateTime={article.published_at}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500"
            >
              <CalendarDays className="h-4 w-4" />
              {formatPublishedDate(article.published_at)}
            </time>
          </div>

          <div className="relative mt-6 aspect-[16/8] overflow-hidden rounded-[28px] bg-slate-100">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 960px"
            />
          </div>

          <div className="prose prose-slate mt-8 max-w-none">
            <p className="text-lg leading-8 text-slate-600">{article.excerpt}</p>
            <h2 className="mt-8 text-2xl font-bold text-slate-900">Bối cảnh thị trường</h2>
            <p className="text-base leading-8 text-slate-600">
              Đây là trang chi tiết mock được dựng để hoàn thiện luồng điều hướng SEO cho nhóm bài phân tích thị
              trường. Ở bước tích hợp CMS thật, phần nội dung này sẽ được map trực tiếp từ editor Admin, đồng bộ với
              các trường `seo_title`, `seo_description`, `cover_image`, `category` và `published_at`.
            </p>
            <h2 className="mt-8 text-2xl font-bold text-slate-900">Gợi ý cho nhà vườn</h2>
            <p className="text-base leading-8 text-slate-600">
              Khi triển khai dữ liệu thật, mỗi bài phân tích nên gắn thêm block CTA theo ngữ cảnh, bảng giá liên quan
              và liên kết sang các giải pháp tưới, châm phân hoặc thiết bị phù hợp để kéo dài hành trình chuyển đổi.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
