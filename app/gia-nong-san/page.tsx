import type { Metadata } from 'next';
import AgriMarketDashboard from './AgriMarketDashboard';

export const metadata: Metadata = {
  title: 'Giá Nông Sản Hôm Nay | Agri Dashboard Nhà Bè Agri',
  description:
    'Theo dõi nhanh giá cà phê, sầu riêng và hồ tiêu theo xu hướng 7 ngày, giá thu mua địa phương và gợi ý thiết bị phù hợp.',
  alternates: {
    canonical: '/gia-nong-san',
  },
};

export default function GiaNongSanPage() {
  return <AgriMarketDashboard />;
}
