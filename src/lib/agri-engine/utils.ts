/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  AGRI-ENGINE UTILITY FUNCTIONS                                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * CURRENCY FORMATTING
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Format number as Vietnamese Dong (VND) currency
 * @param amount - Amount in VND
 * @returns Formatted string like "12.500.000 đ"
 */
export function formatVND(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0 đ";
  }
  
  // Use Intl.NumberFormat for proper VND formatting
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousands separators
 * @param num - Number to format
 * @returns Formatted string like "1,234,567"
 */
export function formatNumber(num: number): string {
  if (typeof num !== "number" || isNaN(num)) {
    return "0";
  }
  return new Intl.NumberFormat("vi-VN").format(num);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * UNIT CONVERSIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Convert hectares to square meters
 */
export function haToM2(ha: number): number {
  return ha * 10000;
}

/**
 * Convert square meters to hectares
 */
export function m2ToHa(m2: number): number {
  return m2 / 10000;
}

/**
 * Convert liters per hour to cubic meters per hour
 */
export function lphToM3h(lph: number): number {
  return lph / 1000;
}

/**
 * Convert cubic meters per hour to liters per hour
 */
export function m3hToLph(m3h: number): number {
  return m3h * 1000;
}

/**
 * Convert millimeters to inches
 */
export function mmToInch(mm: number): number {
  return mm / 25.4;
}

/**
 * Convert meters to feet
 */
export function mToFeet(m: number): number {
  return m * 3.28084;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * AREA CALCULATIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Calculate number of emitters needed for a given area
 * @param areaHa - Area in hectares
 * @param spacingM - Emitter spacing in meters (e.g., 2 for 2m x 2m)
 * @returns Number of emitters needed
 */
export function calculateEmitterCount(areaHa: number, spacingM: number): number {
  const areaM2 = haToM2(areaHa);
  return Math.ceil(areaM2 / (spacingM * spacingM));
}

/**
 * Calculate area covered by emitters
 * @param emitterCount - Number of emitters
 * @param spacingM - Emitter spacing in meters
 * @returns Area in hectares
 */
export function calculateAreaFromEmitters(emitterCount: number, spacingM: number): number {
  const areaM2 = emitterCount * spacingM * spacingM;
  return m2ToHa(areaM2);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PIPE CALCULATIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Standard pipe diameters in mm
 */
export const STANDARD_PIPE_DIAMETERS = [20, 25, 32, 40, 50, 63, 75, 90, 110, 160, 200];

/**
 * Get the next standard pipe size up from a given diameter
 */
export function getNextStandardPipeSize(currentDiameterMm: number): number {
  return STANDARD_PIPE_DIAMETERS.find(d => d > currentDiameterMm) || STANDARD_PIPE_DIAMETERS[STANDARD_PIPE_DIAMETERS.length - 1];
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PUMP CALCULATIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Standard pump sizes in HP
 */
export const STANDARD_PUMP_HP = [0.5, 1, 1.5, 2, 3, 4, 5, 5.5, 7.5, 10, 15, 20, 25, 30, 40, 50];

/**
 * Round up to next standard pump size
 */
export function roundToStandardPumpHP(requiredHP: number): number {
  return STANDARD_PUMP_HP.find(hp => hp >= requiredHP) || STANDARD_PUMP_HP[STANDARD_PUMP_HP.length - 1];
}

/**
 * Convert HP to kW
 */
export function hpToKW(hp: number): number {
  return hp * 0.7457;
}

/**
 * Convert kW to HP
 */
export function kwToHP(kw: number): number {
  return kw / 0.7457;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * VALIDATION HELPERS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Check if a number is within a valid range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ───────────────────────────────────────────────────────────────────────────── */

export default {
  formatVND,
  formatNumber,
  haToM2,
  m2ToHa,
  lphToM3h,
  m3hToLph,
  mmToInch,
  mToFeet,
  calculateEmitterCount,
  calculateAreaFromEmitters,
  STANDARD_PIPE_DIAMETERS,
  getNextStandardPipeSize,
  STANDARD_PUMP_HP,
  roundToStandardPumpHP,
  hpToKW,
  kwToHP,
  isInRange,
  clamp,
};
