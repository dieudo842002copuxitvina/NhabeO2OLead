/**
 * Các interface định nghĩa cấu trúc dữ liệu cho Máy tính Trạm bơm (Pump Calculator)
 * Được thiết kế để đồng bộ với cấu trúc JSONB của cơ sở dữ liệu Supabase.
 */

export interface PipeSpecs {
  /**
   * Đường kính trong của ống chính (mm)
   * Ví dụ: Ống PVC phi 60 có innerDiameter ~ 56mm
   */
  innerDiameter: number;
  
  /**
   * Hệ số nhám Hazen-Williams (C factor)
   * Ví dụ: PVC = 150, HDPE = 140, Ống thép cũ = 100
   */
  frictionFactor: number;
}

export interface PumpSpecs {
  /**
   * Công suất danh định của máy bơm (HP - Mã lực)
   */
  horsepower: number;
  
  /**
   * Cột áp tối đa (m) - Hmax
   */
  maxHead: number;
  
  /**
   * Lưu lượng tối đa (m³/h) - Qmax
   */
  maxFlow: number;
  
  /**
   * Hiệu suất hoạt động của bơm (%) - Mặc định thường là 60-75%
   */
  efficiency: number;
}

export interface SystemInputs {
  /**
   * Chênh lệch độ cao giữa nguồn nước (mực nước tĩnh) và điểm tưới cao nhất (m)
   */
  elevationChange: number;
  
  /**
   * Chiều dài ống dẫn chính từ trạm bơm đến lô tưới (m)
   */
  mainlineLength: number;
  
  /**
   * Lưu lượng nước cần thiết yêu cầu từ rẫy (m³/h)
   * Được tính tổng từ các béc tưới hoạt động cùng lúc
   */
  requiredFlow: number;
  
  /**
   * Suy hao áp suất qua hệ thống lọc (m)
   * Mặc định thường từ 3m đến 5m tùy độ nghẹt của lọc
   */
  filterLoss?: number;
}

/**
 * Tính toán tổn thất áp suất do ma sát trên đường ống chính
 * Sử dụng công thức Hazen-Williams (hệ Metric)
 * 
 * @param flow Lưu lượng nước (m³/h)
 * @param length Chiều dài đường ống (m)
 * @param diameter Đường kính trong của ống (mm)
 * @param cFactor Hệ số nhám (ví dụ PVC: 150)
 * @returns Tổn thất áp suất do ma sát (m)
 */
export function calculateFrictionLoss(
  flow: number,
  length: number,
  diameter: number,
  cFactor: number
): number {
  if (flow <= 0 || length <= 0 || diameter <= 0 || cFactor <= 0) {
    throw new Error('Các giá trị đầu vào cho tính toán ma sát phải lớn hơn 0.');
  }

  // 1. Quy đổi Lưu lượng (Q) từ m³/h sang m³/s
  const qCubicMetersPerSecond = flow / 3600;

  // 2. Quy đổi Đường kính (D) từ mm sang m
  const dMeters = diameter / 1000;

  // 3. Áp dụng công thức Hazen-Williams:
  // H_f = 10.67 * L * (Q / C)^1.852 / D^4.87
  // Lưu ý: D^-4.87 tương đương với phép chia cho D^4.87
  const frictionLoss = 
    10.67 * 
    length * 
    Math.pow(qCubicMetersPerSecond / cFactor, 1.852) / 
    Math.pow(dMeters, 4.87);

  return frictionLoss;
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

/**
 * Tính toán Cột áp tổng (Total Dynamic Head - TDH)
 * 
 * @param inputs Thông số thiết kế hệ thống
 * @param pipe Thông số vật liệu đường ống
 * @returns Object chứa tổng cột áp và chi tiết từng loại tổn thất để hiển thị biểu đồ
 */
export function calculateTDH(
  inputs: SystemInputs,
  pipe: PipeSpecs
): TDHResult {
  // Validate đầu vào
  if (inputs.requiredFlow <= 0 || inputs.mainlineLength <= 0 || pipe.innerDiameter <= 0) {
    throw new Error('Lưu lượng, chiều dài ống và đường kính ống phải lớn hơn 0.');
  }
  
  if (inputs.elevationChange < 0) {
    throw new Error('Chênh lệch độ cao không được là số âm (vui lòng đặt máy bơm tại điểm thấp nhất).');
  }

  // Tính tổn thất do ma sát đường ống
  const frictionLoss = calculateFrictionLoss(
    inputs.requiredFlow,
    inputs.mainlineLength,
    pipe.innerDiameter,
    pipe.frictionFactor
  );

  // Suy hao qua bộ lọc (Mặc định 3m nếu không cung cấp)
  const filterLoss = inputs.filterLoss !== undefined ? inputs.filterLoss : 3;

  // Áp suất hoạt động tối thiểu tại béc tưới (Mặc định 20m cột nước ~ 2 bar)
  const operatingPressure = 20;

  // Chênh lệch độ cao (Elevation loss)
  const elevationLoss = inputs.elevationChange;

  // Tổng Cột Áp Động (Total Dynamic Head)
  const totalDynamicHead = elevationLoss + frictionLoss + filterLoss + operatingPressure;

  return {
    totalDynamicHead,
    details: {
      elevationLoss,
      frictionLoss,
      filterLoss,
      operatingPressure
    }
  };
}
