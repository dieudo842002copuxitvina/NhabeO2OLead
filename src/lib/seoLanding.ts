/**
 * SEO Landing Page Engine
 * Generates dynamic content for /giai-phap-tuoi/{crop}/{province}
 * Combines: crop profile + province geo + commodity price + nearby dealers + local projects
 */

import { commodityPrices, dealers } from '@/data/mock';

export interface CropProfile {
  slug: string;
  name: string;
  emoji: string;
  commodityKeyword: string;   // matches commodityPrices[].name
  irrigationType: string;
  waterNeed: string;
  bestProductCategory: string;
  description: string;
  benefits: string[];
}

export interface ProvinceProfile {
  slug: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  topCrops: string[];           // crop slugs
  climateNote: string;
}

export interface LocalProject {
  id: string;
  cropSlug: string;
  provinceSlug: string;
  title: string;
  area: string;
  installer: string;
  installerPhone: string;
  completedAt: string;
  imageEmoji: string;
  testimonial: string;
  resultMetric: string;
}

// =============== Crop Catalog ===============

export const CROPS: CropProfile[] = [
  {
    slug: 'sau-rieng', name: 'Sầu riêng', emoji: '🌳',
    commodityKeyword: 'sầu riêng',
    irrigationType: 'Tưới nhỏ giọt + cảm biến độ ẩm',
    waterNeed: '80-120 lít/cây/ngày (mùa khô)',
    bestProductCategory: 'Hệ thống tưới',
    description: 'Sầu riêng cần lượng nước ổn định và độ ẩm đất 70-80%. Hệ thống tưới nhỏ giọt kết hợp cảm biến IoT giúp tiết kiệm 60% nước, tăng tỉ lệ đậu trái 25%.',
    benefits: ['Tiết kiệm 60% nước', 'Tăng tỉ lệ đậu trái 25%', 'Giảm công lao động 70%', 'Phòng bệnh chết nhanh'],
  },
  {
    slug: 'ca-phe', name: 'Cà phê', emoji: '☕',
    commodityKeyword: 'cà phê',
    irrigationType: 'Tưới phun mưa + bồn tưới gốc',
    waterNeed: '60-80 lít/cây/đợt × 4-5 đợt/năm',
    bestProductCategory: 'Máy bơm',
    description: 'Cà phê cần tưới đậm vào mùa khô (1-2 tháng/lần). Máy bơm công suất lớn + ống PE chính giúp tưới nhanh diện tích 1-5ha.',
    benefits: ['Tưới đồng đều 5ha trong 1 ngày', 'Tiết kiệm 40% điện', 'Tăng năng suất 15-20%', 'Giảm chi phí nhân công'],
  },
  {
    slug: 'tieu', name: 'Hồ tiêu', emoji: '🌶',
    commodityKeyword: 'tiêu',
    irrigationType: 'Tưới nhỏ giọt áp lực thấp',
    waterNeed: '15-25 lít/trụ/ngày',
    bestProductCategory: 'Hệ thống tưới',
    description: 'Hồ tiêu rất nhạy với úng nước → tưới nhỏ giọt chính xác là tối ưu. Cảm biến độ ẩm cảnh báo sớm phòng bệnh chết nhanh.',
    benefits: ['Phòng bệnh chết nhanh', 'Tiết kiệm 70% nước', 'Tăng năng suất 30%', 'Bón phân qua hệ thống'],
  },
  {
    slug: 'buoi', name: 'Bưởi', emoji: '🍊',
    commodityKeyword: 'bưởi',
    irrigationType: 'Tưới nhỏ giọt vòng quanh gốc',
    waterNeed: '50-80 lít/cây/ngày',
    bestProductCategory: 'Hệ thống tưới',
    description: 'Bưởi da xanh cần tưới đều quanh năm. Hệ thống béc phun cục bộ giúp giữ độ ẩm gốc, tăng độ ngọt và mọng nước.',
    benefits: ['Tăng độ ngọt trái', 'Trái đều, ít nứt vỏ', 'Tiết kiệm 50% nước', 'Bón phân tự động'],
  },
  {
    slug: 'thanh-long', name: 'Thanh long', emoji: '🐉',
    commodityKeyword: 'thanh long',
    irrigationType: 'Tưới phun béc + tưới gốc',
    waterNeed: '20-30 lít/trụ/ngày',
    bestProductCategory: 'Hệ thống tưới',
    description: 'Thanh long cần tưới nhẹ và thường xuyên. Hệ thống béc phun mưa kết hợp châm phân giúp cây bền sức ra hoa quanh năm.',
    benefits: ['Ra hoa quanh năm', 'Tiết kiệm 55% nước', 'Châm phân đồng đều', 'Phù hợp đất cát'],
  },
  {
    slug: 'lua', name: 'Lúa', emoji: '🌾',
    commodityKeyword: 'lúa',
    irrigationType: 'Bơm cấp nước ruộng + đo mực nước',
    waterNeed: 'Mực nước 5-10cm theo giai đoạn',
    bestProductCategory: 'Máy bơm',
    description: 'Cánh đồng lúa lớn cần máy bơm công suất cao + cảm biến mực nước tự động. Giúp giảm 30% lượng nước và tăng năng suất.',
    benefits: ['Bơm tự động theo lịch', 'Giảm 30% nước tưới', 'Tiết kiệm 25% điện', 'Phù hợp ĐBSCL'],
  },
  {
    slug: 'rau-mau', name: 'Rau màu', emoji: '🥬',
    commodityKeyword: 'rau',
    irrigationType: 'Tưới nhỏ giọt T-Tape + phun sương',
    waterNeed: '4-8mm/ngày',
    bestProductCategory: 'Hệ thống tưới',
    description: 'Rau màu chu kỳ ngắn cần tưới nhẹ nhiều lần. Ống T-Tape rẻ, dễ thay giúp HTX và nông trại nhỏ tối ưu chi phí.',
    benefits: ['Chi phí đầu tư thấp', 'Lắp đặt nhanh trong 1 ngày', 'Tăng năng suất 35%', 'Giảm sâu bệnh do tán lá khô'],
  },
  {
    slug: 'cao-su', name: 'Cao su', emoji: '🌲',
    commodityKeyword: 'cao su',
    irrigationType: 'Hệ thống tưới gốc theo lô',
    waterNeed: '40-60 lít/cây/đợt mùa khô',
    bestProductCategory: 'Điều khiển',
    description: 'Cao su quy mô lớn cần bộ điều khiển nhiều vùng. Tưới chia lô theo lịch trình giúp tiết kiệm nhân công và đồng đều.',
    benefits: ['Quản lý 8-16 lô độc lập', 'Tự động theo lịch', 'Giảm 60% nhân công', 'Tăng sản lượng mủ'],
  },
];

// =============== Province Catalog (focus on agri provinces) ===============

export const PROVINCES: ProvinceProfile[] = [
  { slug: 'dak-lak', name: 'Đắk Lắk', region: 'Tây Nguyên', lat: 12.71, lng: 108.05,
    topCrops: ['ca-phe', 'sau-rieng', 'tieu', 'cao-su'],
    climateNote: 'Mùa khô dài 6 tháng (11–4), lượng mưa thấp → cần hệ thống tưới chủ động.' },
  { slug: 'lam-dong', name: 'Lâm Đồng', region: 'Tây Nguyên', lat: 11.94, lng: 108.44,
    topCrops: ['ca-phe', 'sau-rieng', 'rau-mau', 'buoi'],
    climateNote: 'Khí hậu mát, độ dốc cao → ưu tiên tưới nhỏ giọt để chống xói mòn.' },
  { slug: 'gia-lai', name: 'Gia Lai', region: 'Tây Nguyên', lat: 13.98, lng: 108.0,
    topCrops: ['ca-phe', 'tieu', 'cao-su'],
    climateNote: 'Đất đỏ bazan màu mỡ nhưng mùa khô gay gắt — tưới tiết kiệm nước là then chốt.' },
  { slug: 'dak-nong', name: 'Đắk Nông', region: 'Tây Nguyên', lat: 12.00, lng: 107.69,
    topCrops: ['ca-phe', 'tieu', 'sau-rieng'],
    climateNote: 'Vùng trồng tiêu lớn nhất Việt Nam — cần tưới nhỏ giọt phòng bệnh chết nhanh.' },
  { slug: 'kon-tum', name: 'Kon Tum', region: 'Tây Nguyên', lat: 14.35, lng: 108.00,
    topCrops: ['ca-phe', 'cao-su'],
    climateNote: 'Địa hình đồi núi, độ dốc lớn — cần máy bơm áp lực cao.' },
  { slug: 'dong-nai', name: 'Đồng Nai', region: 'Đông Nam Bộ', lat: 10.93, lng: 107.24,
    topCrops: ['sau-rieng', 'buoi', 'rau-mau'],
    climateNote: 'Vành đai trái cây ĐNB, đất phù sa cổ — phù hợp tưới nhỏ giọt cho cây ăn trái.' },
  { slug: 'binh-duong', name: 'Bình Dương', region: 'Đông Nam Bộ', lat: 11.00, lng: 106.65,
    topCrops: ['buoi', 'rau-mau', 'sau-rieng'],
    climateNote: 'Vùng trồng cây ăn trái và rau công nghệ cao gần TP.HCM.' },
  { slug: 'tay-ninh', name: 'Tây Ninh', region: 'Đông Nam Bộ', lat: 11.03, lng: 106.37,
    topCrops: ['cao-su', 'rau-mau', 'lua'],
    climateNote: 'Đồng bằng cao, nhiều hồ đập — thuận lợi cho hệ thống bơm tưới quy mô lớn.' },
  { slug: 'binh-thuan', name: 'Bình Thuận', region: 'Nam Trung Bộ', lat: 11.09, lng: 108.08,
    topCrops: ['thanh-long', 'rau-mau'],
    climateNote: 'Thủ phủ thanh long Việt Nam — khí hậu khô nóng, cần tưới hiệu quả cao.' },
  { slug: 'long-an', name: 'Long An', region: 'ĐBSCL', lat: 10.69, lng: 106.24,
    topCrops: ['lua', 'thanh-long', 'rau-mau'],
    climateNote: 'Cửa ngõ ĐBSCL, vùng lúa chất lượng cao và thanh long.' },
  { slug: 'tien-giang', name: 'Tiền Giang', region: 'ĐBSCL', lat: 10.36, lng: 106.36,
    topCrops: ['sau-rieng', 'buoi', 'thanh-long'],
    climateNote: 'Vương quốc trái cây miền Tây — sầu riêng Cái Mơn nổi tiếng.' },
  { slug: 'ben-tre', name: 'Bến Tre', region: 'ĐBSCL', lat: 10.24, lng: 106.38,
    topCrops: ['buoi', 'sau-rieng'],
    climateNote: 'Bưởi da xanh đặc sản — cần hệ thống tưới chống xâm nhập mặn.' },
  { slug: 'can-tho', name: 'Cần Thơ', region: 'ĐBSCL', lat: 10.03, lng: 105.77,
    topCrops: ['lua', 'rau-mau', 'sau-rieng'],
    climateNote: 'Trung tâm ĐBSCL — sản xuất lúa và rau quy mô lớn.' },
  { slug: 'an-giang', name: 'An Giang', region: 'ĐBSCL', lat: 10.52, lng: 105.13,
    topCrops: ['lua', 'rau-mau'],
    climateNote: 'Vựa lúa cả nước — cần máy bơm công suất lớn cho cánh đồng mẫu lớn.' },
  { slug: 'kien-giang', name: 'Kiên Giang', region: 'ĐBSCL', lat: 9.99, lng: 105.08,
    topCrops: ['lua', 'rau-mau'],
    climateNote: 'Vùng lúa - thủy sản lớn nhất ĐBSCL.' },
];

// =============== Local Projects (real-feel testimonials) ===============

const PROJECT_TEMPLATES = [
  { area: '5.000m²', testimonial: 'Sau 1 vụ tiết kiệm gần 40% chi phí điện và nước. Trái to đều hơn hẳn.', metric: '+22% năng suất' },
  { area: '1.2ha', testimonial: 'Lắp xong trong 2 ngày, đội thợ rất chuyên nghiệp. Vận hành ổn định 6 tháng.', metric: '-55% nước tưới' },
  { area: '8.000m²', testimonial: 'Cảm biến cảnh báo sớm giúp phát hiện vùng khô. Cây ít stress hơn rõ rệt.', metric: '+30% tỉ lệ đậu trái' },
  { area: '2ha', testimonial: 'Hệ thống tưới chia lô tự động, không còn phải dậy sớm mở van mỗi ngày.', metric: '-70% nhân công' },
  { area: '3.500m²', testimonial: 'Trồng theo công nghệ tưới chính xác, sản lượng cao hơn vườn truyền thống bên cạnh 25%.', metric: '+25% sản lượng' },
];

const INSTALLERS = [
  { name: 'Đội thi công Anh Tuấn', phone: '0901112233' },
  { name: 'Tổ kỹ thuật Minh Phát', phone: '0902223344' },
  { name: 'Đội thợ Nông Việt', phone: '0903334455' },
  { name: 'Tổ lắp đặt Thành Công', phone: '0904445566' },
];

const EMOJIS = ['🌳', '💧', '🚜', '🌱', '⚡'];

export function getLocalProjects(cropSlug: string, provinceSlug: string, count = 3): LocalProject[] {
  const seed = (cropSlug.length * 31 + provinceSlug.length * 17) % 100;
  const out: LocalProject[] = [];
  for (let i = 0; i < count; i++) {
    const t = PROJECT_TEMPLATES[(seed + i) % PROJECT_TEMPLATES.length];
    const inst = INSTALLERS[(seed + i * 2) % INSTALLERS.length];
    const monthsAgo = (seed + i * 3) % 12 + 1;
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    out.push({
      id: `proj-${cropSlug}-${provinceSlug}-${i}`,
      cropSlug, provinceSlug,
      title: `Vườn ${cropSlug.replace('-', ' ')} ${t.area} tại ${provinceSlugToName(provinceSlug)}`,
      area: t.area,
      installer: inst.name,
      installerPhone: inst.phone,
      completedAt: `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`,
      imageEmoji: EMOJIS[(seed + i) % EMOJIS.length],
      testimonial: t.testimonial,
      resultMetric: t.metric,
    });
  }
  return out;
}

// =============== Helpers ===============

export function getCrop(slug: string): CropProfile | undefined {
  return CROPS.find(c => c.slug === slug);
}

export function getProvince(slug: string): ProvinceProfile | undefined {
  return PROVINCES.find(p => p.slug === slug);
}

function provinceSlugToName(slug: string): string {
  return getProvince(slug)?.name ?? slug;
}

export function getCommodityPriceForCrop(crop: CropProfile) {
  return commodityPrices.find(c => c.name.toLowerCase().includes(crop.commodityKeyword.toLowerCase()));
}

export function getDealersInProvince(provinceSlug: string, max = 3) {
  const province = getProvince(provinceSlug);
  if (!province) return [];
  // Match by province name first, then region, then by lat/lng proximity
  const exact = dealers.filter(d => d.province === province.name && d.status === 'active');
  if (exact.length >= max) return exact.slice(0, max);
  const sameRegion = dealers.filter(d => d.region === province.region && d.status === 'active' && !exact.includes(d));
  const combined = [...exact, ...sameRegion];
  if (combined.length >= max) return combined.slice(0, max);
  // Fallback: nearest by haversine
  const all = dealers.filter(d => d.status === 'active' && !combined.includes(d));
  const withDist = all.map(d => ({
    d,
    dist: Math.hypot(d.lat - province.lat, d.lng - province.lng),
  })).sort((a, b) => a.dist - b.dist);
  return [...combined, ...withDist.map(x => x.d)].slice(0, max);
}

/** All valid (crop, province) pairs based on each province's topCrops */
export function getAllSeoPairs(): Array<{ crop: CropProfile; province: ProvinceProfile }> {
  const pairs: Array<{ crop: CropProfile; province: ProvinceProfile }> = [];
  for (const p of PROVINCES) {
    for (const cropSlug of p.topCrops) {
      const c = getCrop(cropSlug);
      if (c) pairs.push({ crop: c, province: p });
    }
  }
  return pairs;
}

/** All possible pairs (every crop × every province) — for full SEO coverage */
export function getAllPossiblePairs(): Array<{ crop: CropProfile; province: ProvinceProfile }> {
  const pairs: Array<{ crop: CropProfile; province: ProvinceProfile }> = [];
  for (const p of PROVINCES) {
    for (const c of CROPS) pairs.push({ crop: c, province: p });
  }
  return pairs;
}

export function buildSeoUrl(cropSlug: string, provinceSlug: string): string {
  return `/giai-phap-tuoi/${cropSlug}/${provinceSlug}`;
}

/** Find nearest province to a given lat/lng (haversine on small list = OK) */
export function findNearestProvince(lat: number, lng: number): ProvinceProfile {
  let best = PROVINCES[0];
  let bestDist = Infinity;
  for (const p of PROVINCES) {
    const d = Math.hypot(p.lat - lat, p.lng - lng);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}
