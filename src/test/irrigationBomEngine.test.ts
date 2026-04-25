import { describe, expect, it } from 'vitest';
import { calculateIrrigationBOM } from '../lib/irrigationBomEngine';

describe('calculateIrrigationBOM', () => {
  it('calculates total flow from area, spacing, emitter count, and emitter flow', () => {
    const result = calculateIrrigationBOM({
      areaHa: 1,
      cropSlug: 'ca-phe-robusta',
      plantSpacingM: { rowM: 5, plantM: 5 },
      emitterFlowLph: 60,
      emittersPerPlant: 1,
      targetEcMsCm: 1.4,
      sourceEcMsCm: 0.3,
      irrigationHoursPerShift: 2,
    });

    expect(result.hydraulics.plantCount).toBe(400);
    expect(result.hydraulics.emitterCount).toBe(400);
    expect(result.hydraulics.totalFlowLph).toBe(24_000);
    expect(result.hydraulics.totalFlowM3h).toBe(24);
    expect(result.hydraulics.venturiSizeInch).toBe('2');
  });

  it('uses 1 inch Venturi under 20 m3/h and maps BOM items to store SKUs', () => {
    const result = calculateIrrigationBOM({
      areaHa: 1,
      cropSlug: 'dieu',
      plantSpacingM: 10,
      emitterFlowLph: 100,
      emittersPerPlant: 1,
    });

    expect(result.hydraulics.totalFlowM3h).toBe(10);
    expect(result.hydraulics.venturiSizeInch).toBe('1');
    expect(result.items).toHaveLength(6);
    expect(result.items.every((item) => item.sku.length > 0)).toBe(true);
    expect(result.totalEstimatedValue).toBeGreaterThan(0);
  });

  it('estimates dissolved fertilizer from EC delta', () => {
    const result = calculateIrrigationBOM({
      areaHa: 1,
      cropSlug: 'ca-phe-robusta',
      plantSpacingM: 10,
      emitterFlowLph: 100,
      emittersPerPlant: 1,
      targetEcMsCm: 1.6,
      sourceEcMsCm: 0.4,
      irrigationHoursPerShift: 2,
    });

    expect(result.hydraulics.fertilizerKgPerM3).toBe(0.768);
    expect(result.hydraulics.fertilizerKgPerHour).toBe(7.68);
    expect(result.hydraulics.fertilizerKgPerShift).toBe(15.36);
  });
});
