export type ProductCategory = 'DRONE' | 'FERTILIZER' | 'HARDWARE' | 'SOLAR';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  subCategory: string;
  brand: string;
  price: number;
  unit: string;
  badges: string[];
  description: string;
  images: string[];
  specs: Record<string, string>;
  geoAvailability: string[]; // Tối ưu Local SEO (GEO)
  relatedSlugs: string[]; // Dùng để Cross-sell bán chéo
}

export const PRODUCTS_DATA: Product[] = [
  // ==========================================
  // VŨ TRỤ 1: ĐIỆN MẶT TRỜI & NĂNG LƯỢNG (SOLAR)
  // ==========================================
  {
    id: 'sl-01',
    slug: 'tam-pin-nang-luong-mat-troi-agtek',
    name: 'Tấm pin năng lượng mặt trời AGtek Cao Cấp',
    category: 'SOLAR',
    subCategory: 'Điện mặt trời',
    brand: 'AGtek',
    price: 2105000,
    unit: 'Tấm',
    badges: ['Năng lượng sạch', 'Bảo hành 12 năm', 'Chống thời tiết khắc nghiệt'],
    description: 'Tấm pin năng lượng mặt trời AGtek chính hãng, giải pháp tối ưu hóa chi phí điện năng cho trang trại nông nghiệp. Hoạt động bền bỉ, cung cấp nguồn điện ổn định cho hệ thống bơm tưới tự động tại các vùng sâu vùng xa.',
    images: ['/images/products/solar-agtek.jpg'],
    specs: {
      'Thương hiệu': 'AGtek',
      'Ứng dụng': 'Sinh hoạt, Trạm bơm tưới nông nghiệp',
      'Tuổi thọ': 'Trên 25 năm',
      'Công nghệ': 'Mono Half-cell hiệu suất cao',
    },
    geoAvailability: ['Hồ Chí Minh', 'Gia Lai', 'Đắk Lắk', 'Lâm Đồng', 'Đồng Nai'],
    relatedSlugs: ['may-bom-nang-luong-mat-troi'], 
  },
  {
    id: 'sl-02',
    slug: 'may-bom-nang-luong-mat-troi',
    name: 'Máy bơm năng lượng mặt trời cho hệ thống tưới',
    category: 'SOLAR',
    subCategory: 'Điện mặt trời',
    brand: 'Nha Be Agri',
    price: 15500000,
    unit: 'Hệ thống',
    badges: ['Tiết kiệm 100% điện', 'Không phụ thuộc điện lưới'],
    description: 'Hệ thống máy bơm nước sử dụng trực tiếp điện năng lượng mặt trời, lý tưởng cho các khu vực rẫy sầu riêng, cà phê chưa có điện lưới quốc gia hoặc điện yếu. Vận hành êm ái, bảo vệ môi trường.',
    images: ['/images/products/bom-solar.jpg'],
    specs: {
      'Loại bơm': 'Bơm hỏa tiễn / Bơm đĩa',
      'Nguồn cấp': 'DC trực tiếp từ tấm pin',
      'Ứng dụng': 'Bơm nước giếng khoan, hồ chứa',
    },
    geoAvailability: ['Gia Lai', 'Đắk Nông', 'Đắk Lắk', 'Bình Phước'],
    relatedSlugs: ['tam-pin-nang-luong-mat-troi-agtek', 'ong-tuoi-nho-giot-fuji-blue'],
  },

  // ==========================================
  // VŨ TRỤ 2: DINH DƯỠNG (HUMIC, FULVIC, NPK)
  // ==========================================
  {
    id: 'fe-03',
    slug: 'phan-bon-la-humic-fulvic-cao-cap',
    name: 'Phân bón lá Humic - Fulvic (Giải độc, kích rễ)',
    category: 'FERTILIZER',
    subCategory: 'Humic/Fulvic',
    brand: 'Nha Be Agri',
    price: 250000,
    unit: 'Chai 1 Lít',
    badges: ['Hữu cơ 100%', 'Kích rễ cực mạnh'],
    description: 'Được tạo ra từ các nguồn tự nhiên như than bùn, giúp tăng khả năng hấp thu dinh dưỡng, giải độc phèn – mặn, cải thiện nền đất và hỗ trợ cây phát triển ổn định dài hạn. Rất phù hợp để phục hồi rễ dâu tây, sầu riêng.',
    images: ['/images/products/humic-fulvic.jpg'],
    specs: {
      'Thành phần chính': 'Axit Humic, Axit Fulvic tự nhiên',
      'Tác dụng': 'Kích rễ, cải tạo đất, giải độc phèn',
      'Cách dùng': 'Phun qua lá hoặc hòa hệ thống tưới',
    },
    geoAvailability: ['Lâm Đồng', 'Đắk Lắk', 'Gia Lai', 'Đồng Nai'],
    relatedSlugs: ['solucat-20-20-20-humic'],
  },
  {
    id: 'fe-04',
    slug: 'solucat-20-20-20-humic',
    name: 'Phân bón hòa tan Solucat 20-20-20 (+ Humic & Fulvic)',
    category: 'FERTILIZER',
    subCategory: 'Humic/Fulvic',
    brand: 'Atlantica Tây Ban Nha',
    price: 1850000,
    unit: 'Bao 25kg',
    badges: ['Nhập khẩu Tây Ban Nha', 'Tích hợp Humic/Fulvic'],
    description: 'Solucat là thương hiệu nổi tiếng từ Tây Ban Nha, phát triển sản phẩm dựa trên axit humic và fulvic. Cung cấp dinh dưỡng NPK 20-20-20 đồng thời cải thiện chất lượng đất, tối ưu cực tốt cho hệ thống tưới nhỏ giọt.',
    images: ['/images/products/solucat-202020.jpg'],
    specs: {
      'Chỉ số N-P-K': '20-20-20',
      'Phụ gia đặc biệt': 'Chiết xuất Axit Humic & Fulvic',
      'Thương hiệu': 'Atlantica (Tây Ban Nha)',
    },
    geoAvailability: ['Hồ Chí Minh', 'Gia Lai', 'Đắk Lắk', 'Bình Thuận'],
    relatedSlugs: ['bec-tuoi-driptec-dr09'],
  },
  {
    id: 'fe-01',
    slug: 'haifa-poly-feed-19-19-19',
    name: 'NPK Hòa tan 100% Haifa Poly-Feed 19-19-19+ME',
    category: 'FERTILIZER',
    subCategory: 'Phân bón hòa tan',
    brand: 'Haifa Israel',
    price: 1150000,
    unit: 'Bao 25kg',
    badges: ['Hòa tan 100%', 'Nhập khẩu Israel'],
    description: 'Phân bón NPK hòa tan hoàn toàn trong nước, tinh khiết, không chứa Clo, Natri. Tối ưu cho hệ thống tưới nhỏ giọt (Fertigation) và phun qua lá bằng Drone.',
    images: ['/images/products/haifa-191919.jpg'],
    specs: {
      'Chỉ số N-P-K': '19-19-19',
      'Độ hòa tan': '100% không cặn',
    },
    geoAvailability: ['Gia Lai', 'Đắk Lắk', 'Đồng Nai', 'Bình Thuận', 'Tây Ninh'],
    relatedSlugs: ['dji-agras-t70p'], 
  },

  // ==========================================
  // VŨ TRỤ 3: VẬT TƯ & THIẾT BỊ TƯỚI
  // ==========================================
  {
    id: 'hw-03',
    slug: 'bec-tuoi-driptec-dr09',
    name: 'Béc tưới phun mưa Driptec DR09',
    category: 'HARDWARE',
    subCategory: 'Thiết bị tưới gốc',
    brand: 'Driptec',
    price: 7700,
    unit: 'Cái',
    badges: ['Hiệu quả', 'Bền bỉ', 'Tối ưu chi phí'],
    description: 'Béc tưới phun mưa Driptec DR09 hoạt động hiệu quả, bền bỉ, giúp phân phối nước đồng đều cho cây trồng. Giải pháp tối ưu chi phí đầu tư cho trang trại lớn.',
    images: ['/images/products/driptec-dr09.jpg'],
    specs: {
      'Lưu lượng': 'Đa dạng',
      'Đặc điểm': 'Phun mưa mịn, phủ đều',
    },
    geoAvailability: ['Gia Lai', 'Đắk Lắk', 'Bình Phước', 'Đồng Nai'],
    relatedSlugs: ['ong-ldpe-dekko', 'loc-dia-driptec-chu-t'],
  },
  {
    id: 'hw-04',
    slug: 'dau-tuoi-nho-giot-rivulis-supertif',
    name: 'Đầu tưới nhỏ giọt Rivulis Supertif',
    category: 'HARDWARE',
    subCategory: 'Thiết bị nhỏ giọt',
    brand: 'Rivulis Israel',
    price: 3500,
    unit: 'Cái',
    badges: ['Bù áp hoàn hảo', 'Địa hình dốc'],
    description: 'Đầu tưới nhỏ giọt Rivulis Supertif có tính năng bù áp xuất sắc, dòng chảy cực kỳ ổn định. Là lựa chọn hoàn hảo cho khu vực trồng cây trên địa hình đồi dốc Tây Nguyên.',
    images: ['/images/products/rivulis-supertif.jpg'],
    specs: {
      'Cơ chế': 'Bù áp, tự làm sạch',
      'Ứng dụng': 'Trồng dâu tây, cà chua, sầu riêng đồi dốc',
    },
    geoAvailability: ['Lâm Đồng', 'Đắk Nông', 'Gia Lai'],
    relatedSlugs: ['ong-tuoi-nho-giot-fuji-blue', 'phan-bon-la-humic-fulvic-cao-cap'],
  },
  {
    id: 'hw-05',
    slug: 'ong-tuoi-nho-giot-fuji-blue',
    name: 'Ống tưới nhỏ giọt Fuji Blue',
    category: 'HARDWARE',
    subCategory: 'Ống tưới nhỏ giọt',
    brand: 'Fuji Blue',
    price: 360000,
    unit: 'Cuộn',
    badges: ['Chống rêu', 'Bền bỉ'],
    description: 'Ống tưới nhỏ giọt Fuji Blue giúp tối ưu chi phí, tiết kiệm nước tưới và tăng năng suất cây trồng. Sử dụng vật liệu cao cấp chống chịu tia UV tốt.',
    images: ['/images/products/ong-fuji-blue.jpg'],
    specs: {
      'Đường kính': '16mm',
      'Độ dày': '0.2mm - 0.3mm',
    },
    geoAvailability: ['Hồ Chí Minh', 'Lâm Đồng', 'Hà Nội'],
    relatedSlugs: ['dau-tuoi-nho-giot-rivulis-supertif'],
  },
  {
    id: 'hw-06',
    slug: 'loc-dia-driptec-chu-t',
    name: 'Lọc đĩa DRIPTEC Chữ T',
    category: 'HARDWARE',
    subCategory: 'Bộ lọc trung tâm',
    brand: 'Driptec',
    price: 1250000,
    unit: 'Cái',
    badges: ['Lọc sạch cặn', 'Dễ vệ sinh'],
    description: 'Lọc đĩa DRIPTEC thiết kế chữ T giúp lọc sạch cặn rác, cát trong hệ thống tưới nhỏ giọt, bảo vệ béc tưới không bị tắc nghẽn. Rất dễ dàng tháo lắp để vệ sinh.',
    images: ['/images/products/loc-dia-t.jpg'],
    specs: {
      'Chất liệu': 'Nhựa cao cấp',
      'Cấu tạo': 'Lõi đĩa xếp lớp',
    },
    geoAvailability: ['Gia Lai', 'Đắk Lắk', 'Đồng Nai'],
    relatedSlugs: ['dong-ho-do-ap-suat-driptec'],
  },

  // ==========================================
  // VŨ TRỤ 4: DRONE & MÁY BAY NÔNG NGHIỆP
  // ==========================================
  {
    id: 'dr-03',
    slug: 'dji-agras-t70p',
    name: 'Máy bay nông nghiệp DJI AGRAS T70P',
    category: 'DRONE',
    subCategory: 'Drone Xịt thuốc',
    brand: 'DJI',
    price: 143700000,
    unit: 'Hệ thống',
    badges: ['Mẫu mới nhất', 'Công suất khủng'],
    description: 'Phiên bản cải tiến mạnh mẽ nhất từ DJI. Tải trọng phun và rải được tối ưu hóa. Tích hợp radar và camera AI giúp nhận diện địa hình đồi núi thông minh.',
    images: ['/images/products/dji-t70p.jpg'],
    specs: {
      'Tải trọng': 'Rất lớn',
      'Hệ thống phun': 'Cánh quạt ly tâm kép',
    },
    geoAvailability: ['Hồ Chí Minh', 'Đắk Lắk', 'Đồng Nai'],
    relatedSlugs: ['haifa-poly-feed-19-19-19'],
  }
];
