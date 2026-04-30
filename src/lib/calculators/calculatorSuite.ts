/**
 * Pure calculation helpers for the Irrigation Engineer Suite.
 * Kept framework-agnostic so they can be unit tested.
 */

// ---------- Hydraulic head loss (Hazen-Williams simplified) ----------
// Standard PVC/PE pipe roughness coefficient
const HAZEN_C = 150;

export interface HeadLossInput {
  diameterMm: number;     // inside diameter
  lengthM: number;
  flowLpm: number;        // liters / minute
}

export interface HeadLossResult {
  headLossM: number;          // meters of water column
  headLossBar: number;        // bar
  velocityMs: number;         // m/s
  warning: string | null;
}

export function computeHeadLoss({ diameterMm, lengthM, flowLpm }: HeadLossInput): HeadLossResult {
  const D = diameterMm / 1000;                 // m
  const Q = flowLpm / 60_000;                  // m³/s
  const A = Math.PI * (D / 2) ** 2;            // m²
  const v = A > 0 ? Q / A : 0;                 // m/s
  // Hazen-Williams: hf = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)
  const hf = (10.67 * lengthM * Math.pow(Q, 1.852)) / (Math.pow(HAZEN_C, 1.852) * Math.pow(D, 4.87));
  let warning: string | null = null;
  if (v > 2.5) warning = 'Vận tốc > 2.5 m/s — có thể gây xói mòn ống, nên tăng đường kính';
  else if (v < 0.5 && Q > 0) warning = 'Vận tốc thấp, ống quá lớn so với lưu lượng';
  return {
    headLossM: +hf.toFixed(2),
    headLossBar: +(hf / 10.2).toFixed(3),
    velocityMs: +v.toFixed(2),
    warning,
  };
}

// ---------- Electrical sizing (cable + breaker) ----------
export interface ElectricalInput {
  pumpHp: number;
  voltage: 220 | 380;
  cableLengthM: number;
  phase?: 1 | 3;
}

export interface ElectricalResult {
  ratedCurrentA: number;
  startingCurrentA: number;
  cableMm2: number;
  breakerA: number;
  rcdMa: number;
  voltageDropPct: number;
  recommendation: string;
}

const CABLE_TABLE = [1.5, 2.5, 4, 6, 10, 16, 25, 35]; // common Cu sizes (mm²)
const BREAKER_SIZES = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100];

function cableForCurrent(current: number): number {
  // Conservative current-carrying capacity for Cu in conduit
  const capacity: Record<number, number> = { 1.5: 16, 2.5: 22, 4: 30, 6: 40, 10: 55, 16: 75, 25: 100, 35: 125 };
  for (const s of CABLE_TABLE) if (capacity[s] >= current * 1.25) return s;
  return CABLE_TABLE[CABLE_TABLE.length - 1];
}

function nextBreaker(current: number): number {
  const target = current * 1.25;
  for (const b of BREAKER_SIZES) if (b >= target) return b;
  return BREAKER_SIZES[BREAKER_SIZES.length - 1];
}

export function computeElectrical(input: ElectricalInput): ElectricalResult {
  const { pumpHp, voltage, cableLengthM } = input;
  const phase = input.phase ?? (voltage === 380 ? 3 : 1);
  const wattInput = pumpHp * 746 / 0.85; // motor efficiency ~85%
  const ratedCurrent = phase === 3
    ? wattInput / (Math.sqrt(3) * voltage * 0.85)
    : wattInput / (voltage * 0.85);
  const startingCurrent = ratedCurrent * 6;
  const cable = cableForCurrent(ratedCurrent);
  const breaker = nextBreaker(ratedCurrent);
  // Voltage drop ≈ (2 * L * I * ρ) / (cable * 1000)  with ρ_Cu = 0.0175 Ω·mm²/m
  const drop = (2 * cableLengthM * ratedCurrent * 0.0175) / cable;
  const dropPct = (drop / voltage) * 100;
  let recommendation = '';
  if (dropPct > 3) recommendation = 'Sụt áp > 3% — nên tăng tiết diện dây hoặc rút ngắn khoảng cách.';
  else recommendation = 'Cấu hình điện đạt chuẩn (sụt áp ≤ 3%).';
  return {
    ratedCurrentA: +ratedCurrent.toFixed(1),
    startingCurrentA: +startingCurrent.toFixed(1),
    cableMm2: cable,
    breakerA: breaker,
    rcdMa: 30,
    voltageDropPct: +dropPct.toFixed(2),
    recommendation,
  };
}

// ---------- ROI comparison ----------
export interface RoiInput {
  areaHa: number;
  yearlyYieldKgPerHa: number;
  pricePerKg: number;
  nhaBeInvest: number;        // total upfront VND
  traditionalInvest: number;
  nhaBeYieldUplift: number;   // 0.20 = +20%
  nhaBeWaterSavingPct: number;// 0.55
  laborSavedHoursYear: number;
  laborCostHour: number;
  yearsHorizon: number;
}

export interface RoiResult {
  yearlyRevenueBase: number;
  yearlyRevenueNhaBe: number;
  yearlySavings: number;
  paybackYears: number;
  roiPct: number;
  cumulativeAdvantage: number;
}

export function computeRoi(i: RoiInput): RoiResult {
  const baseRev = i.areaHa * i.yearlyYieldKgPerHa * i.pricePerKg;
  const upliftRev = baseRev * i.nhaBeYieldUplift;
  const waterSavingsVnd = i.areaHa * 1_500_000 * i.nhaBeWaterSavingPct;
  const laborSavings = i.laborSavedHoursYear * i.laborCostHour;
  const yearlyAdvantage = upliftRev + waterSavingsVnd + laborSavings;
  const investDelta = i.nhaBeInvest - i.traditionalInvest;
  const payback = yearlyAdvantage > 0 ? investDelta / yearlyAdvantage : 99;
  const cumulative = yearlyAdvantage * i.yearsHorizon - investDelta;
  const roi = investDelta > 0 ? (cumulative / investDelta) * 100 : 0;
  return {
    yearlyRevenueBase: Math.round(baseRev),
    yearlyRevenueNhaBe: Math.round(baseRev + upliftRev),
    yearlySavings: Math.round(yearlyAdvantage),
    paybackYears: +payback.toFixed(1),
    roiPct: Math.round(roi),
    cumulativeAdvantage: Math.round(cumulative),
  };
}

export function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';
}
