import type { Metadata } from 'next';
import MarketEncyclopediaClient from './MarketEncyclopediaClient';

type PageProps = {
  searchParams?: {
    q?: string | string[];
    category?: string | string[];
  };
};

export const metadata: Metadata = {
  title: 'Bảng Giá Nông Sản Trực Tuyến | Nhà Bè Agri',
  description:
    'Bách khoa toàn thư giá nông sản trực tuyến cho Agri-OS: tra cứu giá thu mua, biến động và nhóm ngành của các mặt hàng nông sản chủ lực.',
  alternates: {
    canonical: '/gia-nong-san',
  },
};

export default function GiaNongSanPage({ searchParams }: PageProps) {
  return <MarketEncyclopediaClient searchParams={searchParams} />;
}
