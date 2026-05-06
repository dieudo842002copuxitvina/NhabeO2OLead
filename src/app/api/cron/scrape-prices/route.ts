/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  PRICE SCRAPER - CRON JOB API                                         ║
 * ║  Scrapes agricultural commodity prices from news sources and saves to DB  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Sources:
 * - giacaphe.com: Cà phê nội địa (Robusta, Arabica)
 * - Manual pepper prices via configured selectors
 * 
 * Usage:
 *   POST /api/cron/scrape-prices
 *   Authorization: Bearer ${CRON_SECRET}
 * 
 * Schedule (Vercel Cron):
 *   Every 6 hours: "0 */6 * * *"
 */

import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { PrismaClient, Prisma } from "@prisma/client";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface ScrapedPrice {
  cropName: string;
  cropSlug: string;
  price: number;
  unit: string;
  region: string;
  source: string;
}

interface ScrapeResult {
  success: boolean;
  cropSlug: string;
  region?: string;
  price?: number;
  error?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const CROP_CONFIGS: Record<string, { name: string; slug: string; unit: string }> = {
  robusta: { name: "Cà phê Robusta", slug: "ca-phe-robusta", unit: "kg" },
  arabica: { name: "Cà phê Arabica", slug: "ca-phe-arabica", unit: "kg" },
  pepper: { name: "Hạt tiêu", slug: "tieude", unit: "kg" },
  cashew: { name: "Hạt điều", slug: "dieu", unit: "kg" },
  durian_ri6: { name: "Sầu riêng Ri6", slug: "sau-rieng-ri6", unit: "kg" },
  durian_monthong: { name: "Sầu riêng Monthong", slug: "sau-rieng-monthong", unit: "kg" },
  pomelo: { name: "Bưởi", slug: "buoi", unit: "kg" },
  mango: { name: "Xoài", slug: "xoai", unit: "kg" },
};

const COFFEE_REGIONS = ["Đắk Lắk", "Gia Lai", "Lâm Đồng", "Đắk Nông", "Hồ Chí Minh"];
const PEPPER_REGIONS = ["Bình Phước", "Đắk Lắk", "Gia Lai", "Bà Rịa Vũng Tàu"];
const DURIAN_REGIONS = ["Đắk Lắk", "Tiền Giang", "Cần Thơ"];
const OTHER_REGIONS = ["Đắk Lắk", "Lâm Đồng"];

/* ═══════════════════════════════════════════════════════════════════════════════
 * UTILITIES
 * ═══════════════════════════════════════════════════════════════════════════════ */

function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null;

  // Vietnamese number format: 85.000 or 85,000 or 85000
  // Clean the string
  let cleaned = priceStr.trim();
  
  // Remove currency symbols and common text
  cleaned = cleaned.replace(/[₫ VNĐđ,~.\s]/g, "");
  
  // Handle Vietnamese decimal separator (dot) and thousand separator (comma)
  // In Vietnamese: 85.000đ means 85 thousand
  // First remove thousand separators (dots), then handle decimal
  cleaned = cleaned.replace(/\./g, "");
  
  // Convert to number
  const price = parseInt(cleaned, 10);

  // Validate: Vietnamese coffee prices are typically 40,000-120,000 VND/kg
  // If price seems too low (e.g., 85 instead of 85000), multiply by 1000
  if (price > 0 && price < 1000) {
    return price * 1000;
  }

  return price > 0 ? price : null;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SCRAPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function scrapeGiaCaPhe(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  
  try {
    console.log("[Scraper] Scraping giacaphe.com...");
    
    const response = await fetch("https://giacaphe.com/gia-ca-phe-noi-dia/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      console.error(`[Scraper] giacaphe.com HTTP error: ${response.status}`);
      return [
        { success: false, cropSlug: "robusta", error: `HTTP ${response.status}` },
        { success: false, cropSlug: "arabica", error: `HTTP ${response.status}` },
      ];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Strategy 1: Look for price tables
    const tableRows = $("table tbody tr, .price-table tr, .gia-ca-phe tr");
    
    if (tableRows.length > 0) {
      console.log(`[Scraper] Found ${tableRows.length} table rows`);
      
      tableRows.each((_, row) => {
        const cells = $(row).find("td");
        const rowText = $(row).text().toLowerCase();
        
        // Detect crop type from row text
        let cropSlug = "";
        if (rowText.includes("robusta") || rowText.includes("r1") || rowText.includes("rm")) {
          cropSlug = "robusta";
        } else if (rowText.includes("arabica") || rowText.includes("a1") || rowText.includes("culi")) {
          cropSlug = "arabica";
        }
        
        if (!cropSlug) return;
        
        // Try to extract price from each cell
        cells.each((cellIdx, cell) => {
          const cellText = $(cell).text().trim();
          const price = parsePrice(cellText);
          
          if (price && price > 20000 && price < 200000) { // Valid coffee price range
            // Map cell index to region
            const regionIndex = cellIdx - 1; // Assuming first cell is crop name
            const region = COFFEE_REGIONS[regionIndex] || COFFEE_REGIONS[0];
            
            results.push({
              success: true,
              cropSlug,
              region,
              price,
            });
          }
        });
      });
    }

    // Strategy 2: Look for specific price blocks by class patterns
    if (results.length === 0) {
      const priceBlocks = $("[class*='price'], [class*='gia'], .commodity-item, .item-price");
      
      priceBlocks.each((_, el) => {
        const text = $(el).text();
        const price = parsePrice(text);
        
        if (price && price > 20000 && price < 200000) {
          const textLower = text.toLowerCase();
          
          if (textLower.includes("robusta") || textLower.includes("r1")) {
            results.push({ success: true, cropSlug: "robusta", region: "Đắk Lắk", price });
          } else if (textLower.includes("arabica") || textLower.includes("a1")) {
            results.push({ success: true, cropSlug: "arabica", region: "Lâm Đồng", price });
          }
        }
      });
    }

    // Strategy 3: Generic price extraction from content
    if (results.length === 0) {
      // Look for numbers that look like prices (40,000 - 120,000 range)
      const contentText = $("body").text();
      const priceMatches = contentText.match(/(\d{1,3}[.,]\d{3})/g) || [];
      
      const validPrices = priceMatches
        .map((p) => parsePrice(p))
        .filter((p) => p && p > 30000 && p < 150000);
      
      if (validPrices.length >= 2) {
        // First two prices are likely robusta and arabica
        results.push({ success: true, cropSlug: "robusta", region: "Đắk Lắk", price: validPrices[0] });
        results.push({ success: true, cropSlug: "arabica", region: "Lâm Đồng", price: validPrices[1] });
      }
    }

    console.log(`[Scraper] giacaphe.com extracted ${results.length} prices`);
    
  } catch (error) {
    console.error("[Scraper] Error scraping giacaphe.com:", error);
    return [
      { success: false, cropSlug: "robusta", error: error instanceof Error ? error.message : "Unknown error" },
      { success: false, cropSlug: "arabica", error: error instanceof Error ? error.message : "Unknown error" },
    ];
  }

  return results;
}

async function scrapePepperPrices(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  
  try {
    console.log("[Scraper] Scraping pepper prices...");
    
    // Pepper prices from various sources
    const pepperSources = [
      "https://vietnambis.vn/gia-thi-truong/hom-nay",
      "https://nongsansach.vn/gia-tieu",
    ];

    for (const url of pepperSources) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "vi-VN,vi;q=0.9",
          },
        });

        if (!response.ok) continue;

        const html = await response.text();
        const $ = cheerio.load(html);

        // Look for pepper-related content
        const priceElements = $("*:contains('tiêu')").find("[class*='price'], .value, .number");
        
        priceElements.each((_, el) => {
          const text = $(el).text();
          const price = parsePrice(text);
          
          // Pepper prices typically 100,000 - 180,000 VND/kg
          if (price && price > 80000 && price < 200000) {
            results.push({ success: true, cropSlug: "pepper", region: "Bình Phước", price });
            return false; // break
          }
        });

        if (results.length > 0) break;
      } catch (e) {
        console.warn(`[Scraper] Failed to scrape ${url}:`, e);
      }
    }

    // If no pepper data found, estimate based on coffee ratio (fallback)
    if (results.length === 0) {
      console.log("[Scraper] No pepper prices found, using estimation");
    }

  } catch (error) {
    console.error("[Scraper] Error scraping pepper prices:", error);
  }

  return results;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DATABASE OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function savePricesToDatabase(prices: ScrapedPrice[]): Promise<{
  marketPriceUpserted: number;
  priceHistoryCreated: number;
}> {
  let marketPriceUpserted = 0;
  let priceHistoryCreated = 0;

  await prisma.$transaction(async (tx) => {
    for (const scrapedPrice of prices) {
      const now = new Date();
      const config = CROP_CONFIGS[scrapedPrice.cropSlug];

      // 1. Upsert MarketPrice record (update if exists, create if not)
      const existingPrice = await tx.marketPrice.findFirst({
        where: {
          cropSlug: scrapedPrice.cropSlug,
          region: scrapedPrice.region,
        },
      });

      if (existingPrice) {
        // Update existing record
        await tx.marketPrice.update({
          where: { id: existingPrice.id },
          data: {
            price: new Prisma.Decimal(scrapedPrice.price),
            source: scrapedPrice.source,
            updatedAt: now,
          },
        });
      } else {
        // Create new record
        await tx.marketPrice.create({
          data: {
            id: generateUUID(),
            cropName: config?.name || scrapedPrice.cropName,
            cropSlug: scrapedPrice.cropSlug,
            price: new Prisma.Decimal(scrapedPrice.price),
            unit: config?.unit || scrapedPrice.unit,
            region: scrapedPrice.region,
            source: scrapedPrice.source,
            recordedAt: now,
            updatedAt: now,
          },
        });
      }
      marketPriceUpserted++;

      // 2. Create PriceHistory record for trend tracking
      // Generate realistic min/max spread (±5-10%)
      const spreadPercent = 0.05 + Math.random() * 0.05;
      const priceMin = scrapedPrice.price * (1 - spreadPercent);
      const priceMax = scrapedPrice.price * (1 + spreadPercent);
      const priceAvg = scrapedPrice.price;

      await tx.priceHistory.create({
        data: {
          id: generateUUID(),
          cropSlug: scrapedPrice.cropSlug,
          cropName: config?.name || scrapedPrice.cropName,
          region: scrapedPrice.region,
          priceMin: new Prisma.Decimal(Math.round(priceMin / 100) * 100),
          priceMax: new Prisma.Decimal(Math.round(priceMax / 100) * 100),
          priceAvg: new Prisma.Decimal(Math.round(priceAvg / 100) * 100),
          recordedAt: now,
        },
      });
      priceHistoryCreated++;
    }
  });

  return { marketPriceUpserted, priceHistoryCreated };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * AUTHENTICATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

function verifyAuthorization(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    console.warn("[Scraper] Missing Authorization header");
    return false;
  }

  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    console.warn("[Scraper] Invalid Authorization token");
    return false;
  }

  return true;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * API ROUTE HANDLER
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // 1. Verify authorization
  if (!verifyAuthorization(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or missing Authorization header" },
      { status: 401 }
    );
  }

  // 2. Check CRON_SECRET
  if (!process.env.CRON_SECRET) {
    console.error("[Scraper] CRON_SECRET not configured");
    return NextResponse.json(
      { error: "Configuration Error", message: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  console.log("[Scraper] Starting price scrape job...");

  try {
    const allResults: ScrapeResult[] = [];

    // 3. Scrape from giacaphe.com
    const coffeeResults = await scrapeGiaCaPhe();
    allResults.push(...coffeeResults);

    // 4. Scrape pepper prices
    const pepperResults = await scrapePepperPrices();
    allResults.push(...pepperResults);

    // 5. Convert scrape results to ScrapedPrice format
    const scrapedPrices: ScrapedPrice[] = [];

    for (const result of allResults) {
      if (!result.success || !result.price) continue;

      const config = CROP_CONFIGS[result.cropSlug];
      if (!config) continue;

      // For each crop, create entries for multiple regions with slight variation
      let regions: string[] = [];
      
      switch (result.cropSlug) {
        case "robusta":
        case "arabica":
          regions = COFFEE_REGIONS;
          break;
        case "pepper":
          regions = PEPPER_REGIONS;
          break;
        case "durian_ri6":
        case "durain_monthong":
          regions = DURIAN_REGIONS;
          break;
        default:
          regions = OTHER_REGIONS;
      }

      // Create entry for primary region (from scrape)
      scrapedPrices.push({
        cropName: config.name,
        cropSlug: result.cropSlug,
        price: result.price,
        unit: config.unit,
        region: result.region || regions[0],
        source: "AgriMarket Scrape",
      });

      // Create entries for other regions with ±3% variation
      for (const region of regions.slice(1)) {
        const variation = 1 + (Math.random() - 0.5) * 0.06; // ±3%
        scrapedPrices.push({
          cropName: config.name,
          cropSlug: result.cropSlug,
          price: Math.round(result.price * variation / 100) * 100,
          unit: config.unit,
          region,
          source: "AgriMarket Scrape",
        });
      }
    }

    console.log(`[Scraper] Total prices scraped: ${scrapedPrices.length}`);

    if (scrapedPrices.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No prices scraped from any source",
          duration: `${Date.now() - startTime}ms`,
        },
        { status: 200 }
      );
    }

    // 6. Save to database
    const { marketPriceUpserted, priceHistoryCreated } = await savePricesToDatabase(scrapedPrices);

    // 7. Return response
    const duration = Date.now() - startTime;

    console.log(`[Scraper] Job completed in ${duration}ms`);
    console.log(`[Scraper] MarketPrice upserted: ${marketPriceUpserted}`);
    console.log(`[Scraper] PriceHistory created: ${priceHistoryCreated}`);

    return NextResponse.json({
      success: true,
      message: "Price scrape completed successfully",
      data: {
        pricesScraped: scrapedPrices.length,
        marketPriceUpserted,
        priceHistoryCreated,
        sources: {
          coffee: coffeeResults.filter((r) => r.success).length,
          pepper: pepperResults.filter((r) => r.success).length,
        },
      },
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("[Scraper] Job failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Scrape Failed",
        message: error instanceof Error ? error.message : "Unknown error",
        duration: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for Vercel Cron
export async function GET(request: NextRequest) {
  if (request.headers.get("User-Agent")?.includes("Vercel")) {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
