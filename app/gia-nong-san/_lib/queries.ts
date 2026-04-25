import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "@/integrations/supabase/server";
import type { Tables } from "@/integrations/supabase/types";
import type { PriceCategory, PriceFilters } from "./schemas";

type MarketPriceRow = Tables<"market_prices">;

type PriceHistoryPoint = {
  date: string;
  price: number;
};

export type CommodityPrice = {
  id: string;
  cropKey: string;
  cropLabel: string;
  category: PriceCategory;
  province: string;
  regionKey: string;
  regionLabel: string;
  priceVnd: number;
  previousPriceVnd: number | null;
  changeVnd: number | null;
  changePct: number | null;
  unit: string;
  recordedAt: string;
  source: string | null;
  qualityLabel: string;
  history: PriceHistoryPoint[];
};

export type PriceCategoryOption = {
  key: PriceCategory;
  label: string;
  count: number;
};

export type PriceRegionOption = {
  key: string;
  label: string;
  count: number;
};

export type PriceSnapshot = {
  items: CommodityPrice[];
  categories: PriceCategoryOption[];
  regions: PriceRegionOption[];
  lastUpdatedAt: string;
  topMovers: CommodityPrice[];
  totalItems: number;
};

const HOT_CACHE_TTL_MS = 30_000;
const LIVE_CACHE_TTL_MS = 5_000;
const CACHE_VERSION = "2026-04-24-v1";

const hotCache = new Map<string, { expiresAt: number; value: PriceSnapshot }>();

const CATEGORY_LABELS: Record<PriceCategory, string> = {
  all: "Tất cả",
  coffee: "Cà phê",
  pepper: "Hồ tiêu",
  rice: "Lúa gạo",
  fruit: "Trái cây",
  cashew: "Điều",
  rubber: "Cao su",
};

const REGION_MAP: Record<string, { key: string; label: string }> = {
  "Đắk Lắk": { key: "tay-nguyen", label: "Tây Nguyên" },
  "Đắk Nông": { key: "tay-nguyen", label: "Tây Nguyên" },
  "Gia Lai": { key: "tay-nguyen", label: "Tây Nguyên" },
  "Kon Tum": { key: "tay-nguyen", label: "Tây Nguyên" },
  "Lâm Đồng": { key: "tay-nguyen", label: "Tây Nguyên" },
  "Đồng Nai": { key: "dong-nam-bo", label: "Đông Nam Bộ" },
  "Bình Phước": { key: "dong-nam-bo", label: "Đông Nam Bộ" },
  "Bà Rịa - Vũng Tàu": { key: "dong-nam-bo", label: "Đông Nam Bộ" },
  "Tây Ninh": { key: "dong-nam-bo", label: "Đông Nam Bộ" },
  "Tiền Giang": { key: "mien-tay", label: "Miền Tây" },
  "Bến Tre": { key: "mien-tay", label: "Miền Tây" },
  "Đồng Tháp": { key: "mien-tay", label: "Miền Tây" },
  "An Giang": { key: "mien-tay", label: "Miền Tây" },
  "Cần Thơ": { key: "mien-tay", label: "Miền Tây" },
  "Sóc Trăng": { key: "mien-tay", label: "Miền Tây" },
  "Long An": { key: "mien-tay", label: "Miền Tây" },
};

const FALLBACK_ROWS: MarketPriceRow[] = [
  seedRow("coffee-daklak", "coffee", "Cà phê Robusta", "Đắk Lắk", 121500, "2026-04-24T10:40:00.000Z", "HTX Krông Ana"),
  seedRow("coffee-daklak-prev", "coffee", "Cà phê Robusta", "Đắk Lắk", 120100, "2026-04-23T10:40:00.000Z", "HTX Krông Ana"),
  seedRow("coffee-gialai", "coffee", "Cà phê Robusta", "Gia Lai", 120800, "2026-04-24T10:35:00.000Z", "Đại lý Pleiku"),
  seedRow("coffee-gialai-prev", "coffee", "Cà phê Robusta", "Gia Lai", 119900, "2026-04-23T10:35:00.000Z", "Đại lý Pleiku"),
  seedRow("pepper-gialai", "pepper", "Hồ tiêu đen", "Gia Lai", 154000, "2026-04-24T10:20:00.000Z", "HTX Nam Yang"),
  seedRow("pepper-gialai-prev", "pepper", "Hồ tiêu đen", "Gia Lai", 154500, "2026-04-23T10:20:00.000Z", "HTX Nam Yang"),
  seedRow("durian-dongnai", "durian", "Sầu riêng Ri6", "Đồng Nai", 115000, "2026-04-24T10:15:00.000Z", "Vựa Long Khánh"),
  seedRow("durian-dongnai-prev", "durian", "Sầu riêng Ri6", "Đồng Nai", 110000, "2026-04-23T10:15:00.000Z", "Vựa Long Khánh"),
  seedRow("rice-soc-trang", "st25_rice", "Lúa ST25", "Sóc Trăng", 12500, "2026-04-24T09:55:00.000Z", "Lộc Trời"),
  seedRow("rice-soc-trang-prev", "st25_rice", "Lúa ST25", "Sóc Trăng", 12250, "2026-04-23T09:55:00.000Z", "Lộc Trời"),
  seedRow("cashew-binhphuoc", "cashew", "Điều thô W320", "Bình Phước", 38500, "2026-04-24T10:05:00.000Z", "Long Sơn"),
  seedRow("cashew-binhphuoc-prev", "cashew", "Điều thô W320", "Bình Phước", 38300, "2026-04-23T10:05:00.000Z", "Long Sơn"),
  seedRow("rubber-dongnai", "rubber", "Cao su mủ tươi", "Đồng Nai", 425, "2026-04-24T10:10:00.000Z", "Cao su Đồng Nai"),
  seedRow("rubber-dongnai-prev", "rubber", "Cao su mủ tươi", "Đồng Nai", 417, "2026-04-23T10:10:00.000Z", "Cao su Đồng Nai"),
];

export async function getPriceSnapshot(filters: PriceFilters): Promise<PriceSnapshot> {
  const cached = unstable_cache(
    async () => loadSnapshot(filters, HOT_CACHE_TTL_MS),
    [CACHE_VERSION, filters.cat, filters.region ?? "all", filters.sort, filters.q ?? ""],
    {
      revalidate: 60,
      tags: ["prices", `prices:${filters.cat}`, filters.region ? `prices:${filters.region}` : "prices:all"],
    }
  );

  return cached();
}

export async function getLivePriceSnapshot(filters: PriceFilters): Promise<PriceSnapshot> {
  return loadSnapshot(filters, LIVE_CACHE_TTL_MS);
}

export async function getTopMovers(limit = 5) {
  const snapshot = await getPriceSnapshot({ cat: "all", region: undefined, sort: "change", q: undefined });
  return snapshot.topMovers.slice(0, limit);
}

async function loadSnapshot(filters: PriceFilters, hotTtlMs: number): Promise<PriceSnapshot> {
  const hotKey = JSON.stringify(filters);
  const cached = hotCache.get(hotKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const rows = await loadRecentMarketRows();
  const snapshot = buildSnapshot(rows, filters);

  hotCache.set(hotKey, {
    expiresAt: Date.now() + hotTtlMs,
    value: snapshot,
  });

  return snapshot;
}

async function loadRecentMarketRows(): Promise<MarketPriceRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    const since = new Date();
    since.setDate(since.getDate() - 14);

    const { data, error } = await supabase
      .from("market_prices")
      .select("id, crop_key, crop_label, province, price_vnd, unit, recorded_at, source, created_at")
      .gte("recorded_at", since.toISOString())
      .order("recorded_at", { ascending: false })
      .limit(500);

    if (error || !data || data.length === 0) {
      return FALLBACK_ROWS;
    }

    return data;
  } catch {
    return FALLBACK_ROWS;
  }
}

function buildSnapshot(rows: MarketPriceRow[], filters: PriceFilters): PriceSnapshot {
  const grouped = new Map<string, MarketPriceRow[]>();

  rows.forEach((row) => {
    const key = `${row.crop_key}::${row.province}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)?.push(row);
  });

  const items = Array.from(grouped.values())
    .map((group) => mapGroupToCommodity(group))
    .filter((item): item is CommodityPrice => Boolean(item));

  const filtered = items.filter((item) => {
    if (filters.cat !== "all" && item.category !== filters.cat) return false;
    if (filters.region && item.regionKey !== filters.region) return false;
    if (filters.q) {
      const needle = normalize(filters.q);
      const haystack = normalize(`${item.cropLabel} ${item.province} ${item.regionLabel}`);
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sorted = filtered.sort((a, b) => {
    if (filters.sort === "price") return b.priceVnd - a.priceVnd;
    if (filters.sort === "name") return a.cropLabel.localeCompare(b.cropLabel, "vi");
    return Math.abs(b.changePct ?? 0) - Math.abs(a.changePct ?? 0);
  });

  const lastUpdatedAt =
    sorted[0]?.recordedAt ??
    items.sort((a, b) => Date.parse(b.recordedAt) - Date.parse(a.recordedAt))[0]?.recordedAt ??
    new Date().toISOString();

  return {
    items: sorted,
    categories: buildCategoryOptions(items),
    regions: buildRegionOptions(items),
    lastUpdatedAt,
    topMovers: [...items].sort((a, b) => Math.abs(b.changePct ?? 0) - Math.abs(a.changePct ?? 0)).slice(0, 5),
    totalItems: sorted.length,
  };
}

function mapGroupToCommodity(group: MarketPriceRow[]): CommodityPrice | null {
  const rows = [...group].sort((a, b) => Date.parse(b.recorded_at) - Date.parse(a.recorded_at));
  const latest = rows[0];

  if (!latest) return null;

  const previous = rows.find((row) => row.id !== latest.id);
  const region = REGION_MAP[latest.province] ?? { key: "toan-quoc", label: "Toàn quốc" };
  const category = inferCategory(latest.crop_key, latest.crop_label);
  const previousPriceVnd = previous ? Number(previous.price_vnd) : null;
  const priceVnd = Number(latest.price_vnd);
  const changeVnd = previousPriceVnd === null ? null : priceVnd - previousPriceVnd;
  const changePct =
    previousPriceVnd && previousPriceVnd > 0 ? Number((((priceVnd - previousPriceVnd) / previousPriceVnd) * 100).toFixed(1)) : null;

  const history = rows
    .slice(0, 7)
    .reverse()
    .map((row) => ({
      date: new Date(row.recorded_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      price: Number(row.price_vnd),
    }));

  return {
    id: `${latest.crop_key}-${slugify(latest.province)}`,
    cropKey: latest.crop_key,
    cropLabel: latest.crop_label,
    category,
    province: latest.province,
    regionKey: region.key,
    regionLabel: region.label,
    priceVnd,
    previousPriceVnd,
    changeVnd,
    changePct,
    unit: latest.unit ?? "kg",
    recordedAt: latest.recorded_at,
    source: latest.source,
    qualityLabel: buildQualityLabel(latest.crop_label),
    history,
  };
}

function buildCategoryOptions(items: CommodityPrice[]): PriceCategoryOption[] {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  return (Object.keys(CATEGORY_LABELS) as PriceCategory[]).map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
    count: key === "all" ? items.length : counts[key] ?? 0,
  }));
}

function buildRegionOptions(items: CommodityPrice[]): PriceRegionOption[] {
  const counts = items.reduce<Record<string, PriceRegionOption>>((acc, item) => {
    if (!acc[item.regionKey]) {
      acc[item.regionKey] = { key: item.regionKey, label: item.regionLabel, count: 0 };
    }
    acc[item.regionKey].count += 1;
    return acc;
  }, {});

  return Object.values(counts).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "vi"));
}

function inferCategory(cropKey: string, cropLabel: string): PriceCategory {
  const normalized = normalize(`${cropKey} ${cropLabel}`);

  if (normalized.includes("coffee") || normalized.includes("ca phe")) return "coffee";
  if (normalized.includes("pepper") || normalized.includes("ho tieu")) return "pepper";
  if (normalized.includes("rice") || normalized.includes("lua") || normalized.includes("gao")) return "rice";
  if (normalized.includes("cashew") || normalized.includes("dieu")) return "cashew";
  if (normalized.includes("rubber") || normalized.includes("cao su")) return "rubber";
  if (normalized.includes("durian") || normalized.includes("sau rieng") || normalized.includes("xoai") || normalized.includes("bo")) {
    return "fruit";
  }

  return "all";
}

function buildQualityLabel(cropLabel: string) {
  if (cropLabel.toLowerCase().includes("ri6")) return "Loại 1 xuất khẩu";
  if (cropLabel.toLowerCase().includes("robusta")) return "R2, độ ẩm chuẩn";
  if (cropLabel.toLowerCase().includes("st25")) return "Hạt dài, chuẩn thương lái";
  return "Chuẩn đại lý thu mua";
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function slugify(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function seedRow(
  id: string,
  cropKey: string,
  cropLabel: string,
  province: string,
  priceVnd: number,
  recordedAt: string,
  source: string
): MarketPriceRow {
  return {
    id,
    created_at: recordedAt,
    crop_key: cropKey,
    crop_label: cropLabel,
    price_vnd: priceVnd,
    province,
    recorded_at: recordedAt,
    source,
    unit: "kg",
  };
}
