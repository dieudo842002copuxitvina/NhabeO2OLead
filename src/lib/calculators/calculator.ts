/**
 * Smart Irrigation Calculator
 * Tính toán hệ thống tưới dựa trên diện tích, loại cây, độ dốc, nguồn nước.
 */

export type CropKey = 'sau_rieng' | 'ca_phe' | 'buoi' | 'tieu' | 'rau_mau';
export type SlopeKey = 'flat' | 'mid' | 'steep';
export type WaterSourceKey = 'gieng_khoan' | 'ho' | 'song_suoi';

export interface CropProfile {
  key: CropKey;
  name: string;
  emoji: string;
  /** mật độ cây / 1000 m² */
  density: number;
  /** lít nước / cây / ngày */
  waterPerTree: number;
  /** số béc tưới / cây */
  emittersPerTree: number;
}

export const CROPS: Record<CropKey, CropProfile> = {
  sau_rieng: { key: 'sau_rieng', name: 'Sầu riêng', emoji: '🌳', density: 100, waterPerTree: 80, emittersPerTree: 4 },
  ca_phe:    { key: 'ca_phe',    name: 'Cà phê',    emoji: '☕', density: 1100, waterPerTree: 20, emittersPerTree: 1 },
  buoi:      { key: 'buoi',      name: 'Bưởi',      emoji: '🍊', density: 250,  waterPerTree: 50, emittersPerTree: 2 },
  tieu:      { key: 'tieu',      name: 'Tiêu',      emoji: '🌶️', density: 1600, waterPerTree: 12, emittersPerTree: 1 },
  rau_mau:   { key: 'rau_mau',   name: 'Rau màu',   emoji: '🥬', density: 4000, waterPerTree: 3,  emittersPerTree: 1 },
};

export const SLOPES: Record<SlopeKey, { name: string; pumpFactor: number }> = {
  flat:  { name: 'Bằng phẳng (<5°)',     pumpFactor: 1.0 },
  mid:   { name: 'Dốc vừa (5-15°)',      pumpFactor: 1.25 },
  steep: { name: 'Dốc cao (>15°)',       pumpFactor: 1.6 },
};

export const WATER_SOURCES: Record<WaterSourceKey, { name: string; emoji: string; pressureBoost: number }> = {
  gieng_khoan: { name: 'Giếng khoan',     emoji: '💧', pressureBoost: 1.2 },
  ho:          { name: 'Hồ / ao',          emoji: '🏞️', pressureBoost: 1.0 },
  song_suoi:   { name: 'Sông / suối',      emoji: '🌊', pressureBoost: 0.9 },
};

export interface CalculatorInput {
  areaM2: number;
  crop: CropKey;
  slope: SlopeKey;
  waterSource: WaterSourceKey;
}

export interface CalculatorResult {
  trees: number;
  emitters: number;
  mainPipeM: number;
  branchPipeM: number;
  pumpHP: number;
  totalWaterPerDay: number; // L/day
  budget: BudgetLine[];
  totalBudget: number;
}

export interface BudgetLine {
  item: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

/** Đơn giá tham khảo (VND) */
const PRICES = {
  emitter: 8000,        // /béc
  mainPipe: 35000,      // /m (PE 32mm)
  branchPipe: 12000,    // /m (PE 16mm)
  pumpPerHP: 3500000,   // /HP (máy bơm chuẩn)
  filter: 1800000,      // /bộ
  controller: 3200000,  // /bộ
  installPerM2: 8000,   // /m² (lắp đặt)
};

export function calculateIrrigation(input: CalculatorInput): CalculatorResult {
  const { areaM2, crop, slope, waterSource } = input;
  const cropProfile = CROPS[crop];
  const slopeProfile = SLOPES[slope];
  const waterProfile = WATER_SOURCES[waterSource];

  // Số cây
  const trees = Math.ceil((areaM2 / 1000) * cropProfile.density);
  const emitters = trees * cropProfile.emittersPerTree;

  // Chiều dài ống: ước lượng từ diện tích, mật độ, hệ số dốc
  const sideLength = Math.sqrt(areaM2);
  const mainPipeM = Math.ceil(sideLength * 2 * slopeProfile.pumpFactor);
  // ống phụ: tỉ lệ với số cây và khoảng cách
  const branchPipeM = Math.ceil(trees * (cropProfile.key === 'rau_mau' ? 0.5 : 2.5));

  // Lưu lượng & công suất bơm
  const totalWaterPerDay = trees * cropProfile.waterPerTree; // L/day
  // ước lượng HP: 1 HP ~ 3000 L/h ở áp 2 bar, tưới 4h/ngày
  const requiredFlowLh = totalWaterPerDay / 4;
  const rawHP = (requiredFlowLh / 3000) * slopeProfile.pumpFactor * waterProfile.pressureBoost;
  const pumpHP = Math.max(0.5, Math.ceil(rawHP * 2) / 2); // làm tròn 0.5 HP

  // Dự toán
  const budget: BudgetLine[] = [
    { item: 'Béc tưới nhỏ giọt', qty: emitters, unit: 'cái', unitPrice: PRICES.emitter, subtotal: emitters * PRICES.emitter },
    { item: 'Ống chính PE 32mm',  qty: mainPipeM, unit: 'm', unitPrice: PRICES.mainPipe, subtotal: mainPipeM * PRICES.mainPipe },
    { item: 'Ống phụ PE 16mm',    qty: branchPipeM, unit: 'm', unitPrice: PRICES.branchPipe, subtotal: branchPipeM * PRICES.branchPipe },
    { item: `Máy bơm ${pumpHP} HP`, qty: 1, unit: 'cái', unitPrice: PRICES.pumpPerHP * pumpHP, subtotal: PRICES.pumpPerHP * pumpHP },
    { item: 'Bộ lọc đĩa',          qty: 1, unit: 'bộ', unitPrice: PRICES.filter, subtotal: PRICES.filter },
    { item: 'Bộ điều khiển tự động', qty: 1, unit: 'bộ', unitPrice: PRICES.controller, subtotal: PRICES.controller },
    { item: 'Thi công lắp đặt',     qty: areaM2, unit: 'm²', unitPrice: PRICES.installPerM2, subtotal: areaM2 * PRICES.installPerM2 },
  ];

  const totalBudget = budget.reduce((s, l) => s + l.subtotal, 0);

  return { trees, emitters, mainPipeM, branchPipeM, pumpHP, totalWaterPerDay, budget, totalBudget };
}

export function formatVND(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';
}
