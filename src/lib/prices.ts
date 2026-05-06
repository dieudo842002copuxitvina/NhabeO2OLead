/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  MARKET PRICES API                                        ║
 * ║  Fetch current agricultural commodity prices from database      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Features:
 * - Fetch current prices by crop slug
 * - Get price history for trend charts
 * - Support region filtering
 * - Cache-friendly response structure
 */

import { PrismaClient, Prisma } from "@prisma/client"

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface MarketPriceItem {
  id: string
  cropName: string
  cropSlug: string
  price: number
  unit: string
  region: string
  source: string | null
  recordedAt: Date
  updatedAt: Date
}

export interface PriceHistoryItem {
  id: string
  cropSlug: string
  cropName: string
  region: string
  priceMin: number
  priceMax: number
  priceAvg: number
  recordedAt: Date
}

export interface PriceTrend {
  cropSlug: string
  cropName: string
  region: string
  currentPrice: number
  previousPrice: number
  changePercent: number
  changeDirection: 'up' | 'down' | 'stable'
  history: Array<{
    date: string
    priceAvg: number
    priceMin: number
    priceMax: number
  }>
}

export interface FetchPricesOptions {
  cropSlug?: string
  region?: string
  limit?: number
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DUMMY DATA (for UI development before database setup)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const DUMMY_PRICES: MarketPriceItem[] = [
  // Sầu riêng
  {
    id: "dummy-1",
    cropName: "Sầu riêng Ri6",
    cropSlug: "sau-rieng-ri6",
    price: 85000,
    unit: "kg",
    region: "Đắk Lắk",
    source: "Sở NN & PTNT Đắk Lắk",
    recordedAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dummy-2",
    cropName: "Sầu riêng Monthong",
    cropSlug: "sau-rieng-monthong",
    price: 120000,
    unit: "kg",
    region: "Tiền Giang",
    source: "Sở NN & PTNT Tiền Giang",
    recordedAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dummy-3",
    cropName: "Sầu riêng Ri6",
    cropSlug: "sau-rieng-ri6",
    price: 82000,
    unit: "kg",
    region: "Tiền Giang",
    source: "Sở NN & PTNT Tiền Giang",
    recordedAt: new Date(),
    updatedAt: new Date(),
  },
  // Cà phê
  {
    id: "dummy-4",
    cropName: "Cà phê Robusta",
    cropSlug: "ca-phe-robusta",
    price: 58000,
    unit: "kg",
    region: "Đắk Lắk",
    source: "Vinacafe",
    recordedAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dummy-5",
    cropName: "Cà phê Arabica",
    cropSlug: "ca-phe-arabica",
    price: 125000,
    unit: "kg",
    region: "Lâm Đồng",
    source: "Trung tâm NC Cà phê",
    recordedAt: new Date(),
    updatedAt: new Date(),
  },
  // Tiêu
  {
    id: "dummy-6",
    cropName: "Tiêu đen",
    cropSlug: "tieu-den",
    price: 145000,
    unit: "kg",
    region: "Bình Phước",
    source: "Hiệp hội Tiêu VN",
    recordedAt: new Date(),
    updatedAt: new Date(),
  },
  // Bưởi
  {
    id: "dummy-7",
    cropName: "Bưởi Năm Roi",
    cropSlug: "buoi-nam-roi",
    price: 18000,
    unit: "kg",
    region: "Vĩnh Long",
    source: "Sở NN & PTNT Vĩnh Long",
    recordedAt: new Date(),
    updatedAt: new Date(),
  },
  // Sắn
  {
    id: "dummy-8",
    cropName: "Sắn tươi",
    cropSlug: "san-tuoi",
    price: 3200,
    unit: "kg",
    region: "Tây Ninh",
    source: "Cty TNHH Tây Ninh",
    recordedAt: new Date(),
    updatedAt: new Date(),
  },
]

/* Generate 30-day price history for a crop */
function generateDummyHistory(cropSlug: string, currentPrice: number): Array<{date: string, priceAvg: number, priceMin: number, priceMax: number}> {
  const history: Array<{date: string, priceAvg: number, priceMin: number, priceMax: number}> = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Simulate price fluctuation (±5%)
    const fluctuation = (Math.random() - 0.5) * 0.1
    const priceAvg = Math.round(currentPrice * (1 + fluctuation))
    const priceMin = Math.round(priceAvg * 0.95)
    const priceMax = Math.round(priceAvg * 1.05)
    
    history.push({
      date: date.toISOString().split('T')[0],
      priceAvg,
      priceMin,
      priceMax,
    })
  }
  
  return history
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * API FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Fetch current market prices from database
 * Falls back to dummy data if database is empty
 */
export async function fetchCurrentPrices(options: FetchPricesOptions = {}): Promise<MarketPriceItem[]> {
  const { cropSlug, region, limit = 50 } = options
  
  try {
    const where: Prisma.MarketPriceWhereInput = {}
    
    if (cropSlug) {
      where.cropSlug = cropSlug
    }
    
    if (region) {
      where.region = { contains: region, mode: 'insensitive' }
    }
    
    const prices = await prisma.marketPrice.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: limit,
    })
    
    // If no data in DB, return dummy data
    if (prices.length === 0) {
      console.log('[Prices] No data in DB, returning dummy data')
      return filterDummyData(cropSlug, region, limit)
    }
    
    return prices.map(p => ({
      ...p,
      price: Number(p.price),
      recordedAt: p.recordedAt,
      updatedAt: p.updatedAt,
    }))
    
  } catch (error) {
    console.error('[Prices] Error fetching from DB, using dummy data:', error)
    return filterDummyData(cropSlug, region, limit)
  }
}

/**
 * Filter dummy data based on options
 */
function filterDummyData(cropSlug?: string, region?: string, limit?: number): MarketPriceItem[] {
  let data = [...DUMMY_PRICES]
  
  if (cropSlug) {
    data = data.filter(p => p.cropSlug === cropSlug)
  }
  
  if (region) {
    data = data.filter(p => p.region.toLowerCase().includes(region.toLowerCase()))
  }
  
  if (limit) {
    data = data.slice(0, limit)
  }
  
  return data
}

/**
 * Get price history for trend chart
 */
export async function fetchPriceHistory(
  cropSlug: string,
  region?: string,
  days: number = 30
): Promise<PriceHistoryItem[]> {
  try {
    const where: Prisma.PriceHistoryWhereInput = { cropSlug }
    
    if (region) {
      where.region = { contains: region, mode: 'insensitive' }
    }
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    where.recordedAt = { gte: startDate }
    
    const history = await prisma.priceHistory.findMany({
      where,
      orderBy: { recordedAt: 'asc' },
      take: days,
    })
    
    // If no data, generate from dummy
    if (history.length === 0) {
      const dummyPrice = DUMMY_PRICES.find(p => p.cropSlug === cropSlug)
      if (!dummyPrice) return []
      
      const generatedHistory = generateDummyHistory(cropSlug, dummyPrice.price)
      return generatedHistory.map((h, i) => ({
        id: `dummy-hist-${i}`,
        cropSlug,
        cropName: dummyPrice.cropName,
        region: region || dummyPrice.region,
        priceMin: h.priceMin,
        priceMax: h.priceMax,
        priceAvg: h.priceAvg,
        recordedAt: new Date(h.date),
      }))
    }
    
    return history.map(h => ({
      ...h,
      priceMin: Number(h.priceMin),
      priceMax: Number(h.priceMax),
      priceAvg: Number(h.priceAvg),
    }))
    
  } catch (error) {
    console.error('[Prices] Error fetching history:', error)
    return []
  }
}

/**
 * Get price trends with calculated changes
 */
export async function fetchPriceTrends(
  cropSlugs?: string[]
): Promise<PriceTrend[]> {
  try {
    // Get current prices
    const currentPrices = await fetchCurrentPrices()
    
    // Filter by crop slugs if provided
    let filteredPrices = currentPrices
    if (cropSlugs && cropSlugs.length > 0) {
      filteredPrices = currentPrices.filter(p => cropSlugs.includes(p.cropSlug))
    }
    
    // Group by cropSlug + region
    const grouped = new Map<string, MarketPriceItem>()
    for (const price of filteredPrices) {
      const key = `${price.cropSlug}-${price.region}`
      if (!grouped.has(key)) {
        grouped.set(key, price)
      }
    }
    
    // Calculate trends
    const trends: PriceTrend[] = []
    
    for (const [_key, price] of grouped) {
      // Get 7-day history for comparison
      const history = await fetchPriceHistory(price.cropSlug, price.region, 7)
      
      let previousPrice = price.price
      let changePercent = 0
      let changeDirection: 'up' | 'down' | 'stable' = 'stable'
      
      if (history.length >= 2) {
        // Use price from 7 days ago
        previousPrice = history[0].priceAvg
        if (previousPrice > 0) {
          changePercent = ((price.price - previousPrice) / previousPrice) * 100
          if (changePercent > 1) changeDirection = 'up'
          else if (changePercent < -1) changeDirection = 'down'
        }
      }
      
      trends.push({
        cropSlug: price.cropSlug,
        cropName: price.cropName,
        region: price.region,
        currentPrice: price.price,
        previousPrice,
        changePercent: Math.round(changePercent * 10) / 10,
        changeDirection,
        history: history.map(h => ({
          date: h.recordedAt.toISOString().split('T')[0],
          priceAvg: h.priceAvg,
          priceMin: h.priceMin,
          priceMax: h.priceMax,
        })),
      })
    }
    
    return trends.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    
  } catch (error) {
    console.error('[Prices] Error fetching trends:', error)
    return []
  }
}

/**
 * Get all available crop slugs for filtering
 */
export async function getAvailableCrops(): Promise<Array<{slug: string, name: string}>> {
  try {
    // Try database first
    const prices = await prisma.marketPrice.findMany({
      select: { cropSlug: true, cropName: true },
      distinct: ['cropSlug'],
    })
    
    if (prices.length > 0) {
      return prices.map(p => ({ slug: p.cropSlug, name: p.cropName }))
    }
    
    // Fallback to dummy data
    const dummyCrops = new Map<string, string>()
    for (const p of DUMMY_PRICES) {
      if (!dummyCrops.has(p.cropSlug)) {
        dummyCrops.set(p.cropSlug, p.cropName)
      }
    }
    
    return Array.from(dummyCrops.entries()).map(([slug, name]) => ({ slug, name }))
    
  } catch (error) {
    console.error('[Prices] Error getting crops:', error)
    return []
  }
}

/**
 * Get all available regions for filtering
 */
export async function getAvailableRegions(): Promise<string[]> {
  try {
    // Try database first
    const prices = await prisma.marketPrice.findMany({
      select: { region: true },
      distinct: ['region'],
    })
    
    if (prices.length > 0) {
      return prices.map(p => p.region).sort()
    }
    
    // Fallback to dummy data
    const regions = new Set<string>()
    for (const p of DUMMY_PRICES) {
      regions.add(p.region)
    }
    
    return Array.from(regions).sort()
    
  } catch (error) {
    console.error('[Prices] Error getting regions:', error)
    return []
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default {
  fetchCurrentPrices,
  fetchPriceHistory,
  fetchPriceTrends,
  getAvailableCrops,
  getAvailableRegions,
}
