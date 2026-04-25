/**
 * Smart Calculator engine v2 — fully driven by admin-tunable params
 * loaded from public.calculator_params (Supabase).
 *
 * Pure function; given a params map + project input, returns a quote.
 */

export type CropKey = 'durian' | 'coffee' | 'pomelo' | 'pepper' | 'dragonfruit' | 'avocado';
export type SlopeKey = 'flat' | 'hilly';
export type WaterSourceKey = 'well' | 'river';

export interface CropMeta {
  key: CropKey;
  name: string;
  emoji: string;
  /** Maps to commodityPrices entry name for trend lookup (optional). */
  commodityName?: string;
  paramPrefix: string; // e.g. 'crop_durian'
}

export const CROPS: CropMeta[] = [
  { key: 'durian',      name: 'Sầu riêng',  emoji: '🌳', commodityName: 'Sầu riêng', paramPrefix: 'crop_durian' },
  { key: 'coffee',      name: 'Cà phê',     emoji: '☕', commodityName: 'Cà phê',    paramPrefix: 'crop_coffee' },
  { key: 'pomelo',      name: 'Bưởi',       emoji: '🍊',                              paramPrefix: 'crop_pomelo' },
  { key: 'pepper',      name: 'Hồ tiêu',    emoji: '🌶️', commodityName: 'Hồ tiêu',  paramPrefix: 'crop_pepper' },
  { key: 'dragonfruit', name: 'Thanh long', emoji: '🐉',                              paramPrefix: 'crop_dragonfruit' },
  { key: 'avocado',     name: 'Bơ',         emoji: '🥑',                              paramPrefix: 'crop_avocado' },
];

export const SLOPES: { key: SlopeKey; name: string; emoji: string }[] = [
  { key: 'flat',  name: 'Phẳng',  emoji: '🟢' },
  { key: 'hilly', name: 'Dốc',    emoji: '⛰️' },
];

export const WATER_SOURCES: { key: WaterSourceKey; name: string; emoji: string }[] = [
  { key: 'well',  name: 'Giếng khoan', emoji: '💧' },
  { key: 'river', name: 'Hồ / Sông',   emoji: '🏞️' },
];

export interface CalculatorInput {
  crop: CropKey;
  areaM2: number;
  spacing: number;        // metres, e.g. 6 means 6×6m
  slope: SlopeKey;
  waterSource: WaterSourceKey;
}

export interface QuoteLine {
  item: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export interface CalculatorResult {
  trees: number;
  nozzleCount: number;
  mainPipeMeters: number;
  branchPipeMeters: number;
  pipeMeters: number;       // total
  pumpHP: number;
  lines: QuoteLine[];
  totalCost: number;
}

export type ParamMap = Record<string, number>;

const num = (params: ParamMap, key: string, fallback: number): number =>
  typeof params[key] === 'number' ? params[key] : fallback;

export function calculate(input: CalculatorInput, params: ParamMap): CalculatorResult {
  const crop = CROPS.find(c => c.key === input.crop) ?? CROPS[0];

  // Tree count from spacing grid
  const spacing = Math.max(1, input.spacing);
  const trees = Math.max(1, Math.floor(input.areaM2 / (spacing * spacing)));

  const nozzlesPerTree = num(params, `${crop.paramPrefix}_nozzles`, 1);
  const nozzleCount = trees * nozzlesPerTree;

  // Pipe estimation: main pipe = 2× sqrt(area), branch = 1.2× spacing per tree
  const sideLength = Math.sqrt(input.areaM2);
  const mainPipeMeters = Math.ceil(sideLength * 2);
  const branchPipeMeters = Math.ceil(trees * spacing * 1.2);

  // Coefficients
  const slopeFactor = input.slope === 'flat'
    ? num(params, 'factor_slope_flat', 1.0)
    : num(params, 'factor_slope_hilly', 1.15);
  const waterFactor = input.waterSource === 'well'
    ? num(params, 'factor_water_well', 1.10)
    : num(params, 'factor_water_river', 1.0);
  const lossFactor = num(params, 'factor_loss', 1.08);

  // Pump sizing: HP per 1000m² baseline, scaled by slope & water source
  const pumpBase = num(params, 'pump_hp_per_1000m2', 0.6);
  const pumpRaw = (input.areaM2 / 1000) * pumpBase * slopeFactor * waterFactor;
  const pumpHP = Math.max(0.5, Math.ceil(pumpRaw * 2) / 2); // round up to 0.5 HP

  // Prices
  const priceNozzle      = num(params, 'price_nozzle', 35000);
  const priceMain        = num(params, 'price_pipe_main', 18000);
  const priceBranch      = num(params, 'price_pipe_branch', 6500);
  const pricePumpPerHP   = num(params, 'price_pump_per_hp', 2200000);
  const priceFilter      = num(params, 'price_filter', 850000);
  const priceInstall     = num(params, 'price_install_per_m2', 4500);

  const lines: QuoteLine[] = [
    {
      item: 'Béc tưới',
      qty: Math.ceil(nozzleCount * lossFactor),
      unit: 'cái',
      unitPrice: priceNozzle,
      subtotal: Math.ceil(nozzleCount * lossFactor) * priceNozzle,
    },
    {
      item: 'Ống chính PE Ø32',
      qty: Math.ceil(mainPipeMeters * lossFactor),
      unit: 'm',
      unitPrice: priceMain,
      subtotal: Math.ceil(mainPipeMeters * lossFactor) * priceMain,
    },
    {
      item: 'Ống nhánh Ø16',
      qty: Math.ceil(branchPipeMeters * lossFactor),
      unit: 'm',
      unitPrice: priceBranch,
      subtotal: Math.ceil(branchPipeMeters * lossFactor) * priceBranch,
    },
    {
      item: `Máy bơm ${pumpHP} HP`,
      qty: 1,
      unit: 'bộ',
      unitPrice: pricePumpPerHP * pumpHP,
      subtotal: pricePumpPerHP * pumpHP,
    },
    {
      item: 'Bộ lọc + van',
      qty: 1,
      unit: 'bộ',
      unitPrice: priceFilter,
      subtotal: priceFilter,
    },
    {
      item: 'Thi công lắp đặt',
      qty: input.areaM2,
      unit: 'm²',
      unitPrice: priceInstall,
      subtotal: input.areaM2 * priceInstall,
    },
  ];

  const totalCost = lines.reduce((s, l) => s + l.subtotal, 0);

  return {
    trees,
    nozzleCount,
    mainPipeMeters,
    branchPipeMeters,
    pipeMeters: mainPipeMeters + branchPipeMeters,
    pumpHP,
    lines,
    totalCost,
  };
}

export function formatVND(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';
}

/** Build the Zalo / Sales Proposal message. */
export function buildSalesMessage(args: {
  leadId: string;
  customerName: string;
  customerPhone: string;
  crop: string;
  areaM2: number;
  total: number;
  pumpHP: number;
  nozzleCount: number;
}): string {
  return [
    `📋 ĐỀ NGHỊ BÁO GIÁ HỆ THỐNG TƯỚI`,
    `Mã đơn: ${args.leadId}`,
    `Khách: ${args.customerName} — ${args.customerPhone}`,
    `Cây trồng: ${args.crop}`,
    `Diện tích: ${args.areaM2.toLocaleString('vi-VN')} m²`,
    `Số béc tưới: ${args.nozzleCount.toLocaleString('vi-VN')} cái`,
    `Máy bơm gợi ý: ${args.pumpHP} HP`,
    `Tổng dự toán: ${formatVND(args.total)}`,
    ``,
    `Vui lòng gửi bản vẽ chi tiết & báo giá chính thức. Cảm ơn!`,
  ].join('\n');
}
