/**
 * Module tính toán Hiệu quả Đầu tư (ROI) & Phân tích Dòng tiền dự án Nông nghiệp
 * Sử dụng TypeScript thuần để xử lý logic tài chính cho Báo cáo dự toán.
 */

// ─── NHIỆM VỤ 1: ĐỊNH NGHĨA TYPESCRIPT INTERFACES ──────────────────────

export interface CurrentCosts {
  /**
   * Chi phí nhân công vận hành hiện tại mỗi tháng (Đơn vị: VNĐ)
   * Bao gồm công kéo ống, công rải phân, công kiểm tra vườn.
   */
  laborCostPerMonth: number;
  
  /**
   * Chi phí điện nước hiện tại mỗi tháng (Đơn vị: VNĐ)
   */
  waterPowerCostPerMonth: number;
  
  /**
   * Chi phí phân bón hiện tại mỗi tháng (Đơn vị: VNĐ)
   */
  fertilizerCostPerMonth: number;
}

export interface InvestmentInputs {
  /**
   * Tổng Chi phí Đầu tư Ban đầu (Capital Expenditure - CapEx) (Đơn vị: VNĐ)
   * Chứa toàn bộ tiền thiết bị, vật tư và nhân công lắp đặt.
   */
  totalCapEx: number;
  
  /**
   * Tuổi thọ khấu hao dự kiến của hệ thống (Đơn vị: Năm)
   */
  estimatedLifespan: number;
}

export interface SystemEfficiency {
  /**
   * Tỷ lệ tiết kiệm nhân công dự kiến (%)
   * VD: 70% (Tương đương 0.7 hoặc truyền số 70 tùy logic, ở đây chuẩn hóa truyền tỷ lệ 0-100)
   */
  laborSavedPercent: number;
  
  /**
   * Tỷ lệ tiết kiệm điện nước dự kiến (%)
   */
  waterPowerSavedPercent: number;
  
  /**
   * Tỷ lệ tiết kiệm phân bón dự kiến nhờ bón qua đường ống (Châm phân) (%)
   */
  fertilizerSavedPercent: number;
}

export interface CashflowDataPoint {
  year: number;
  cashflow: number; // Dòng tiền thuần trong năm (VNĐ)
  cumulativeCashflow: number; // Dòng tiền tích lũy (VNĐ)
}


// ─── NHIỆM VỤ 2: CÁC HÀM TÍNH TOÁN DÒNG TIỀN (CASHFLOW) ─────────────────

/**
 * Tính tổng tiền tiết kiệm được mỗi năm (OpEx Savings) nhờ hệ thống mới.
 * Chuyên việt vào việc cắt giảm chi phí vật tư và nhân công (Không tính ESG/Carbon).
 * 
 * @param current Chi phí hiện tại (VNĐ/tháng)
 * @param efficiency Tỉ lệ tiết kiệm dự kiến (%)
 * @returns Tổng tiền tiết kiệm hàng năm (VNĐ/năm)
 */
export function calculateAnnualSavings(
  current: CurrentCosts, 
  efficiency: SystemEfficiency
): number {
  // Tính tiền tiết kiệm mỗi tháng (VNĐ)
  const monthlyLaborSavings = current.laborCostPerMonth * (efficiency.laborSavedPercent / 100);
  const monthlyWaterPowerSavings = current.waterPowerCostPerMonth * (efficiency.waterPowerSavedPercent / 100);
  const monthlyFertilizerSavings = current.fertilizerCostPerMonth * (efficiency.fertilizerSavedPercent / 100);

  const totalMonthlySavings = monthlyLaborSavings + monthlyWaterPowerSavings + monthlyFertilizerSavings;

  // Quy đổi ra hằng năm
  return totalMonthlySavings * 12;
}

/**
 * Tính thời gian hoàn vốn (Payback Period)
 * 
 * @param capEx Tổng chi phí đầu tư ban đầu (VNĐ)
 * @param annualSavings Tổng số tiền tiết kiệm hàng năm (VNĐ)
 * @returns Thời gian hoàn vốn tính bằng Tháng
 */
export function calculatePaybackPeriod(
  capEx: number, 
  annualSavings: number
): number {
  if (annualSavings <= 0) {
    throw new Error('Số tiền tiết kiệm hằng năm phải lớn hơn 0 để có thể hoàn vốn (tránh lỗi Infinity).');
  }

  // (CapEx / AnnualSavings) sẽ ra số năm hoàn vốn.
  // Nhân 12 để quy đổi ra số Tháng.
  return (capEx / annualSavings) * 12;
}

/**
 * Trả về mảng dữ liệu dự phóng dòng tiền tích lũy (Cumulative Cashflow) qua từng năm.
 * Thường dùng để đưa vào Recharts vẽ biểu đồ đường hoặc biểu đồ miền.
 * 
 * @param capEx Chi phí đầu tư (VNĐ)
 * @param annualSavings Tiết kiệm hằng năm (VNĐ)
 * @param lifespan Tuổi thọ dự án (Năm)
 * @returns Mảng đối tượng chứa dữ liệu dòng tiền
 */
export function generateCashflowProjection(
  capEx: number, 
  annualSavings: number, 
  lifespan: number
): CashflowDataPoint[] {
  
  if (lifespan < 0) {
    throw new Error('Tuổi thọ dự án không hợp lệ.');
  }

  const projection: CashflowDataPoint[] = [];
  
  // Năm 0: Bỏ tiền đầu tư (Dòng tiền ÂM)
  let cumulative = -capEx;
  projection.push({
    year: 0,
    cashflow: -capEx,
    cumulativeCashflow: cumulative
  });

  // Chạy vòng lặp từ năm 1 đến hết tuổi thọ dự kiến
  for (let year = 1; year <= lifespan; year++) {
    cumulative += annualSavings;
    projection.push({
      year,
      cashflow: annualSavings,
      cumulativeCashflow: cumulative
    });
  }

  return projection;
}
