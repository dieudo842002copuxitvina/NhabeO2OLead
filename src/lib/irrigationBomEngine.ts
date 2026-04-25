import { PRODUCTS_DATA, type ProductData } from '../data/productsData';

export type PlantSpacingInput =
  | number
  | {
      rowM: number;
      plantM: number;
    };

export interface IrrigationBOMInput {
  areaHa: number;
  cropSlug: string;
  plantSpacingM: PlantSpacingInput;
  emitterFlowLph: number;
  emittersPerPlant?: number;
  targetEcMsCm?: number;
  sourceEcMsCm?: number;
  irrigationHoursPerShift?: number;
  safetyFactor?: number;
}

export type BOMItemRole = 'MAIN_PIPE' | 'BRANCH_PIPE' | 'EMITTER' | 'FILTER' | 'VENTURI' | 'FERTILIZER';

export interface BOMItem {
  role: BOMItemRole;
  productId: string;
  sku: string;
  name: string;
  category_id: string;
  brand: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  sizing: Record<string, string | number | boolean | null>;
  note: string;
}

export interface BOMResult {
  input: {
    areaHa: number;
    areaM2: number;
    cropSlug: string;
    rowSpacingM: number;
    plantSpacingM: number;
    emitterFlowLph: number;
    emittersPerPlant: number;
    targetEcMsCm: number;
    sourceEcMsCm: number;
    irrigationHoursPerShift: number;
    safetyFactor: number;
  };
  hydraulics: {
    plantCount: number;
    emitterCount: number;
    totalFlowLph: number;
    totalFlowM3h: number;
    mainPipeLengthM: number;
    branchPipeLengthM: number;
    mainPipeDiameterMm: number;
    branchPipeDiameterMm: number;
    filterUnits: number;
    venturiSizeInch: '1' | '2';
    ecDeltaMsCm: number;
    fertilizerKgPerM3: number;
    fertilizerKgPerHour: number;
    fertilizerKgPerShift: number;
  };
  items: BOMItem[];
  totalEstimatedValue: number;
  assumptions: string[];
  warnings: string[];
}

type CropHydraulicProfile = {
  targetEcMsCm: number;
  emittersPerPlant: number;
  fertilizerKeywords: string[];
};

const CROP_PROFILES: Record<string, CropHydraulicProfile> = {
  'ca-phe': { targetEcMsCm: 1.4, emittersPerPlant: 1, fertilizerKeywords: ['cà phê', 'ca phe', 'NPK'] },
  'ca-phe-robusta': { targetEcMsCm: 1.4, emittersPerPlant: 1, fertilizerKeywords: ['cà phê', 'ca phe', 'NPK'] },
  'sau-rieng': { targetEcMsCm: 1.7, emittersPerPlant: 4, fertilizerKeywords: ['sầu riêng', 'sau rieng', 'thúc trái'] },
  'sau-rieng-ri6': { targetEcMsCm: 1.7, emittersPerPlant: 4, fertilizerKeywords: ['sầu riêng', 'sau rieng', 'thúc trái'] },
  'tieu-den': { targetEcMsCm: 1.5, emittersPerPlant: 1, fertilizerKeywords: ['hồ tiêu', 'tieu', 'MAP'] },
  'ho-tieu': { targetEcMsCm: 1.5, emittersPerPlant: 1, fertilizerKeywords: ['hồ tiêu', 'tieu', 'MAP'] },
  'lua-st25': { targetEcMsCm: 1.2, emittersPerPlant: 1, fertilizerKeywords: ['lúa', 'lua', 'NPK'] },
  dieu: { targetEcMsCm: 1.3, emittersPerPlant: 1, fertilizerKeywords: ['điều', 'dieu', 'NPK'] },
};

const DEFAULT_PROFILE: CropHydraulicProfile = {
  targetEcMsCm: 1.5,
  emittersPerPlant: 1,
  fertilizerKeywords: ['NPK', 'tan hoàn toàn', 'water soluble'],
};

const EC_TO_KG_PER_M3 = 0.64;
const DEFAULT_SOURCE_EC = 0.3;
const DEFAULT_IRRIGATION_HOURS = 2;
const DEFAULT_SAFETY_FACTOR = 1.08;

export function calculateIrrigationBOM(input: IrrigationBOMInput): BOMResult {
  const areaHa = assertPositive(input.areaHa, 'areaHa');
  const areaM2 = areaHa * 10_000;
  const spacing = normalizeSpacing(input.plantSpacingM);
  const emitterFlowLph = assertPositive(input.emitterFlowLph, 'emitterFlowLph');
  const profile = CROP_PROFILES[input.cropSlug] ?? DEFAULT_PROFILE;
  const emittersPerPlant = Math.max(1, Math.ceil(input.emittersPerPlant ?? profile.emittersPerPlant));
  const targetEcMsCm = Math.max(0, input.targetEcMsCm ?? profile.targetEcMsCm);
  const sourceEcMsCm = Math.max(0, input.sourceEcMsCm ?? DEFAULT_SOURCE_EC);
  const irrigationHoursPerShift = assertPositive(input.irrigationHoursPerShift ?? DEFAULT_IRRIGATION_HOURS, 'irrigationHoursPerShift');
  const safetyFactor = Math.max(1, input.safetyFactor ?? DEFAULT_SAFETY_FACTOR);

  const plantCount = Math.ceil(areaM2 / (spacing.rowM * spacing.plantM));
  const emitterCount = plantCount * emittersPerPlant;
  const totalFlowLph = emitterCount * emitterFlowLph;
  const totalFlowM3h = totalFlowLph / 1000;
  const fieldSideM = Math.sqrt(areaM2);
  const rowCount = Math.ceil(fieldSideM / spacing.rowM);
  const mainPipeLengthM = Math.ceil(fieldSideM * 1.2 * safetyFactor);
  const branchPipeLengthM = Math.ceil(rowCount * fieldSideM * 1.05 * safetyFactor);
  const mainPipeDiameterMm = sizeMainPipe(totalFlowM3h);
  const branchPipeDiameterMm = sizeBranchPipe(emitterFlowLph, emittersPerPlant);
  const venturiSizeInch = totalFlowM3h < 20 ? '1' : '2';
  const ecDeltaMsCm = Math.max(0, targetEcMsCm - sourceEcMsCm);
  const fertilizerKgPerM3 = round(ecDeltaMsCm * EC_TO_KG_PER_M3, 3);
  const fertilizerKgPerHour = round(fertilizerKgPerM3 * totalFlowM3h, 2);
  const fertilizerKgPerShift = round(fertilizerKgPerHour * irrigationHoursPerShift, 2);

  const emitter = pickEmitterProduct(emitterFlowLph);
  const mainPipe = pickProduct('ong-hdpe');
  const branchPipe = pickProduct('ong-tuoi-nho-giot');
  const filter = pickFilterProduct(totalFlowM3h);
  const venturi = pickProduct('thiet-bi-cham-phan');
  const fertilizer = pickFertilizerProduct(profile.fertilizerKeywords);

  const filterCapacityM3h = parseMaxNumber(filter?.specs.flow_m3h) || 20;
  const filterUnits = Math.max(1, Math.ceil(totalFlowM3h / filterCapacityM3h));

  const items: BOMItem[] = [
    buildPieceItem('EMITTER', emitter, Math.ceil(emitterCount * safetyFactor), {
      requestedFlowLph: emitterFlowLph,
      emittersPerPlant,
    }),
    buildMeterItem('MAIN_PIPE', mainPipe, mainPipeLengthM, {
      requiredDiameterMm: mainPipeDiameterMm,
      calculatedLengthM: mainPipeLengthM,
    }),
    buildMeterItem('BRANCH_PIPE', branchPipe, branchPipeLengthM, {
      requiredDiameterMm: branchPipeDiameterMm,
      calculatedLengthM: branchPipeLengthM,
    }),
    buildPieceItem('FILTER', filter, filterUnits, {
      requiredFlowM3h: round(totalFlowM3h, 2),
      catalogCapacityM3h: filterCapacityM3h,
    }),
    buildPieceItem('VENTURI', venturi, 1, {
      requiredSizeInch: venturiSizeInch,
      triggerRule: totalFlowM3h < 20 ? '<20 m3/h' : '>=20 m3/h',
    }),
    buildPackageItem('FERTILIZER', fertilizer, fertilizerKgPerShift, {
      targetEcMsCm,
      sourceEcMsCm,
      fertilizerKgPerHour,
      fertilizerKgPerShift,
    }),
  ].filter(Boolean) as BOMItem[];

  const warnings = buildWarnings({
    totalFlowM3h,
    mainPipe,
    mainPipeDiameterMm,
    branchPipe,
    branchPipeDiameterMm,
    filter,
    filterCapacityM3h,
    filterUnits,
    fertilizer,
    fertilizerKgPerShift,
  });

  return {
    input: {
      areaHa,
      areaM2,
      cropSlug: input.cropSlug,
      rowSpacingM: spacing.rowM,
      plantSpacingM: spacing.plantM,
      emitterFlowLph,
      emittersPerPlant,
      targetEcMsCm,
      sourceEcMsCm,
      irrigationHoursPerShift,
      safetyFactor,
    },
    hydraulics: {
      plantCount,
      emitterCount,
      totalFlowLph,
      totalFlowM3h: round(totalFlowM3h, 2),
      mainPipeLengthM,
      branchPipeLengthM,
      mainPipeDiameterMm,
      branchPipeDiameterMm,
      filterUnits,
      venturiSizeInch,
      ecDeltaMsCm: round(ecDeltaMsCm, 2),
      fertilizerKgPerM3,
      fertilizerKgPerHour,
      fertilizerKgPerShift,
    },
    items,
    totalEstimatedValue: items.reduce((sum, item) => sum + item.subtotal, 0),
    assumptions: [
      'Dien tich ha duoc quy doi sang m2 truoc khi tinh mat do cay.',
      'Tong luu luong = (dien tich m2 / dien tich khoang cach cay m2) * so bec/cay * luu luong bec.',
      'Luong phan tan uoc tinh theo quy doi EC: 1 mS/cm xap xi 0.64 kg muoi hoa tan/m3 nuoc.',
      'Chieu dai ong la uoc tinh so bo cho BOM online; ban ve thi cong can khao sat dia hinh, cot ap va phan khu tuoi.',
    ],
    warnings,
  };
}

export function formatBomCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeSpacing(spacing: PlantSpacingInput) {
  if (typeof spacing === 'number') {
    const value = assertPositive(spacing, 'plantSpacingM');
    return { rowM: value, plantM: value };
  }

  return {
    rowM: assertPositive(spacing.rowM, 'plantSpacingM.rowM'),
    plantM: assertPositive(spacing.plantM, 'plantSpacingM.plantM'),
  };
}

function assertPositive(value: number, field: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a positive number`);
  }

  return value;
}

function sizeMainPipe(flowM3h: number) {
  if (flowM3h <= 8) return 50;
  if (flowM3h <= 20) return 63;
  if (flowM3h <= 40) return 90;
  return 110;
}

function sizeBranchPipe(emitterFlowLph: number, emittersPerPlant: number) {
  const localFlowLph = emitterFlowLph * emittersPerPlant;
  if (localFlowLph <= 120) return 16;
  if (localFlowLph <= 250) return 20;
  return 25;
}

function pickEmitterProduct(emitterFlowLph: number) {
  if (emitterFlowLph <= 10) {
    return pickProduct('dau-tuoi-nho-giot', (product) => product.name.toLowerCase().includes('pcj'));
  }

  if (emitterFlowLph <= 300) {
    return pickProduct('bec-tuoi-phun-mua') ?? pickProduct('dau-tuoi-nho-giot');
  }

  return pickProduct('sung-tuoi-phun-mua') ?? pickProduct('bec-tuoi-phun-mua');
}

function pickFilterProduct(requiredFlowM3h: number) {
  const filters = PRODUCTS_DATA.filter((product) => product.category_id === 'loc-he-thong-tuoi');
  return (
    filters.find((product) => {
      const capacity = parseMaxNumber(product.specs.flow_m3h);
      return capacity >= requiredFlowM3h;
    }) ??
    filters.sort((a, b) => parseMaxNumber(b.specs.flow_m3h) - parseMaxNumber(a.specs.flow_m3h))[0] ??
    null
  );
}

function pickFertilizerProduct(keywords: string[]) {
  const waterSoluble = PRODUCTS_DATA.filter((product) => product.category_id === 'fertilizer-water-soluble');
  const allFertilizers = PRODUCTS_DATA.filter((product) => product.type === 'FERTILIZER');
  const normalizedKeywords = keywords.map(normalizeText);

  return (
    waterSoluble.find((product) => matchesKeywords(product, normalizedKeywords)) ??
    allFertilizers.find((product) => matchesKeywords(product, normalizedKeywords)) ??
    waterSoluble[0] ??
    allFertilizers[0] ??
    null
  );
}

function pickProduct(categoryId: string, predicate?: (product: ProductData) => boolean) {
  const products = PRODUCTS_DATA.filter((product) => product.category_id === categoryId);
  return predicate ? products.find(predicate) ?? products[0] ?? null : products[0] ?? null;
}

function buildPieceItem(
  role: BOMItemRole,
  product: ProductData | null,
  quantity: number,
  sizing: BOMItem['sizing'],
): BOMItem | null {
  if (!product) return null;
  const safeQuantity = Math.max(1, Math.ceil(quantity));

  return {
    role,
    productId: product.id,
    sku: product.sku,
    name: product.name,
    category_id: product.category_id,
    brand: product.brand ?? product.brand_id,
    unit: product.unit,
    unitPrice: product.price,
    quantity: safeQuantity,
    subtotal: safeQuantity * product.price,
    sizing,
    note: buildRoleNote(role, product, safeQuantity),
  };
}

function buildMeterItem(
  role: BOMItemRole,
  product: ProductData | null,
  lengthM: number,
  sizing: BOMItem['sizing'],
): BOMItem | null {
  if (!product) return null;
  const packageMeters = parsePackageMeters(product.unit);
  const quantity = packageMeters ? Math.max(1, Math.ceil(lengthM / packageMeters)) : Math.ceil(lengthM);

  return {
    role,
    productId: product.id,
    sku: product.sku,
    name: product.name,
    category_id: product.category_id,
    brand: product.brand ?? product.brand_id,
    unit: product.unit,
    unitPrice: product.price,
    quantity,
    subtotal: quantity * product.price,
    sizing: {
      ...sizing,
      packageMeters: packageMeters ?? null,
    },
    note: packageMeters ? `Dat ${quantity} ${product.unit} de dap ung ${lengthM} m tinh toan.` : `Dat theo met cho ${lengthM} m tinh toan.`,
  };
}

function buildPackageItem(
  role: BOMItemRole,
  product: ProductData | null,
  requiredKg: number,
  sizing: BOMItem['sizing'],
): BOMItem | null {
  if (!product) return null;
  const packageKg = parsePackageKgEquivalent(product.unit);
  const quantity = packageKg ? Math.max(1, Math.ceil(requiredKg / packageKg)) : 1;

  return {
    role,
    productId: product.id,
    sku: product.sku,
    name: product.name,
    category_id: product.category_id,
    brand: product.brand ?? product.brand_id,
    unit: product.unit,
    unitPrice: product.price,
    quantity,
    subtotal: quantity * product.price,
    sizing: {
      ...sizing,
      packageKgEquivalent: packageKg ?? null,
    },
    note: packageKg
      ? `Can khoang ${requiredKg} kg/ca tuoi, lam tron thanh ${quantity} ${product.unit}.`
      : 'Khong doc duoc quy cach dong goi, tam de xuat 1 don vi san pham.',
  };
}

function buildRoleNote(role: BOMItemRole, product: ProductData, quantity: number) {
  if (role === 'VENTURI') return `Chon SKU ${product.sku}; size thiet ke nam trong sizing.requiredSizeInch.`;
  if (role === 'FILTER') return `So luong loc lam tron theo cong suat catalog va tong luu luong he thong.`;
  if (role === 'EMITTER') return `So luong da cong du phong, lam tron ${quantity} ${product.unit}.`;
  return `Chon tu catalog PRODUCTS_DATA SKU ${product.sku}.`;
}

function buildWarnings(args: {
  totalFlowM3h: number;
  mainPipe: ProductData | null;
  mainPipeDiameterMm: number;
  branchPipe: ProductData | null;
  branchPipeDiameterMm: number;
  filter: ProductData | null;
  filterCapacityM3h: number;
  filterUnits: number;
  fertilizer: ProductData | null;
  fertilizerKgPerShift: number;
}) {
  const warnings: string[] = [];
  const mainPipeCatalogDiameter = parseMaxNumber(args.mainPipe?.specs.diameter_mm);
  const branchPipeCatalogDiameter = parseMaxNumber(args.branchPipe?.specs.diameter_mm);

  if (!args.mainPipe) warnings.push('Khong tim thay SKU ong chinh trong PRODUCTS_DATA.');
  else if (mainPipeCatalogDiameter && mainPipeCatalogDiameter < args.mainPipeDiameterMm) {
    warnings.push(`SKU ong chinh hien co ${mainPipeCatalogDiameter} mm nho hon size tinh toan ${args.mainPipeDiameterMm} mm.`);
  }

  if (!args.branchPipe) warnings.push('Khong tim thay SKU ong nhanh trong PRODUCTS_DATA.');
  else if (branchPipeCatalogDiameter && branchPipeCatalogDiameter < args.branchPipeDiameterMm) {
    warnings.push(`SKU ong nhanh hien co ${branchPipeCatalogDiameter} mm nho hon size tinh toan ${args.branchPipeDiameterMm} mm.`);
  }

  if (!args.filter) warnings.push('Khong tim thay SKU bo loc trong PRODUCTS_DATA.');
  else if (args.filterUnits > 1) {
    warnings.push(`Tong luu luong ${round(args.totalFlowM3h, 2)} m3/h vuot cong suat loc don ${args.filterCapacityM3h} m3/h, can ${args.filterUnits} bo song song.`);
  }

  if (!args.fertilizer && args.fertilizerKgPerShift > 0) {
    warnings.push('Khong tim thay SKU phan bon hoa tan de gan vao BOM.');
  }

  return warnings;
}

function parsePackageMeters(unit: string) {
  const match = unit.match(/(\d+(?:[.,]\d+)?)\s*m\b/i);
  return match ? Number(match[1].replace(',', '.')) : null;
}

function parsePackageKgEquivalent(unit: string) {
  const kg = unit.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);
  if (kg) return Number(kg[1].replace(',', '.'));

  const liter = unit.match(/(\d+(?:[.,]\d+)?)\s*l\b/i);
  if (liter) return Number(liter[1].replace(',', '.'));

  return null;
}

function parseMaxNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const matches = value.match(/\d+(?:[.,]\d+)?/g);
  if (!matches) return 0;
  return Math.max(...matches.map((match) => Number(match.replace(',', '.'))));
}

function matchesKeywords(product: ProductData, normalizedKeywords: string[]) {
  const searchable = normalizeText(
    [product.name, product.description, product.tags.join(' '), product.specs.crop, product.specs.stage]
      .filter(Boolean)
      .join(' '),
  );

  return normalizedKeywords.some((keyword) => searchable.includes(keyword));
}

function normalizeText(value: unknown) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
