/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  AGRI-HUB HYDRAULIC ENGINE                                                ║
 * ║  Core Algorithm for Irrigation System Pump Calculation                       ║
 * ║  Version: 1.0.0 | Physics-Based Engineering                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * PHYSICS REFERENCES:
 * ──────────────────
 * 1. Hazen-Williams Equation (USA, 1902) - Water flow in pipes
 *    h_f = 10.67 * L * (Q/C)^1.852 * d^(-4.87)
 * 
 * 2. Pump Power Equation - Hydraulic to Mechanical conversion
 *    P = (Q × H × ρ × g) / η
 *    Where simplified for water (ρ ≈ 1000 kg/m³, g ≈ 9.81 m/s²):
 *    HP = (Q_m3h × H_m × 1000) / (3600 × 75 × η)
 * 
 * 3. Flow Continuity
 *    Q = n × q_e (Total flow = emitter count × single emitter flow)
 */

import { round } from "./utils";

/* ─────────────────────────────────────────────────────────────────────────────
 * INTERFACES - Type Definitions
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Input parameters for hydraulic calculation
 * All measurements in SI/metric standard units
 */
export interface HydraulicInput {
  /** Diện tích tưới (Hecta) */
  areaHa: number;
  
  /** Chênh lệch độ cao từ bơm đến điểm cao nhất (Mét) */
  elevationM: number;
  
  /** Chiều dài đường ống chính từ bơm đến cuối rẫy (Mét) */
  pipeLengthM: number;
  
  /** Đường kính trong của ống (Milimét) */
  pipeDiameterMm: number;
  
  /** Lưu lượng của một béc tưới (Lít/Giờ) */
  emitterFlowLPH: number;
  
  /** Tổng số béc tưới trên toàn hệ thống */
  emitterCount: number;
}

/**
 * Output results from hydraulic calculation
 * All values rounded to 2 decimal places for readability
 */
export interface HydraulicOutput {
  /** Tổng lưu lượng hệ thống (Mét khối/Giờ) */
  totalFlowM3H: number;
  
  /** Tổng lưu lượng hệ thống (Mét khối/Giây) */
  totalFlowM3S: number;
  
  /** Tổn thất áp lực do ma sát trong ống (Mét cột nước) */
  frictionLossM: number;
  
  /** Áp suất làm việc của béc tưới (Mét cột nước) */
  emitterPressureM: number;
  
  /** Tổng cột áp yêu cầu tại đầu bơm (Mét) */
  totalHeadM: number;
  
  /** Công suất bơm yêu cầu (Mã lực - Horse Power) */
  requiredPumpHP: number;
  
  /** Công suất bơm yêu cầu (Kilowatt) */
  requiredPumpKW: number;
  
  /** Đường kính ống được đề xuất (mm) */
  recommendedPipeMm: number;
  
  /** Số lượng béc tưới trên mỗi hàng ống */
  emittersPerRow: number;
  
  /** Chi phí vật tư ước tính (VNĐ) */
  estimatedCostVND: number;
  
  /** Cấp độ rủi ro (low|medium|high) */
  riskLevel: "low" | "medium" | "high";
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PHYSICS CONSTANTS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Hazen-Williams Coefficient (C)
 * ──────────────────────────────
 * Measures pipe roughness & flow efficiency
 * 
 * C = 140  → HDPE/PVC pipe (smooth interior) ✅ RECOMMENDED
 * C = 130  → Asbestos cement
 * C = 120  → New steel
 * C = 100  → Old/rough steel
 * C =  90  → Corrugated metal
 */
const HW_COEFFICIENT = 140;

/**
 * Emitter Operating Pressure
 * ─────────────────────────
 * Standard pressure for most drip/bubbler emitters
 * Range: 10-30m (1-3 bar)
 */
const EMITTER_PRESSURE_M = 15; // 15m ≈ 1.5 bar ≈ 21.75 PSI

/**
 * Minor Loss Factor
 * ─────────────────
 * Accounts for fittings, valves, bends, couplings
 * Typically 5-15% of friction loss
 * 
 * Formula: Minor Losses = factor × h_f
 * factor = 0.10 = 10% of friction loss
 */
const MINOR_LOSS_FACTOR = 0.10;

/**
 * Pump Efficiency (η)
 * ─────────────────────
 * Centrifugal pump average efficiency
 * Range: 0.60-0.75 depending on size/condition
 * 
 * Small pumps (< 5 HP):  ~0.60-0.65
 * Medium pumps (5-20 HP): ~0.65-0.70
 * Large pumps (> 20 HP): ~0.70-0.75
 */
const PUMP_EFFICIENCY = 0.65;

/**
 * Safety Factor
 * ─────────────
 * Extra capacity for future growth/margins
 * Typical range: 1.10-1.25 (10-25%)
 */
const SAFETY_FACTOR = 1.15;

/**
 * Conversion Factors
 * ──────────────────
 * Standard metric conversions
 */
const HECTARE_TO_SQM = 10000;       // 1 Ha = 10,000 m²
const LITER_TO_CUBIC_METER = 1000;  // 1 m³ = 1,000 L
const HOUR_TO_SECOND = 3600;        // 1 hour = 3,600 seconds
const MM_TO_METER = 0.001;          // 1 mm = 0.001 m
const HP_TO_KW = 0.7457;            // 1 HP = 0.7457 kW

/**
 * Pipe Sizing Reference (mm)
 * ───────────────────────────
 * Standard HDPE/PVC irrigation pipe sizes
 * Based on typical flow velocity (1-2 m/s optimal)
 */
const PIPE_SIZES_MM = [20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 160, 200];

/* ─────────────────────────────────────────────────────────────────────────────
 * HELPER FUNCTIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Calculate optimal pipe diameter based on flow rate
 * Uses flow velocity optimization (1.5-2.0 m/s ideal for irrigation)
 * 
 * @param flowM3H - Total flow in m³/h
 * @returns Recommended pipe diameter in mm
 */
function calculateOptimalPipeSize(flowM3H: number): number {
  // Optimal flow velocity: 1.5-2.0 m/s
  // Q = V × A → A = Q/V → d = √(4A/π)
  // Simplified empirical formula based on pipe industry standards
  
  const optimalVelocityMPS = 1.8; // meters per second (midpoint)
  const flowM3S = flowM3H / HOUR_TO_SECOND;
  
  // Cross-sectional area: A = Q/V (m²)
  const areaM2 = flowM3S / optimalVelocityMPS;
  
  // Diameter: d = √(4A/π) × 1000 (mm)
  const diameterMM = Math.sqrt((4 * areaM2) / Math.PI) * 1000;
  
  // Find nearest standard pipe size that can handle this flow
  for (const size of PIPE_SIZES_MM) {
    if (size >= diameterMM * 0.9) { // 10% margin
      return size;
    }
  }
  
  return PIPE_SIZES_MM[PIPE_SIZES_MM.length - 1];
}

/**
 * Calculate estimated material cost
 * Rough estimation based on Vietnamese market prices (2026)
 * 
 * @param flowM3H - Flow rate in m³/h
 * @param pipeLengthM - Total pipe length in meters
 * @param emitterCount - Number of emitters
 * @returns Estimated total cost in VND
 */
function estimateMaterialCost(
  flowM3H: number,
  pipeLengthM: number,
  emitterCount: number
): number {
  // Pump cost based on HP (rough estimation)
  const requiredHP = (flowM3H * 15 * 1000) / (HOUR_TO_SECOND * 75 * PUMP_EFFICIENCY);
  const pumpCost = Math.max(5000000, requiredHP * 3000000); // Min 5M, ~3M per HP
  
  // Pipe cost (HDPE 63mm typical) - ~80,000 VND/meter
  const pipeCost = pipeLengthM * 80000;
  
  // Emitter cost - ~15,000 VND each (quality dripper)
  const emitterCost = emitterCount * 15000;
  
  // Fittings, valves, filters (~30% of pipe + pump)
  const fittingCost = (pipeCost + pumpCost) * 0.30;
  
  return Math.round(pumpCost + pipeCost + emitterCost + fittingCost);
}

/**
 * Determine risk level based on system parameters
 * 
 * @param flowM3H - Flow rate
 * @param headM - Total head
 * @param pipeDiameterMm - Pipe diameter
 * @returns Risk level classification
 */
function calculateRiskLevel(
  flowM3H: number,
  headM: number,
  pipeDiameterMm: number
): "low" | "medium" | "high" {
  // Check velocity (high velocity = high friction = risk)
  const optimalPipeSize = calculateOptimalPipeSize(flowM3H);
  const velocityRatio = optimalPipeSize / pipeDiameterMm;
  
  // Risk factors
  if (velocityRatio > 1.3 || headM > 80 || flowM3H > 200) {
    return "high";
  }
  if (velocityRatio > 1.1 || headM > 50 || flowM3H > 100) {
    return "medium";
  }
  return "low";
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MAIN CALCULATION FUNCTION
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  CALCULATE PUMP REQUIREMENT                                                  ║
 * ║  Core hydraulic calculation engine                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * ALGORITHM STEPS:
 * ─────────────────
 * Step 1: Calculate Total Flow Rate (Q)
 *         Q = emitterCount × emitterFlowLPH
 *         Convert L/h → m³/h → m³/s
 * 
 * Step 2: Calculate Friction Loss (hf) using Hazen-Williams
 *         hf = 10.67 × L × (Q/C)^1.852 × d^(-4.87)
 *         Where: L = pipeLengthM, Q = m³/s, d = pipeDiameterMm/1000
 * 
 * Step 3: Calculate Total Head (H)
 *         H = elevationM + hf + emitterPressure + minorLosses
 * 
 * Step 4: Calculate Pump Power (HP)
 *         HP = (Q × H × 1000) / (3600 × 75 × η)
 * 
 * @param input - HydraulicInput parameters
 * @returns HydraulicOutput results with all calculations
 */
export function calculatePumpRequirement(input: HydraulicInput): HydraulicOutput {
  /* ═══════════════════════════════════════════════════════════════════════════
   * STEP 1: FLOW CALCULATION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  // Total flow in Liters per Hour
  const totalFlowLPH = input.emitterCount * input.emitterFlowLPH;
  
  // Convert to Cubic Meters per Hour (m³/h)
  // Formula: Q_m3h = Q_Lh / 1000
  const totalFlowM3H = totalFlowLPH / LITER_TO_CUBIC_METER;
  
  // Convert to Cubic Meters per Second (m³/s)
  // Formula: Q_m3s = Q_m3h / 3600
  // This unit is required for Hazen-Williams equation
  const totalFlowM3S = totalFlowM3H / HOUR_TO_SECOND;

  /* ═══════════════════════════════════════════════════════════════════════════
   * STEP 2: HAZEN-WILLIAMS FRICTION LOSS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  // Convert pipe diameter from mm to meters
  // Hazen-Williams uses meters for diameter
  const pipeDiameterM = input.pipeDiameterMm * MM_TO_METER;
  
  // Hazen-Williams Formula:
  // h_f = 10.67 × L × (Q/C)^1.852 × d^(-4.87)
  //
  // Where:
  //   h_f  = Friction head loss (m)
  //   10.67 = Constant (US units conversion)
  //   L    = Pipe length (m)
  //   Q    = Flow rate (m³/s)
  //   C    = Hazen-Williams roughness coefficient (140 for HDPE/PVC)
  //   d    = Inside diameter (m)
  //
  // NOTE: This formula is valid for:
  //   - Water at ~15°C
  //   - Flow velocity 0.3-3.0 m/s
  //   - Pipe diameters 50mm-4000mm
  
  const hwBase = Math.pow(totalFlowM3S / HW_COEFFICIENT, 1.852);
  const hwDiameter = Math.pow(pipeDiameterM, -4.87);
  const frictionLossM = 10.67 * input.pipeLengthM * hwBase * hwDiameter;

  /* ═══════════════════════════════════════════════════════════════════════════
   * STEP 3: TOTAL HEAD CALCULATION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  // Total Head (H) is the total pressure the pump must overcome
  // Components:
  //   1. Static Head: Elevation difference between pump and highest point
  //   2. Friction Head: Energy lost due to pipe friction
  //   3. Operating Pressure: Required pressure at emitters
  //   4. Minor Losses: Fittings, valves, bends (~10% of friction)
  //
  // Formula: H = elevationM + frictionLossM + emitterPressure + minorLosses
  
  const minorLossesM = frictionLossM * MINOR_LOSS_FACTOR;
  
  const totalHeadM = 
    input.elevationM +           // Static lift
    frictionLossM +              // Friction loss
    EMITTER_PRESSURE_M +         // Operating pressure (15m = 1.5 bar)
    minorLossesM;                // Minor losses (fittings, etc.)

  /* ═══════════════════════════════════════════════════════════════════════════
   * STEP 4: PUMP POWER CALCULATION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  // Hydraulic Power (theoretical, without losses)
  // P_hyd = Q × H × ρ × g
  // 
  // Where:
  //   P_hyd = Hydraulic power (Watts)
  //   Q     = Flow rate (m³/s)
  //   H     = Total head (m)
  //   ρ     = Fluid density (~1000 kg/m³ for water)
  //   g     = Gravitational acceleration (9.81 m/s²)
  
  // Simplified Formula (water ρ×g ≈ 1000 kg/m³ × 9.81 m/s² ≈ 1000 when simplified):
  // HP = (Q × H × 1000) / (3600 × 75 × η)
  //
  // Where:
  //   Q   = Flow rate (m³/h)
  //   H   = Total head (m)
  //   1000 = ρ (water density in kg/m³) ≈ 1000
  //   3600 = seconds per hour
  //   75   = Conversion factor (1 HP = 550 ft-lb/s ≈ 75 kg-m/s)
  //   η    = Pump efficiency (0.65 = 65%)
  
  const hydraulicPowerW = (totalFlowM3H * totalHeadM * 1000) / HOUR_TO_SECOND;
  const shaftPowerKW = hydraulicPowerW / (75 * PUMP_EFFICIENCY);
  const shaftPowerHP = shaftPowerKW / HP_TO_KW;
  
  // Apply safety factor for motor sizing
  const requiredPumpHP = shaftPowerHP * SAFETY_FACTOR;

  /* ═══════════════════════════════════════════════════════════════════════════
   * STEP 5: ADDITIONAL CALCULATIONS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  // Convert HP to KW for international specs
  const requiredPumpKW = requiredPumpHP * HP_TO_KW;
  
  // Calculate optimal pipe size based on flow velocity
  const recommendedPipeMm = calculateOptimalPipeSize(totalFlowM3H);
  
  // Calculate emitters per pipe row (assume 5m spacing between emitters)
  const emittersPerRow = Math.max(1, Math.round(input.emitterCount / 20));
  
  // Estimate total material cost
  const estimatedCostVND = estimateMaterialCost(
    totalFlowM3H,
    input.pipeLengthM,
    input.emitterCount
  );
  
  // Determine risk level
  const riskLevel = calculateRiskLevel(
    totalFlowM3H,
    totalHeadM,
    input.pipeDiameterMm
  );

  /* ═══════════════════════════════════════════════════════════════════════════
   * RETURN RESULTS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  return {
    totalFlowM3H: round(totalFlowM3H, 2),
    totalFlowM3S: round(totalFlowM3S, 4),
    frictionLossM: round(frictionLossM, 2),
    emitterPressureM: EMITTER_PRESSURE_M,
    totalHeadM: round(totalHeadM, 2),
    requiredPumpHP: round(requiredPumpHP, 2),
    requiredPumpKW: round(requiredPumpKW, 2),
    recommendedPipeMm: recommendedPipeMm,
    emittersPerRow: emittersPerRow,
    estimatedCostVND: estimatedCostVND,
    riskLevel: riskLevel,
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * FORMULA DOCUMENTATION (for reference/maintenance)
 * ─────────────────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────────────────────┐
│                    HAZEN-WILLIAMS EQUATION REFERENCE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   h_f = 10.67 × L × (Q/C)^1.852 × d^(-4.87)                              │
│                                                                             │
│   Where:                                                                    │
│   ───────                                                                   │
│   h_f  = Friction head loss (m)                                            │
│   10.67 = Dimensional constant (US Customary)                               │
│   L    = Length of pipe (m)                                                │
│   Q    = Discharge flow rate (m³/s)                                        │
│   C    = Hazen-Williams roughness coefficient                              │
│   d    = Inside diameter of pipe (m)                                       │
│                                                                             │
│   Example:                                                                  │
│   ─────────                                                                  │
│   L = 100m, Q = 0.005 m³/s, C = 140, d = 0.063m                          │
│   h_f = 10.67 × 100 × (0.005/140)^1.852 × (0.063)^(-4.87)                │
│   h_f ≈ 2.35 m                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                       PUMP POWER EQUATION REFERENCE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   P_hp = (Q × H × 1000) / (3600 × 75 × η)                                 │
│                                                                             │
│   Where:                                                                    │
│   ───────                                                                   │
│   P_hp  = Pump power (Horse Power)                                          │
│   Q     = Flow rate (m³/h)                                                 │
│   H     = Total head (m)                                                    │
│   1000  = Water density (kg/m³)                                            │
│   3600  = Conversion (seconds/hour)                                         │
│   75    = Conversion (kg·m/s to HP)                                         │
│   η     = Pump efficiency (decimal)                                        │
│                                                                             │
│   Example:                                                                  │
│   ─────────                                                                  │
│   Q = 50 m³/h, H = 30 m, η = 0.65                                         │
│   P_hp = (50 × 30 × 1000) / (3600 × 75 × 0.65)                           │
│   P_hp ≈ 8.55 HP  →  Round up to 10 HP motor                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

 * ───────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────────
 * EXPORTS
 * ───────────────────────────────────────────────────────────────────────────── */

export default calculatePumpRequirement;
