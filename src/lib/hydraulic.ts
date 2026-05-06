/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  HYDRAULIC CALCULATOR UTILITIES                                      ║
 * ║  Core calculations for irrigation system design                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────────────────────────────────────────── */

export interface TotalFlowResult {
  totalPlants: number;
  totalFlowM3H: number;
}

export interface GeoCoord {
  lat: number;
  lon: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PROVINCE COORDINATES (Vietnam)
 * ───────────────────────────────────────────────────────────────────────────── */

const PROVINCE_COORDS: Record<string, GeoCoord> = {
  "hà nội": { lat: 21.0285, lon: 105.8542 },
  "hồ chí minh": { lat: 10.8231, lon: 106.6297 },
  "đà nẵng": { lat: 16.0544, lon: 108.2022 },
  "hải phòng": { lat: 20.8449, lon: 106.6881 },
  "cần thơ": { lat: 10.0341, lon: 105.7212 },
  "an giang": { lat: 10.5222, lon: 105.1254 },
  "bà rịa vũng tàu": { lat: 10.5417, lon: 107.2425 },
  "bắc giang": { lat: 21.2731, lon: 106.1946 },
  "bắc kạn": { lat: 22.1472, lon: 105.8348 },
  "bạc liêu": { lat: 9.2946, lon: 105.7273 },
  "bắc ninh": { lat: 21.1275, lon: 106.0793 },
  "bến tre": { lat: 10.2411, lon: 106.3753 },
  "bình định": { lat: 13.7833, lon: 109.2167 },
  "bình dương": { lat: 11.0697, lon: 106.6569 },
  "bình phước": { lat: 11.4955, lon: 106.8865 },
  "bình thuận": { lat: 10.9573, lon: 108.0669 },
  "cà mau": { lat: 9.1876, lon: 105.1517 },
  "đắk lắk": { lat: 12.8797, lon: 108.1099 },
  "đắk nông": { lat: 12.2627, lon: 107.8531 },
  "điện biên": { lat: 21.3860, lon: 103.0126 },
  "đồng nai": { lat: 11.0687, lon: 107.0536 },
  "đồng tháp": { lat: 10.4928, lon: 105.6928 },
  "gia lai": { lat: 13.9833, lon: 108.0000 },
  "hà giang": { lat: 22.8025, lon: 104.9782 },
  "hà nam": { lat: 20.5834, lon: 105.9139 },
  "hà tĩnh": { lat: 18.3429, lon: 105.8967 },
  "hải dương": { lat: 20.9373, lon: 106.3154 },
  "hậu giang": { lat: 9.7578, lon: 105.6417 },
  "hòa bình": { lat: 20.8170, lon: 105.3375 },
  "hưng yên": { lat: 20.6463, lon: 106.0511 },
  "khánh hòa": { lat: 12.2388, lon: 109.0524 },
  "kiên giang": { lat: 10.3872, lon: 105.4648 },
  "kon tum": { lat: 14.3501, lon: 108.0000 },
  "lai châu": { lat: 22.3864, lon: 103.4327 },
  "lâm đồng": { lat: 11.5748, lon: 108.1425 },
  "lạng sơn": { lat: 21.8527, lon: 106.7615 },
  "lào cai": { lat: 22.4853, lon: 103.9754 },
  "long an": { lat: 10.5379, lon: 106.4097 },
  "nam định": { lat: 20.2500, lon: 106.1667 },
  "nghệ an": { lat: 18.6745, lon: 105.7846 },
  "ninh bình": { lat: 20.2500, lon: 105.9167 },
  "ninh thuận": { lat: 11.5776, lon: 108.8580 },
  "phú thọ": { lat: 21.4102, lon: 105.2060 },
  "phú yên": { lat: 13.0878, lon: 109.2500 },
  "quảng bình": { lat: 17.4680, lon: 106.6178 },
  "quảng nam": { lat: 15.5500, lon: 108.4833 },
  "quảng ngãi": { lat: 15.1206, lon: 108.8000 },
  "quảng ninh": { lat: 21.0064, lon: 107.2920 },
  "quảng trị": { lat: 16.7500, lon: 107.1667 },
  "sóc trăng": { lat: 9.6029, lon: 105.9739 },
  "sơn la": { lat: 21.3256, lon: 103.9189 },
  "tây ninh": { lat: 11.3353, lon: 106.1097 },
  "thái bình": { lat: 20.4499, lon: 106.3350 },
  "thái nguyên": { lat: 21.5944, lon: 105.8480 },
  "thanh hóa": { lat: 19.8047, lon: 105.7850 },
  "thừa thiên huế": { lat: 16.4619, lon: 107.5834 },
  "tiền giang": { lat: 10.4499, lon: 106.3500 },
  "trà vinh": { lat: 9.9483, lon: 106.3422 },
  "tuyên quang": { lat: 21.7786, lon: 105.2319 },
  "vĩnh long": { lat: 10.2487, lon: 105.9720 },
  "vĩnh phúc": { lat: 21.3068, lon: 105.5972 },
  "yên bái": { lat: 21.7200, lon: 104.9111 },
};

/**
 * Get geographic coordinates for a Vietnamese province
 * Used for geo-matching with dealers
 * 
 * @param province - Province name (case-insensitive, partial match supported)
 * @returns GeoCoord with lat/lon or null if not found
 */
export function getProvinceCoords(province: string): GeoCoord | null {
  if (!province?.trim()) return null;
  
  const normalized = province.toLowerCase().trim();
  
  // Exact match
  if (PROVINCE_COORDS[normalized]) {
    return PROVINCE_COORDS[normalized];
  }
  
  // Partial match
  for (const [key, coords] of Object.entries(PROVINCE_COORDS)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return coords;
    }
  }
  
  return null;
}

/**
 * Calculate total number of plants and flow rate based on field area
 * 
 * @param areaHa - Field area in hectares
 * @param plantSpacing - Spacing between plants in meters
 * @param rowSpacing - Spacing between rows in meters
 * @param dripperFlowRate - Flow rate of each dripper in L/h
 * @returns Object with total plants and flow rate in m3/h
 */
export function calculateTotalFlow(
  areaHa: number,
  plantSpacing: number,
  rowSpacing: number,
  dripperFlowRate: number
): TotalFlowResult {
  const areaM2 = areaHa * 10000;
  const totalPlants = Math.floor(areaM2 / (plantSpacing * rowSpacing));
  const totalFlowM3H = (totalPlants * dripperFlowRate) / 1000;

  return {
    totalPlants,
    totalFlowM3H: Math.round(totalFlowM3H * 100) / 100,
  };
}

/**
 * Calculate friction loss using Hazen-Williams formula
 * 
 * @param lengthM - Pipe length in meters
 * @param flowRateM3H - Flow rate in cubic meters per hour
 * @param internalDiameterMm - Internal diameter of pipe in millimeters
 * @param cFactor - Hazen-Williams roughness coefficient (default 140 for PVC)
 * @returns Friction loss in meters of water column (mH2O)
 */
export function calculateFrictionLoss(
  lengthM: number,
  flowRateM3H: number,
  internalDiameterMm: number,
  cFactor: number = 140
): number {
  if (cFactor === 0) {
    throw new Error("C factor cannot be zero");
  }
  if (internalDiameterMm === 0) {
    throw new Error("Internal diameter cannot be zero");
  }

  const d = internalDiameterMm / 1000; // Convert mm to meters
  const qOverC = flowRateM3H / cFactor;
  const hF = (10.67 * lengthM * Math.pow(qOverC, 1.852)) / Math.pow(d, 4.87);

  return Math.round(hF * 100) / 100;
}

/**
 * Calculate total pump head requirement
 * 
 * @param frictionLoss - Friction loss in pipe in meters (mH2O)
 * @param elevationChange - Elevation change in meters (positive = uphill)
 * @param requiredPressure - Required pressure at sprinklers in meters (default 15m ~ 1.5 bar)
 * @returns Total pump head in meters (mH2O)
 */
export function calculatePumpHead(
  frictionLoss: number,
  elevationChange: number,
  requiredPressure: number = 15
): number {
  const totalHead = frictionLoss + elevationChange + requiredPressure;
  return Math.round(totalHead * 100) / 100;
}
