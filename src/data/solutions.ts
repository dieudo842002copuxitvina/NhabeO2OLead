export interface Solution {
  id: string;
  cropSlug: string;
  name: string;
  title: string;
  description: string;
  coverImage: string;
  advantages: string[];
  recommendedProductSlugs: string[]; // Link với PRODUCTS_DATA
}

export const SOLUTIONS_DATA: Solution[] = [
  {
    id: 'sol-01',
    cropSlug: 'sau-rieng',
    name: 'Sầu Riêng',
    title: 'Giải pháp tưới và châm phân tự động cho Sầu Riêng',
    description: 'Cấu hình thiết bị chuẩn giúp sầu riêng phát triển mạnh, chống rụng sinh lý và đạt năng suất tối đa. Tối ưu cho địa hình đồi dốc Tây Nguyên.',
    coverImage: '/images/solutions/sau-rieng-cover.jpg',
    advantages: [
      'Bù áp 100% giúp nước ra đều mọi gốc dù ở đồi dốc.',
      'Tích hợp châm phân qua đường ống tiết kiệm 40% nhân công.',
      'Đảm bảo độ ẩm tầng mặt, không gây thối rễ.'
    ],
    recommendedProductSlugs: ['dau-tuoi-nho-giot-rivulis-supertif', 'ong-tuoi-nho-giot-fuji-blue', 'phan-bon-la-humic-fulvic-cao-cap']
  },
  {
    id: 'sol-02',
    cropSlug: 'ca-phe',
    name: 'Cà Phê',
    title: 'Hệ thống tưới tự động tối ưu hóa lợi nhuận cho Cà Phê',
    description: 'Giải pháp tưới phun mưa gốc và bón phân hòa tan giúp cà phê bung hoa đồng loạt, đậu trái nhiều, giảm chi phí vận hành.',
    coverImage: '/images/solutions/ca-phe-cover.jpg',
    advantages: [
      'Béc phun mưa bán kính rộng, ướt đều bồn cà phê.',
      'Thi công nhanh chóng, dễ dàng nâng cấp mở rộng.',
      'Kết hợp lọc đĩa trung tâm chống tắc nghẽn 100%.'
    ],
    recommendedProductSlugs: ['bec-tuoi-driptec-dr09', 'loc-dia-driptec-chu-t', 'haifa-poly-feed-19-19-19']
  }
];
