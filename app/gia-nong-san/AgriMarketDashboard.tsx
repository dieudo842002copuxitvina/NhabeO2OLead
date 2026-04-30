'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Cherry,
  ChevronRight,
  Coffee,
  Flower2,
  Leaf,
  MapPin,
  Sprout,
  TrendingUp,
  Wheat,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import AgriWeatherWidget from './AgriWeatherWidget';
import MarketNewsWidget from './MarketNewsWidget';
import O2OProductSlider from './O2OProductSlider';

type CommodityKey =
  | 'coffee-robusta'
  | 'coffee-arabica'
  | 'pepper'
  | 'cashew'
  | 'rubber'
  | 'durian-ri6'
  | 'durian-thai'
  | 'dragonfruit'
  | 'mango'
  | 'longan'
  | 'lychee'
  | 'rice-st25'
  | 'rice-om5451'
  | 'corn'
  | 'sweet-potato'
  | 'chili'
  | 'tomato'
  | 'melon'
  | 'rose';

type TimeRangeKey = '7d' | '30d' | '180d';
type ChartMode = 'line' | 'range';

type MarketSeriesPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type LocalPrice = {
  area: string;
  product: string;
  quality: string;
  unit: string;
  price: number;
  changePct: number;
  note: string;
};

type CommodityDataset = {
  key: CommodityKey;
  label: string;
  group: string;
  icon: LucideIcon;
  accent: string;
  chipTone: string;
  summary: string;
  currentPrice: number;
  unit: string;
  changePct: number;
  series: MarketSeriesPoint[];
  localPrices: LocalPrice[];
  banner: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    ctaLabel: string;
  };
};

type CommoditySeed = Omit<CommodityDataset, 'series' | 'localPrices'> & {
  seriesSeed: {
    driftPct: number;
    volatilityPct: number;
    phase: number;
    rangePct: number;
  };
  localPrices: Array<[string, string, string, string, number, number, string]>;
};

type DisplaySeriesPoint = MarketSeriesPoint & {
  label: string;
  lowBase: number;
  priceRange: number;
};

const PRIMARY_GREEN = '#2E7D32';
const ACTION_ORANGE = '#EF6C00';
const MOCK_REFERENCE_DATE = new Date('2026-04-30T00:00:00');

const COMMODITY_TABS: CommodityKey[] = [
  'coffee-robusta',
  'coffee-arabica',
  'pepper',
  'cashew',
  'rubber',
  'durian-ri6',
  'durian-thai',
  'dragonfruit',
  'mango',
  'longan',
  'lychee',
  'rice-st25',
  'rice-om5451',
  'corn',
  'sweet-potato',
  'chili',
  'tomato',
  'melon',
  'rose',
];

const FEATURED_TICKER_KEYS: CommodityKey[] = [
  'coffee-robusta',
  'durian-ri6',
  'pepper',
  'rice-st25',
  'tomato',
  'rubber',
];

const TIME_RANGE_OPTIONS: Array<{ key: TimeRangeKey; label: string; days: number }> = [
  { key: '7d', label: '7 Ngày', days: 7 },
  { key: '30d', label: '1 Tháng', days: 30 },
  { key: '180d', label: '6 Tháng', days: 180 },
];

function roundPrice(value: number) {
  return Math.max(1, Math.round(value));
}

function generateMarketSeries(
  currentPrice: number,
  seed: CommoditySeed['seriesSeed'],
  days = 180
): MarketSeriesPoint[] {
  const rawCloses = Array.from({ length: days }, (_, index) => {
    const progress = index / (days - 1);
    const drift = -seed.driftPct + progress * seed.driftPct;
    const seasonal =
      Math.sin((index + seed.phase) / 6) * seed.volatilityPct +
      Math.cos((index + seed.phase) / 13) * (seed.volatilityPct * 0.48);

    return currentPrice * (1 + drift + seasonal);
  });

  const scaleFactor = currentPrice / rawCloses[rawCloses.length - 1];
  const startDate = new Date(MOCK_REFERENCE_DATE);
  startDate.setDate(startDate.getDate() - days + 1);

  const closes = rawCloses.map((value) => roundPrice(value * scaleFactor));

  return closes.map((close, index) => {
    const pointDate = new Date(startDate);
    pointDate.setDate(startDate.getDate() + index);

    const previousClose =
      index === 0
        ? roundPrice(close * (1 - seed.rangePct * 0.35))
        : closes[index - 1];

    const open = roundPrice(
      previousClose *
        (1 + Math.sin((index + seed.phase) / 5) * seed.volatilityPct * 0.16)
    );
    const upperWick = roundPrice(
      currentPrice * seed.rangePct * (0.5 + ((index + seed.phase) % 5) * 0.07)
    );
    const lowerWick = roundPrice(
      currentPrice * seed.rangePct * (0.45 + ((index + seed.phase) % 4) * 0.06)
    );

    const high = roundPrice(Math.max(open, close) + upperWick);
    const low = roundPrice(Math.max(1, Math.min(open, close) - lowerWick));

    return {
      date: pointDate.toISOString().slice(0, 10),
      open,
      high,
      low,
      close,
    };
  });
}

function buildLocalPrices(rows: CommoditySeed['localPrices']): LocalPrice[] {
  return rows.map(([area, product, quality, unit, price, changePct, note]) => ({
    area,
    product,
    quality,
    unit,
    price,
    changePct,
    note,
  }));
}

function createDataset(seed: CommoditySeed): CommodityDataset {
  return {
    ...seed,
    series: generateMarketSeries(seed.currentPrice, seed.seriesSeed),
    localPrices: buildLocalPrices(seed.localPrices),
  };
}

const MOCK_MARKET_DATA: Record<CommodityKey, CommodityDataset> = {
  'coffee-robusta': createDataset({
    key: 'coffee-robusta',
    label: 'Cà phê Robusta',
    group: 'Cây công nghiệp lâu năm',
    icon: Coffee,
    accent: PRIMARY_GREEN,
    chipTone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary:
      'Robusta Tây Nguyên tiếp tục neo giá cao nhờ nhu cầu rang xay xuất khẩu ổn định và tồn kho nội địa không còn dồi dào.',
    currentPrice: 107500,
    unit: 'đ/kg',
    changePct: 1.8,
    seriesSeed: { driftPct: 0.08, volatilityPct: 0.018, phase: 2, rangePct: 0.012 },
    localPrices: [
      ['Đắk Lắk', 'Robusta Nhân Xô (Khô)', 'Sàng 16+, độ ẩm chuẩn xuất khẩu', 'đ/kg', 107500, 1.8, 'Kho trung tâm mua mạnh cho đơn giao cuối tuần.'],
      ['Đắk Nông', 'Robusta Tươi', 'Quả chín 90%, giao tại vườn', 'đ/kg', 26800, 1.1, 'Nông hộ bán nhanh để xoay nhân công.'],
      ['Lâm Đồng', 'Robusta Nhân Xô (Khô)', 'Loại 1, tạp thấp', 'đ/kg', 106600, 1.2, 'Chênh giá nhờ lô hàng tuyển kỹ.'],
      ['Gia Lai', 'Robusta Tươi', 'Quả chín đều, ít lẫn cành lá', 'đ/kg', 27200, 1.4, 'Nhà rang ưu tiên lô có truy xuất rõ ràng.'],
    ],
    banner: {
      eyebrow: 'Bán chéo thiết bị',
      title: 'Giá Robusta đang tốt, đây là lúc tối ưu trạm bơm tưới tự động cho vụ mới.',
      description:
        'Gợi ý nâng cấp bơm ly tâm và bộ châm phân bán tự động để giảm công kéo ống và giữ ẩm đồng đều khi bước vào cao điểm chăm trái.',
      href: '/san-pham/may-bom-nang-luong-mat-troi',
      ctaLabel: 'Xem thiết bị tưới',
    },
  }),
  'coffee-arabica': createDataset({
    key: 'coffee-arabica',
    label: 'Cà phê Arabica',
    group: 'Cây công nghiệp lâu năm',
    icon: Coffee,
    accent: PRIMARY_GREEN,
    chipTone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary:
      'Arabica vùng cao đang hồi phục nhờ chất lượng hạt đẹp và đơn hàng specialty tiếp tục giữ sức mua tốt.',
    currentPrice: 128000,
    unit: 'đ/kg',
    changePct: 1.2,
    seriesSeed: { driftPct: 0.07, volatilityPct: 0.017, phase: 5, rangePct: 0.011 },
    localPrices: [
      ['Lâm Đồng', 'Arabica Nhân Xanh', 'Specialty 84+, sơ chế washed', 'đ/kg', 128000, 1.2, 'Nhu cầu từ nhà rang specialty khá đều.'],
      ['Sơn La', 'Arabica Tươi', 'Quả chín chọn lọc tại vườn', 'đ/kg', 31400, 0.9, 'Ưu tiên lô có độ đường tốt.'],
      ['Quảng Trị', 'Arabica Nhân Xanh', 'Natural phơi kỹ, độ ẩm thấp', 'đ/kg', 126500, 0.8, 'Giá giữ vững nhờ chất lượng đồng đều.'],
    ],
    banner: {
      eyebrow: 'Giải pháp sau thu hoạch',
      title: 'Arabica lên giá, nên đầu tư hệ thống tưới giữ độ đồng đều sinh trưởng đầu vụ.',
      description:
        'Bộ tưới chính xác giúp duy trì tán khỏe và tỷ lệ phân hóa mầm tốt hơn cho các lô Arabica vùng cao.',
      href: '/giai-phap',
      ctaLabel: 'Xem giải pháp phù hợp',
    },
  }),
  pepper: createDataset({
    key: 'pepper',
    label: 'Hồ tiêu',
    group: 'Cây công nghiệp lâu năm',
    icon: Leaf,
    accent: PRIMARY_GREEN,
    chipTone: 'bg-lime-50 text-lime-700 border-lime-200',
    summary:
      'Tiêu đen tiếp tục phục hồi sau giai đoạn điều chỉnh ngắn, các vùng có truy xuất và phơi chuẩn đang chốt giá tốt hơn mặt bằng.',
    currentPrice: 149800,
    unit: 'đ/kg',
    changePct: 0.9,
    seriesSeed: { driftPct: 0.06, volatilityPct: 0.015, phase: 7, rangePct: 0.01 },
    localPrices: [
      ['Gia Lai', 'Hồ tiêu đen', '500g/l, loại xuất khẩu', 'đ/kg', 149800, 0.9, 'Mua đều cho đơn xuất khẩu.'],
      ['Đắk Nông', 'Hồ tiêu đen', '550g/l, phơi chuẩn', 'đ/kg', 150400, 1.1, 'Ưu tiên hàng phơi chuẩn.'],
      ['Bà Rịa - Vũng Tàu', 'Hồ tiêu trắng', 'Sơ chế sạch, loại 1', 'đ/kg', 192000, 1.4, 'Chênh giá nhờ lô chất lượng cao.'],
    ],
    banner: {
      eyebrow: 'Chốt sale theo bối cảnh',
      title: 'Mùa hồ tiêu hồi giá là lúc hợp lý để nâng cấp bộ lọc trung tâm cho vườn nhỏ giọt.',
      description:
        'Bộ lọc ổn định giúp giảm nghẹt đầu tưới và duy trì lưu lượng đồng đều khi bước vào giai đoạn chăm trái, dưỡng dây.',
      href: '/danh-muc',
      ctaLabel: 'Xem bộ lọc phù hợp',
    },
  }),
  cashew: createDataset({
    key: 'cashew',
    label: 'Điều',
    group: 'Cây công nghiệp lâu năm',
    icon: Leaf,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Giá điều thô đang nhích lên nhờ nhu cầu gom nguyên liệu đầu mùa và kỳ vọng sản lượng không bùng nổ như dự báo trước đó.',
    currentPrice: 34500,
    unit: 'đ/kg',
    changePct: 1.1,
    seriesSeed: { driftPct: 0.055, volatilityPct: 0.016, phase: 9, rangePct: 0.014 },
    localPrices: [
      ['Bình Phước', 'Điều thô', 'Độ ẩm chuẩn, loại 1', 'đ/kg', 34500, 1.1, 'Nhà máy tăng nhịp mua đầu tuần.'],
      ['Đồng Nai', 'Điều thô', 'Loại 1, hạt đồng đều', 'đ/kg', 34350, 0.9, 'Ưu tiên lô hạt đồng đều.'],
      ['Đắk Nông', 'Điều xô', 'Tạp thấp, giao vườn', 'đ/kg', 34100, 0.7, 'Thương lái mua cẩn trọng hơn.'],
    ],
    banner: {
      eyebrow: 'Thiết bị tiết kiệm công',
      title: 'Điều bước vào giai đoạn nuôi trái, nên giữ ẩm nền ổn định bằng tưới nhỏ giọt tiết kiệm nước.',
      description:
        'Hệ thống tưới đơn giản nhưng chính xác giúp giảm công tưới thủ công và chủ động hơn ở những vườn đồi, đất nhẹ.',
      href: '/giai-phap',
      ctaLabel: 'Xem giải pháp tưới nhỏ giọt',
    },
  }),
  rubber: createDataset({
    key: 'rubber',
    label: 'Cao su',
    group: 'Cây công nghiệp lâu năm',
    icon: Leaf,
    accent: PRIMARY_GREEN,
    chipTone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary:
      'Cao su tấm và mủ nước đi ngang trong biên độ hẹp nhưng vùng chăm tốt vẫn hưởng chênh lệch giá từ chất lượng đầu vào ổn định.',
    currentPrice: 43800,
    unit: 'đ/kg',
    changePct: 0.6,
    seriesSeed: { driftPct: 0.04, volatilityPct: 0.012, phase: 11, rangePct: 0.009 },
    localPrices: [
      ['Bình Phước', 'Mủ nước', '30 độ TSC, loại nhà máy', 'đ/kg', 43800, 0.6, 'Nhà máy giữ nhịp mua đều.'],
      ['Tây Ninh', 'Mủ tạp', 'Tạp thấp, giao trong ngày', 'đ/kg', 43100, 0.4, 'Chất lượng ảnh hưởng giá chốt.'],
      ['Bình Dương', 'Mủ nước', '32 độ TSC, loại 1', 'đ/kg', 44050, 0.8, 'Ưu tiên lô sạch tạp chất.'],
    ],
    banner: {
      eyebrow: 'Bảo trì hạ tầng vườn',
      title: 'Khi giá cao su ổn định, nên tranh thủ nâng cấp hạ tầng cấp nước và điện bơm cho khu sơ chế.',
      description:
        'Chuẩn hóa bơm, lọc và tủ điện giúp vận hành ổn định hơn ở khu vực rửa dụng cụ, vệ sinh và tưới nền trong mùa khô.',
      href: '/san-pham/may-bom-nang-luong-mat-troi',
      ctaLabel: 'Xem cấu hình bơm',
    },
  }),
  'durian-ri6': createDataset({
    key: 'durian-ri6',
    label: 'Sầu riêng Ri6',
    group: 'Cây ăn trái xuất khẩu',
    icon: Sprout,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Ri6 nghịch vụ giữ biên lợi nhuận tốt, thương lái ưu tiên vườn có nguồn nước chủ động và trái đồng đều về kích cỡ.',
    currentPrice: 76500,
    unit: 'đ/kg',
    changePct: 2.4,
    seriesSeed: { driftPct: 0.11, volatilityPct: 0.021, phase: 4, rangePct: 0.018 },
    localPrices: [
      ['Đắk Lắk', 'Sầu riêng Ri6', 'Loại 1 (Hàng xuất khẩu)', 'đ/kg', 76500, 2.4, 'Sản lượng đầu mùa chưa cao.'],
      ['Đắk Nông', 'Sầu riêng Ri6', 'Loại 2, trái 2.5-3.2kg', 'đ/kg', 74200, 1.8, 'Thương lái gom nhanh lô đẹp.'],
      ['Tiền Giang', 'Sầu riêng Ri6', 'Bao vườn, loại A', 'đ/kg', 77200, 2.8, 'Vườn đạt mẫu mã đang được hỏi mua nhiều.'],
      ['Lâm Đồng', 'Sầu riêng Ri6', 'Loại 1, hàng tuyển', 'đ/kg', 75800, 2.0, 'Giá tốt hơn ở vùng tưới chủ động.'],
    ],
    banner: {
      eyebrow: 'Bán chéo giá trị cao',
      title: 'Giữ trái Ri6 đẹp mùa giá cao với bộ châm phân Venturi và béc tưới bù áp.',
      description:
        'Tăng độ đồng đều ẩm đất, giảm stress cây trong giai đoạn nuôi trái và hạn chế sốc nước ở những vườn có độ dốc nhẹ.',
      href: '/danh-muc',
      ctaLabel: 'Xem combo tưới - châm phân',
    },
  }),
  'durian-thai': createDataset({
    key: 'durian-thai',
    label: 'Sầu riêng Thái',
    group: 'Cây ăn trái xuất khẩu',
    icon: Sprout,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Sầu riêng Thái tiếp tục được ưu tiên bởi nhóm xuất khẩu nhờ form trái đẹp và độ ổn định cao ở các vùng chăm bài bản.',
    currentPrice: 84200,
    unit: 'đ/kg',
    changePct: 2.1,
    seriesSeed: { driftPct: 0.095, volatilityPct: 0.019, phase: 8, rangePct: 0.016 },
    localPrices: [
      ['Đắk Lắk', 'Sầu riêng Thái', 'Loại 1 (Hàng xuất khẩu)', 'đ/kg', 84200, 2.1, 'Lô trái đẹp được chốt nhanh.'],
      ['Đắk Nông', 'Sầu riêng Thái', 'Loại 2, trái 2.8-3.5kg', 'đ/kg', 82600, 1.7, 'Ưu tiên vườn có truy xuất rõ.'],
      ['Bến Tre', 'Sầu riêng Thái', 'Loại 2, hàng nội địa chọn', 'đ/kg', 81800, 1.5, 'Giá thấp hơn theo cỡ trái.'],
    ],
    banner: {
      eyebrow: 'Nâng cấp hệ thống',
      title: 'Vườn Thái đang có giá, nên hoàn thiện tưới chính xác để giữ form trái và đồng đều đường kính.',
      description:
        'Tưới đúng áp và châm phân đều giúp giảm chênh lệch sinh trưởng giữa các hàng, nhất là ở vườn xen canh hoặc địa hình lượn sóng.',
      href: '/giai-phap',
      ctaLabel: 'Xem hệ thống trọn gói',
    },
  }),
  dragonfruit: createDataset({
    key: 'dragonfruit',
    label: 'Thanh long',
    group: 'Cây ăn trái xuất khẩu',
    icon: Cherry,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Thanh long ruột đỏ đang nhích giá nhờ đơn hàng đóng container quay trở lại, vùng chăm đèn và nước ổn định đang chiếm ưu thế.',
    currentPrice: 22400,
    unit: 'đ/kg',
    changePct: 1.4,
    seriesSeed: { driftPct: 0.065, volatilityPct: 0.02, phase: 3, rangePct: 0.017 },
    localPrices: [
      ['Bình Thuận', 'Thanh long ruột đỏ', 'Loại 1, hàng xuất khẩu', 'đ/kg', 22400, 1.4, 'Nguồn hàng đẹp bán nhanh trong ngày.'],
      ['Long An', 'Thanh long ruột trắng', 'Loại 1, hàng nội địa đẹp', 'đ/kg', 21200, 1.0, 'Giá ổn định, ít biến động.'],
      ['Tiền Giang', 'Thanh long ruột đỏ', 'Loại 2, trái 0.4-0.6kg', 'đ/kg', 20500, 0.7, 'Giá chênh theo độ đồng đều tai trái.'],
    ],
    banner: {
      eyebrow: 'Tiết kiệm điện tưới',
      title: 'Thanh long vào nhịp chăm mạnh, có thể tối ưu bơm và lịch tưới để giảm điện cuối vụ.',
      description:
        'Bộ hẹn giờ và bơm hiệu suất phù hợp giúp giảm chi phí điện cho vườn thắp đèn và tưới luân phiên theo khu.',
      href: '/san-pham/may-bom-nang-luong-mat-troi',
      ctaLabel: 'Xem cấu hình tiết kiệm điện',
    },
  }),
  mango: createDataset({
    key: 'mango',
    label: 'Xoài',
    group: 'Cây ăn trái xuất khẩu',
    icon: Cherry,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Xoài xuất khẩu giữ mức giá khá, đặc biệt ở các vườn có cỡ trái đồng đều và kiểm soát tốt thời điểm phun - tưới sau mưa.',
    currentPrice: 28600,
    unit: 'đ/kg',
    changePct: 1.3,
    seriesSeed: { driftPct: 0.06, volatilityPct: 0.018, phase: 6, rangePct: 0.015 },
    localPrices: [
      ['Đồng Tháp', 'Xoài cát Chu', 'Loại 1, hàng siêu thị', 'đ/kg', 28600, 1.3, 'Đầu ra ổn định cho siêu thị.'],
      ['An Giang', 'Xoài Đài Loan', 'Loại 1, trái bóng đẹp', 'đ/kg', 27600, 1.1, 'Giá tốt nhờ độ bóng trái cao.'],
      ['Tiền Giang', 'Xoài keo', 'Loại 2, hàng chợ đầu mối', 'đ/kg', 26400, 0.8, 'Mua đều cho chợ đầu mối.'],
    ],
    banner: {
      eyebrow: 'Tưới thông minh theo cây ăn trái',
      title: 'Xoài cần nền ẩm và lịch tưới chính xác để giữ da trái đẹp trong giai đoạn nước rút.',
      description:
        'Thiết kế béc và lịch tưới hợp lý giúp hạn chế sốc nước, giảm hiện tượng nám trái và giữ tốc độ lớn trái đồng đều hơn.',
      href: '/giai-phap',
      ctaLabel: 'Xem giải pháp cho xoài',
    },
  }),
  longan: createDataset({
    key: 'longan',
    label: 'Nhãn',
    group: 'Cây ăn trái xuất khẩu',
    icon: Cherry,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Nhãn đang hồi phục nhẹ, thị trường ưu tiên lô trái sáng màu, cỡ chùm đẹp và thu hoạch đúng độ chín.',
    currentPrice: 31800,
    unit: 'đ/kg',
    changePct: 0.8,
    seriesSeed: { driftPct: 0.05, volatilityPct: 0.017, phase: 10, rangePct: 0.014 },
    localPrices: [
      ['Vĩnh Long', 'Nhãn IDo', 'Loại 1, chùm đồng đều', 'đ/kg', 31800, 0.8, 'Chùm đồng đều được trả giá tốt.'],
      ['Đồng Tháp', 'Nhãn xuồng cơm vàng', 'Loại 1, hàng tuyển', 'đ/kg', 32500, 0.9, 'Nguồn cung chưa nhiều.'],
      ['Tiền Giang', 'Nhãn thường', 'Loại 2, hàng chợ', 'đ/kg', 28700, 0.5, 'Giá thấp hơn theo mẫu mã.'],
    ],
    banner: {
      eyebrow: 'Đồng bộ dinh dưỡng',
      title: 'Nhãn vào kỳ nuôi trái, nên tối ưu châm phân và tưới nhịp ngắn để giữ chùm chắc hơn.',
      description:
        'Hệ thống châm phân bán tự động phù hợp cho nhà vườn muốn tăng độ đều dinh dưỡng mà không tăng nhân công quá nhiều.',
      href: '/danh-muc',
      ctaLabel: 'Xem thiết bị châm phân',
    },
  }),
  lychee: createDataset({
    key: 'lychee',
    label: 'Vải',
    group: 'Cây ăn trái xuất khẩu',
    icon: Cherry,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Vải thiều vào nhịp nhạy cảm với thời tiết, vùng chủ động nước và phun lá đúng thời điểm đang có lợi thế rõ rệt.',
    currentPrice: 40200,
    unit: 'đ/kg',
    changePct: 1.6,
    seriesSeed: { driftPct: 0.08, volatilityPct: 0.019, phase: 1, rangePct: 0.016 },
    localPrices: [
      ['Bắc Giang', 'Vải thiều', 'Loại 1, hàng xuất khẩu', 'đ/kg', 40200, 1.6, 'Đơn gom xuất khẩu tăng.'],
      ['Hải Dương', 'Vải sớm', 'Loại 1, màu đẹp', 'đ/kg', 41600, 1.8, 'Nguồn hàng đầu vụ còn ít.'],
      ['Lục Ngạn', 'Vải thiều', 'Loại 2, hàng chợ đầu mối', 'đ/kg', 37100, 1.1, 'Chênh theo màu trái và độ đồng đều.'],
    ],
    banner: {
      eyebrow: 'Can thiệp đúng thời điểm',
      title: 'Vải nhạy với mưa và sốc nhiệt, nên chuẩn bị sẵn phương án tưới - dinh dưỡng ngắn ngày.',
      description:
        'Khi thị trường sáng hơn, việc chuẩn hóa nước tưới và phân bón lá giúp giữ chất lượng trái đồng đều cho lô xuất khẩu.',
      href: '/giai-phap',
      ctaLabel: 'Xem vật tư hỗ trợ sau mưa',
    },
  }),
  'rice-st25': createDataset({
    key: 'rice-st25',
    label: 'Lúa ST25',
    group: 'Cây lương thực & ngắn ngày',
    icon: Wheat,
    accent: PRIMARY_GREEN,
    chipTone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary:
      'ST25 được hỗ trợ bởi nhu cầu gạo chất lượng cao, thương lái đang trả giá tốt hơn cho ruộng có độ chín và độ sạch đồng đều.',
    currentPrice: 10450,
    unit: 'đ/kg',
    changePct: 0.7,
    seriesSeed: { driftPct: 0.035, volatilityPct: 0.01, phase: 12, rangePct: 0.008 },
    localPrices: [
      ['Sóc Trăng', 'Lúa ST25', 'Lúa tươi, loại chuẩn', 'đ/kg', 10450, 0.7, 'Ruộng chín đều được đặt cọc sớm.'],
      ['Bạc Liêu', 'Gạo ST25', 'Gạo khô, loại cao cấp', 'đ/tấn', 16100000, 0.9, 'Giá nhỉnh hơn nhờ độ ẩm thấp.'],
      ['Cần Thơ', 'Lúa ST25', 'Lúa tươi, hàng nhà máy', 'đ/kg', 10300, 0.5, 'Đầu ra ổn định cho nhà máy xay xát.'],
    ],
    banner: {
      eyebrow: 'Giải pháp tiết kiệm vận hành',
      title: 'Mùa lúa ổn định giá là thời điểm tốt để chuẩn hóa bơm và điện nước cho vụ sau.',
      description:
        'Tối ưu trạm bơm nội đồng và hạ tầng cấp nước giúp giảm chi phí nhiên liệu, điện năng khi vào cao điểm bơm xả.',
      href: '/san-pham/may-bom-nang-luong-mat-troi',
      ctaLabel: 'Xem giải pháp bơm nước',
    },
  }),
  'rice-om5451': createDataset({
    key: 'rice-om5451',
    label: 'Lúa OM5451',
    group: 'Cây lương thực & ngắn ngày',
    icon: Wheat,
    accent: PRIMARY_GREEN,
    chipTone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary:
      'OM5451 giữ thanh khoản tốt ở nhóm gạo xuất khẩu phổ thông, vùng có lịch nước ổn định đang thu hoạch thuận lợi hơn.',
    currentPrice: 9650,
    unit: 'đ/kg',
    changePct: 0.5,
    seriesSeed: { driftPct: 0.03, volatilityPct: 0.009, phase: 15, rangePct: 0.007 },
    localPrices: [
      ['An Giang', 'Lúa OM5451', 'Lúa tươi, loại nhà máy', 'đ/kg', 9650, 0.5, 'Mua đều theo hợp đồng cũ.'],
      ['Kiên Giang', 'Gạo OM5451', 'Gạo khô, loại xuất khẩu', 'đ/tấn', 14550000, 0.7, 'Giá tốt hơn nhờ độ ẩm thấp.'],
      ['Đồng Tháp', 'Lúa OM5451', 'Lúa tươi, hàng chợ lúa', 'đ/kg', 9580, 0.4, 'Thu hoạch thuận do thời tiết ổn định.'],
    ],
    banner: {
      eyebrow: 'Hạ tầng nội đồng',
      title: 'Ổn định bơm tưới - tiêu cho vùng lúa giúp giảm rủi ro khi lịch nước thay đổi đột ngột.',
      description:
        'Những khu canh tác quy mô vừa nên ưu tiên hạ tầng bơm bền và dễ bảo trì trước khi bước vào vụ kế tiếp.',
      href: '/giai-phap',
      ctaLabel: 'Xem cấu hình nội đồng',
    },
  }),
  corn: createDataset({
    key: 'corn',
    label: 'Bắp',
    group: 'Cây lương thực & ngắn ngày',
    icon: Wheat,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Bắp lấy hạt đang giữ giá khá nhờ nhu cầu thức ăn chăn nuôi, những vùng có tưới chủ động bứt tốt hơn ở giai đoạn làm hạt.',
    currentPrice: 8850,
    unit: 'đ/kg',
    changePct: 1.0,
    seriesSeed: { driftPct: 0.045, volatilityPct: 0.012, phase: 14, rangePct: 0.01 },
    localPrices: [
      ['Đồng Nai', 'Bắp hạt khô', 'Loại 1, độ ẩm chuẩn', 'đ/kg', 8850, 1.0, 'Giá tăng do nguồn hàng khô đẹp.'],
      ['Gia Lai', 'Bắp tươi', 'Bắp già, giao tại ruộng', 'đ/kg', 6550, 0.6, 'Chênh mạnh theo độ già bắp.'],
      ['Đắk Lắk', 'Bắp hạt khô', 'Loại 1, hàng trại cám', 'đ/kg', 8720, 0.8, 'Đầu ra tốt cho trại cám địa phương.'],
    ],
    banner: {
      eyebrow: 'Tưới đúng giai đoạn',
      title: 'Bắp cần nhịp nước chuẩn ở giai đoạn trổ cờ - làm hạt để giữ năng suất cuối cùng.',
      description:
        'Các hệ thống tưới áp thấp, dễ dịch chuyển là lựa chọn phù hợp cho nông hộ muốn tăng chủ động nhưng vẫn giữ chi phí vừa phải.',
      href: '/danh-muc',
      ctaLabel: 'Xem vật tư tưới áp thấp',
    },
  }),
  'sweet-potato': createDataset({
    key: 'sweet-potato',
    label: 'Khoai lang',
    group: 'Cây lương thực & ngắn ngày',
    icon: Sprout,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Khoai lang giữ sức mua khá ở các vùng lên luống chuẩn, quản trị độ ẩm tốt đang cho củ đồng đều và ít nứt vỏ hơn.',
    currentPrice: 12300,
    unit: 'đ/kg',
    changePct: 1.2,
    seriesSeed: { driftPct: 0.05, volatilityPct: 0.015, phase: 13, rangePct: 0.011 },
    localPrices: [
      ['Vĩnh Long', 'Khoai lang tím', 'Loại 1, củ đồng đều', 'đ/kg', 12300, 1.2, 'Củ đồng đều được ưu tiên.'],
      ['Đồng Tháp', 'Khoai lang trắng', 'Loại 1, hàng chợ', 'đ/kg', 10800, 0.7, 'Mua ổn định cho chợ đầu mối.'],
      ['Gia Lai', 'Khoai lang Nhật', 'Loại 1, mẫu đẹp', 'đ/kg', 12950, 1.5, 'Giá cao hơn nhờ mẫu mã đẹp.'],
    ],
    banner: {
      eyebrow: 'Bảo vệ cấu trúc đất',
      title: 'Khoai lang lên giá, có thể đầu tư tưới nhỏ giọt để giảm nứt củ và giữ luống ổn định hơn.',
      description:
        'Tưới nhỏ giọt giúp kiểm soát độ ẩm vùng rễ tốt hơn, phù hợp cho cây củ cần nền ẩm đều nhưng không úng mặt luống.',
      href: '/giai-phap',
      ctaLabel: 'Xem nhỏ giọt cho cây củ',
    },
  }),
  chili: createDataset({
    key: 'chili',
    label: 'Ớt',
    group: 'Cây rau màu & hoa',
    icon: Sprout,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Ớt thương phẩm đang tăng giá nhờ nguồn cung hụt cục bộ, những ruộng có tưới đều và kiểm soát sâu bệnh chặt đang lợi thế rõ.',
    currentPrice: 32600,
    unit: 'đ/kg',
    changePct: 2.7,
    seriesSeed: { driftPct: 0.12, volatilityPct: 0.024, phase: 16, rangePct: 0.02 },
    localPrices: [
      ['Tây Ninh', 'Ớt chỉ thiên', 'Loại 1, hàng chế biến', 'đ/kg', 32600, 2.7, 'Mua mạnh cho đầu mối chế biến.'],
      ['Đồng Nai', 'Ớt sừng', 'Loại 1, trái bóng đẹp', 'đ/kg', 28200, 1.9, 'Chênh giá theo độ bóng trái.'],
      ['Long An', 'Ớt hiểm', 'Loại 1, nguồn cung thấp', 'đ/kg', 33800, 2.4, 'Nguồn cung chưa hồi phục hoàn toàn.'],
    ],
    banner: {
      eyebrow: 'Giải pháp phun xịt chính xác',
      title: 'Ớt tăng giá mạnh, nên tận dụng thời điểm này để đẩy nhanh xử lý sâu bệnh bằng thiết bị phù hợp.',
      description:
        'Drone phun và hệ thống lọc ổn định giúp thao tác nhanh hơn, giảm thời gian nhân công ở các ruộng sản lượng lớn.',
      href: '/giai-phap',
      ctaLabel: 'Xem giải pháp phun xịt',
    },
  }),
  tomato: createDataset({
    key: 'tomato',
    label: 'Cà chua',
    group: 'Cây rau màu & hoa',
    icon: Cherry,
    accent: ACTION_ORANGE,
    chipTone: 'bg-orange-50 text-orange-700 border-orange-200',
    summary:
      'Cà chua nhà màng và ngoài trời đang phân hóa giá mạnh, lô chăm nước - dinh dưỡng bài bản giữ được độ bóng và cứng trái tốt hơn.',
    currentPrice: 21400,
    unit: 'đ/kg',
    changePct: 1.9,
    seriesSeed: { driftPct: 0.09, volatilityPct: 0.02, phase: 18, rangePct: 0.017 },
    localPrices: [
      ['Lâm Đồng', 'Cà chua beef', 'Loại 1, nhà màng', 'đ/kg', 21400, 1.9, 'Nhà màng giữ chất lượng tốt.'],
      ['Đơn Dương', 'Cà chua chợ', 'Loại 1, hàng tươi', 'đ/kg', 19600, 1.2, 'Nguồn cung ổn định hơn cuối tuần.'],
      ['Đà Lạt', 'Cà chua cherry', 'Loại 1, hàng nhà hàng', 'đ/kg', 24800, 2.1, 'Giá cao nhờ đầu ra nhà hàng.'],
    ],
    banner: {
      eyebrow: 'Tưới - châm phân chuẩn xác',
      title: 'Cà chua cần lịch nước và dinh dưỡng ổn định để giữ độ cứng trái và hạn chế nứt vai.',
      description:
        'Hệ thống châm phân bán tự động rất phù hợp cho nhà vườn đang muốn chuẩn hóa công thức tưới theo từng giai đoạn trái.',
      href: '/danh-muc',
      ctaLabel: 'Xem hệ thống fertigation',
    },
  }),
  melon: createDataset({
    key: 'melon',
    label: 'Dưa lưới',
    group: 'Cây rau màu & hoa',
    icon: Cherry,
    accent: PRIMARY_GREEN,
    chipTone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary:
      'Dưa lưới giữ mức giá tốt ở nhóm canh tác trong nhà màng, thị trường ưu tiên lô trái đồng đều, gân đẹp và độ ngọt ổn định.',
    currentPrice: 39800,
    unit: 'đ/kg',
    changePct: 1.5,
    seriesSeed: { driftPct: 0.07, volatilityPct: 0.016, phase: 20, rangePct: 0.013 },
    localPrices: [
      ['Lâm Đồng', 'Dưa lưới', 'Loại 1, nhà màng chuẩn', 'đ/kg', 39800, 1.5, 'Đầu ra ổn định qua siêu thị.'],
      ['Ninh Thuận', 'Dưa lưới', 'Loại 1, lưới đẹp', 'đ/kg', 38600, 1.1, 'Giá chênh theo độ lưới và trọng lượng.'],
      ['Bình Dương', 'Dưa lưới', 'Loại 1, cắt cuống chuẩn', 'đ/kg', 40500, 1.6, 'Lô đẹp được chốt trước.'],
    ],
    banner: {
      eyebrow: 'Nâng chuẩn canh tác',
      title: 'Dưa lưới giá tốt là lúc nên tối ưu châm phân và kiểm soát áp tưới trong nhà màng.',
      description:
        'Tưới chính xác giúp giảm dao động EC, giữ trái lớn đều và nâng tỷ lệ hàng loại 1 cho kênh bán lẻ hiện đại.',
      href: '/giai-phap',
      ctaLabel: 'Xem cấu hình nhà màng',
    },
  }),
  rose: createDataset({
    key: 'rose',
    label: 'Hoa hồng',
    group: 'Cây rau màu & hoa',
    icon: Flower2,
    accent: ACTION_ORANGE,
    chipTone: 'bg-rose-50 text-rose-700 border-rose-200',
    summary:
      'Hoa hồng cắt cành ổn định giá hơn nhờ nhu cầu sự kiện và cưới hỏi, vườn có lịch tưới - phun lá chuẩn đang cho chiều dài cành đẹp hơn.',
    currentPrice: 3200,
    unit: 'đ/cành',
    changePct: 1.4,
    seriesSeed: { driftPct: 0.085, volatilityPct: 0.025, phase: 22, rangePct: 0.03 },
    localPrices: [
      ['Đà Lạt', 'Hoa hồng đỏ', 'Loại A, cành 70cm+', 'đ/cành', 3200, 1.4, 'Chiều dài cành đẹp, màu bông đều.'],
      ['Mê Linh', 'Hoa hồng cắt cành', 'Loại 1, cành 60cm+', 'đ/cành', 2980, 1.0, 'Đầu ra ổn định cho chợ hoa.'],
      ['Lâm Đồng', 'Hoa hồng chùm', 'Loại A, nụ đều', 'đ/cành', 3520, 1.6, 'Nhà vườn ưu tiên đơn sỉ cuối tuần.'],
    ],
    banner: {
      eyebrow: 'Tưới áp thấp tinh chỉnh',
      title: 'Hoa hồng cần lịch nước và phun lá chính xác để giữ chiều dài cành và độ bung nụ.',
      description:
        'Béc phun mịn, van ổn định áp và châm phân chuẩn giúp nhà vườn chủ động hơn trong những giai đoạn cao điểm cắt cành.',
      href: '/danh-muc',
      ctaLabel: 'Xem vật tư cho nhà vườn hoa',
    },
  }),
};

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
}

function formatCompactPrice(value: number, unit: string) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} ${unit}`;
}

function formatAxisTick(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}tr`;
  }

  if (value >= 1_000) {
    return value >= 10_000 ? `${Math.round(value / 1_000)}k` : `${(value / 1_000).toFixed(1)}k`;
  }

  return `${value}`;
}

function getRangeMeta(range: TimeRangeKey) {
  return TIME_RANGE_OPTIONS.find((option) => option.key === range) ?? TIME_RANGE_OPTIONS[0];
}

function formatSeriesLabel(date: string, range: TimeRangeKey) {
  const value = new Date(date);

  if (range === '7d') {
    return new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(value);
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  }).format(value);
}

function DashboardCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)]',
        className
      )}
    >
      {children}
    </section>
  );
}

function TickerTape({ datasets }: { datasets: CommodityDataset[] }) {
  const items = [...datasets, ...datasets];

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.3)]">
      <div className="flex whitespace-nowrap py-3">
        <div className="flex min-w-max animate-[agri-market-marquee_28s_linear_infinite] items-center gap-4 px-4">
          {items.map((item, index) => {
            const TrendIcon = item.changePct >= 0 ? ArrowUpRight : ArrowDownRight;

            return (
              <div
                key={`${item.key}-${index}`}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${item.accent}14`, color: item.accent }}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-base font-bold text-slate-900">
                    {formatCompactPrice(item.currentPrice, item.unit)}
                  </p>
                </div>
                <div
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold',
                    item.changePct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  )}
                >
                  <TrendIcon className="h-4 w-4" />
                  {item.changePct >= 0 ? '+' : ''}
                  {item.changePct.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes agri-market-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

function CommodityTabs({
  activeTab,
  onChange,
}: {
  activeTab: CommodityKey;
  onChange: (tab: CommodityKey) => void;
}) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-max gap-3">
        {COMMODITY_TABS.map((tabKey) => {
          const item = MOCK_MARKET_DATA[tabKey];
          const active = activeTab === tabKey;

          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => onChange(tabKey)}
              aria-pressed={active}
              className={cn(
                'inline-flex min-w-[180px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
                active
                  ? 'border-transparent text-white shadow-[0_16px_30px_-18px_rgba(46,125,50,0.55)]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              )}
              style={active ? { backgroundColor: item.accent } : undefined}
            >
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                  active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-bold">{item.label}</p>
                <p className={cn('truncate text-sm', active ? 'text-white/80' : 'text-slate-500')}>
                  {item.group}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
  mode,
}: {
  active?: boolean;
  payload?: Array<{ payload: DisplaySeriesPoint; value: number }>;
  label?: string;
  unit: string;
  mode: ChartMode;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{formatCompactPrice(point.close, unit)}</p>
      {mode === 'range' ? (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
          <span>Mở cửa: {formatCompactPrice(point.open, unit)}</span>
          <span>Cao nhất: {formatCompactPrice(point.high, unit)}</span>
          <span>Thấp nhất: {formatCompactPrice(point.low, unit)}</span>
          <span>Đóng cửa: {formatCompactPrice(point.close, unit)}</span>
        </div>
      ) : null}
    </div>
  );
}

function PriceTrendChart({ dataset }: { dataset: CommodityDataset }) {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('7d');
  const [chartMode, setChartMode] = useState<ChartMode>('line');

  const rangeMeta = getRangeMeta(timeRange);
  const changeTone =
    dataset.changePct >= 0
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

  const displaySeries = useMemo<DisplaySeriesPoint[]>(() => {
    return dataset.series.slice(-rangeMeta.days).map((point) => ({
      ...point,
      label: formatSeriesLabel(point.date, timeRange),
      lowBase: point.low,
      priceRange: Math.max(1, point.high - point.low),
    }));
  }, [dataset.series, rangeMeta.days, timeRange]);

  const minLow = Math.min(...displaySeries.map((point) => point.low));
  const maxHigh = Math.max(...displaySeries.map((point) => point.high));
  const domainPadding = Math.max((maxHigh - minLow) * 0.12, dataset.currentPrice * 0.025);

  return (
    <DashboardCard>
      <div className="p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn('rounded-full border px-3 py-1 text-sm font-semibold', dataset.chipTone)}>
                {dataset.group}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
                Dữ liệu {rangeMeta.label.toLowerCase()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${dataset.accent}14`, color: dataset.accent }}
              >
                <dataset.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Biểu đồ phân tích</p>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">{dataset.label}</h2>
              </div>
            </div>

            <p className="max-w-3xl text-base leading-7 text-slate-500">{dataset.summary}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Giá hiện tại</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCompactPrice(dataset.currentPrice, dataset.unit)}
              </p>
            </div>
            <div className={cn('rounded-2xl border p-4', changeTone)}>
              <p className="text-sm font-semibold">Biến động</p>
              <p className="mt-1 text-2xl font-bold">
                {dataset.changePct >= 0 ? '+' : ''}
                {dataset.changePct.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Mẫu dữ liệu</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
                <TrendingUp className="h-5 w-5" style={{ color: dataset.accent }} />
                {displaySeries.length} điểm
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] bg-slate-50 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {TIME_RANGE_OPTIONS.map((option) => {
                const active = timeRange === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setTimeRange(option.key)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-semibold transition',
                      active
                        ? 'border-transparent bg-[var(--chart-accent)] text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    )}
                    style={active ? { backgroundColor: dataset.accent } : undefined}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setChartMode((prev) => (prev === 'line' ? 'range' : 'line'))}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <BarChart3 className="h-4 w-4" />
              {chartMode === 'line' ? 'Chuyển sang Biên độ giá' : 'Chuyển sang Biểu đồ đường'}
            </button>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              {chartMode === 'line' ? 'Chế độ: Đường đóng cửa' : 'Chế độ: Biên độ giá mô phỏng nến'}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
              Khoảng xem: {rangeMeta.label}
            </span>
          </div>

          <div className="h-[320px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'line' ? (
                <LineChart data={displaySeries} margin={{ left: 6, right: 16, top: 12, bottom: 4 }}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={timeRange === '180d' ? 24 : 12}
                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={84}
                    domain={[Math.max(0, minLow - domainPadding), maxHigh + domainPadding]}
                    tickFormatter={formatAxisTick}
                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
                  />
                  <Tooltip content={<ChartTooltip unit={dataset.unit} mode={chartMode} />} />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={dataset.accent}
                    strokeWidth={4}
                    dot={displaySeries.length <= 14 ? { r: 4, strokeWidth: 0, fill: dataset.accent } : false}
                    activeDot={{ r: 7, fill: dataset.accent, stroke: '#ffffff', strokeWidth: 3 }}
                  />
                </LineChart>
              ) : (
                <ComposedChart data={displaySeries} margin={{ left: 6, right: 16, top: 12, bottom: 4 }}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={timeRange === '180d' ? 24 : 12}
                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={84}
                    domain={[Math.max(0, minLow - domainPadding), maxHigh + domainPadding]}
                    tickFormatter={formatAxisTick}
                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
                  />
                  <Tooltip content={<ChartTooltip unit={dataset.unit} mode={chartMode} />} />
                  <Bar dataKey="lowBase" stackId="price" fill="transparent" isAnimationActive={false} />
                  <Bar
                    dataKey="priceRange"
                    stackId="price"
                    fill={dataset.accent}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={16}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function LocalPricesTable({ dataset }: { dataset: CommodityDataset }) {
  return (
    <DashboardCard>
      <div className="p-6">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Thu mua địa phương</p>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">
              Bảng giá khu vực cho {dataset.label}
            </h3>
            <p className="text-base leading-7 text-slate-500">
              Bảng giá đã tách rõ mặt hàng, chuẩn chất lượng và đơn vị để người dùng phân tích sâu hơn theo từng nhóm thu mua.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
            <MapPin className="h-4 w-4" style={{ color: dataset.accent }} />
            Cập nhật từ mạng lưới Nhà Bè Agri
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-[920px] divide-y divide-slate-200 text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-4 text-sm font-bold text-slate-700">Khu vực</th>
                  <th className="px-4 py-4 text-sm font-bold text-slate-700">Mặt hàng</th>
                  <th className="px-4 py-4 text-sm font-bold text-slate-700">Chuẩn chất lượng</th>
                  <th className="px-4 py-4 text-sm font-bold text-slate-700">Đơn vị</th>
                  <th className="px-4 py-4 text-sm font-bold text-slate-700">Giá hôm nay</th>
                  <th className="px-4 py-4 text-sm font-bold text-slate-700">Biến động</th>
                  <th className="px-4 py-4 text-sm font-bold text-slate-700">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {dataset.localPrices.map((row, index) => {
                  const rising = row.changePct >= 0;
                  const TrendIcon = rising ? ArrowUpRight : ArrowDownRight;

                  return (
                    <tr
                      key={`${row.area}-${row.product}-${row.quality}`}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                    >
                      <td className="px-4 py-4 text-base font-bold text-slate-900">{row.area}</td>
                      <td className="px-4 py-4 text-base font-semibold text-slate-900">{row.product}</td>
                      <td className="px-4 py-4 text-base text-slate-600">{row.quality}</td>
                      <td className="px-4 py-4 text-base font-semibold text-slate-600">{row.unit}</td>
                      <td className="px-4 py-4 text-base font-bold text-slate-900">
                        {formatCompactPrice(row.price, row.unit)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold',
                            rising ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          )}
                        >
                          <TrendIcon className="h-4 w-4" />
                          {rising ? '+' : ''}
                          {row.changePct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-base leading-7 text-slate-500">{row.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

function ContextualSalesBanner({ dataset }: { dataset: CommodityDataset }) {
  const isWarmTone = dataset.accent === ACTION_ORANGE;

  return (
    <DashboardCard className="overflow-hidden">
      <div
        className="p-6"
        style={{
          background: isWarmTone
            ? 'linear-gradient(135deg, rgba(239,108,0,0.12), rgba(255,247,237,1))'
            : 'linear-gradient(135deg, rgba(46,125,50,0.12), rgba(240,253,244,1))',
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              {dataset.banner.eyebrow}
            </p>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">{dataset.banner.title}</h3>
            <p className="text-base leading-7 text-slate-600">{dataset.banner.description}</p>
          </div>

          <Link
            href={dataset.banner.href}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-bold text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.45)] transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: isWarmTone ? ACTION_ORANGE : PRIMARY_GREEN }}
          >
            {dataset.banner.ctaLabel}
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </DashboardCard>
  );
}

function MarketContentSkeleton() {
  return (
    <div className="space-y-6">
      <DashboardCard>
        <div className="space-y-5 p-6">
          <Skeleton className="h-6 w-40 rounded-full" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
          <Skeleton className="h-5 w-full max-w-3xl rounded-full" />
          <Skeleton className="h-[320px] w-full rounded-[24px] sm:h-[380px]" />
        </div>
      </DashboardCard>

      <DashboardCard>
        <div className="space-y-4 p-6">
          <Skeleton className="h-6 w-64 rounded-full" />
          <Skeleton className="h-[280px] w-full rounded-[24px]" />
        </div>
      </DashboardCard>
    </div>
  );
}

export default function AgriMarketDashboard() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeTab, setActiveTab] = useState<CommodityKey>('coffee-robusta');
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const tickerItems = useMemo(
    () => FEATURED_TICKER_KEYS.map((tabKey) => MOCK_MARKET_DATA[tabKey]),
    []
  );
  const activeDataset = MOCK_MARKET_DATA[activeTab];

  const handleTabChange = (nextTab: CommodityKey) => {
    if (nextTab === activeTab) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setIsSwitching(true);
    timerRef.current = setTimeout(() => {
      setActiveTab(nextTab);
      setIsSwitching(false);
    }, 420);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <header className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)] sm:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <TrendingUp className="h-4 w-4" />
                  Agri Market Dashboard
                </span>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    Bảng giá nông sản sáng rõ, chia nhóm theo chiến lược canh tác
                  </h1>
                  <p className="max-w-4xl text-lg leading-8 text-slate-500">
                    Theo dõi nhanh giá cây công nghiệp lâu năm, cây ăn trái xuất khẩu, lúa màu và nhóm rau hoa trong cùng
                    một màn hình, kèm ngữ cảnh thời tiết và cơ hội chốt sale thiết bị.
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Dữ liệu mô phỏng</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">08:30 sáng nay</p>
                <p className="mt-1 text-base leading-7 text-slate-500">
                  Sẵn sàng thay bằng API Supabase khi backend market hoàn tất.
                </p>
              </div>
            </div>
          </header>

          <TickerTape datasets={tickerItems} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <DashboardCard>
                <div className="space-y-5 p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Phân loại nông sản
                    </p>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                      Chọn nhanh mặt hàng cần theo dõi
                    </h2>
                    <p className="text-base leading-7 text-slate-500">
                      Thanh tab có thể cuộn ngang để chứa toàn bộ nhóm cây trồng chiến lược mà không làm vỡ bố cục.
                    </p>
                  </div>

                  <CommodityTabs activeTab={activeTab} onChange={handleTabChange} />
                </div>
              </DashboardCard>

              {isSwitching ? (
                <MarketContentSkeleton />
              ) : (
                <>
                  <PriceTrendChart dataset={activeDataset} />
                  <MarketNewsWidget />
                  <O2OProductSlider />
                  <LocalPricesTable dataset={activeDataset} />
                </>
              )}
            </div>

            <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-4 lg:self-start">
              <AgriWeatherWidget />
              <ContextualSalesBanner dataset={activeDataset} />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
