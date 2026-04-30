export interface CurrentCosts {
  laborCostPerMonth: number;
  waterPowerCostPerMonth: number;
  fertilizerCostPerMonth: number;
}

export interface InvestmentInputs {
  totalCapEx: number;
  estimatedLifespan: number;
}

export interface SystemEfficiency {
  laborSavedPercent: number;
  waterPowerSavedPercent: number;
  fertilizerSavedPercent: number;
}

export interface CashflowDataPoint {
  year: number;
  cashflow: number;
  cumulativeCashflow: number;
}

export function calculateAnnualSavings(current: CurrentCosts, efficiency: SystemEfficiency): number {
  const monthlyLaborSavings = current.laborCostPerMonth * (efficiency.laborSavedPercent / 100);
  const monthlyWaterPowerSavings = current.waterPowerCostPerMonth * (efficiency.waterPowerSavedPercent / 100);
  const monthlyFertilizerSavings = current.fertilizerCostPerMonth * (efficiency.fertilizerSavedPercent / 100);

  return (monthlyLaborSavings + monthlyWaterPowerSavings + monthlyFertilizerSavings) * 12;
}

export function calculatePaybackPeriod(capEx: number, annualSavings: number): number {
  if (annualSavings <= 0) {
    throw new Error('So tien tiet kiem hang nam phai lon hon 0.');
  }

  return (capEx / annualSavings) * 12;
}

export function generateCashflowProjection(
  capEx: number,
  annualSavings: number,
  lifespan: number
): CashflowDataPoint[] {
  if (lifespan < 0) {
    throw new Error('Tuoi tho du an khong hop le.');
  }

  const projection: CashflowDataPoint[] = [];
  let cumulative = -capEx;

  projection.push({
    year: 0,
    cashflow: -capEx,
    cumulativeCashflow: cumulative,
  });

  for (let year = 1; year <= lifespan; year += 1) {
    cumulative += annualSavings;
    projection.push({
      year,
      cashflow: annualSavings,
      cumulativeCashflow: cumulative,
    });
  }

  return projection;
}
