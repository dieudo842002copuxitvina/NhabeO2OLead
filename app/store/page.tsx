import type { Metadata } from 'next';
import StoreClient from './store-client';

export const metadata: Metadata = {
  title: 'Cửa hàng tổng hợp | Nhà Bè Agri',
  description:
    'Cửa hàng tổng hợp thiết bị tưới, máy nông nghiệp và phân bón chính hãng, có lọc danh mục đa tầng, thông số kỹ thuật và gợi ý đại lý gần nhất.',
  alternates: {
    canonical: '/store',
  },
};

export default function StorePage() {
  return <StoreClient />;
}

