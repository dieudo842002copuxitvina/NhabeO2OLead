/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  HYDRAULIC CALCULATION ENGINE                                          ║
 * ║  Agricultural irrigation system pump & pipe sizing calculator             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Implements Hazen-Williams formula for friction loss calculation
 * and pump requirement estimation for agricultural irrigation systems.
 */

/* ─────────────────────────────────────────────────────────────────────────────

/* ─────────────────────────────────────────────────────────────────────────────
 * TYPES
 * ───────────────────────────────────────────────────────────────────────────── */

export interface HydraulicResult {
  headLossMeters: number;
  pressureDropBar: number;
}

/**
 * Tính toán tổn thất áp lực trong đường ống sử dụng công thức Hazen-Williams
 * @param flowRateLph Lưu lượng nước (Lít/giờ)
 * @param lengthM Chiều dài đường ống (Mét)
 * @param innerDiameterMm Đường kính trong của ống (Milimét)
 * @param cCoefficient Hệ số nhám Hazen-Williams (mặc định 140 cho ống nhựa PVC/HDPE)
 */
export function calculateFrictionLoss(
  flowRateLph: number,
  lengthM: number,
  innerDiameterMm: number,
  cCoefficient: number = 140
): HydraulicResult {
  if (Number.isNaN(flowRateLph) || Number.isNaN(lengthM) || Number.isNaN(innerDiameterMm)) {
    throw new Error("Vui lòng nhập số liệu hợp lệ");
  }
  if (innerDiameterMm <= 0) throw new Error("Đường kính ống phải lớn hơn 0");
  if (flowRateLph < 0) throw new Error("Lưu lượng không được âm");
  if (lengthM < 0) throw new Error("Chiều dài ống không được âm");
  
  if (flowRateLph === 0 || lengthM === 0) {
    return { headLossMeters: 0, pressureDropBar: 0 };
  }

  // Quy đổi L/h -> m³/s
  const flowRateM3s = flowRateLph / 3600000;
  // Quy đổi mm -> m
  const diameterM = innerDiameterMm / 1000;

  // Công thức Hazen-Williams
  const qOverC = flowRateM3s / cCoefficient;
  const headLossMeters = 10.67 * lengthM * Math.pow(qOverC, 1.852) / Math.pow(diameterM, 4.8704);
  const pressureDropBar = headLossMeters / 10.197;

  return {
    headLossMeters: Number(headLossMeters.toFixed(3)),
    pressureDropBar: Number(pressureDropBar.toFixed(3)),
  };
}

/**
 * Input parameters for hydraulic calculation
 */
export interface HydraulicInput {
  areaHa: number;           // Area in hectares
  elevationM: number;       // Elevation change (meters)
  pipeLengthM: number;     // Main pipe length (meters)
  pipeDiameterMm: number;   // Pipe inner diameter (mm)
  emitterFlowLPH: number;  // Emitter flow rate (L/h)
  emitterCount: number;     // Total number of emitters
}

/**
 * Output from hydraulic calculation
 */
export interface HydraulicOutput {
  requiredPumpHP: number;          // Required pump horsepower
  requiredPumpKW: number;          // Required pump kilowatts
  totalFlowM3H: number;           // Total flow rate (m³/h)
  totalHeadM: number;              // Total dynamic head (meters)
  frictionLossM: number;          // Friction loss (meters)
  recommendedPipeMm: number;      // Recommended pipe diameter (mm)
  estimatedCostVND: number;        // Estimated material cost (VND)
  riskLevel: "low" | "medium" | "high";
}

/* ─────────────────────────────────────────────────────────────────────────────
 * CONSTANTS
 * ───────────────────────────────────────────────────────────────────────────── */

// Hazen-Williams C factor for PVC/HDPE pipes
const HAZEN_WILLIAMS_C = 140;

// Operating pressure for emitters (meters of head)
const EMITTER_OPERATING_PRESSURE = 15;

// Filter and fitting losses (meters)
const FITTING_LOSSES = 3;

// Safety factor for pump selection
const PUMP_SAFETY_FACTOR = 1.2;

// Pump efficiency assumption (%)
const PUMP_EFFICIENCY = 0.65;

// Conversion factor: L/h to m³/h
const LPH_TO_M3H = 1000;

// Conversion factor: HP to kW
const HP_TO_KW = 0.7457;

// Cost estimates (VND per unit)
const COST_ESTIMATES = {
  pumpPerHP: 4500000,      // VND per HP
  pipePerMeter63: 85000,   // VND per meter (63mm HDPE)
  pipePerMeter75: 120000,  // VND per meter (75mm HDPE)
  pipePerMeter90: 165000,  // VND per meter (90mm HDPE)
  pipePerMeter110: 250000,  // VND per meter (110mm HDPE)
  emitter: 25000,           // VND per emitter
  filter: 3500000,          // VND for filter system
};

/* ─────────────────────────────────────────────────────────────────────────────
 * HELPER FUNCTIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Convert HP to kW
 */
function hpToKW(hp: number): number {
  return hp * HP_TO_KW;
}

/**
 * Get pipe cost per meter based on diameter
 */
function getPipeCostPerMeter(diameterMm: number): number {
  if (diameterMm <= 63) return COST_ESTIMATES.pipePerMeter63;
  if (diameterMm <= 75) return COST_ESTIMATES.pipePerMeter75;
  if (diameterMm <= 90) return COST_ESTIMATES.pipePerMeter90;
  return COST_ESTIMATES.pipePerMeter110;
}

/**
 * Recommend pipe diameter based on flow rate
 * Uses velocity constraint: 1.5-2.5 m/s for optimal performance
 */
function recommendPipeDiameter(flowM3H: number): number {
  // For flows up to 20 m³/h, 63mm is sufficient
  if (flowM3H <= 20) return 63;
  // For flows up to 40 m³/h, 75mm is recommended
  if (flowM3H <= 40) return 75;
  // For flows up to 70 m³/h, 90mm is recommended
  if (flowM3H <= 70) return 90;
  // For larger flows, 110mm
  return 110;
}

/**
 * Assess risk level based on system parameters
 */
function assessRisk(
  input: HydraulicInput,
  totalHead: number,
  recommendedDiameter: number
): "low" | "medium" | "high" {
  let riskScore = 0;

  // Check elevation
  if (input.elevationM > 50) riskScore += 2;
  else if (input.elevationM > 25) riskScore += 1;

  // Check head
  if (totalHead > 100) riskScore += 2;
  else if (totalHead > 60) riskScore += 1;

  // Check if pipe is undersized
  if (recommendedDiameter > input.pipeDiameterMm) riskScore += 2;

  // Check distance
  if (input.pipeLengthM > 500) riskScore += 1;
  if (input.pipeLengthM > 1000) riskScore += 2;

  // Determine risk level
  if (riskScore >= 4) return "high";
  if (riskScore >= 2) return "medium";
  return "low";
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MAIN CALCULATION FUNCTION
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Calculate pump requirements for an irrigation system
 * 
 * @param input - Hydraulic input parameters
 * @returns Hydraulic output with pump requirements and recommendations
 */
export function calculatePumpRequirement(input: HydraulicInput): HydraulicOutput {
  // Validate inputs
  if (input.areaHa <= 0) {
    throw new Error("Diện tích phải lớn hơn 0");
  }
  if (input.pipeDiameterMm <= 0) {
    throw new Error("Đường kính ống phải lớn hơn 0");
  }
  if (input.emitterFlowLPH <= 0 || input.emitterCount <= 0) {
    throw new Error("Lưu lượng béc và số lượng béc phải lớn hơn 0");
  }

  // 1. Calculate total flow rate
  const totalFlowLPH = input.emitterFlowLPH * input.emitterCount;
  const totalFlowM3H = totalFlowLPH / LPH_TO_M3H;

  // 2. Calculate friction loss using Hazen-Williams formula
  let frictionLossM = 0;
  try {
    frictionLossM = calculateFrictionLoss(
      totalFlowLPH,
      input.pipeLengthM,
      input.pipeDiameterMm,
      HAZEN_WILLIAMS_C
    ).headLossMeters;
  } catch {
    // If friction calculation fails, use simplified estimate
    frictionLossM = (input.pipeLengthM / 100) * 2; // ~2m per 100m for small pipes
  }

  // 3. Calculate total dynamic head
  const elevationHead = input.elevationM;
  const operatingPressure = EMITTER_OPERATING_PRESSURE;
  const totalHeadM = elevationHead + frictionLossM + FITTING_LOSSES + operatingPressure;

  // 4. Calculate pump power requirement
  // Power (W) = (ρ × g × Q × H) / η
  // Where: ρ = 1000 kg/m³, g = 9.81 m/s², Q in m³/s, H in m, η = efficiency
  const flowM3PerSec = totalFlowM3H / 3600;
  const powerWatts = (1000 * 9.81 * flowM3PerSec * totalHeadM) / PUMP_EFFICIENCY;
  const powerKW = powerWatts / 1000;
  
  // Convert to HP with safety factor
  const requiredKW = powerKW * PUMP_SAFETY_FACTOR;
  const requiredHP = requiredKW / HP_TO_KW;

  // Round up to standard pump sizes (0.5 HP increments)
  const roundedHP = Math.ceil(requiredHP * 2) / 2;

  // 5. Get recommended pipe diameter
  const recommendedPipeMm = recommendPipeDiameter(totalFlowM3H);

  // 6. Estimate material costs
  const pipeCost = input.pipeLengthM * getPipeCostPerMeter(input.pipeDiameterMm);
  const emitterCost = input.emitterCount * COST_ESTIMATES.emitter;
  const pumpCost = roundedHP * COST_ESTIMATES.pumpPerHP;
  const filterCost = COST_ESTIMATES.filter;
  
  const estimatedCostVND = pipeCost + emitterCost + pumpCost + filterCost;

  // 7. Assess risk level
  const riskLevel = assessRisk(input, totalHeadM, recommendedPipeMm);

  return {
    requiredPumpHP: roundedHP,
    requiredPumpKW: Math.round(requiredKW * 10) / 10,
    totalFlowM3H: Math.round(totalFlowM3H * 10) / 10,
    totalHeadM: Math.round(totalHeadM * 10) / 10,
    frictionLossM: Math.round(frictionLossM * 10) / 10,
    recommendedPipeMm,
    estimatedCostVND,
    riskLevel,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ───────────────────────────────────────────────────────────────────────────── */

export default calculatePumpRequirement;
