/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  HYDRAULIC MATHEMATICS ENGINE                                         ║
 * ║  Core calculation functions for agricultural irrigation systems            ║
 * ║  - Total flow calculation                                              ║
 * ║  - Hazen-Williams friction loss                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * CONSTANTS
 * ───────────────────────────────────────────────────────────────────────────── */

// Earth's radius in kilometers (for geo calculations)
const EARTH_RADIUS_KM = 6371;

// Hazen-Williams C factor for PVC/HDPE pipes
const HAZEN_WILLIAMS_C = 140;

// Default emitter operating pressure (meters of head)
const EMITTER_OPERATING_PRESSURE = 15;

/* ─────────────────────────────────────────────────────────────────────────────
 * HELPER FUNCTIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate a number is positive
 */
function isValidPositiveNumber(value: number, name: string): void {
  if (value === null || value === undefined || isNaN(value)) {
    throw new Error(`${name} không hợp lệ`);
  }
  if (value <= 0) {
    throw new Error(`${name} phải lớn hơn 0`);
  }
}

/**
 * Validate coordinates for geo calculations
 */
function isValidCoordinate(lat: number, lon: number): boolean {
  if (lat === null || lat === undefined || isNaN(lat)) return false;
  if (lon === null || lon === undefined || isNaN(lon)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lon < -180 || lon > 180) return false;
  return true;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * CORE CALCULATION FUNCTIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Calculate total flow rate for an irrigation system
 * 
 * @param areaSqMeters - Total area in square meters
 * @param densityPerSqMeter - Density of emitters per square meter (1/spacing²)
 * @param dripperFlowRate - Flow rate per emitter in L/h
 * @returns Total flow rate in L/h
 * 
 * @example
 * // For 10,000 m² with 3m spacing and 40 L/h emitters:
 * const flow = calculateTotalFlow(10000, 1/9, 40);
 * // Returns: ~4444 L/h
 */
export function calculateTotalFlow(
  areaSqMeters: number,
  densityPerSqMeter: number,
  dripperFlowRate: number
): number {
  // Validate inputs
  isValidPositiveNumber(areaSqMeters, "Diện tích");
  isValidPositiveNumber(densityPerSqMeter, "Mật độ");
  isValidPositiveNumber(dripperFlowRate, "Lưu lượng béc");

  // Calculate number of emitters
  const emitterCount = Math.floor(areaSqMeters * densityPerSqMeter);

  // Calculate total flow in L/h
  const totalFlowLh = emitterCount * dripperFlowRate;

  return totalFlowLh;
}

/**
 * Calculate friction loss using Hazen-Williams formula
 * 
 * Formula: Hf = 10.67 × L × Q^1.852 / (C^1.852 × D^4.87)
 * Where:
 *   Q = Flow rate in m³/h
 *   L = Pipe length in meters
 *   D = Pipe internal diameter in mm
 *   C = Hazen-Williams roughness coefficient
 * 
 * @param length - Pipe length in meters
 * @param flowRateM3h - Flow rate in m³/h
 * @param diameterMm - Pipe internal diameter in mm
 * @param cFactor - Hazen-Williams roughness coefficient (default: 140 for PVC/HDPE)
 * @returns Friction loss in meters
 * 
 * @example
 * // For 200m of 60mm pipe with 4 m³/h flow:
 * const loss = calculatePipeFrictionLoss(200, 4, 60);
 * // Returns: ~1.8 m
 */
export function calculatePipeFrictionLoss(
  length: number,
  flowRateM3h: number,
  diameterMm: number,
  cFactor: number = HAZEN_WILLIAMS_C
): number {
  // Validate inputs
  isValidPositiveNumber(length, "Chiều dài ống");
  isValidPositiveNumber(flowRateM3h, "Lưu lượng");
  isValidPositiveNumber(diameterMm, "Đường kính ống");
  isValidPositiveNumber(cFactor, "Hệ số C");

  // Convert flow from m³/h to m³/s for calculation
  const flowM3s = flowRateM3h / 3600;
  
  // Convert diameter from mm to meters
  const diameterM = diameterMm / 1000;

  // Calculate using Darcy-Weisbach equivalent (Hazen-Williams)
  // Hf = 10.67 × L × (Q/C)^1.852 / D^4.87
  const cPower = Math.pow(cFactor, 1.852);
  const dPower = Math.pow(diameterMm, 4.87);
  
  const frictionLoss = (10.67 * length * Math.pow(flowRateM3h / cFactor, 1.852)) / dPower;

  return Number(frictionLoss.toFixed(3));
}

/**
 * Calculate distance between two geographic points using Haversine formula
 * 
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    throw new Error("Tọa độ không hợp lệ");
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((EARTH_RADIUS_KM * c).toFixed(3));
}

/**
 * Find nearest dealer to a given location
 * 
 * @param latitude - Customer latitude
 * @param longitude - Customer longitude
 * @param dealers - Array of dealers with coordinates
 * @returns Nearest dealer and distance, or null
 */
export function findNearestDealer<T extends { 
  id: string; 
  latitude?: number | null; 
  longitude?: number | null 
}>(
  latitude: number,
  longitude: number,
  dealers: T[]
): { dealer: T; distanceKm: number } | null {
  if (!isValidCoordinate(latitude, longitude)) {
    return null;
  }

  let nearest: T | null = null;
  let minDistance = Infinity;

  for (const dealer of dealers) {
    const dealerLat = dealer.latitude;
    const dealerLon = dealer.longitude;

    if (dealerLat === null || dealerLat === undefined || 
        dealerLon === null || dealerLon === undefined) {
      continue;
    }

    if (!isValidCoordinate(dealerLat, dealerLon)) {
      continue;
    }

    const distance = calculateDistance(latitude, longitude, dealerLat, dealerLon);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = dealer;
    }
  }

  if (nearest === null) {
    return null;
  }

  return {
    dealer: nearest,
    distanceKm: Number(minDistance.toFixed(3)),
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PROVINCE COORDINATE LOOKUP (Vietnam)
 * ───────────────────────────────────────────────────────────────────────────── */

const VIETNAM_PROVINCE_COORDS: Record<string, { lat: number; lon: number }> = {
  "hồ chí minh": { lat: 10.8231, lon: 106.6297 },
  "hà nội": { lat: 21.0285, lon: 105.8542 },
  "đà nẵng": { lat: 16.0544, lon: 108.2022 },
  "cần thơ": { lat: 10.0452, lon: 105.7847 },
  "hải phòng": { lat: 20.8449, lon: 106.6880 },
  "đắk lắk": { lat: 12.7104, lon: 108.1378 },
  "đắk nông": { lat: 12.2587, lon: 107.6937 },
  "lâm đồng": { lat: 11.5752, lon: 108.0689 },
  "tiền giang": { lat: 10.4495, lon: 106.3755 },
  "vĩnh long": { lat: 10.2485, lon: 105.9719 },
  "an giang": { lat: 10.5211, lon: 105.1530 },
  "bến tre": { lat: 10.2417, lon: 106.3751 },
  "kiên giang": { lat: 10.4173, lon: 105.1859 },
  "hậu giang": { lat: 10.5159, lon: 105.4788 },
  "trà vinh": { lat: 9.9482, lon: 106.3138 },
  "sóc trăng": { lat: 9.6029, lon: 105.9772 },
  "bạc liêu": { lat: 9.2944, lon: 105.7298 },
  "cà mau": { lat: 9.1870, lon: 105.1940 },
  "hà giang": { lat: 22.8232, lon: 104.1834 },
  "cao bằng": { lat: 22.6657, lon: 106.2566 },
  "bắc kạn": { lat: 22.1328, lon: 106.3319 },
  "tuyên quang": { lat: 21.8193, lon: 105.2176 },
  "lào cai": { lat: 22.4852, lon: 103.9759 },
  "yên bái": { lat: 21.7228, lon: 104.8209 },
  "thái nguyên": { lat: 21.5941, lon: 105.8443 },
  "lạng sơn": { lat: 21.8537, lon: 106.6867 },
  "quảng ninh": { lat: 20.9699, lon: 106.8304 },
  "bắc giang": { lat: 21.2764, lon: 106.1976 },
  "phú thọ": { lat: 21.4119, lon: 105.2107 },
  "vĩnh phúc": { lat: 21.3069, lon: 105.5879 },
  "bắc ninh": { lat: 21.1861, lon: 106.1773 },
  "hưng yên": { lat: 20.6464, lon: 105.9753 },
  "hải dương": { lat: 20.9384, lon: 106.3320 },
  "thái bình": { lat: 20.5379, lon: 106.3498 },
  "nam định": { lat: 20.2541, lon: 106.1651 },
  "ninh bình": { lat: 20.2691, lon: 105.9753 },
  "thanh hóa": { lat: 19.9636, lon: 105.2894 },
  "nghệ an": { lat: 18.6704, lon: 104.8350 },
  "hà tĩnh": { lat: 18.3423, lon: 105.3814 },
  "quảng bình": { lat: 17.4681, lon: 106.4278 },
  "quảng trị": { lat: 16.7386, lon: 107.0900 },
  "thừa thiên huế": { lat: 16.4621, lon: 107.5628 },
  "quảng nam": { lat: 15.5394, lon: 108.4745 },
  "quảng ngãi": { lat: 15.1204, lon: 108.8035 },
  "bình định": { lat: 13.9762, lon: 109.0222 },
  "phú yên": { lat: 13.0883, lon: 109.2210 },
  "khánh hòa": { lat: 12.2388, lon: 109.2002 },
  "ninh thuận": { lat: 11.5644, lon: 108.8406 },
  "bình thuận": { lat: 10.9254, lon: 108.0704 },
  "kon tum": { lat: 14.3497, lon: 108.0076 },
  "gia lai": { lat: 13.9829, lon: 108.1378 },
  "bình dương": { lat: 11.0694, lon: 106.6541 },
  "bình phước": { lat: 11.5353, lon: 106.8829 },
  "tây ninh": { lat: 11.3583, lon: 106.1258 },
  "đồng nai": { lat: 11.0693, lon: 107.1667 },
  "bà rịa vũng tàu": { lat: 10.5418, lon: 107.2421 },
  "long an": { lat: 10.6929, lon: 106.4615 },
  "đồng tháp": { lat: 10.4928, lon: 105.6924 },
};

/**
 * Get approximate coordinates for a Vietnamese province
 * 
 * @param province - Province/city name (case-insensitive)
 * @returns Coordinates or null if not found
 */
export function getProvinceCoords(province: string): { lat: number; lon: number } | null {
  if (!province || typeof province !== 'string') {
    return null;
  }
  
  const normalized = province.toLowerCase().trim();
  const coords = VIETNAM_PROVINCE_COORDS[normalized];
  
  if (coords) {
    return coords;
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(VIETNAM_PROVINCE_COORDS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SIMPLIFIED FLOW CALCULATION (for UI display)
 * ───────────────────────────────────────────────────────────────────────────── */

export interface SimplifiedFlowResult {
  emitterCount: number;
  totalFlowLh: number;
  totalFlowM3h: number;
}

/**
 * Calculate simplified flow from area and spacing
 * 
 * @param areaSqMeters - Total area in m²
 * @param spacingMeters - Plant spacing in meters (e.g., 3 for 3m×3m)
 * @param dripperFlowRate - Flow rate per emitter in L/h
 * @returns Object with emitter count and flow rates
 */
export function calculateSimplifiedFlow(
  areaSqMeters: number,
  spacingMeters: number,
  dripperFlowRate: number
): SimplifiedFlowResult {
  isValidPositiveNumber(areaSqMeters, "Diện tích");
  isValidPositiveNumber(spacingMeters, "Khoảng cách");
  isValidPositiveNumber(dripperFlowRate, "Lưu lượng béc");

  const emitterCount = Math.floor(areaSqMeters / (spacingMeters * spacingMeters));
  const totalFlowLh = emitterCount * dripperFlowRate;
  const totalFlowM3h = totalFlowLh / 1000;

  return {
    emitterCount,
    totalFlowLh: Math.round(totalFlowLh),
    totalFlowM3h: Number(totalFlowM3h.toFixed(2)),
  };
}
