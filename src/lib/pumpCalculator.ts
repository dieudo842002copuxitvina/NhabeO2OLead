export interface PipeSpecs {
  innerDiameter: number;
  frictionFactor: number;
}

export interface PumpSpecs {
  horsepower: number;
  maxHead: number;
  maxFlow: number;
  efficiency: number;
}

export interface SystemInputs {
  elevationChange: number;
  mainlineLength: number;
  requiredFlow: number;
  filterLoss?: number;
}

export function calculateFrictionLoss(
  flow: number,
  length: number,
  diameter: number,
  cFactor: number
): number {
  if (flow <= 0 || length <= 0 || diameter <= 0 || cFactor <= 0) {
    throw new Error('Cac gia tri dau vao cho tinh toan ma sat phai lon hon 0.');
  }

  const qCubicMetersPerSecond = flow / 3600;
  const dMeters = diameter / 1000;

  return 10.67 * length * Math.pow(qCubicMetersPerSecond / cFactor, 1.852) / Math.pow(dMeters, 4.87);
}

export interface TDHResult {
  totalDynamicHead: number;
  details: {
    elevationLoss: number;
    frictionLoss: number;
    filterLoss: number;
    operatingPressure: number;
  };
}

export function calculateTDH(inputs: SystemInputs, pipe: PipeSpecs): TDHResult {
  if (inputs.requiredFlow <= 0 || inputs.mainlineLength <= 0 || pipe.innerDiameter <= 0) {
    throw new Error('Luu luong, chieu dai ong va duong kinh ong phai lon hon 0.');
  }

  if (inputs.elevationChange < 0) {
    throw new Error('Chenh lech do cao khong duoc la so am.');
  }

  const frictionLoss = calculateFrictionLoss(
    inputs.requiredFlow,
    inputs.mainlineLength,
    pipe.innerDiameter,
    pipe.frictionFactor
  );

  const filterLoss = inputs.filterLoss !== undefined ? inputs.filterLoss : 3;
  const operatingPressure = 20;
  const elevationLoss = inputs.elevationChange;
  const totalDynamicHead = elevationLoss + frictionLoss + filterLoss + operatingPressure;

  return {
    totalDynamicHead,
    details: {
      elevationLoss,
      frictionLoss,
      filterLoss,
      operatingPressure,
    },
  };
}
