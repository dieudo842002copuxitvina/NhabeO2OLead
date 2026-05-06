/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SMART BOM (Bill of Materials) GENERATOR                              ║
 * ║  Automatically selects products from database based on calculations    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * This module generates BOM (Bill of Materials) for irrigation systems
 * by querying products from the database and matching them against
 * calculated hydraulic requirements.
 * 
 * Features:
 * - Smart matching by Vietnamese category names (Ống, Bộ lọc, Máy bơm, Béc tưới)
 * - Parallel filter suggestion when flow exceeds single filter capacity
 * - Automatic manual review flag for oversized systems
 */

import { PrismaClient, Prisma } from "@prisma/client"

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern for production)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CATEGORY NAME MAPPING (Vietnamese names to slug patterns)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const CATEGORY_NAME_PATTERNS = {
  // Ống / PVC / HDPE pipes
  PIPE: ['ong', 'pvc', 'hdpe', 'ống', 'ống nhựa'],
  // Filters
  FILTER: ['bo-loc', 'bo-loc-trung-tam', 'bộ lọc', 'lọc', 'bộ lọc trung tâm'],
  // Pumps
  PUMP: ['may-bom', 'máy bơm', 'bơm', 'pump'],
  // Emitters / Drippers
  EMITTER: ['bec-tuoi', 'béc tưới', 'béc', 'dripper', 'drip'],
  // Pipe accessories
  ACCESSORY: ['phu-kien', 'phụ kiện', 'co', 'cút', 'cke'],
}

/**
 * Find category by name pattern (supports Vietnamese names)
 */
async function findCategoryByNamePatterns(patterns: string[]): Promise<string | null> {
  const orConditions = patterns.map(pattern => ({
    OR: [
      { name: { contains: pattern, mode: 'insensitive' as const } },
      { slug: { contains: pattern, mode: 'insensitive' as const } },
    ],
  }))

  const categories = await prisma.categories.findMany({
    where: { OR: orConditions },
    select: { id: true, name: true, slug: true },
    take: 1,
  })

  return categories[0]?.id ?? null
}

/**
 * Find all categories matching patterns
 */
async function findAllCategoriesByPatterns(patterns: string[]): Promise<Array<{id: string, name: string, slug: string}>> {
  const orConditions = patterns.map(pattern => ({
    OR: [
      { name: { contains: pattern, mode: 'insensitive' as const } },
      { slug: { contains: pattern, mode: 'insensitive' as const } },
    ],
  }))

  return prisma.categories.findMany({
    where: { OR: orConditions },
    select: { id: true, name: true, slug: true },
  })
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Hydraulic calculation results from the calculator
 */
export interface HydraulicCalcResults {
  totalFlowM3H: number        // Total flow rate (m³/h)
  totalFlowLPH?: number       // Total flow rate (L/h) - optional
  pipeDiameterMm: number      // Required pipe diameter (mm)
  frictionLossM: number       // Friction loss (meters)
  totalHeadM: number          // Total dynamic head (meters)
  emitterCount: number       // Number of emitters
  emitterFlowLPH?: number     // Flow rate per emitter (L/h)
  pumpHP?: number             // Required pump horsepower
  pumpKW?: number             // Required pump kilowatts
  pipeLengthM?: number        // Pipe length (meters)
  elevationM?: number         // Elevation change (meters)
}

/**
 * Single BOM line item
 */
export interface BOMItem {
  productId: string
  sku: string
  name: string
  category: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  specifications?: Record<string, any>
}

/**
 * Complete BOM output
 */
export interface BOMResult {
  items: BOMItem[]
  totalCost: number
  currency: string
  requiresManualReview: boolean
  message?: string
  warnings?: string[]
}

/**
 * Product specifications stored in JSON format
 */
interface ProductSpecifications {
  diameter_mm?: number        // Pipe diameter (mm)
  max_flow_m3h?: number       // Maximum flow rate (m³/h)
  max_flow_lph?: number       // Maximum flow rate (L/h)
  flow_rate_m3h?: number      // Rated flow rate (m³/h)
  flow_rate_lph?: number      // Rated flow rate (L/h)
  head_m?: number             // Pump head (meters)
  max_head_m?: number          // Maximum pump head (meters)
  power_hp?: number           // Power (HP)
  power_kw?: number           // Power (kW)
  pressure_bar?: number       // Operating pressure (bar)
  connection_size?: string     // Connection size (e.g., "1 inch", "2 inch")
  material?: string           // Material (PVC, HDPE, etc.)
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CATEGORY SLUGS (Database category slugs for irrigation products)
 * ═══════════════════════════════════════════════════════════════════════════════ */

/** @deprecated Use findCategoryByNamePatterns instead for better Vietnamese support */
const CATEGORY_SLUGS = {
  PIPE: 'ong',                 // Main pipes
  PIPE_ACCESSORIES: 'phu-kien-ong', // Pipe fittings
  FILTER: 'bo-loc',            // Filters
  EMITTER: 'bec-tuoi',         // Drippers/Sprinklers
  PUMP: 'may-bom',             // Pumps
  VALVE: 'van',                // Valves
  FITTING: 'co',               // Fittings
}

/** Reverse mapping for debug/logging */
const CATEGORY_LABELS: Record<string, string> = {
  PIPE: 'Ống chính',
  FILTER: 'Bộ lọc',
  PUMP: 'Máy bơm',
  EMITTER: 'Béc tưới',
  ACCESSORY: 'Phụ kiện',
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Find the closest value in an array to a target
 */
function findClosestValue(values: number[], target: number): number {
  if (values.length === 0) return target
  return values.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  )
}

/**
 * Parse specifications from JSON
 */
function parseSpecifications(specs: any): ProductSpecifications {
  if (!specs) return {}
  if (typeof specs === 'string') {
    try {
      return JSON.parse(specs)
    } catch {
      return {}
    }
  }
  return specs as ProductSpecifications
}

/**
 * Find products by category slug or name patterns with filtering
 * Supports both slug-based and Vietnamese name-based matching
 */
async function findProductsByCategory(
  categoryIdentifier: string | string[],
  filter?: {
    maxFlowM3H?: number
    minDiameter?: number
    maxDiameter?: number
    minHead?: number
    limit?: number
    orderBy?: 'price_asc' | 'price_desc' | 'created_desc'
  }
) {
  // Convert to array if single value
  const identifiers = Array.isArray(categoryIdentifier) 
    ? categoryIdentifier 
    : [categoryIdentifier]

  // Try to find categories by name patterns first, then fall back to slug
  const categoryIds: string[] = []

  for (const identifier of identifiers) {
    // Check if it's a slug (single word without spaces)
    if (!identifier.includes(' ')) {
      const category = await prisma.categories.findUnique({
        where: { slug: identifier },
        select: { id: true },
      })
      if (category) {
        categoryIds.push(category.id)
        continue
      }
    }

    // Try matching by name patterns
    const matchedCategories = await findAllCategoriesByPatterns([identifier])
    for (const cat of matchedCategories) {
      if (!categoryIds.includes(cat.id)) {
        categoryIds.push(cat.id)
      }
    }
  }

  if (categoryIds.length === 0) return []

  const where: Prisma.productsWhereInput = {
    category_id: { in: categoryIds },
    is_active: true,
    in_stock: true,
  }

  // Add flow rate filter if specified
  if (filter?.maxFlowM3H !== undefined) {
    where.specifications = {
      OR: [
        { max_flow_m3h: { gte: filter.maxFlowM3H } },
        { max_flow_m3h: null },
        { flow_rate_m3h: { gte: filter.maxFlowM3H } },
        { flow_rate_m3h: null },
      ],
    }
  }

  // Add diameter range filter if specified
  if (filter?.minDiameter !== undefined || filter?.maxDiameter !== undefined) {
    const specsFilter: Prisma.JsonFilter = {}
    if (filter.minDiameter !== undefined) {
      specsFilter.gte = filter.minDiameter
    }
    if (filter.maxDiameter !== undefined) {
      specsFilter.lte = filter.maxDiameter
    }
    where.specifications = {
      ...(where.specifications as object || {}),
      diameter_mm: specsFilter,
    }
  }

  // Build orderBy
  let orderBy: Prisma.productsOrderByWithRelationInput = { created_at: 'desc' }
  if (filter?.orderBy === 'price_asc') {
    orderBy = { base_price: 'asc' }
  } else if (filter?.orderBy === 'price_desc') {
    orderBy = { base_price: 'desc' }
  }

  const products = await prisma.products.findMany({
    where,
    orderBy,
    take: filter?.limit || 10,
    select: {
      id: true,
      name: true,
      sku: true,
      base_price: true,
      specifications: true,
      image_url: true,
      categories: {
        select: { name: true, slug: true },
      },
    },
  })

  return products
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * BOM SELECTION FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Select main pipe based on required diameter
 * Searches for pipes with diameter >= required, closest match first
 */
async function selectMainPipe(requiredDiameterMm: number, lengthMeters: number) {
  // Common pipe diameters in Vietnam market
  const standardDiameters = [20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 160]
  
  // Find closest standard diameter (should be >= required)
  const suitableDiameters = standardDiameters.filter(d => d >= requiredDiameterMm)
  const targetDiameter = suitableDiameters.length > 0
    ? suitableDiameters[0]  // Use smallest diameter that meets requirement
    : findClosestValue(standardDiameters, requiredDiameterMm)

  // Search for pipe in database - supports both slug and Vietnamese name
  const pipes = await findProductsByCategory(CATEGORY_NAME_PATTERNS.PIPE, {
    minDiameter: targetDiameter * 0.9,  // 10% tolerance
    maxDiameter: targetDiameter * 1.5,  // Allow larger pipes
    orderBy: 'price_asc',
    limit: 5,
  })

  // Find the best match
  const pipeProducts = pipes.map(p => ({
    ...p,
    specs: parseSpecifications(p.specifications),
  }))

  // Select pipe with diameter closest to target
  const selectedPipe = pipeProducts.length > 0
    ? pipeProducts.sort((a, b) => {
        const aDiff = Math.abs((a.specs.diameter_mm || 0) - targetDiameter)
        const bDiff = Math.abs((b.specs.diameter_mm || 0) - targetDiameter)
        return aDiff - bDiff
      })[0]
    : null

  if (!selectedPipe) {
    return null
  }

  return {
    productId: selectedPipe.id,
    sku: selectedPipe.sku,
    name: selectedPipe.name,
    unit: 'm',
    quantity: lengthMeters || 100,  // Default to 100m if not specified
    unitPrice: selectedPipe.base_price || 0,
  }
}

/**
 * Select filter based on flow rate
 * Supports parallel filter suggestion when single filter cannot handle the flow
 */
async function selectFilter(maxFlowM3H: number) {
  const filters = await findProductsByCategory(CATEGORY_NAME_PATTERNS.FILTER, {
    maxFlowM3H,
    orderBy: 'price_asc',
    limit: 10,
  })

  // Filter products that can handle the required flow
  const suitableFilters = filters
    .map(f => ({
      ...f,
      specs: parseSpecifications(f.specifications),
    }))
    .filter(f => {
      const maxFlow = f.specs.max_flow_m3h || f.specs.flow_rate_m3h || Infinity
      return maxFlow >= maxFlowM3H
    })

  // Select the most affordable suitable filter
  const selectedFilter = suitableFilters.length > 0
    ? suitableFilters.sort((a, b) => (a.base_price || 0) - (b.base_price || 0))[0]
    : null

  if (!selectedFilter) {
    return null
  }

  return {
    productId: selectedFilter.id,
    sku: selectedFilter.sku,
    name: selectedFilter.name,
    unit: 'bộ',
    quantity: 1,
    unitPrice: selectedFilter.base_price || 0,
    specifications: selectedFilter.specs,
  }
}

/**
 * Suggest parallel filters when flow exceeds single filter capacity
 * Returns array of filter items to be used in parallel
 */
async function suggestParallelFilters(maxFlowM3H: number): Promise<{
  items: Array<{
    productId: string
    sku: string
    name: string
    quantity: number
    unitPrice: number
    specifications: any
  }>
  warning: string
} | null> {
  // Find largest single filter capacity
  const allFilters = await findProductsByCategory(CATEGORY_NAME_PATTERNS.FILTER, {
    orderBy: 'price_asc',
    limit: 20,
  })

  const suitableFilters = allFilters
    .map(f => ({
      ...f,
      specs: parseSpecifications(f.specifications),
    }))
    .filter(f => {
      const maxFlow = f.specs.max_flow_m3h || f.specs.flow_rate_m3h || 0
      return maxFlow > 0
    })
    .sort((a, b) => {
      const aFlow = a.specs.max_flow_m3h || a.specs.flow_rate_m3h || 0
      const bFlow = b.specs.max_flow_m3h || b.specs.flow_rate_m3h || 0
      return bFlow - aFlow // Sort by max capacity descending
    })

  if (suitableFilters.length === 0) {
    return null
  }

  const largestFilter = suitableFilters[0]
  const largestCapacity = largestFilter.specs.max_flow_m3h || largestFilter.specs.flow_rate_m3h || 0

  // If single filter can handle it, no parallel needed
  if (largestCapacity >= maxFlowM3H) {
    return null
  }

  // Calculate how many filters needed in parallel
  const filtersNeeded = Math.ceil(maxFlowM3H / largestCapacity)

  // Suggest the largest filter multiplied
  return {
    items: [{
      productId: largestFilter.id,
      sku: largestFilter.sku,
      name: `${largestFilter.name} (x${filtersNeeded} - ghép song song)`,
      quantity: filtersNeeded,
      unitPrice: largestFilter.base_price || 0,
      specifications: largestFilter.specs,
    }],
    warning: `Lưu lượng ${maxFlowM3H} m³/h vượt quá khả năng lọc của 1 bộ. Đề xuất ghép song song ${filtersNeeded} bộ ${largestFilter.name}.`,
  }
}

/**
 * Select pump based on head and flow requirements
 * Uses Vietnamese category name matching
 */
async function selectPump(requiredFlowM3H: number, requiredHeadM: number, requiredHP?: number) {
  // Search for pumps that meet requirements - supports Vietnamese name matching
  const pumps = await findProductsByCategory(CATEGORY_NAME_PATTERNS.PUMP, {
    orderBy: 'price_asc',
    limit: 20,
  })

  // Filter and score pumps
  const pumpProducts = pumps.map(p => ({
    ...p,
    specs: parseSpecifications(p.specifications),
  }))

  // Score each pump
  const scoredPumps = pumpProducts
    .map(pump => {
      const pumpFlow = pump.specs.flow_rate_m3h || pump.specs.max_flow_m3h || 0
      const pumpHead = pump.specs.head_m || pump.specs.max_head_m || 0
      const pumpHP = pump.specs.power_hp || pump.specs.power_kw ? (pump.specs.power_hp || pump.specs.power_kw! * 1.341) : 0

      // Calculate suitability score (higher is better)
      // Pump must meet minimum requirements
      if (pumpFlow < requiredFlowM3H * 0.8) return { pump, score: -1 }
      if (pumpHead < requiredHeadM * 0.8) return { pump, score: -1 }

      // Score based on how well it matches requirements
      const flowScore = 100 - Math.abs(pumpFlow - requiredFlowM3H) / requiredFlowM3H * 50
      const headScore = 100 - Math.abs(pumpHead - requiredHeadM) / requiredHeadM * 50
      const hpScore = requiredHP
        ? 100 - Math.abs(pumpHP - requiredHP) / requiredHP * 30
        : 100

      const totalScore = flowScore + headScore + hpScore

      return { pump, score: totalScore }
    })
    .filter(sp => sp.score > 0)
    .sort((a, b) => b.score - a.score)

  const selectedPump = scoredPumps.length > 0 ? scoredPumps[0].pump : null

  if (!selectedPump) {
    return null
  }

  return {
    productId: selectedPump.id,
    sku: selectedPump.sku,
    name: selectedPump.name,
    unit: 'máy',
    quantity: 1,
    unitPrice: selectedPump.base_price || 0,
  }
}

/**
 * Select emitters/drippers based on flow rate
 * Supports Vietnamese category name matching
 */
async function selectEmitters(emitterFlowLPH: number, emitterCount: number) {
  // Search for emitters - supports Vietnamese name matching
  const emitters = await findProductsByCategory(CATEGORY_NAME_PATTERNS.EMITTER, {
    orderBy: 'price_asc',
    limit: 10,
  })

  // Filter by flow rate (find closest match)
  const emitterProducts = emitters.map(e => ({
    ...e,
    specs: parseSpecifications(e.specifications),
  }))

  // Find emitter with closest flow rate
  const selectedEmitter = emitterProducts.length > 0
    ? emitterProducts.sort((a, b) => {
        const aDiff = Math.abs((a.specs.flow_rate_lph || a.specs.pressure_bar || 0) - emitterFlowLPH)
        const bDiff = Math.abs((b.specs.flow_rate_lph || b.specs.pressure_bar || 0) - emitterFlowLPH)
        return aDiff - bDiff
      })[0]
    : null

  if (!selectedEmitter) {
    // Return generic emitter info for manual selection
    return null
  }

  return {
    productId: selectedEmitter.id,
    sku: selectedEmitter.sku,
    name: selectedEmitter.name,
    unit: 'cái',
    quantity: emitterCount,
    unitPrice: selectedEmitter.base_price || 0,
  }
}

/**
 * Select pipe fittings/accessories
 * Supports Vietnamese category name matching
 */
async function selectPipeFittings(pipeDiameterMm: number) {
  const fittings = await findProductsByCategory(CATEGORY_NAME_PATTERNS.ACCESSORY, {
    orderBy: 'price_asc',
    limit: 10,
  })

  // Filter fittings matching pipe diameter
  const suitableFittings = fittings
    .map(f => ({
      ...f,
      specs: parseSpecifications(f.specifications),
    }))
    .filter(f => {
      const fitDiameter = f.specs.diameter_mm || parseInt(f.specs.connection_size || '0')
      return !fitDiameter || Math.abs(fitDiameter - pipeDiameterMm) <= 20
    })

  // Return a basic fittings kit (estimated)
  if (suitableFittings.length > 0) {
    return {
      productId: suitableFittings[0].id,
      sku: suitableFittings[0].sku,
      name: `Phụ kiện ống Φ${pipeDiameterMm}mm (bộ)`,
      unit: 'bộ',
      quantity: 1,
      unitPrice: suitableFittings[0].base_price || 0,
    }
  }

  return null
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN BOM GENERATOR
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Generate Bill of Materials based on hydraulic calculation results
 * 
 * @param calcResults - Results from hydraulic calculator
 * @param options - Optional configuration
 * @returns BOM with selected products and pricing
 * 
 * @example
 * ```typescript
 * const bom = await generateBOM({
 *   totalFlowM3H: 25,
 *   pipeDiameterMm: 63,
 *   emitterCount: 500,
 *   totalHeadM: 45,
 *   frictionLossM: 5,
 *   pumpHP: 5,
 * }, {
 *   pipeLengthM: 200,
 * });
 * ```
 */
export async function generateBOM(
  calcResults: HydraulicCalcResults,
  options?: {
    pipeLengthM?: number
    preferredEmitters?: string[]  // Product IDs of preferred emitters
    forceManualReview?: boolean    // Force manual review for complex systems
  }
): Promise<BOMResult> {
  const warnings: string[] = []
  const items: BOMItem[] = []
  const pipeLength = options?.pipeLengthM || calcResults.pipeLengthM || 100

  try {
    /* ─────────────────────────────────────────────────────────────────────────────
     * 1. SELECT MAIN PIPE
     * ───────────────────────────────────────────────────────────────────────────── */
    const mainPipe = await selectMainPipe(calcResults.pipeDiameterMm, pipeLength)
    if (mainPipe) {
      items.push({
        productId: mainPipe.productId,
        sku: mainPipe.sku,
        name: mainPipe.name,
        category: CATEGORY_LABELS.PIPE,
        quantity: mainPipe.quantity,
        unit: mainPipe.unit,
        unitPrice: mainPipe.unitPrice,
        totalPrice: mainPipe.quantity * mainPipe.unitPrice,
      })
    } else {
      warnings.push(`Không tìm thấy ống Φ${calcResults.pipeDiameterMm}mm phù hợp. Cần tư vấn trực tiếp từ kỹ thuật.`)
    }

    /* ─────────────────────────────────────────────────────────────────────────────
     * 2. SELECT FILTER (with parallel suggestion if needed)
     * ───────────────────────────────────────────────────────────────────────────── */
    let filterResult = await selectFilter(calcResults.totalFlowM3H)
    
    // If no single filter can handle the flow, suggest parallel filters
    if (!filterResult) {
      const parallelSuggestion = await suggestParallelFilters(calcResults.totalFlowM3H)
      
      if (parallelSuggestion) {
        // Add parallel filters as items
        for (const filterItem of parallelSuggestion.items) {
          items.push({
            productId: filterItem.productId,
            sku: filterItem.sku,
            name: filterItem.name,
            category: CATEGORY_LABELS.FILTER,
            quantity: filterItem.quantity,
            unit: 'bộ',
            unitPrice: filterItem.unitPrice,
            totalPrice: filterItem.quantity * filterItem.unitPrice,
          })
        }
        warnings.push(parallelSuggestion.warning)
      } else {
        warnings.push(`Không tìm thấy bộ lọc phù hợp cho lưu lượng ${calcResults.totalFlowM3H} m³/h. Cần tư vấn trực tiếp từ kỹ thuật.`)
      }
    } else {
      items.push({
        productId: filterResult.productId,
        sku: filterResult.sku,
        name: filterResult.name,
        category: CATEGORY_LABELS.FILTER,
        quantity: filterResult.quantity,
        unit: filterResult.unit,
        unitPrice: filterResult.unitPrice,
        totalPrice: filterResult.quantity * filterResult.unitPrice,
      })
    }

    /* ─────────────────────────────────────────────────────────────────────────────
     * 3. SELECT PUMP
     * ───────────────────────────────────────────────────────────────────────────── */
    const pump = await selectPump(
      calcResults.totalFlowM3H,
      calcResults.totalHeadM,
      calcResults.pumpHP
    )
    if (pump) {
      items.push({
        productId: pump.productId,
        sku: pump.sku,
        name: pump.name,
        category: CATEGORY_LABELS.PUMP,
        quantity: pump.quantity,
        unit: pump.unit,
        unitPrice: pump.unitPrice,
        totalPrice: pump.quantity * pump.unitPrice,
      })
    } else {
      warnings.push(`Không tìm thấy máy bơm phù hợp (${calcResults.totalFlowM3H} m³/h, ${calcResults.totalHeadM}m). Cần tư vấn trực tiếp từ kỹ thuật.`)
    }

    /* ─────────────────────────────────────────────────────────────────────────────
     * 4. SELECT EMITTERS (if emitter count specified)
     * ───────────────────────────────────────────────────────────────────────────── */
    if (calcResults.emitterCount > 0) {
      const emitterFlowLPH = calcResults.emitterFlowLPH || 4 // Default 4 L/h
      
      // Check for preferred emitters
      if (options?.preferredEmitters?.length) {
        const preferredProducts = await prisma.products.findMany({
          where: {
            id: { in: options.preferredEmitters },
            is_active: true,
          },
          select: {
            id: true,
            name: true,
            sku: true,
            base_price: true,
          },
        })

        if (preferredProducts.length > 0) {
          const preferred = preferredProducts[0]
          items.push({
            productId: preferred.id,
            sku: preferred.sku,
            name: preferred.name,
            category: CATEGORY_LABELS.EMITTER,
            quantity: calcResults.emitterCount,
            unit: 'cái',
            unitPrice: preferred.base_price || 0,
            totalPrice: calcResults.emitterCount * (preferred.base_price || 0),
          })
        }
      } else {
        // Auto-select emitters
        const emitter = await selectEmitters(emitterFlowLPH, calcResults.emitterCount)
        if (emitter) {
          items.push({
            productId: emitter.productId,
            sku: emitter.sku,
            name: emitter.name,
            category: CATEGORY_LABELS.EMITTER,
            quantity: emitter.quantity,
            unit: emitter.unit,
            unitPrice: emitter.unitPrice,
            totalPrice: emitter.quantity * emitter.unitPrice,
          })
        } else {
          // Add generic emitter entry for manual selection
          items.push({
            productId: 'TBD',
            sku: 'EMITTER-EST',
            name: `Béc tưới ${emitterFlowLPH}L/h (cần chọn model)`,
            category: CATEGORY_LABELS.EMITTER,
            quantity: calcResults.emitterCount,
            unit: 'cái',
            unitPrice: 25000, // Estimated price
            totalPrice: calcResults.emitterCount * 25000,
          })
        }
      }
    }

    /* ─────────────────────────────────────────────────────────────────────────────
     * 5. SELECT PIPE FITTINGS
     * ───────────────────────────────────────────────────────────────────────────── */
    const fittings = await selectPipeFittings(calcResults.pipeDiameterMm)
    if (fittings) {
      items.push({
        productId: fittings.productId,
        sku: fittings.sku,
        name: fittings.name,
        category: CATEGORY_LABELS.ACCESSORY,
        quantity: fittings.quantity,
        unit: fittings.unit,
        unitPrice: fittings.unitPrice,
        totalPrice: fittings.quantity * fittings.unitPrice,
      })
    } else {
      // Estimate fittings cost (typically 15-20% of pipe cost)
      const pipeCost = items.find(i => i.category === CATEGORY_LABELS.PIPE)?.totalPrice || 0
      if (pipeCost > 0) {
        items.push({
          productId: 'TBD',
          sku: 'FITTING-EST',
          name: 'Phụ kiện ống (bộ - ước tính)',
          category: CATEGORY_LABELS.ACCESSORY,
          quantity: 1,
          unit: 'bộ',
          unitPrice: Math.round(pipeCost * 0.15), // 15% of pipe cost
          totalPrice: Math.round(pipeCost * 0.15),
        })
      }
    }

    /* ─────────────────────────────────────────────────────────────────────────────
     * 6. CALCULATE TOTAL
     * ───────────────────────────────────────────────────────────────────────────── */
    const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0)

    /* ─────────────────────────────────────────────────────────────────────────────
     * 7. DETERMINE IF MANUAL REVIEW NEEDED
     * ───────────────────────────────────────────────────────────────────────────── */
    const requiresManualReview = options?.forceManualReview || 
      warnings.length > 0 ||
      items.some(i => i.productId === 'TBD') ||
      totalCost === 0 ||
      calcResults.totalHeadM > 100 ||  // High head systems need review
      calcResults.pipeDiameterMm > 110  // Large pipe systems need review

    /* ─────────────────────────────────────────────────────────────────────────────
     * 8. GENERATE MESSAGE
     * ───────────────────────────────────────────────────────────────────────────── */
    let message: string | undefined
    
    if (requiresManualReview) {
      if (calcResults.totalFlowM3H > 50 || calcResults.pipeDiameterMm > 160) {
        message = "Cần liên hệ kỹ thuật để thiết kế trạm trung tâm đặc thù cho hệ thống quy mô lớn."
      } else {
        message = "Hệ thống cần được kỹ thuật viên rà soát trước khi báo giá chính thức."
      }
    } else {
      message = "BOM đã được tự động tạo. Vui lòng kiểm tra và xác nhận."
    }

    return {
      items,
      totalCost,
      currency: 'VND',
      requiresManualReview,
      message,
      warnings: warnings.length > 0 ? warnings : undefined,
    }

  } catch (error) {
    console.error('[BOM Generator] Error:', error)
    
    return {
      items: [],
      totalCost: 0,
      currency: 'VND',
      requiresManualReview: true,
      message: 'Có lỗi xảy ra khi tạo BOM. Vui lòng liên hệ kỹ thuật để được hỗ trợ.',
      warnings: [`Lỗi hệ thống: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default generateBOM
