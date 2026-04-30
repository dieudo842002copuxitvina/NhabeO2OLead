export interface ProductCardData {
  id: string;
  slug: string;
  sku: string;
  name: string;
  base_price: number;
  image_url: string;
  brand: string;
  short_specs: string[];
}

export const MOCK_HOT_PRODUCTS: ProductCardData[] = [
  {
    id: 'hot-product-01',
    slug: 'may-bom-nang-luong-mat-troi',
    sku: 'SOL-PUMP-3HP-001',
    name: 'Máy bơm ly tâm năng lượng mặt trời 3HP',
    base_price: 15500000,
    image_url:
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
    brand: 'Nhà Bè Agri',
    short_specs: ['Cột áp: 30m', 'Lưu lượng: 15m3/h', 'Nguồn: Solar DC'],
  },
  {
    id: 'hot-product-02',
    slug: 'bec-tuoi-driptec-dr09',
    sku: 'SPR-DR09-PC-002',
    name: 'Béc tưới bù áp Driptec DR09',
    base_price: 7700,
    image_url:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    brand: 'Driptec',
    short_specs: ['Bán kính: 3.5m', 'Áp suất: 1.5-3 bar', 'Phun đều chống xói gốc'],
  },
  {
    id: 'hot-product-03',
    slug: 'dau-tuoi-nho-giot-rivulis-supertif',
    sku: 'DRIP-PC-RIV-003',
    name: 'Đầu tưới nhỏ giọt Rivulis Supertif',
    base_price: 3500,
    image_url:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    brand: 'Rivulis Israel',
    short_specs: ['Lưu lượng: 2L/h', 'Bù áp ổn định', 'Phù hợp địa hình dốc'],
  },
  {
    id: 'hot-product-04',
    slug: 'ong-tuoi-nho-giot-fuji-blue',
    sku: 'PIPE-PE20-FJ-004',
    name: 'Cuộn ống PE Fuji Blue 20mm',
    base_price: 360000,
    image_url:
      'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80',
    brand: 'Fuji Blue',
    short_specs: ['Đường kính: 20mm', 'Chống UV', 'Cuộn bền cho tuyến dài'],
  },
  {
    id: 'hot-product-05',
    slug: 'loc-dia-driptec-chu-t',
    sku: 'FILTER-DISC-005',
    name: 'Bộ lọc đĩa trung tâm Driptec chữ T',
    base_price: 1250000,
    image_url:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
    brand: 'Driptec',
    short_specs: ['Lọc: 120 mesh', 'Vệ sinh nhanh', 'Bảo vệ đầu tưới nhỏ giọt'],
  },
  {
    id: 'hot-product-06',
    slug: 'dji-agras-t70p',
    sku: 'DRONE-T70P-006',
    name: 'Drone nông nghiệp DJI AGRAS T70P',
    base_price: 143700000,
    image_url:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    brand: 'DJI',
    short_specs: ['Bình phun lớn', 'Radar tránh vật cản', 'Phun rải đa nhiệm'],
  },
];
