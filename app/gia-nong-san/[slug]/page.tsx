import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import MarketDetailClient from './MarketDetailClient';
import {
  formatMarketPrice,
  generateStaticParams as buildStaticParams,
  getCropMarketDetail,
} from './market-detail-data';

type Props = {
  params: {
    slug: string;
  };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return buildStaticParams();
}

export function generateMetadata({ params }: Props): Metadata {
  const detail = getCropMarketDetail(params.slug);

  if (!detail) {
    return {
      title: 'Không tìm thấy giá nông sản | Nhà Bè Agri',
      description: 'Mặt hàng nông sản này chưa có trong cơ sở dữ liệu giá của Nhà Bè Agri.',
    };
  }

  return {
    title: `Giá ${detail.crop.name} Hôm Nay - Cập Nhật Trực Tuyến | Nhà Bè Agri`,
    description: `Cập nhật giá ${detail.crop.name} hôm nay theo tỉnh thành, giá trung bình ${formatMarketPrice(
      detail.averagePrice,
      detail.records[0]?.unit,
    )}, biến động ${detail.averageChange >= 0 ? '+' : ''}${detail.averageChange.toFixed(1)}%.`,
    alternates: {
      canonical: `/gia-nong-san/${detail.crop.slug}`,
    },
    openGraph: {
      title: `Giá ${detail.crop.name} hôm nay`,
      description: `Theo dõi giá ${detail.crop.name}, biểu đồ xu hướng và bảng so sánh địa phương.`,
      images: [detail.crop.image_url],
    },
  };
}

export default function CropPriceDetailPage({ params }: Props) {
  const detail = getCropMarketDetail(params.slug);

  if (!detail) {
    notFound();
  }

  const jsonLd = buildDatasetJsonLd(detail);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-gray-400">
            <Link href="/" className="hover:text-green-600">
              Trang Chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/gia-nong-san" className="hover:text-green-600">
              Bảng Giá
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-600">{detail.category.name}</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-green-600">{detail.crop.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-full bg-green-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-green-600">
                Cập nhật hôm nay
              </div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
                Giá {detail.crop.name} Hôm Nay
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                Theo dõi giá thu mua {detail.crop.name.toLowerCase()} theo từng tỉnh thành, xu hướng 7/30 ngày và
                vật tư khuyến nghị để tối ưu mùa vụ.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <img src={detail.crop.image_url} alt={detail.crop.name} className="h-52 w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-10">
        <MarketDetailClient detail={detail} />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}

function buildDatasetJsonLd(detail: NonNullable<ReturnType<typeof getCropMarketDetail>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Giá ${detail.crop.name} hôm nay`,
    description: `Bộ dữ liệu giá ${detail.crop.name} theo tỉnh thành, bao gồm giá thu mua, biến động phần trăm và trạng thái xác thực nguồn giá.`,
    url: `https://nhabeagri.vn/gia-nong-san/${detail.crop.slug}`,
    keywords: [detail.crop.name, detail.category.name, 'giá nông sản', 'giá thu mua', 'Agri-OS'],
    variableMeasured: ['price', 'change_percentage', 'province', 'is_verified'],
    temporalCoverage: detail.records[0]?.date,
    spatialCoverage: detail.records.map((record) => ({
      '@type': 'Place',
      name: record.province,
    })),
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `https://nhabeagri.vn/gia-nong-san/${detail.crop.slug}`,
    },
    creator: {
      '@type': 'Organization',
      name: 'Nhà Bè Agri',
      url: 'https://nhabeagri.vn',
    },
  };
}
