import { MOCK_CROP_CATEGORIES, MOCK_CROPS, MOCK_PRICE_RECORDS } from '@/data/mockMarket';
import { PRODUCTS_DATA, type ProductData } from '@/data/productsData';
import type { CropCategory, CropItem, PriceRecord } from '@/types/market';

export type ChartPoint = {
  date: string;
  price: number;
};

export type CropMarketDetail = {
  crop: CropItem;
  category: CropCategory;
  records: PriceRecord[];
  averagePrice: number;
  averageChange: number;
  highestRecord: PriceRecord | null;
  lowestRecord: PriceRecord | null;
  chart30d: ChartPoint[];
  recommendedProducts: ProductData[];
};

export function getCropMarketDetail(slug: string): CropMarketDetail | null {
  const crop = MOCK_CROPS.find((item) => item.slug === slug);
  if (!crop) return null;

  const category = MOCK_CROP_CATEGORIES.find((item) => item.id === crop.category_id) ?? MOCK_CROP_CATEGORIES[0];
  const records = MOCK_PRICE_RECORDS.filter((record) => record.crop_id === crop.id);
  const averagePrice =
    records.length > 0 ? records.reduce((sum, record) => sum + record.price, 0) / records.length : 0;
  const averageChange =
    records.length > 0
      ? records.reduce((sum, record) => sum + record.change_percentage, 0) / records.length
      : 0;
  const sortedByPrice = [...records].sort((a, b) => b.price - a.price);

  return {
    crop,
    category,
    records,
    averagePrice,
    averageChange,
    highestRecord: sortedByPrice[0] ?? null,
    lowestRecord: sortedByPrice[sortedByPrice.length - 1] ?? null,
    chart30d: buildChartData(records, averagePrice, averageChange),
    recommendedProducts: getRecommendedProducts(crop),
  };
}

export function generateStaticParams() {
  return MOCK_CROPS.map((crop) => ({ slug: crop.slug }));
}

export function formatMarketPrice(value: number, unit = 'đ/kg') {
  return `${Math.round(value).toLocaleString('vi-VN')} ${unit}`;
}

function buildChartData(records: PriceRecord[], averagePrice: number, averageChange: number): ChartPoint[] {
  const latestDate = records[0]?.date ? new Date(`${records[0].date}T00:00:00`) : new Date('2026-04-25T00:00:00');
  const safeAverage = averagePrice || 10000;
  const dailyDrift = averageChange / 100 / 29;

  return Array.from({ length: 30 }, (_, index) => {
    const dayIndex = index - 29;
    const date = new Date(latestDate);
    date.setDate(latestDate.getDate() + dayIndex);

    const wave = Math.sin(index * 0.75) * 0.018;
    const provinceSpread =
      records.length > 0
        ? records.reduce((sum, record, recordIndex) => sum + record.change_percentage * Math.cos(index + recordIndex), 0) /
          records.length /
          100
        : 0;
    const price = safeAverage * (1 + dayIndex * dailyDrift + wave + provinceSpread * 0.2);

    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      price: Math.max(0, Math.round(price)),
    };
  });
}

function getRecommendedProducts(crop: CropItem) {
  const normalizedCrop = normalize(crop.name);
  const cropTokens = normalizedCrop.split(' ').filter((token) => token.length > 2);

  const scored = PRODUCTS_DATA.map((product) => {
    const haystack = normalize(
      `${product.name} ${product.description} ${product.tags.join(' ')} ${JSON.stringify(product.specs)}`,
    );
    const cropScore = cropTokens.reduce((score, token) => score + (haystack.includes(token) ? 3 : 0), 0);
    const categoryScore = crop.category_id === 'fruit-crops' && haystack.includes('cay an trai') ? 2 : 0;
    const irrigationScore =
      product.type === 'HARDWARE' && /tuoi|irrigation|bec|ong|bom|loc|cham phan/.test(haystack) ? 1 : 0;
    const fertilizerScore = product.type === 'FERTILIZER' && /npk|humic|vi sinh|phan|fertilizer/.test(haystack) ? 1 : 0;

    return {
      product,
      score: cropScore + categoryScore + irrigationScore + fertilizerScore,
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  const selected = scored.map((item) => item.product);
  const fallback = [
    ...PRODUCTS_DATA.filter((product) => product.type === 'HARDWARE').slice(0, 2),
    ...PRODUCTS_DATA.filter((product) => product.type === 'FERTILIZER').slice(0, 2),
  ];

  return dedupeProducts([...selected, ...fallback]).slice(0, 3);
}

function dedupeProducts(products: ProductData[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}
