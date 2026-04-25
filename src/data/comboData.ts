export interface ComboCondition {
  minArea: number; // in Hectares
  maxArea: number; // in Hectares
  cropType: string[]; // e.g. ['sau-rieng', 'ca-phe', 'all']
  minWaterCapacity: number; // m3/h
}

export interface ComboItem {
  name: string;
  quantity: string | number;
}

export interface IrrigationCombo {
  id: string;
  name: string;
  description: string;
  tags: string[];
  conditions: ComboCondition;
  items: ComboItem[];
  benefits: string[];
  isFeatured: boolean;
  priceEstimate?: string;
}

export const comboMockData: IrrigationCombo[] = [
  {
    id: 'combo-starter',
    name: 'Giải pháp Rẫy Nhỏ (Tiết kiệm)',
    description: 'Hệ thống tưới cơ bản, dễ lắp đặt và tiết kiệm chi phí. Phù hợp cho nông hộ mới bắt đầu chuyển đổi sang tưới tự động.',
    tags: ['Tiết kiệm', 'Rẫy nhỏ', 'Tự lắp đặt'],
    conditions: {
      minArea: 0.1,
      maxArea: 1.0,
      cropType: ['all'],
      minWaterCapacity: 10,
    },
    items: [
      { name: 'Béc tưới phun sương', quantity: '100 cái' },
      { name: 'Khởi thủy 5mm', quantity: '100 cái' },
      { name: 'Ống nhánh PE 16mm', quantity: '2 cuộn (400m)' },
      { name: 'Lọc đĩa phi 60', quantity: '1 cái' }
    ],
    benefits: [
      'Chi phí đầu tư ban đầu cực thấp',
      'Không cần máy bơm công suất quá lớn',
      'Dễ dàng tự bảo trì và thay thế'
    ],
    isFeatured: false,
    priceEstimate: '1.800.000đ / Hecta'
  },
  {
    id: 'combo-standard',
    name: 'Giải pháp Tiêu Chuẩn Bù Áp',
    description: 'Hệ thống vận hành ổn định, đồng đều áp suất trên diện tích rộng. Phù hợp cho các vườn cây ăn trái chuyên canh.',
    tags: ['Chuẩn chuyên canh', 'Đồng đều', 'Bù áp'],
    conditions: {
      minArea: 1.0,
      maxArea: 5.0,
      cropType: ['sau-rieng', 'buoi', 'nhan', 'xoai'],
      minWaterCapacity: 25,
    },
    items: [
      { name: 'Béc tưới S2000 bù áp', quantity: '250 cái' },
      { name: 'Ống nhánh LDPE 20mm', quantity: '5 cuộn (1000m)' },
      { name: 'Bộ lọc đĩa đôi phi 90', quantity: '1 bộ' },
      { name: 'Van xả khí tự động', quantity: '2 cái' }
    ],
    benefits: [
      'Hạt nước phân bổ đều từ đầu đến cuối rẫy',
      'Hạn chế tối đa nghẹt rác nhờ lọc đôi',
      'Tuổi thọ hệ thống lên đến 10 năm'
    ],
    isFeatured: true,
    priceEstimate: '3.500.000đ / Hecta'
  },
  {
    id: 'combo-hill-pro',
    name: 'Giải pháp Đồi Dốc Chuyên Nghiệp',
    description: 'Thiết kế đặc trị cho địa hình đồi núi dốc, áp lực cao. Chống tụt áp, chống sụp ống.',
    tags: ['Đồi dốc', 'Áp lực cao', 'Độ bền cao'],
    conditions: {
      minArea: 1.0,
      maxArea: 10.0,
      cropType: ['ca-phe', 'ho-tieu', 'mac-ca'],
      minWaterCapacity: 35,
    },
    items: [
      { name: 'Béc tưới chống sâu bọ bù áp', quantity: '300 cái' },
      { name: 'Ống nhánh HDPE siêu bền', quantity: '1200m' },
      { name: 'Van giảm áp an toàn', quantity: '5 cái' },
      { name: 'Van xả khí phi 60', quantity: '3 cái' }
    ],
    benefits: [
      'Không bị nổ ống ở vùng trũng (chân đồi)',
      'Nước lên đều tới đỉnh đồi',
      'Ống siêu bền chống tia UV và va đập'
    ],
    isFeatured: false,
    priceEstimate: '5.200.000đ / Hecta'
  }
];
