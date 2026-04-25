export interface Crop {
  id: string;
  name: string;
  icon: string;
  region: string;
}

export const cropsData: Crop[] = [
  { id: 'sau-rieng', name: 'Sầu riêng', icon: '🌳', region: 'Tây Nguyên' },
  { id: 'ca-phe', name: 'Cà phê', icon: '☕', region: 'Tây Nguyên' },
  { id: 'ho-tieu', name: 'Hồ tiêu', icon: '🌿', region: 'Tây Nguyên' },
  { id: 'mac-ca', name: 'Mắc ca', icon: '🌰', region: 'Tây Nguyên' },
  { id: 'buoi', name: 'Bưởi', icon: '🍊', region: 'Đông Nam Bộ' },
  { id: 'mit', name: 'Mít', icon: '🍈', region: 'Đông Nam Bộ' },
  { id: 'chuoi', name: 'Chuối', icon: '🍌', region: 'Đông Nam Bộ' },
  { id: 'nhan', name: 'Nhãn', icon: '🌳', region: 'ĐBSCL' },
  { id: 'xoai', name: 'Xoài', icon: '🥭', region: 'ĐBSCL' },
  { id: 'thanh-long', name: 'Thanh long', icon: '🐉', region: 'ĐBSCL' },
  { id: 'cam', name: 'Cam', icon: '🍊', region: 'ĐBSCL' },
  { id: 'mia', name: 'Mía', icon: '🎋', region: 'Khác' },
  { id: 'che', name: 'Chè (Trà)', icon: '🍵', region: 'Miền núi phía Bắc' },
];
