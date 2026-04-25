import { comboMockData, IrrigationCombo } from '@/data/comboData';

export interface UserInput {
  cropType: string;
  area: number;
  waterCapacity: number;
}

export function getRecommendedCombos(input?: UserInput): IrrigationCombo[] {
  if (!input) {
    // Return default featured
    const defaultFeatured = comboMockData.filter(c => c.isFeatured);
    return defaultFeatured.length > 0 ? defaultFeatured : [comboMockData[0]];
  }

  const { cropType, area, waterCapacity } = input;

  // Filter valid combos
  let validCombos = comboMockData.filter(combo => {
    const cropMatch = combo.conditions.cropType.includes('all') || combo.conditions.cropType.includes(cropType);
    const areaMatch = area >= combo.conditions.minArea && area <= combo.conditions.maxArea;
    const waterMatch = waterCapacity >= combo.conditions.minWaterCapacity;
    
    return cropMatch && areaMatch && waterMatch;
  });

  // If no match, fallback to standard
  if (validCombos.length === 0) {
    const fallback = comboMockData.find(c => c.id === 'combo-standard') || comboMockData[0];
    return [{ ...fallback, isFeatured: true }];
  }

  // Prioritize combos
  validCombos.sort((a, b) => {
    // Rule 1: Exact crop match
    const aExactCrop = a.conditions.cropType.includes(cropType) && !a.conditions.cropType.includes('all') ? 1 : 0;
    const bExactCrop = b.conditions.cropType.includes(cropType) && !b.conditions.cropType.includes('all') ? 1 : 0;
    if (aExactCrop !== bExactCrop) return bExactCrop - aExactCrop;

    // Rule 2: Closest area range (compare midpoints)
    const aMidArea = (a.conditions.minArea + a.conditions.maxArea) / 2;
    const bMidArea = (b.conditions.minArea + b.conditions.maxArea) / 2;
    const aAreaDelta = Math.abs(aMidArea - area);
    const bAreaDelta = Math.abs(bMidArea - area);
    return aAreaDelta - bAreaDelta;
  });

  // Mark first as recommended/featured
  return validCombos.map((combo, index) => ({
    ...combo,
    isFeatured: index === 0
  }));
}
