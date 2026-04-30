export interface CmsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  category: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
}

export const MOCK_MARKET_NEWS: CmsArticle[] = [
  {
    id: 'market-news-01',
    slug: 'nhan-dinh-gia-sau-rieng-xuat-khau-quy-2-2026',
    title: 'Nhận định giá sầu riêng xuất khẩu quý II/2026: Vì sao hàng loại 1 đang nới biên lợi nhuận?',
    excerpt:
      'Phân tích sự chênh lệch giữa Ri6 và Thái theo vùng thu mua, đồng thời chỉ ra nhóm nhà vườn có lợi thế rõ nhất là những đơn vị đã chủ động tưới và ổn định dinh dưỡng trước mùa mưa.',
    cover_image:
      'https://images.unsplash.com/photo-1621871908119-295c2e07f4f9?auto=format&fit=crop&w=1400&q=80',
    category: 'Thị trường Sầu Riêng',
    published_at: '2026-04-29T08:00:00+07:00',
    seo_title: 'Nhận định giá sầu riêng xuất khẩu quý II/2026 | Nhà Bè Agri',
    seo_description:
      'Đọc nhanh xu hướng giá sầu riêng Ri6 và Thái theo vùng thu mua, chuẩn hàng xuất khẩu và tín hiệu thị trường ảnh hưởng trực tiếp đến quyết định đầu tư hệ thống tưới.',
  },
  {
    id: 'market-news-02',
    slug: 'du-bao-san-luong-ca-phe-robusta-tay-nguyen-2026',
    title: 'Dự báo sản lượng cà phê Robusta Tây Nguyên 2026: Áp lực nguồn cung và cơ hội cho vườn chăm nước tốt',
    excerpt:
      'Bài viết giải thích vì sao các vườn giữ được nền ẩm ổn định, tỷ lệ chín đồng đều và độ sạch sau thu hoạch đang được trả giá cao hơn mặt bằng trung bình toàn vùng.',
    cover_image:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=80',
    category: 'Thị trường Cà Phê',
    published_at: '2026-04-27T07:30:00+07:00',
    seo_title: 'Dự báo sản lượng cà phê Robusta Tây Nguyên 2026 | Nhà Bè Agri',
    seo_description:
      'Phân tích triển vọng giá và sản lượng cà phê Robusta 2026, tác động của nước tưới, thu hoạch và chuẩn hàng nhân xô đến biên lợi nhuận của nông hộ.',
  },
  {
    id: 'market-news-03',
    slug: 'chien-luoc-phong-rui-ro-gia-ho-tieu-sau-mua-dong-loat',
    title: 'Chiến lược phòng rủi ro giá hồ tiêu sau các đợt mưa đồng loạt: Nông hộ nên giữ hàng hay bán nhanh?',
    excerpt:
      'Góc nhìn chuyên gia về tác động của ẩm độ, chất lượng phơi và truy xuất lô hàng đối với giá hồ tiêu, kèm khuyến nghị vận hành bộ lọc và tưới nhỏ giọt trong giai đoạn nhạy cảm.',
    cover_image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1400&q=80',
    category: 'Phân Tích Hồ Tiêu',
    published_at: '2026-04-24T09:15:00+07:00',
    seo_title: 'Chiến lược phòng rủi ro giá hồ tiêu sau mưa | Nhà Bè Agri',
    seo_description:
      'Tìm hiểu cách thị trường hồ tiêu phản ứng sau mưa lớn, cùng chiến lược giữ giá trị lô hàng bằng quản trị ẩm độ, chất lượng phơi và hạ tầng tưới phù hợp.',
  },
  {
    id: 'market-news-04',
    slug: 'thi-truong-lua-gao-chat-luong-cao-va-bai-toan-bom-nuoc-noi-dong',
    title: 'Thị trường lúa gạo chất lượng cao và bài toán bơm nước nội đồng: Khi ST25 không chỉ là câu chuyện giá bán',
    excerpt:
      'Từ biến động giá ST25 và OM5451, bài viết mở rộng sang bài toán chi phí bơm, lịch nước và lựa chọn cấu hình vận hành hợp lý cho những vùng canh tác quy mô vừa.',
    cover_image:
      'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=1400&q=80',
    category: 'Thị trường Lúa Gạo',
    published_at: '2026-04-21T06:45:00+07:00',
    seo_title: 'Thị trường lúa gạo chất lượng cao và bài toán bơm nước | Nhà Bè Agri',
    seo_description:
      'Phân tích giá lúa ST25, OM5451 và cách tối ưu chi phí bơm nước nội đồng để tăng hiệu quả biên lợi nhuận trong bối cảnh giá lúa chất lượng cao biến động.',
  },
];
