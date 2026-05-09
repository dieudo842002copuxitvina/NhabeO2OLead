/**
 * scripts/sync-products.ts (v2 — Nâng cấp Deep Technical Scraping)
 * ─────────────────────────────────────────────────────────────────────────────
 * Web Scraper & Seeder — Đồng bộ sản phẩm từ nhabeagri.com vào Prisma DB
 *
 * Nâng cấp v2:
 *  ✓ Bóc tách THÔNG SỐ KỸ THUẬT → JSON chuẩn (làm đầu vào máy tính thủy lực)
 *  ✓ Bóc tách HƯỚNG DẪN SỬ DỤNG → text/HTML sạch
 *  ✓ Làm sạch HTML (loại class/style thừa, giữ format cơ bản)
 *  ✓ SEO Meta Description tự động
 *  ✓ Chế độ TEST: Thử 1-2 URL trước batch để kiểm tra độ chính xác
 *
 * Chạy:
 *   npm run sync:products           — Sync hàng loạt (batch)
 *   npm run sync:products:preview   — Preview 1 URL (không lưu DB)
 *   npx tsx scripts/sync-products.ts --url "https://nhabeagri.com/..."
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

// ─── Setup ────────────────────────────────────────────────────────────────────
const prisma = new PrismaClient();

// ─── Retry + Backoff Utility ────────────────────────────────────────────────────

const HTTP_STATUS_RETRY = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Exponential backoff with jitter for HTTP requests.
 * Retries on network error or retryable HTTP status codes (429 rate-limit, 5xx).
 * Returns parsed response data on success.
 *
 * @param responseType - "json" (default) returns parsed data, "arraybuffer" returns Buffer
 */
async function fetchWithRetry<T>(
  url: string,
  options: {
    method?: "GET" | "POST";
    headers?: Record<string, string>;
    body?: unknown;
    responseType?: "json" | "arraybuffer";
    baseDelayMs?: number;
    maxDelayMs?: number;
    maxAttempts?: number;
  } = {}
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    responseType = "json",
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    maxAttempts = 4,
  } = options;

  let lastErr: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.request<T>({
        method,
        url,
        data: body,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          ...headers,
        },
        timeout: 25000,
        responseType: responseType === "arraybuffer" ? "arraybuffer" : "json",
      });

      const status = response.status;
      if (status === 429 || HTTP_STATUS_RETRY.has(status)) {
        const retryAfter = response.headers["retry-after"];
        let delay = retryAfter
          ? parseInt(String(retryAfter), 10) * 1000
          : baseDelayMs * Math.pow(2, attempt - 1);

        delay = Math.min(delay, maxDelayMs);
        const jitter = delay * 0.25 * (Math.random() * 2 - 1);
        delay = Math.max(0, delay + jitter);

        console.warn(
          `  ⏳ [Attempt ${attempt}/${maxAttempts}] HTTP ${status} — retry sau ${Math.round(delay / 1000)}s`
        );
        await sleep(delay);
        continue; // retry
      }

      return response.data as T;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number }; code?: string; message?: string };
      const status = axiosErr?.response?.status;

      if (status && HTTP_STATUS_RETRY.has(status)) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
        const jitter = delay * 0.25 * (Math.random() * 2 - 1);
        console.warn(
          `  ⏳ [Attempt ${attempt}/${maxAttempts}] HTTP ${status} — retry sau ${Math.round((delay + jitter) / 1000)}s`
        );
        await sleep(delay + jitter);
        continue; // retry
      }

      lastErr = new Error(axiosErr?.message ?? String(err));
      if (attempt < maxAttempts) {
        const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
        const jitter = delay * 0.25 * (Math.random() * 2 - 1);
        console.warn(
          `  ⏳ [Attempt ${attempt}/${maxAttempts}] Lỗi: ${lastErr.message} — retry sau ${Math.round((delay + jitter) / 1000)}s`
        );
        await sleep(delay + jitter);
      }
    }
  }

  throw lastErr ?? new Error(`fetchWithRetry: failed after ${maxAttempts} attempts for ${url}`);
}

// ─── Config ────────────────────────────────────────────────────────────────────
const SOURCE_URL = "https://nhabeagri.com";
const PAGE_LIMIT = 5;
const DELAY_MS = 1500;

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Raw scraped product */
interface ScrapedProduct {
  name: string;
  price: number;
  description: string;
  instructions: string;
  imageUrl: string;
  galleryUrls: string[];
  category: string;
  sku: string;
  sourceUrl: string;
  /** Tên brand gốc từ web nguồn (VD: "RIVULIS", "DUCAR") */
  rawBrand: string;
  /** Đầu vào máy tính thủy lực */
  technicalParams: Record<string, string>;
}

/** Normalized product ready for DB */
interface NormalizedProduct {
  name: string;
  slug: string;
  description: string;
  instructions: string;
  metaDescription: string;
  imageUrl: string;
  localImagePath: string;
  galleryLocalPaths: string[];
  sku: string;
  basePrice: number;
  /** Category slug trong DB mới (từ CATEGORY_MAP) */
  categorySlug: string;
  /** Tên category hiển thị */
  categoryName: string;
  /** Brand slug — để resolve thành brandId trong upsert */
  brandSlug: string | null;
  cropTags: string[];
  terrainTags: string[];
  geoTags: string[];
  /** JSON specs — đầu vào máy tính thủy lực */
  specifications: Record<string, string>;
  features: Record<string, unknown>;
  sourceUrl: string;
  scrapedAt: string;
}

// ─── STEP 0: Parse CLI arguments ──────────────────────────────────────────────

function parseArgs(): { mode: "batch" | "preview" | "map5" | "incremental"; singleUrl?: string } {
  const args = process.argv.slice(2);

  if (args.includes("--preview") || args.includes("-p")) {
    const urlArg = args.find((a) => a.startsWith("--url="))?.split("=")[1];
    return { mode: "preview", singleUrl: urlArg || undefined };
  }

  if (args.includes("--url")) {
    const urlIndex = args.indexOf("--url");
    return { mode: "preview", singleUrl: args[urlIndex + 1] };
  }

  if (args.includes("--map5")) {
    return { mode: "map5" };
  }

  if (args.includes("--incremental") || args.includes("-i")) {
    return { mode: "incremental" };
  }

  return { mode: "batch" };
}

// ─── STEP 0b: CATEGORY MAPPING DICTIONARY ──────────────────────────────────
/**
 * Bảng đối chiếu danh mục từ nhabeagri.com (WooCommerce/WordPress)
 * sang category_slug trong DB mới của O2O.
 *
 * Priority: URL path > breadcrumb > keyword title
 */

interface CategoryMap {
  dbSlug: string;
  dbName: string;
  keywords: string[];
  urlPatterns: RegExp[];
  oldSlugs: string[];
}

const CATEGORY_MAP: CategoryMap[] = [
  {
    dbSlug: "bec-tuoi-phun-mua",
    dbName: "Béc Tưới Phun Mưa",
    keywords: ["béc tưới", "béc phun", "bec tuoi", "bec phun", "đầu tưới", "dau tuoi", "súng tưới", "sung tuoi", "atom", "dr07", "dr09", "s2000", "ducar", "rondo", "tornado", "sky"],
    urlPatterns: [/\/danh-muc\/tuoi-phun-mua\//, /tuoi-phun-mua/, /bec-phun-mua/, /bec-tuoi-[a-z]/, /dau-tuoi/, /sung-tuoi/, /atom/i, /s2000/i, /rondo/i],
    oldSlugs: ["bec-phun-mua", "bec-tuoi", "dau-tuoi-phun-mua", "dau-tuoi", "sung-tuoi-phun-mua"],
  },
  {
    dbSlug: "bec-tuoi-nho-giot",
    dbName: "Béc Tưới Nhỏ Giọt",
    keywords: ["béc nhỏ giọt", "béc tưới nhỏ giọt", "bec nho giot", "dripline", "dripper", "naslit"],
    urlPatterns: [/\/danh-muc\/tuoi-nuoc-nho-giot\//, /tuoi-nho-giot/, /nho-giot/, /dripline/i, /dripper/i],
    oldSlugs: ["dau-tuoi-nho-giot", "ong-nho-giot", "bo-kit-tuoi-nho-giot"],
  },
  {
    dbSlug: "ong-tuoi",
    dbName: "Ống Tưới",
    keywords: ["ống pe", "ong pe", "ống ldpe", "ong ldpe", "ống hdpe", "ong hdpe", "ống pvc", "ong pvc", "ống nhựa", "ong nhua"],
    urlPatterns: [/\/danh-muc\/.*ong/, /-ong-/, /ong-(pe|ldpe|hdpe|pvc)/i, /ong-phun-mua/],
    oldSlugs: ["ong-ldpe", "ong-hdpe", "ong-pvc", "ong-phun-mua", "ong-tuoi-nho-giot"],
  },
  {
    dbSlug: "may-bom",
    dbName: "Máy Bơm Tưới",
    keywords: ["máy bơm", "may bom", "bơm nước", "bom nuoc", "motor pump", "centrifugal"],
    urlPatterns: [/may-bom/, /bom-/, /motor-pump/],
    oldSlugs: ["may-bom", "may-bom-nuoc"],
  },
  {
    dbSlug: "van-dien-tu",
    dbName: "Van Điện Từ",
    keywords: ["van điện từ", "van dien tu", "solenoid valve", "electric valve", "bermad", "arka"],
    urlPatterns: [/van-dien-tu/, /van-dien/, /electric-valve/],
    oldSlugs: ["van-dien-tu", "van-dien"],
  },
  {
    dbSlug: "bo-loc",
    dbName: "Bộ Lọc",
    keywords: ["bộ lọc", "bo loc", "lọc đĩa", "loc dia", "filter", "azud"],
    urlPatterns: [/bo-loc/, /loc-/, /filter/, /loc-nuoc/],
    oldSlugs: ["bo-loc", "loc-nuoc", "loc-dia"],
  },
  {
    dbSlug: "tu-dieu-khien",
    dbName: "Tủ Điều Khiển",
    keywords: ["tủ điều khiển", "tu dieu khien", "timer", "bộ hẹn giờ", "bo hen gio", "controller"],
    urlPatterns: [/tu-dien/, /tuoi-tu-dong/, /timer/, /controller/, /hen-gio/],
    oldSlugs: ["tu-dien", "hen-gio-tuoi-tu-dong"],
  },
  {
    dbSlug: "phu-kien",
    dbName: "Phụ Kiện Tưới",
    keywords: ["phụ kiện", "phu kien", "co", "cút", "ren", "接头", "fitting", "nối ống", "noi ong"],
    urlPatterns: [/phu-kien/, /phu-kien-duong-ong/, /phu-kien-ong-/, /co-/, /noi-/],
    oldSlugs: ["phu-kien", "phu-kien-duong-ong", "phu-kien-ong-ldpe", "phu-kien-ong-hdpe"],
  },
  {
    dbSlug: "bo-kit",
    dbName: "Bộ Kit Tưới",
    keywords: ["bộ kit", "bo kit", "kit set", "combo", "trọn bộ", "tron bo"],
    urlPatterns: [/bo-kit/, /kit-/, /tron-bo/],
    oldSlugs: ["bo-kit-tuoi-nho-giot", "bo-kit-phun-suong", "bo-kit-tuoi-canh-quan"],
  },
  {
    dbSlug: "dien-mat-troi",
    dbName: "Điện Mặt Trời",
    keywords: ["điện mặt trời", "dien mat troi", "solar pump", "solar panel"],
    urlPatterns: [/dien-mat-troi/, /solar/],
    oldSlugs: ["dien-mat-troi", "solar"],
  },
  {
    dbSlug: "mang-phu",
    dbName: "Màng Phủ Nông Nghiệp",
    keywords: ["màng phủ", "mang phu", "bạt lót", "bat lot", "mulch"],
    urlPatterns: [/mang-phu/, /bat-lot/, /mulch/],
    oldSlugs: ["mang-phu-nong-nghiep", "bat-lot-ho"],
  },
  {
    dbSlug: "phan-bon",
    dbName: "Phân Bón",
    keywords: ["phân bón", "phan bon", "npk", "humic"],
    urlPatterns: [/phan-bon/, /phan-/, /npk/],
    oldSlugs: ["phan-bon"],
  },
];

function extractCategoryFromUrl(url: string): string | null {
  const path = url.replace(/https?:\/\/nhabeagri\.com\/?/, "").split("?")[0];
  const segments = path.split("/").filter(Boolean);
  const candidates = [...segments].reverse().slice(0, 3);

  for (const seg of candidates) {
    for (const cat of CATEGORY_MAP) {
      for (const pattern of cat.urlPatterns) {
        if (pattern.test("/" + seg) || pattern.test(seg)) {
          return cat.dbSlug;
        }
      }
      for (const oldSlug of cat.oldSlugs) {
        if (seg.includes(oldSlug) || oldSlug.includes(seg)) {
          return cat.dbSlug;
        }
      }
    }
  }
  return null;
}

function extractCategoryFromName(name: string): string | null {
  const lower = name.toLowerCase();
  for (const cat of CATEGORY_MAP) {
    for (const kw of cat.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return cat.dbSlug;
      }
    }
  }
  return null;
}

function getCategoryName(dbSlug: string): string {
  const cat = CATEGORY_MAP.find((c) => c.dbSlug === dbSlug);
  return cat?.dbName || dbSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ─── BRAND EXTRACTION ──────────────────────────────────────────────────────

/** Bảng map brand từ tên raw → brand slug trong DB */
const BRAND_MAP: Record<string, string> = {
  // Chữ hoa chuẩn
  "rivulis": "rivulis",
  "driptec": "driptec",
  "ducar": "ducar",
  "azud": "azud",
  "netafim": "netafim",
  "bermad": "bermad",
  "arka": "arka",
  "ark a": "arka",
  "rain bird": "rain-bird",
  "rainbird": "rain-bird",
  "hunter": "hunter",
  "dekko": "dekko",
  "dekko farm": "dekko",
  "drip irrigation": "driptec",
  "sky": "sky",
  "sky 41": "sky",
  "sky-41": "sky",
  // Tiếng Việt
  "nhà bè agri": "nha-be-agri",
  "nhabe agri": "nha-be-agri",
  "nhà bè": "nha-be-agri",
  "nhà bè nông nghiệp": "nha-be-agri",
};

/**
 * Trích xuất brand slug từ tên sản phẩm, description, specs
 */
function extractBrandSlug(text: string): string | null {
  const lower = text.toLowerCase();

  // 1. Tìm chính xác trong bảng map
  for (const [key, slug] of Object.entries(BRAND_MAP)) {
    if (lower.includes(key)) return slug;
  }

  // 2. Regex patterns cho uppercase brand trong text (VD: "RIVULIS", "DUCAR")
  const brandPatterns = [
    /\b(RIVULIS|DRIPTEC|DUCAR|AZUD|NETAFIM|BERMAD|ARKA|RAINBIRD|HUNTER|DEKKO|SKY)\b/gi,
    /\b(Rivulis|Driptec|Ducar|Azud|Netafim|Bermad|Arka|Rainbird|Hunter|Dekko|Sky)\b/gi,
  ];

  for (const pattern of brandPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const raw = match[0].toLowerCase();
      if (BRAND_MAP[raw]) return BRAND_MAP[raw];
    }
  }

  return null;
}

/**
 * Preview mapping — thử nghiệm 5 sản phẩm đầu tiên
 */
async function previewMapping(urls: string[]): Promise<void> {
  console.log("\n" + "═".repeat(70));
  console.log("  🔍 PREVIEW: Category Mapping — 5 sản phẩm đầu tiên");
  console.log("═".repeat(70));

  for (let i = 0; i < Math.min(urls.length, 5); i++) {
    const url = urls[i];
    console.log(`\n  📦 Sản phẩm ${i + 1}/5`);
    console.log(`  ─────────────────────────────────────────`);
    console.log(`  URL: ${url}`);

    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept-Language": "vi-VN,vi;q=0.9",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(data);
      const name = $("h1").first().text().trim() || $("h2").first().text().trim();
      console.log(`  Tên: "${name}"`);

      const fromUrl = extractCategoryFromUrl(url);
      const fromName = extractCategoryFromName(name);
      const finalCategory = fromUrl || fromName || "san-pham-khac";

      console.log(`  ✅ URL:      ${fromUrl ? getCategoryName(fromUrl) + " (" + fromUrl + ")" : "— chưa khớp"}`);
      console.log(`  ✅ Title:    ${fromName ? getCategoryName(fromName) + " (" + fromName + ")" : "— chưa khớp"}`);
      console.log(`  ─────────────────────────────────────────`);
      console.log(`  🎯 GÁN VÀO DB: ${getCategoryName(finalCategory)} (${finalCategory})`);

      const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 100);
      console.log(`  🔗 Slug:    /san-pham/${slug}`);

    } catch (err) {
      console.log(`  ❌ Lỗi: ${(err as Error).message}`);
    }

    if (i < Math.min(urls.length - 1, 4)) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log("\n" + "═".repeat(70));
  console.log("  ✅ Preview mapping hoàn tất!");
  console.log("  💡 Chạy batch để sync thực sự:");
  console.log("     npm run sync:products");
  console.log("═".repeat(70));
}

// ─── STEP 1: HTML Sanitizer — Loại bỏ class/style thừa ──────────────────────

/**
 * Làm sạch HTML: Loại bỏ class, style, data-*, onlick...
 * Chỉ giữ lại cấu trúc sematic cơ bản (h1-h6, p, ul, ol, li, strong, em, a, img)
 */
function sanitizeHtml(html: string): string {
  if (!html) return "";

  const $ = cheerio.load(html, { decodeEntities: false });

  // Loại bỏ tất cả attributes không phải cơ bản
  const ALLOWED_TAGS = new Set([
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "strong", "b", "em", "i", "u",
    "a", "img",
    "table", "thead", "tbody", "tfoot",
    "tr", "th", "td",
    "div", "span",
    "blockquote", "code", "pre",
  ]);

  const ALLOWED_ATTRS = new Set(["href", "src", "alt", "title", "target"]);

  $("*").each((_, el) => {
    const tag = el.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      // Giữ div/span nhưng xóa attributes
      if (tag !== "div" && tag !== "span") {
        $(el).replaceWith($(el).html() || "");
        return;
      }
    }

    const attrs = Object.keys(el.attribs || {});
    for (const attr of attrs) {
      if (!ALLOWED_ATTRS.has(attr)) {
        $(el).removeAttr(attr);
      }
    }
  });

  // Loại bỏ thẻ trống
  $("*").each((_, el) => {
    const tag = el.tagName.toLowerCase();
    if (ALLOWED_TAGS.has(tag) && !$(el).html()?.trim()) {
      if (tag !== "br" && tag !== "hr") {
        $(el).remove();
      }
    }
  });

  return $.html().trim();
}

// ─── STEP 2: Bóc tách Thông số Kỹ thuật ───────────────────────────────────

/** Chuẩn hóa key thông số kỹ thuật (normalize để máy tính thủy lực đọc được) */
const SPEC_KEY_MAP: Record<string, string> = {
  // Lưu lượng / Flow
  "lưu lượng": "flow_rate",
  "lưu lượng nước": "flow_rate",
  "lưu lượng tưới": "flow_rate",
  "lưu lượng/giờ": "flow_rate",
  "l/h": "flow_rate",
  "lít/giờ": "flow_rate",
  "l/hr": "flow_rate",
  "gph": "flow_rate",
  "flow rate": "flow_rate",
  "flow": "flow_rate",
  "m³/h": "flow_rate_m3h",
  "m3/h": "flow_rate_m3h",

  // Áp suất
  "áp suất làm việc": "working_pressure",
  "áp suất vận hành": "working_pressure",
  "áp suất": "working_pressure",
  "working pressure": "working_pressure",
  "pressure": "working_pressure",
  "bar": "working_pressure_bar",
  "psi": "working_pressure_psi",

  // Kích thước / kết nối
  "kích thước": "dimensions",
  "kích thước kết nối": "connection_size",
  "kết nối": "connection_size",
  "đường kính": "diameter",
  "đường kính vào": "inlet_diameter",
  "đường kính ra": "outlet_diameter",
  "inlet": "inlet_diameter",
  "outlet": "outlet_diameter",
  "size": "connection_size",
  "connection": "connection_size",

  // Công suất / Power
  "công suất": "power",
  "hp": "power_hp",
  "kw": "power_kw",
  "watt": "power_w",
  "power": "power_kw",

  // Vật liệu
  "chất liệu": "material",
  "vật liệu": "material",
  "material": "material",

  // Bán kính / Coverage
  "bán kính tưới": "spray_radius",
  "bán kính": "spray_radius",
  "radius": "spray_radius",
  "coverage": "coverage_area",

  // Góc tưới
  "góc tưới": "spray_angle",
  "góc": "spray_angle",
  "angle": "spray_angle",

  // Khoảng cách
  "khoảng cách béc": "spacing",
  "khoảng cách": "spacing",

  // Khối lượng / Trọng lượng
  "trọng lượng": "weight",
  "khối lượng": "weight",
  "weight": "weight",

  // Bảo hành
  "bảo hành": "warranty",

  // Điện áp
  "điện áp": "voltage",
  "voltage": "voltage",

  // Chiều dài
  "chiều dài": "length",
  "chiều rộng": "width",
  "chiều cao": "height",
  "length": "length",
  "width": "width",
  "height": "height",
};

/**
 * Normalize key thông số → snake_case (máy tính thủy lực đọc được)
 */
function normalizeSpecKey(rawKey: string): string {
  const k = rawKey.toLowerCase().trim();

  // Thử exact match
  if (SPEC_KEY_MAP[k]) return SPEC_KEY_MAP[k];

  // Thử partial match
  for (const [keyword, normalized] of Object.entries(SPEC_KEY_MAP)) {
    if (k.includes(keyword) || keyword.includes(k)) {
      return normalized;
    }
  }

  // Fallback: slugify
  return k
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Parse giá trị số (extract number + unit)
 */
function parseSpecValue(rawValue: string): string {
  return rawValue.trim().replace(/\s+/g, " ");
}

/**
 * Bóc tách thông số kỹ thuật từ HTML
 * Hỗ trợ: Bảng (table), Danh sách (dl/dt/dd), UL/LI, div-based specs
 */
function extractTechnicalParams(html: string): Record<string, string> {
  if (!html) return {};
  const $ = cheerio.load(html);
  const specs: Record<string, string> = {};

  // ── A) Bảng specs: table.specs, .technical-table, .attributes ---
  const tableSelectors = [
    "table.specs",
    "table.technical-table",
    "table.attributes",
    "table.product-attributes",
    ".specs-table",
    ".technical-specs",
    ".woocommerce-product-attributes",
    "table",
  ];

  for (const sel of tableSelectors) {
    $(sel).find("tr").each((_, tr) => {
      const $tr = $(tr);
      const th = $tr.find("th, td:first").text().trim();
      const td = $tr.find("td:last, td").last().text().trim();

      if (th && td && th !== td) {
        const key = normalizeSpecKey(th);
        const val = parseSpecValue(td);
        if (key && val && val.length < 200) {
          specs[key] = val;
        }
      }
    });

    // DL > DT/DD pairs
    $tr.find("dl dt, dl dd").each((_, el) => {
      if ($(el).is("dt")) {
        const key = normalizeSpecKey($(el).text().trim());
        const val = parseSpecValue($(el).next("dd").text().trim());
        if (key && val) specs[key] = val;
      }
    });

    if (Object.keys(specs).length > 0) break;
  }

  // ── B) UL/LI-based specs (VD: "Công suất: 3HP") ──
  const listSelectors = [
    ".specs-list",
    ".technical-list",
    ".product-specs",
    ".features-list",
    "ul.specs",
  ];

  for (const sel of listSelectors) {
    $(sel)
      .find("li")
      .each((_, li) => {
        const text = $(li).text().trim();
        const colonIdx = text.indexOf(":");
        if (colonIdx > 2 && colonIdx < 100) {
          const rawKey = text.substring(0, colonIdx).trim();
          const val = text.substring(colonIdx + 1).trim();
          if (rawKey && val) {
            const key = normalizeSpecKey(rawKey);
            const cleanVal = parseSpecValue(val);
            if (key && cleanVal.length < 200) {
              specs[key] = cleanVal;
            }
          }
        }
      });

    if (Object.keys(specs).length > 0) break;
  }

  // ── C) Div-based specs (.spec-item, .attribute-item) ──
  const divSelectors = [
    ".spec-item",
    ".attribute-item",
    ".product-spec-item",
    ".specs-item",
  ];

  for (const sel of divSelectors) {
    $(sel).each((_, el) => {
      const text = $(el).text().trim();
      const colonIdx = text.indexOf(":");
      if (colonIdx > 2 && colonIdx < 150) {
        const rawKey = text.substring(0, colonIdx).trim();
        const val = text.substring(colonIdx + 1).trim();
        if (rawKey && val) {
          const key = normalizeSpecKey(rawKey);
          const cleanVal = parseSpecValue(val);
          if (key && cleanVal.length < 200) {
            specs[key] = cleanVal;
          }
        }
      }
    });

    if (Object.keys(specs).length > 0) break;
  }

  // ── D) WooCommerce inline specs (WooCommerce uses <li> inside .product-info) ──
  // Pattern: text-based lists like "• Cỡ ren 27mm" or "- Kết nối: 2 inch"
  const inlineSpecPatterns: [string, RegExp][] = [
    // Kết nối / Ren / Size
    ["connection_size", /c[ổo]?[\s-]*ren[\s:]*([0-9,′"]+\s*(mm|inch|in|")*)/gi],
    ["connection_size", /k[ếe]?[t]*[\s-]*n[ốo]?[i]*[\s:]*([0-9,′"]+\s*(mm|inch|in|")*)/gi],
    ["inlet_diameter", /họng[\s-]*chính[\s:]*([0-9.,]+\s*mm)/gi],
    ["outlet_diameter", /họng[\s-]*phụ[\s:]*([0-9.,]+\s*mm)/gi],
    ["diameter", /đường[\s-]*kính[\s:]*([0-9.,]+\s*mm)/gi],
    // Lưu lượng
    ["flow_rate_m3h", /lưu[\s-]*lượng[\s:]*([0-9.,\s–-]+)\s*m³\/h/gi],
    ["flow_rate", /lưu[\s-]*lượng[\s:]*([0-9.,\s–-]+\s*[Ll])/gi],
    ["flow_rate", /\b([0-9.,\s–-]+\s*m³\/h)\b/gi],
    ["flow_rate", /\b([0-9.,\s–-]+\s*L?\/h)\b/gi],
    // Áp suất
    ["working_pressure", /áp[\s-]*suất[\s:]*([0-9.,\s–-]+\s*bar)/gi],
    ["working_pressure", /áp[\s-]*suất[\s:]*([0-9.,\s–-]+\s*kg\/cm)/gi],
    ["working_pressure_bar", /\b([0-9.,\s–-]+\s*bar)\b/gi],
    // Bán kính
    ["spray_radius", /bán[\s-]*kính[\s:]*([0-9.,\s–-]+\s*m(?!²))/gi],
    // Diện tích
    ["coverage_area", /diện[\s-]*tích[\s:]*([0-9.,\s–-]+\s*m²)/gi],
    // Bảo hành
    ["warranty", /bảo[\s-]*hành[\s:]*([0-9,]+(?:\s*(?:tháng|năm|year)))/gi],
    // Xuất xứ
    ["origin", /xuất[\s-]*xứ[\s:]*([A-Za-zÀ-ỹ]+)/gi],
    // Hãng
    ["brand", /hãng[\s-]*sản[\s-]*xuất[\s:]*([A-Za-zÀ-ỹ0-9]+)/gi],
    ["brand", /\b(BERMAD|DUCAR|DRIPTEC|RIVULIS|AZUD|DEKKO|ARKA)\b/gi],
    // Chất liệu
    ["material", /vật[\s-]*liệu[\s:]*([A-Za-zÀ-ỹ0-9\s,]+?)(?:\n|$)/gi],
    // Voltage
    ["voltage", /điện[\s-]*áp[\s:]*([0-9.,]+\s*(VAC|VDC|V|volt))/gi],
    // Lưu lượng m3/h
    ["flow_rate_m3h", /\b([0-9.,]+\s*–\s*[0-9.,]+\s*m³\/h)\b/gi],
  ];

  const fullText = $("body").text();

  for (const [key, regex] of inlineSpecPatterns) {
    if (!specs[key]) {
      const matches = fullText.match(regex);
      if (matches && matches.length > 0) {
        // Lấy full match thay vì chỉ capture group
        const raw = matches[0];
        // Extract the value portion after the label
        const colonIdx = raw.search(/[:：]/);
        const value = colonIdx >= 0 ? raw.substring(colonIdx + 1).trim() : raw;
        const cleaned = parseSpecValue(value);
        if (cleaned && cleaned.length > 0 && cleaned.length < 100) {
          specs[key] = cleaned;
        }
      }
    }
  }

  return specs;
}

// ─── STEP 3: Bóc tách Hướng dẫn sử dụng ────────────────────────────────────

/**
 * Tìm và trích xuất phần "Hướng dẫn" từ trang sản phẩm WooCommerce
 * Hỗ trợ: Tab content, collapsible sections, heading-based extraction
 */
function extractInstructions(html: string): string {
  if (!html) return "";
  const $ = cheerio.load(html);
  const instructions: string[] = [];

  // ── A) WooCommerce Tabs (standard WooCommerce structure) ──
  const wooTabsSelectors = [
    ".woocommerce-tabs",           // Full tabs container
    ".woocommerce-Tabs-panel",     // Individual tab panels
    ".woocommerce-product-attributes", // Attributes table
  ];

  for (const sel of wooTabsSelectors) {
    $(sel).each((_, el) => {
      const text = $(el).html() || "";
      if (text.length > 100) {
        // Check if it contains instruction keywords
        const lower = $(el).text().toLowerCase();
        if (
          lower.includes("hướng dẫn") ||
          lower.includes("lắp đặt") ||
          lower.includes("cách sử dụng") ||
          lower.includes("lắp") ||
          lower.includes("cài đặt") ||
          sel === ".woocommerce-product-attributes"
        ) {
          instructions.push(sanitizeHtml(text));
        }
      }
    });
  }

  // ── B) WooCommerce Additional Info table ──
  const additionalInfoSelectors = [
    ".shop_attributes",
    ".woocommerce-product-attributes-item",
    "table.shop_attributes",
  ];

  for (const sel of additionalInfoSelectors) {
    $(sel).find("tr").each((_, tr) => {
      const label = $(tr).find("th").text().trim();
      const value = $(tr).find("td").text().trim();
      if (label && value) {
        instructions.push(`• ${label}: ${value}`);
      }
    });
  }

  // ── C) Manual heading-based extraction (text search approach) ──
  // Search all elements for text containing instruction keywords
  const instructionKeywords = ["hướng dẫn", "lắp đặt", "cách lắp", "cách sử dụng", "sử dụng", "cài đặt"];

  $("*").each((_, el) => {
    const tag = el.tagName.toLowerCase();
    // Only check headings and divs/spans
    if (!["h1","h2","h3","h4","h5","h6","div","span","p","li","section"].includes(tag)) return;
    const text = $(el).text().trim();
    if (text.length < 5 || text.length > 200) return;
    const lower = text.toLowerCase();
    for (const kw of instructionKeywords) {
      if (lower.includes(kw)) {
        const parent = $(el).parent();
        const parentHtml = parent.html() || "";
        if (parentHtml.length > 50 && parentHtml.length < 10000) {
          instructions.push(sanitizeHtml(parentHtml));
        }
        break;
      }
    }
  });

  // ── D) Collapsible/Accordion / Tabs panels ──
  const accordionSelectors = [
    ".accordion-content",
    ".collapse-content",
    "[data-tab]",
    "[role='tabpanel']",
    ".panel-content",
  ];

  for (const sel of accordionSelectors) {
    $(sel).each((_, panel) => {
      const text = $(panel).html() || "";
      if (text.length > 100) {
        instructions.push(sanitizeHtml(text));
      }
    });
  }

  // ── E) Footer/product-info sections ──
  const footerSelectors = [
    ".product-info",
    ".product-detail",
    ".entry-content",
    ".post-content",
  ];

  for (const sel of footerSelectors) {
    const content = $(sel).html() || "";
    if (
      content.includes("hướng dẫn") ||
      content.includes("lắp đặt") ||
      content.includes("cách sử dụng")
    ) {
      instructions.push(sanitizeHtml(content));
      break;
    }
  }

  // Ghép và deduplicate
  const combined = instructions.join("\n\n");
  if (combined.length < 50) return "";

  // Loại bỏ trùng lặp (simple dedup)
  const lines = combined.split("\n").filter((l) => l.trim());
  const unique = [...new Map(lines.map((l) => [l.trim().substring(0, 80), l])).values()];
  return unique.join("\n").substring(0, 5000);
}

// ─── STEP 4: Tạo Meta Description SEO ────────────────────────────────────────

/**
 * Tạo meta description tự động, 150-160 ký tự, chứa từ khóa chính
 */
function generateMetaDescription(name: string, description: string): string {
  const keywords = extractSeoKeywords(name, description);
  const keywordStr = keywords.slice(0, 3).join(", ");

  const base = `${name} — Thông số kỹ thuật, giá bán & hướng dẫn lắp đặt. ${keywordStr ? `Phù hợp ${keywordStr}.` : ""} Giao hàng toàn quốc, bảo hành 12 tháng.`;

  // Trim đến ~158 ký tự
  if (base.length <= 160) return base;
  return base.substring(0, 155).replace(/[,.\s]*$/, "") + "...";
}

/**
 * Trích xuất từ khóa SEO từ tên + mô tả
 */
function extractSeoKeywords(name: string, description: string): string[] {
  const text = `${name} ${description}`.toLowerCase();
  const keywords: string[] = [];

  const SEO_KEYWORDS = [
    "béc tưới bù áp", "béc tưới nhỏ giọt", "hệ thống tưới tự động",
    "tưới tiết kiệm nước", "tưới đồi dốc", "tưới sầu riêng", "tưới cà phê",
    "ống PE", "van điện từ", "máy bơm", "bộ lọc", "dây nhỏ giọt",
    "tưới Tây Nguyên", "tưới ĐBSCL", "tưới miền Tây",
    "thiết bị nông nghiệp", "vật tư tưới", "tưới tự động",
  ];

  for (const kw of SEO_KEYWORDS) {
    if (text.includes(kw)) keywords.push(kw);
  }

  return [...new Set(keywords)];
}

// ─── STEP 5: Cào chi tiết sản phẩm (Deep Scraping) ──────────────────────────

async function fetchProductDetail(url: string): Promise<ScrapedProduct | null> {
  console.log(`\n  🌐 Đang cào: ${url}`);

  let data: ReturnType<typeof cheerio.load>;
  try {
    data = cheerio.load(await fetchWithRetry<string>(url));

    // ── A) Tên sản phẩm — WooCommerce standard ──
    const nameSelectors = [
      "h1.product-title",           // Theme custom
      "h1.product-name",            // Theme custom
      ".single-product h1",          // WooCommerce storefront
      ".product-detail h1",
      "h1.entry-title",             // Storefront theme
      "h1.page-title",
      "h1",
    ];
    let name = "";
    for (const sel of nameSelectors) {
      name = $(sel).first().text().trim();
      if (name && name.length > 3) break;
    }

    if (!name) {
      console.log(`  ⚠️  Bỏ qua: không tìm thấy tên sản phẩm`);
      return null;
    }
    console.log(`  ✅ Tên: ${name}`);

    // ── B) Giá — WooCommerce standard ──
    const priceSelectors = [
      "p.price .woocommerce-Price-amount",  // Storefront
      ".woocommerce-Price-amount",           // WooCommerce
      ".product-price .amount",              // Theme custom
      "p.price",                             // WooCommerce basic
      ".price .amount",
      ".product-price",
      ".sum",
      "p.price:not(.product-price *)",      // Skip nested
    ];
    let priceStr = "";
    for (const sel of priceSelectors) {
      priceStr = $(sel).first().text().trim();
      if (priceStr) break;
    }
    const price = parsePrice(priceStr);
    console.log(`  💰 Giá: ${priceStr || "không tìm thấy"}`);

    // ── C) Thông số kỹ thuật (JSON) ──
    let specsHtml = "";
    const specsSelectors = [
      "table.specs",
      "table.technical-table",
      "table.attributes",
      ".specs-section",
      ".technical-section",
      ".product-attributes",
      ".woocommerce-product-attributes",
      ".specifications",
      "[class*='spec']",
      "[class*='attribute']",
    ];

    for (const sel of specsSelectors) {
      const html = $(sel).first().html();
      if (html && html.length > 50) {
        specsHtml = html;
        break;
      }
    }

    const technicalParams = extractTechnicalParams(specsHtml);
    console.log(`  ⚙️  Thông số: ${Object.keys(technicalParams).length} trường`);
    if (Object.keys(technicalParams).length > 0) {
      console.log(`     ${JSON.stringify(technicalParams)}`);
    }

    // ── D) Mô tả sản phẩm — WooCommerce standard ──
    const descSelectors = [
      ".woocommerce-product-details__short-description",  // WooCommerce
      ".short-description",                               // Storefront
      ".product-description",
      ".product-content",
      ".woocommerce-Tabs-panel",                        // Tabs panel
      '[class*="description"]',
      ".entry-content",                                   // WordPress/Storefront
      ".post-content",
    ];
    let description = "";
    for (const sel of descSelectors) {
      const html = $(sel).first().html() || "";
      if (html.length > 30) {
        description = sanitizeHtml(html);
        break;
      }
    }

    // Fallback: lấy toàn bộ content
    if (!description) {
      description = sanitizeHtml(
        $(".post-content, .content-area, main, article").html() || ""
      );
    }
    console.log(`  📝 Mô tả: ${description.length} ký tự`);

    // ── E) Hướng dẫn sử dụng ──
    const instructions = extractInstructions($.html());
    console.log(`  📖 Hướng dẫn: ${instructions.length} ký tự`);

    // ── F) Hình ảnh chính ──
    const imgSelectors = [
      ".product-image img",
      ".woocommerce-product-gallery img",
      ".product-gallery img",
      '[class*="product"] img.attachment',
      "img.attachment-shop_single",
      ".product-detail img",
    ];
    let imageUrl = "";
    for (const sel of imgSelectors) {
      imageUrl =
        $(sel).first().attr("src") ||
        $(sel).first().attr("data-src") ||
        $(sel).first().attr("data-o_src") ||
        "";
      if (imageUrl) break;
    }

    if (!imageUrl) {
      imageUrl = $('meta[property="og:image"]').attr("content") || "";
    }
    console.log(`  🖼️  Ảnh: ${imageUrl ? "có" : "không có"}`);

    // ── G) Gallery ảnh — WooCommerce standard ──
    const galleryUrls: string[] = [];
    const gallerySelectors = [
      ".woocommerce-product-gallery img",  // WooCommerce gallery
      ".product-gallery img",
      ".flex-control-nav img",            // Flexslider nav
      ".flex-viewport img",              // Flexslider main
      "[data-thumb] img",               // WooCommerce thumbnails
      ".gallery img",
      '[class*="gallery"] img',
      ".attachments img",                  // WordPress media gallery
    ];

    for (const sel of gallerySelectors) {
      $(sel).each((_, img) => {
        const src = $(img).attr("src") || $(img).attr("data-src") || "";
        if (src && src !== imageUrl && !galleryUrls.includes(src)) {
          galleryUrls.push(src);
        }
      });
    }
    console.log(`  🖼️  Gallery: ${galleryUrls.length} ảnh`);

    // ── H) Category ──
    let category = "";
    const catSelectors = [
      ".product-category a",
      ".product-categories a",
      ".woocommerce-product-category a",
      '[class*="breadcrumb"] a',
      ".product_cat a",
    ];
    for (const sel of catSelectors) {
      category = $(sel).first().text().trim();
      if (category) break;
    }
    console.log(`  🏷️  Category: ${category || "không có"}`);

    // ── J) Brand Extraction — từ title + specs ──
    let rawBrand = "";
    const brandSelectors = [
      ".brand",
      ".product-brand",
      '[class*="brand"]',
      '[class*="manufacturer"]',
      ".woocommerce-product-attributes-item--pa-brand td",
      "table.shop_attributes td",
    ];
    for (const sel of brandSelectors) {
      const val = $(sel).first().text().trim();
      if (val && val.length > 1 && val.length < 50) {
        rawBrand = val;
        break;
      }
    }
    // Nếu không có trong HTML, extract từ name + description
    if (!rawBrand) {
      const brandFromText = extractBrandSlug(name + " " + description);
      if (brandFromText) {
        rawBrand = brandFromText;
      }
    }
    console.log(`  🏢 Brand: ${rawBrand || "không có"}`);

    // ── K) SKU ──
    let sku = "";
    const skuSelectors = [
      ".sku",
      ".product-sku",
      '[class*="sku"]',
      ".woocommerce-product-attributes-item--sku",
    ];
    for (const sel of skuSelectors) {
      sku = $(sel).first().text().trim();
      if (sku) break;
    }

    return {
      name,
      price,
      description,
      instructions,
      imageUrl,
      galleryUrls,
      category,
      sku,
      sourceUrl: url,
      rawBrand,
      technicalParams,
    };
  } catch (err) {
    console.error(`  ❌ Lỗi cào: ${(err as Error).message}`);
    return null;
  }
}

// ─── STEP 6: Các hàm utility (giữ nguyên từ v1) ────────────────────────────

function toSlug(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100)
  );
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr
    .replace(/[^\d.,]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseInt(cleaned, 10) || 0;
}

function generateSku(name: string, index: number): string {
  const prefix = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 4);
  return `NBA-${prefix}-${String(index).padStart(4, "0")}`;
}

function extractTags(name: string, description: string): {
  cropTags: string[];
  terrainTags: string[];
  geoTags: string[];
} {
  const text = `${name} ${description}`.toLowerCase();
  const cropTags = new Set<string>();
  const terrainTags = new Set<string>();
  const geoTags = new Set<string>();

  const CROP_KEYWORDS: Record<string, string> = {
    "sầu riêng": "sau-rieng", "sau rieng": "sau-rieng",
    "cà phê": "ca-phe", "ca phe": "ca-phe",
    "hồ tiêu": "ho-tieu", "ho tieu": "ho-tieu",
    "cao su": "cao-su", "mắc ca": "mac-ca", "mac ca": "mac-ca",
    "bưởi": "buoi", "xoài": "xoai", "cam": "cam", "chanh": "chanh",
    "thanh long": "thanh-long", "lúa": "lua", "điều": "dieu",
    "bơ": "bo", "nho": "nho",
  };

  const TERRAIN_KEYWORDS: Record<string, string> = {
    "bù áp": "bu-ap", "bu ap": "bu-ap",
    "đồi dốc": "doi-doc", "doi doc": "doi-doc",
    "đồi": "doi", "dốc": "doc",
    "đồng bằng": "dong-bang", "dong bang": "dong-bang",
    "cao nguyên": "cao-nguyen", "cao nguyen": "cao-nguyen",
  };

  const GEO_KEYWORDS: Record<string, string> = {
    "tây nguyên": "Tây Nguyên", "tay nguyen": "Tây Nguyên",
    "đắk lắk": "Đắk Lắk", "lâm đồng": "Lâm Đồng",
    "gia lai": "Gia Lai", "kon tum": "Kon Tum",
    "đông nam bộ": "Đông Nam Bộ", "dong nam bo": "Đông Nam Bộ",
    "đồng nai": "Đồng Nai", "bình phước": "Bình Phước",
    "đbscl": "ĐBSCL", "đồng bằng sông cửu long": "ĐBSCL",
    "miền tây": "ĐBSCL", "cần thơ": "Cần Thơ",
    "tiền giang": "Tiền Giang", "bến tre": "Bến Tre",
  };

  for (const [keyword, tag] of Object.entries(CROP_KEYWORDS)) {
    if (text.includes(keyword)) cropTags.add(tag);
  }
  for (const [keyword, tag] of Object.entries(TERRAIN_KEYWORDS)) {
    if (text.includes(keyword)) terrainTags.add(tag);
  }
  for (const [keyword, region] of Object.entries(GEO_KEYWORDS)) {
    if (text.includes(keyword)) geoTags.add(region);
  }

  return {
    cropTags: [...cropTags],
    terrainTags: [...terrainTags],
    geoTags: [...geoTags],
  };
}

// ─── Supabase Storage Client (lazy singleton) ────────────────────────────────────
function getSupabaseStorage() {
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!sbUrl || !sbKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env"
    );
  }
  return createClient(sbUrl, sbKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Download remote image → upload lên Supabase Storage
 * Trả về public URL hoặc empty string nếu fail.
 * KHÔNG ghi vào filesystem local — tương thích Vercel/serverless.
 */
async function downloadImage(imageUrl: string, slug: string, index = 0): Promise<string> {
  if (!imageUrl) return "";

  const extMatch = imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
  const filename =
    index > 0
      ? `products/${slug}-${index}-${Date.now()}.${ext}`
      : `products/${slug}-${Date.now()}.${ext}`;

  try {
    // 1. Fetch ảnh từ web nguồn (retry 429/5xx)
    const buffer = await fetchWithRetry<ArrayBuffer>(imageUrl, {
      headers: { Referer: SOURCE_URL },
      responseType: "arraybuffer",
    });

    // 2. Upload lên Supabase Storage bucket "images"
    const sb = getSupabaseStorage();
    const { data: uploadData, error: uploadErr } = await sb.storage
      .from("images")
      .upload(filename, buffer, {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: true, // ghi đè nếu đã tồn tại
      });

    if (uploadErr) {
      console.warn(`     ⚠️  Supabase upload lỗi: ${uploadErr.message}`);
      return "";
    }

    // 3. Lấy public URL
    const { data: urlData } = sb.storage
      .from("images")
      .getPublicUrl(uploadData.path);

    console.log(`     🖼️  Đã upload: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (err) {
    console.warn(`     ⚠️  Không tải được ảnh: ${(err as Error).message}`);
    return "";
  }
}

// ─── STEP 7: Normalize sản phẩm ──────────────────────────────────────────────

async function normalizeProduct(
  scraped: ScrapedProduct,
  index: number
): Promise<NormalizedProduct> {
  const slug = toSlug(scraped.name) || `product-${index + 1}`;
  const sku = scraped.sku || generateSku(scraped.name, index + 1);
  const { cropTags, terrainTags, geoTags } = extractTags(scraped.name, scraped.description);

  // ── Category Mapping — Priority: URL path > breadcrumb/title → CATEGORY_MAP ──
  const fromUrl = extractCategoryFromUrl(scraped.sourceUrl);
  const fromName = extractCategoryFromName(scraped.name);
  const rawCategory = scraped.category?.trim() || "";
  const fromBreadcrumb = extractCategoryFromName(rawCategory);

  // Priority: URL > Breadcrumb > Name > fallback
  const categorySlug = fromUrl || fromBreadcrumb || fromName || "san-pham-khac";
  const categoryName = getCategoryName(categorySlug);

  // ── Brand Extraction ──
  // Resolve rawBrand (string from HTML/specs) → brandSlug in DB
  let brandSlug: string | null = null;
  if (scraped.rawBrand) {
    const rawLower = scraped.rawBrand.toLowerCase().trim();
    // rawBrand có thể là tên brand gốc hoặc đã là slug
    if (BRAND_MAP[rawLower]) {
      brandSlug = BRAND_MAP[rawLower];
    } else {
      brandSlug = extractBrandSlug(scraped.rawBrand);
    }
  }
  // Fallback: extract từ name + description
  if (!brandSlug) {
    brandSlug = extractBrandSlug(scraped.name + " " + scraped.description);
  }
  console.log(`     🏢 Brand: ${brandSlug || "không có"}`);

  // Download main image
  const localImagePath = scraped.imageUrl
    ? await downloadImage(scraped.imageUrl, slug, 0)
    : "";

  // Download gallery
  const galleryLocalPaths: string[] = [];
  for (let i = 0; i < scraped.galleryUrls.length; i++) {
    const galPath = await downloadImage(scraped.galleryUrls[i], slug, i + 1);
    if (galPath) galleryLocalPaths.push(galPath);
  }

  // SEO meta description
  const metaDescription = generateMetaDescription(scraped.name, scraped.description);

  return {
    name: scraped.name,
    slug,
    description: scraped.description,
    instructions: scraped.instructions,
    metaDescription,
    imageUrl: scraped.imageUrl,
    localImagePath,
    galleryLocalPaths,
    sku,
    basePrice: scraped.price,
    categorySlug,
    categoryName,
    brandSlug,
    cropTags,
    terrainTags,
    geoTags,
    specifications: scraped.technicalParams,
    features: {
      crop_tags: cropTags,
      terrain_tags: terrainTags,
      geo_tags: geoTags,
      source_url: SOURCE_URL,
      scraped_at: new Date().toISOString(),
    },
    sourceUrl: `https://nhabeagri.com`,
    scrapedAt: new Date().toISOString(),
  };
}

// ─── STEP 8: Upsert vào Prisma DB ─────────────────────────────────────────────

async function upsertProduct(
  product: NormalizedProduct,
  index: number,
  total: number,
  syncHash?: string,
): Promise<void> {
  process.stdout.write(
    `\n  📦 [${index}/${total}] ${product.name.substring(0, 40)}... `
  );

  // ── SINGLE TRANSACTION: Category → Brand → Product → Tags ───────────────────
  // Tất cả 4 bước rollback hoàn toàn nếu bất kỳ lệnh nào fail.
  // orphan record: khi category OK + brand OK nhưng product fail → cả 3 được revert.
  await prisma.$transaction(async (tx) => {
    // PHASE 1: Upsert Category — fail-fast
    const categoryId = await tx.categories
      .upsert({
        where: { slug: product.categorySlug },
        update: {},
        create: { name: product.categoryName, slug: product.categorySlug },
      })
      .catch((err) => {
        process.stdout.write(
          `\n  ❌ LỖI CATEGORY [${product.categorySlug}]: ${err.message}`
        );
        throw err; // Rethrow — transaction sẽ rollback
      })
      .then((cat) => cat.id);

    // PHASE 2: Upsert Brand (nullable) — graceful null
    let brandId: string | null = null;
    if (product.brandSlug) {
      const brand = await tx.brand
        .upsert({
          where: { slug: product.brandSlug },
          update: {},
          create: {
            name: product.brandSlug
              .split("-")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            slug: product.brandSlug,
          },
        })
        .catch((err) => {
          process.stdout.write(
            `\n  ⚠️ Brand [${product.brandSlug}] lỗi: ${err.message}`
          );
          return null; // Graceful — tiếp tục với brandId = null
        });
      if (brand) brandId = brand.id;
    }

    // PHASE 3: Upsert Product
    await tx.products
      .upsert({
        where: { slug: product.slug },
        update: {
          name: product.name,
          description: product.description,
          image_url: product.localImagePath || null,
          gallery_images: product.galleryLocalPaths,
          base_price: product.basePrice,
          sku: product.sku,
          specifications: product.specifications as object,
          brand_id: brandId,
          brand: product.brandSlug || null,
          features: {
            ...product.features,
            instructions: product.instructions,
            meta_description: product.metaDescription,
          } as object,
          updated_at: new Date(),
          source_url: product.sourceUrl,
          sync_hash: syncHash ?? null,
          last_synced_at: syncHash ? new Date() : undefined,
        },
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          image_url: product.localImagePath || null,
          gallery_images: product.galleryLocalPaths,
          base_price: product.basePrice,
          sku: product.sku,
          specifications: product.specifications as object,
          brand_id: brandId,
          brand: product.brandSlug || null,
          features: {
            crop_tags: product.cropTags,
            terrain_tags: product.terrainTags,
            geo_tags: product.geoTags,
            instructions: product.instructions,
            meta_description: product.metaDescription,
            source_url: product.sourceUrl,
            scraped_at: product.scrapedAt,
          } as object,
          is_active: true,
          shipping_info: {},
          variants: [],
          in_stock: true,
          stock_quantity: 0,
          pdf_url: null,
          category_id: categoryId,
          source_url: product.sourceUrl,
          sync_hash: syncHash ?? null,
          last_synced_at: syncHash ? new Date() : undefined,
        },
      })
      .catch((err) => {
        process.stdout.write(`\n  ❌ LỖI PRODUCT: ${err.message}`);
        throw err; // Rethrow — transaction sẽ rollback
      });

    // PHASE 4: Upsert crop_tags
    for (const cropSlug of product.cropTags) {
      await tx.crop_tags.upsert({
        where: { slug: cropSlug },
        update: {},
        create: {
          name: cropSlug
            .split("-")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          slug: cropSlug,
        },
      });
    }

    // PHASE 5: Upsert terrain_tags
    for (const terrainSlug of product.terrainTags) {
      await tx.terrain_tags.upsert({
        where: { slug: terrainSlug },
        update: {},
        create: {
          name: terrainSlug
            .split("-")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          slug: terrainSlug,
        },
      });
    }
  }).catch((err) => {
    // Transaction failed — outer loop sẽ catch và count
    process.stdout.write(`\n  ❌ TRANSACTION FAILED: ${err.message}`);
    throw err;
  });

  process.stdout.write("✅ OK");
}

// ─── STEP 9: Lấy danh sách link ─────────────────────────────────────────────

async function fetchProductLinks(baseUrl: string): Promise<string[]> {
  console.log(`\n🌐 Lấy danh sách từ: ${baseUrl}`);
  const links: string[] = [];

  try {
    const html = await fetchWithRetry<string>(baseUrl);

    const $ = cheerio.load(html, { decodeEntities: false });
    const selectors = [
      'a[href*="/san-pham/"]',
      'a[href*="/product/"]',
      ".product-item a",
      ".product-card a",
      ".woocommerce-loop-product__link",
      '[class*="product"] a[href]',
    ];

    for (const sel of selectors) {
      $(sel).each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          // Chỉ lấy link sản phẩm (chứa /product/), loại bỏ category links
          if (!href.includes("/product/") && !href.includes("/san-pham/")) return;
          const fullUrl = href.startsWith("http") ? href : `${SOURCE_URL}${href}`;
          if (!links.includes(fullUrl)) links.push(fullUrl);
        }
      });
      if (links.length > 0) {
        console.log(`  ✅ Tìm thấy ${links.length} link`);
        break;
      }
    }
  } catch (err) {
    console.error(`  ❌ Lỗi: ${(err as Error).message}`);
  }

  return [...new Set(links)];
}

// ─── PREVIEW MODE: Test 1-2 URL ──────────────────────────────────────────────

async function previewUrl(url: string): Promise<void> {
  console.log("\n" + "═".repeat(60));
  console.log("  🔍 CHẾ ĐỘ PREVIEW — Test bóc tách 1 URL");
  console.log("═".repeat(60));
  console.log(`\n  URL: ${url}\n`);

  const scraped = await fetchProductDetail(url);

  if (!scraped) {
    console.error("\n  ❌ Không lấy được dữ liệu từ URL này");
    return;
  }

  console.log("\n" + "─".repeat(60));
  console.log("  📋 KẾT QUẢ BÓC TÁCH");
  console.log("─".repeat(60));

  console.log(`\n  1️⃣  TÊN SẢN PHẨM:`);
  console.log(`      "${scraped.name}"`);

  console.log(`\n  2️⃣  GIÁ:`);
  console.log(`      ${scraped.price.toLocaleString("vi-VN")} đ`);

  console.log(`\n  3️⃣  THÔNG SỐ KỸ THUẬT (đầu vào máy tính thủy lực):`);
  const specs = scraped.technicalParams;
  if (Object.keys(specs).length > 0) {
    for (const [key, value] of Object.entries(specs)) {
      console.log(`      • ${key}: ${value}`);
    }
  } else {
    console.log("      ⚠️  Không tìm thấy bảng thông số. Cần kiểm tra lại selector!");
  }

  console.log(`\n  4️⃣  MÔ TẢ (${scraped.description.length} ký tự):`);
  const descPreview = scraped.description.substring(0, 200);
  console.log(`      ${descPreview}${descPreview.length < scraped.description.length ? "..." : ""}`);

  console.log(`\n  5️⃣  HƯỚNG DẪN SỬ DỤNG (${scraped.instructions.length} ký tự):`);
  if (scraped.instructions.length > 0) {
    const instPreview = scraped.instructions.substring(0, 200);
    console.log(`      ${instPreview}${scraped.instructions.length > 200 ? "..." : ""}`);
  } else {
    console.log("      ⚠️  Không tìm thấy phần hướng dẫn");
  }

  console.log(`\n  6️⃣  HÌNH ẢNH:`);
  console.log(`      Chính: ${scraped.imageUrl ? "✅ Có" : "❌ Không"}`);
  console.log(`      Gallery: ${scraped.galleryUrls.length} ảnh`);

  console.log(`\n  7️⃣  SLUG SEO (tự động tạo):`);
  const slug = toSlug(scraped.name);
  console.log(`      ${slug}`);

  console.log(`\n  8️⃣  META DESCRIPTION:`);
  const meta = generateMetaDescription(scraped.name, scraped.description);
  console.log(`      ${meta.substring(0, 120)}...`);

  const { cropTags, terrainTags, geoTags } = extractTags(scraped.name, scraped.description);
  console.log(`\n  9️⃣  TAGS TỰ ĐỘNG:`);
  console.log(`      🌱 Crop: ${cropTags.join(", ") || "không có"}`);
  console.log(`      🏔️  Terrain: ${terrainTags.join(", ") || "không có"}`);
  console.log(`      📍 Geo: ${geoTags.join(", ") || "không có"}`);

  console.log("\n" + "─".repeat(60));
  console.log("  ✅ Preview hoàn tất — Dữ liệu sẵn sàng để sync");
  console.log("─".repeat(60));
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const startTime = Date.now();

  console.log("═══════════════════════════════════════════════════");
  console.log("  🌱 Nhà Bè Agri — Sync Sản Phẩm v2 (Deep Scraping)");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  📡 Nguồn: ${SOURCE_URL}`);
  const modeLabel = args.mode === "preview" ? "PREVIEW (không lưu DB)" : args.mode === "map5" ? "MAP5 (preview mapping)" : "BATCH";
  console.log(`  🔧 Mode: ${modeLabel}`);
  if (args.singleUrl) {
    console.log(`  🎯 URL test: ${args.singleUrl}`);
  }
  console.log("───────────────────────────────────────────────────");

  // ── MAP5 MODE: Preview mapping 5 sản phẩm đầu tiên ──
  if (args.mode === "map5") {
    console.log("\n📋 BƯỚC 0: Tìm danh sách sản phẩm để preview...");
    const categoryUrls = [
      `${SOURCE_URL}/danh-muc/tuoi-phun-mua/bec-phun-mua/`,
      `${SOURCE_URL}/danh-muc/tuoi-phun-mua/`,
      `${SOURCE_URL}/product`,
    ];
    let allLinks: string[] = [];
    for (const catUrl of categoryUrls) {
      const links = await fetchProductLinks(catUrl);
      allLinks = [...new Set([...allLinks, ...links])];
      if (allLinks.length >= 5) break;
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
    if (allLinks.length === 0) {
      console.log("  ⚠️  Không tìm thấy sản phẩm nào!");
    } else {
      await previewMapping(allLinks);
    }
    await prisma.$disconnect();
    return;
  }

  // ── PREVIEW MODE ──
  if (args.mode === "preview") {
    if (args.singleUrl) {
      await previewUrl(args.singleUrl);
    } else {
      console.log("\n  ⚠️  Vui lòng cung cấp URL:");
      console.log('     npx tsx scripts/sync-products.ts --url "https://..."');
      console.log('     npx tsx scripts/sync-products.ts --preview --url="https://..."');
    }
    await prisma.$disconnect();
    return;
  }

  // ── BATCH MODE ──
  try {
    await prisma.$connect();
    console.log("  ✅ Kết nối Prisma DB thành công\n");
  } catch (err) {
    console.error("  ❌ Không kết nối được DB:", (err as Error).message);
    process.exit(1);
  }

  // 1. Cào danh sách link
  console.log("\n📋 BƯỚC 1: Lấy danh sách sản phẩm");
  console.log("─".repeat(50));

  const categoryUrls = [
    `${SOURCE_URL}/san-pham`,
    `${SOURCE_URL}/product`,
    `${SOURCE_URL}/cua-hang`,
  ];

  let allLinks: string[] = [];
  for (const catUrl of categoryUrls) {
    const links = await fetchProductLinks(catUrl);
    allLinks = [...new Set([...allLinks, ...links])];
    if (allLinks.length > 0) break;
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  if (allLinks.length === 0) {
    console.log("  ⚠️  Không tìm thấy link. Thử preview URL trực tiếp:");
    console.log('     npx tsx scripts/sync-products.ts --url "https://nhabeagri.com/san-pham/..."');
    await prisma.$disconnect();
    return;
  }

  const limitedLinks = allLinks.slice(0, PAGE_LIMIT > 0 ? PAGE_LIMIT * 20 : undefined);
  console.log(`  📊 Tổng cần sync: ${limitedLinks.length} sản phẩm`);

  // ── INCREMENTAL SYNC MODE ───────────────────────────────────────────────
  if (args.mode === "incremental") {
    console.log("\n  🔄 Mode: INCREMENTAL — chỉ sync sản phẩm mới / thay đổi");
    console.log("─".repeat(50));

    // Load existing products from DB
    const existing = await prisma.products.findMany({
      select: { slug: true, source_url: true, sync_hash: true, last_synced_at: true, name: true },
    });
    const existingBySlug = new Map(existing.map((p) => [p.slug, p]));

    // Compute hash of normalized product content for change detection
    async function computeSyncHash(p: NormalizedProduct): Promise<string> {
      const { createHash } = await import("crypto");
      const content = JSON.stringify({
        name: p.name,
        description: p.description,
        price: p.basePrice,
        specs: p.specifications,
      });
      return createHash("sha256").update(content).digest("hex").slice(0, 32);
    }

    // Stale threshold: re-scrape products not synced in the last N days
    const STALE_DAYS = 7;
    const staleThreshold = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);

    // Classify products: new | stale | source_changed | hash_changed | unchanged
    const toScrape: { url: string; slug: string; reason: string }[] = [];
    const now = Date.now();

    for (const url of limitedLinks) {
      const slugMatch = url.match(/\/san-pham\/([^/?#]+)/);
      if (!slugMatch) continue;
      const slug = slugMatch[1];
      const existingProduct = existingBySlug.get(slug);

      if (!existingProduct) {
        toScrape.push({ url, slug, reason: "🆕 sản phẩm mới" });
        existingBySlug.delete(slug); // remove from map to avoid duplicate
        continue;
      }

      // Existing product — check if stale (not synced in N days)
      if (existingProduct.last_synced_at) {
        const lastSync = new Date(existingProduct.last_synced_at).getTime();
        const daysSince = (now - lastSync) / (1000 * 60 * 60 * 24);
        if (daysSince >= STALE_DAYS) {
          toScrape.push({ url, slug, reason: `📅 stale (${Math.round(daysSince)}d)` });
          existingBySlug.delete(slug);
          continue;
        }
      }

      // Source URL changed → likely moved to new page
      if (existingProduct.source_url && existingProduct.source_url !== url) {
        toScrape.push({ url, slug, reason: "🔗 URL thay đổi" });
        existingBySlug.delete(slug);
        continue;
      }

      // Still fresh and unchanged — will be checked post-scrape via hash
      existingBySlug.delete(slug);
    }

    // Remaining in map = products in DB but not found in current page list
    // → mark as potentially removed (log only, don't delete)
    if (existingBySlug.size > 0) {
      console.log(`\n  ⚠️  ${existingBySlug.size} sản phẩm trong DB không còn trên trang:`);
      for (const [slug, p] of existingBySlug) {
        console.log(`     - ${p.name} (${slug})`);
      }
    }

    if (toScrape.length === 0) {
      console.log("\n  ✅ Tất cả sản phẩm đã up-to-date. Không có gì để sync.");
      await prisma.$disconnect();
      return;
    }

    console.log(`\n  📊 Cần scrape: ${toScrape.length} sản phẩm`);
    for (const item of toScrape) {
      console.log(`     ${item.reason} ${item.slug}`);
    }

    // Scrape + upsert
    const normalizedProducts: NormalizedProduct[] = [];
    for (let i = 0; i < toScrape.length; i++) {
      const { url, slug } = toScrape[i];
      process.stdout.write(`\n  [${i + 1}/${toScrape.length}] ${url}`);

      const scraped = await fetchProductDetail(url);
      if (!scraped) {
        process.stdout.write(" — ⚠️ scrape thất bại\n");
        continue;
      }

      const normalized = await normalizeProduct(scraped, i);
      const hash = await computeSyncHash(normalized);

      // Hash unchanged → content really didn't change, skip upsert
      const dbProduct = existing.find((p) => p.slug === slug);
      if (dbProduct && dbProduct.sync_hash === hash) {
        process.stdout.write(" = không đổi, bỏ qua");
        // Update last_synced_at anyway (touch)
        await prisma.products.updateMany({
          where: { slug },
          data: { last_synced_at: new Date(), updated_at: new Date() },
        }).catch(() => {});
        continue;
      }

      normalizedProducts.push(normalized);

      if (i < toScrape.length - 1) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    console.log(`\n\n  📦 Sản phẩm cần update: ${normalizedProducts.length}`);

    // Upsert the changed/new products
    let successCount = 0;
    for (let i = 0; i < normalizedProducts.length; i++) {
      const hash = await computeSyncHash(normalizedProducts[i]);
      try {
        await upsertProduct(normalizedProducts[i], i + 1, normalizedProducts.length, hash);
        successCount++;
      } catch (err) {
        console.error(`\n  ❌ Upsert thất bại [${normalizedProducts[i].slug}]:`, (err as Error).message);
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log("\n\n" + "═".repeat(60));
    console.log("  📊 KẾT QUẢ INCREMENTAL SYNC");
    console.log("═".repeat(60));
    console.log(`  ✅ Update: ${successCount}/${normalizedProducts.length}`);
    console.log(`  ⏱️  Thời gian: ${elapsed}s`);
    console.log("═".repeat(60));

    await prisma.$disconnect();
    return;
  }

  // ── FULL BATCH MODE ────────────────────────────────────────────────────
  console.log("\n  📋 Mode: FULL SYNC (scrape lại toàn bộ)");

  // 2. Cào chi tiết + normalize
  console.log("\n📋 BƯỚC 2: Cào chi tiết & bóc tách thông số");
  console.log("─".repeat(50));

  const normalizedProducts: NormalizedProduct[] = [];

  for (let i = 0; i < limitedLinks.length; i++) {
    const url = limitedLinks[i];
    process.stdout.write(`\n  [${i + 1}/${limitedLinks.length}] `);

    const scraped = await fetchProductDetail(url);
    if (!scraped) continue;

    const normalized = await normalizeProduct(scraped, i);
    normalizedProducts.push(normalized);

    if (i < limitedLinks.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n  ✅ Đã xử lý: ${normalizedProducts.length} sản phẩm`);

  if (normalizedProducts.length === 0) {
    console.log("\n  ⚠️  Không có sản phẩm nào được cào.");
    console.log("     Thử chạy preview trước:");
    console.log('     npx tsx scripts/sync-products.ts --url "https://nhabeagri.com/..."');
    await prisma.$disconnect();
    return;
  }

  // 3. Upsert vào DB
  console.log("\n📋 BƯỚC 3: Upsert vào Database");
  console.log("─".repeat(50));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < normalizedProducts.length; i++) {
    const { createHash } = await import("crypto");
    const p = normalizedProducts[i];
    const content = JSON.stringify({ name: p.name, description: p.description, price: p.basePrice, specs: p.specifications });
    const hash = createHash("sha256").update(content).digest("hex").slice(0, 32);

    try {
      await upsertProduct(normalizedProducts[i], i + 1, normalizedProducts.length, hash);
      successCount++;
    } catch {
      errorCount++;
    }
  }

  // ── Summary ──
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n\n" + "═".repeat(60));
  console.log("  📊 KẾT QUẢ SYNC v2");
  console.log("═".repeat(60));
  console.log(`  ✅ Thành công: ${successCount}/${normalizedProducts.length}`);
  console.log(`  ❌ Lỗi: ${errorCount}`);
  console.log(`  ⏱️  Thời gian: ${elapsed}s`);

  // Stats thông số kỹ thuật
  const withSpecs = normalizedProducts.filter((p) => Object.keys(p.specifications).length > 0).length;
  const withInstructions = normalizedProducts.filter((p) => p.instructions.length > 0).length;
  console.log(`  ⚙️  Có thông số kỹ thuật: ${withSpecs}/${normalizedProducts.length}`);
  console.log(`  📖 Có hướng dẫn sử dụng: ${withInstructions}/${normalizedProducts.length}`);
  console.log("───────────────────────────────────────────────────");
  console.log("  📁 Ảnh: /public/images/products/");
  console.log("  🏷️  Tags: crop_tags, terrain_tags, geo_tags");
  console.log("═".repeat(60));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n❌ Script crash:", err);
  process.exit(1);
});
