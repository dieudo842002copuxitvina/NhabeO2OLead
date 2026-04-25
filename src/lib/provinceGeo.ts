/**
 * Province centroids for VN — used by Market Intelligence heatmap.
 * Coordinates are approximate centroids suitable for visualization.
 */
export interface ProvinceCentroid { name: string; lat: number; lng: number; region: string; }

export const PROVINCES: ProvinceCentroid[] = [
  { name: 'Hà Nội', lat: 21.03, lng: 105.85, region: 'Bắc' },
  { name: 'Hải Phòng', lat: 20.86, lng: 106.68, region: 'Bắc' },
  { name: 'Nam Định', lat: 20.42, lng: 106.17, region: 'Bắc' },
  { name: 'Nghệ An', lat: 19.23, lng: 104.93, region: 'Trung' },
  { name: 'Hà Tĩnh', lat: 18.34, lng: 105.90, region: 'Trung' },
  { name: 'Thừa Thiên Huế', lat: 16.46, lng: 107.59, region: 'Trung' },
  { name: 'Đà Nẵng', lat: 16.05, lng: 108.22, region: 'Trung' },
  { name: 'Quảng Nam', lat: 15.58, lng: 108.0, region: 'Trung' },
  { name: 'Bình Định', lat: 13.78, lng: 109.22, region: 'Trung' },
  { name: 'Phú Yên', lat: 13.10, lng: 109.30, region: 'Trung' },
  { name: 'Khánh Hòa', lat: 12.24, lng: 109.19, region: 'Trung' },
  { name: 'Ninh Thuận', lat: 11.57, lng: 108.99, region: 'Trung' },
  { name: 'Bình Thuận', lat: 11.09, lng: 108.07, region: 'Trung' },
  { name: 'Lâm Đồng', lat: 11.94, lng: 108.44, region: 'Tây Nguyên' },
  { name: 'Đắk Lắk', lat: 12.67, lng: 108.05, region: 'Tây Nguyên' },
  { name: 'Đắk Nông', lat: 12.00, lng: 107.69, region: 'Tây Nguyên' },
  { name: 'Gia Lai', lat: 13.98, lng: 108.0, region: 'Tây Nguyên' },
  { name: 'Kon Tum', lat: 14.35, lng: 108.00, region: 'Tây Nguyên' },
  { name: 'TP.HCM', lat: 10.82, lng: 106.63, region: 'Đông Nam Bộ' },
  { name: 'Đồng Nai', lat: 10.93, lng: 107.24, region: 'Đông Nam Bộ' },
  { name: 'Bình Dương', lat: 11.0, lng: 106.65, region: 'Đông Nam Bộ' },
  { name: 'Bình Phước', lat: 11.55, lng: 106.95, region: 'Đông Nam Bộ' },
  { name: 'Tây Ninh', lat: 11.31, lng: 106.10, region: 'Đông Nam Bộ' },
  { name: 'Bà Rịa - Vũng Tàu', lat: 10.50, lng: 107.17, region: 'Đông Nam Bộ' },
  { name: 'Long An', lat: 10.54, lng: 106.41, region: 'ĐBSCL' },
  { name: 'Tiền Giang', lat: 10.40, lng: 106.36, region: 'ĐBSCL' },
  { name: 'Bến Tre', lat: 10.24, lng: 106.38, region: 'ĐBSCL' },
  { name: 'Cần Thơ', lat: 10.03, lng: 105.77, region: 'ĐBSCL' },
  { name: 'An Giang', lat: 10.52, lng: 105.13, region: 'ĐBSCL' },
  { name: 'Kiên Giang', lat: 10.00, lng: 105.08, region: 'ĐBSCL' },
  { name: 'Cà Mau', lat: 9.18, lng: 105.15, region: 'ĐBSCL' },
];

export function findProvince(name: string): ProvinceCentroid | undefined {
  const n = name.toLowerCase();
  return PROVINCES.find(p => p.name.toLowerCase() === n)
    ?? PROVINCES.find(p => p.name.toLowerCase().includes(n) || n.includes(p.name.toLowerCase()));
}
