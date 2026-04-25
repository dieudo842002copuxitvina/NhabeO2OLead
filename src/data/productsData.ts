import type { Product } from './types';

export type ProductGroup = 'HARDWARE' | 'FERTILIZER';

export interface ProductData extends Product {
  type: ProductGroup;
  brand: string;
  images: string[];
  geo_availability: string[];
}

type CategoryTier = {
  tier1: ProductGroup;
  tier2_id: string;
  tier2_name: string;
  tier3_id: string;
  tier3_name: string;
};

type HardwareTemplate = {
  label: string;
  model: string;
  brand: string;
  category: CategoryTier;
  basePrice: number;
  unit: string;
  keywords: string[];
  specs: Record<string, string | number | boolean>;
  strengths: string[];
};

type FertilizerTemplate = {
  label: string;
  formula: string;
  brand: string;
  category: CategoryTier;
  basePrice: number;
  unit: string;
  crop: string;
  stage: string;
  keywords: string[];
  specs: Record<string, string | number | boolean>;
  strengths: string[];
};

const PROVINCE_POOLS = [
  ['Đồng Nai', 'Bình Phước', 'Lâm Đồng', 'Gia Lai', 'Đắk Lắk'],
  ['Long An', 'Tiền Giang', 'Cần Thơ', 'Vĩnh Long', 'Đồng Tháp'],
  ['Tây Ninh', 'Bình Dương', 'TP.HCM', 'Bà Rịa - Vũng Tàu', 'Bình Thuận'],
  ['Đắk Nông', 'Kon Tum', 'Khánh Hòa', 'Ninh Thuận', 'An Giang'],
];

const HARDWARE_CATEGORIES: CategoryTier[] = [
  { tier1: 'HARDWARE', tier2_id: 'tuoi-nho-giot', tier2_name: 'Tưới nhỏ giọt', tier3_id: 'dau-tuoi-nho-giot', tier3_name: 'Đầu tưới nhỏ giọt' },
  { tier1: 'HARDWARE', tier2_id: 'tuoi-nho-giot', tier2_name: 'Tưới nhỏ giọt', tier3_id: 'ong-tuoi-nho-giot', tier3_name: 'Ống tưới nhỏ giọt' },
  { tier1: 'HARDWARE', tier2_id: 'tuoi-phun-mua', tier2_name: 'Tưới phun mưa', tier3_id: 'bec-tuoi-phun-mua', tier3_name: 'Béc tưới phun mưa' },
  { tier1: 'HARDWARE', tier2_id: 'tuoi-phun-mua', tier2_name: 'Tưới phun mưa', tier3_id: 'sung-tuoi-phun-mua', tier3_name: 'Súng tưới phun mưa' },
  { tier1: 'HARDWARE', tier2_id: 'bo-trung-tam', tier2_name: 'Bộ trung tâm', tier3_id: 'may-bom-tuoi-cay', tier3_name: 'Máy bơm tưới cây' },
  { tier1: 'HARDWARE', tier2_id: 'bo-trung-tam', tier2_name: 'Bộ trung tâm', tier3_id: 'bo-dieu-khien', tier3_name: 'Bộ điều khiển' },
  { tier1: 'HARDWARE', tier2_id: 'bo-trung-tam', tier2_name: 'Bộ trung tâm', tier3_id: 'loc-he-thong-tuoi', tier3_name: 'Lọc hệ thống tưới' },
  { tier1: 'HARDWARE', tier2_id: 'bo-trung-tam', tier2_name: 'Bộ trung tâm', tier3_id: 'thiet-bi-cham-phan', tier3_name: 'Thiết bị châm phân' },
  { tier1: 'HARDWARE', tier2_id: 'ong-dan-nuoc', tier2_name: 'Ống dẫn nước', tier3_id: 'ong-hdpe', tier3_name: 'Ống HDPE' },
  { tier1: 'HARDWARE', tier2_id: 'may-nong-nghiep', tier2_name: 'Máy nông nghiệp', tier3_id: 'may-bay-nong-nghiep', tier3_name: 'Máy bay nông nghiệp' },
];

const FERTILIZER_CATEGORIES: CategoryTier[] = [
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-compound', tier2_name: 'Phân phức hợp và hỗn hợp', tier3_id: 'fertilizer-npk', tier3_name: 'NPK' },
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-compound', tier2_name: 'Phân phức hợp và hỗn hợp', tier3_id: 'fertilizer-dap-map', tier3_name: 'DAP/MAP' },
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-secondary-micro', tier2_name: 'Trung lượng và vi lượng', tier3_id: 'fertilizer-secondary-elements', tier3_name: 'Canxi, Magie, Lưu huỳnh' },
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-secondary-micro', tier2_name: 'Trung lượng và vi lượng', tier3_id: 'fertilizer-micro-elements', tier3_name: 'Bo, Kẽm, Sắt, Đồng, Mangan' },
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-industrial-organic', tier2_name: 'Hữu cơ công nghiệp', tier3_id: 'fertilizer-organic-mineral', tier3_name: 'Hữu cơ khoáng' },
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-industrial-organic', tier2_name: 'Hữu cơ công nghiệp', tier3_id: 'fertilizer-organic-bio', tier3_name: 'Hữu cơ vi sinh' },
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-soil-conditioner', tier2_name: 'Cải tạo đất', tier3_id: 'fertilizer-humic-fulvic', tier3_name: 'Humic/Fulvic' },
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-foliar', tier2_name: 'Phân bón lá', tier3_id: 'fertilizer-foliar-npk', tier3_name: 'NPK bón lá' },
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-fertigation', tier2_name: 'Châm phân qua hệ thống tưới', tier3_id: 'fertilizer-water-soluble', tier3_name: 'Phân tan hoàn toàn' },
  { tier1: 'FERTILIZER', tier2_id: 'fertilizer-biostimulant', tier2_name: 'Chế phẩm kích thích sinh trưởng', tier3_id: 'fertilizer-seaweed-extract', tier3_name: 'Chiết xuất rong biển' },
];

const hardwareTemplates: HardwareTemplate[] = [
  {
    label: 'Béc tưới bù áp chống côn trùng',
    model: 'S2000 PC',
    brand: 'Rivulis',
    category: HARDWARE_CATEGORIES[0],
    basePrice: 18500,
    unit: 'cái',
    keywords: ['micro sprinkler', 'irrigation emitter', 'agritech'],
    specs: { flow_lph: '35-95 L/h', pressure_bar: '1.5-4.0 bar', radius_m: '2.5-5.5 m', material: 'Acetal chống UV', anti_insect: true, filtration_mesh: 120 },
    strengths: ['lưu lượng ổn định trên vùng đồi dốc', 'cơ chế chống côn trùng chui vào đầu béc', 'phù hợp sầu riêng, cà phê và hồ tiêu'],
  },
  {
    label: 'Que nhỏ giọt bù áp lưu lượng thấp',
    model: 'PCJ 2L',
    brand: 'Netafim',
    category: HARDWARE_CATEGORIES[0],
    basePrice: 13500,
    unit: 'cái',
    keywords: ['drip emitter', 'precision irrigation', 'orchard'],
    specs: { flow_lph: '2 L/h', pressure_bar: '1.0-4.0 bar', inlet: 'barb 3 mm', material: 'PE chống UV', clog_resistance: 'labyrinth TurboNet', filtration_mesh: 120 },
    strengths: ['bù áp chính xác cho hàng cây dài', 'giảm rò rỉ cuối tuyến', 'dễ thay thế từng điểm tưới'],
  },
  {
    label: 'Ống nhỏ giọt thành dày',
    model: 'D5000 16',
    brand: 'Rivulis',
    category: HARDWARE_CATEGORIES[1],
    basePrice: 980000,
    unit: 'cuộn 500 m',
    keywords: ['dripline', 'farm irrigation', 'agriculture'],
    specs: { diameter_mm: 16, wall_thickness_mm: 1.0, emitter_spacing_cm: 30, flow_lph: '2.1 L/h', pressure_bar: '0.8-3.5 bar', uv_resistance: true },
    strengths: ['thành ống dày cho vườn cây lâu năm', 'mê cung chống nghẹt khi châm phân', 'độ đồng đều cao trên tuyến dài'],
  },
  {
    label: 'Béc phun mưa mini cho vườn cây ăn trái',
    model: '501-U',
    brand: 'NaanDanJain',
    category: HARDWARE_CATEGORIES[2],
    basePrice: 22000,
    unit: 'cái',
    keywords: ['sprinkler irrigation', 'fruit orchard', 'agritech'],
    specs: { flow_lph: '120-250 L/h', pressure_bar: '2.0-3.5 bar', radius_m: '4.0-7.0 m', nozzle_mm: '2.0-3.2', material: 'POM chống mài mòn' },
    strengths: ['hạt nước đều, ít làm xói gốc', 'thay béc nhanh theo tán cây', 'phù hợp cây ăn trái giai đoạn kiến thiết'],
  },
  {
    label: 'Súng tưới bán kính lớn',
    model: 'Jet35T',
    brand: 'Ducar',
    category: HARDWARE_CATEGORIES[3],
    basePrice: 1250000,
    unit: 'cái',
    keywords: ['rain gun', 'large irrigation', 'farm equipment'],
    specs: { flow_m3h: '10-30 m3/h', pressure_bar: '3.0-6.0 bar', radius_m: '20-35 m', connection: 'ren 2 inch', nozzle_mm: '10-18', material: 'hợp kim nhôm' },
    strengths: ['phủ nước nhanh cho ruộng và cỏ chăn nuôi', 'góc quay chỉnh được', 'chịu áp tốt khi dùng bơm công suất lớn'],
  },
  {
    label: 'Máy bơm ly tâm trục ngang',
    model: 'CM 10-3',
    brand: 'Grundfos',
    category: HARDWARE_CATEGORIES[4],
    basePrice: 15800000,
    unit: 'bộ',
    keywords: ['water pump', 'irrigation pump', 'agritech'],
    specs: { power_hp: 3, flow_m3h: '8-14 m3/h', head_m: '28-42 m', voltage: '1 pha/3 pha', body: 'gang phủ epoxy', protection: 'IP55' },
    strengths: ['cột áp ổn định cho tưới phun', 'động cơ tiết kiệm điện', 'dễ tích hợp tủ điều khiển tự động'],
  },
  {
    label: 'Bộ điều khiển tưới WiFi 8 zone',
    model: 'AC8 Pro',
    brand: 'AgriFlow',
    category: HARDWARE_CATEGORIES[5],
    basePrice: 3450000,
    unit: 'bộ',
    keywords: ['smart irrigation controller', 'iot farm', 'agritech'],
    specs: { zones: 8, output: '24 VAC', connectivity: 'WiFi/Bluetooth', schedule: '16 lịch tưới/ngày', enclosure: 'IP65', sensor_input: 'rain/soil moisture' },
    strengths: ['lập lịch theo từng khu tưới', 'dừng tưới khi cảm biến mưa kích hoạt', 'phù hợp nâng cấp hệ thống van điện từ'],
  },
  {
    label: 'Lọc đĩa bảo vệ hệ thống nhỏ giọt',
    model: 'AGL 2',
    brand: 'Azud',
    category: HARDWARE_CATEGORIES[6],
    basePrice: 1850000,
    unit: 'bộ',
    keywords: ['disc filter', 'irrigation filter', 'farm water'],
    specs: { size_inch: 2, flow_m3h: '20-25 m3/h', filtration_micron: 130, mesh: 120, max_pressure_bar: 8, cleaning: 'tháo rửa thủ công' },
    strengths: ['giữ cặn trước khi vào ống nhỏ giọt', 'lõi đĩa dễ vệ sinh', 'giảm rủi ro nghẹt béc khi dùng nước ao hồ'],
  },
  {
    label: 'Thiết bị châm phân Venturi',
    model: 'VNT 34',
    brand: 'Mazzei',
    category: HARDWARE_CATEGORIES[7],
    basePrice: 740000,
    unit: 'bộ',
    keywords: ['fertigation injector', 'venturi', 'irrigation fertilizer'],
    specs: { size_inch: '3/4', suction_lph: '40-120 L/h', pressure_bar: '1.5-6.0 bar', material: 'PP gia cường', check_valve: true, chemical_resistance: 'pH 2-12' },
    strengths: ['châm phân không cần điện', 'lắp bypass gọn trong bộ trung tâm', 'phù hợp phân tan hoàn toàn và humic lỏng'],
  },
  {
    label: 'Ống HDPE PN10 dẫn nước chính',
    model: 'HDPE 63',
    brand: 'Dekko',
    category: HARDWARE_CATEGORIES[8],
    basePrice: 4200000,
    unit: 'cuộn 100 m',
    keywords: ['hdpe pipe', 'irrigation pipe', 'water supply'],
    specs: { diameter_mm: 63, pressure_class: 'PN10', standard: 'ISO 4427', material: 'HDPE PE100', uv_resistance: true, joining: 'hàn nhiệt/khớp nối' },
    strengths: ['chịu áp tốt cho tuyến ống chính', 'bền ngoài trời', 'tổn thất ma sát thấp khi thiết kế đúng lưu lượng'],
  },
  {
    label: 'Drone nông nghiệp phun rải thông minh',
    model: 'Agras T50',
    brand: 'DJI',
    category: HARDWARE_CATEGORIES[9],
    basePrice: 385000000,
    unit: 'bộ',
    keywords: ['agriculture drone', 'agritech drone', 'precision farming'],
    specs: { spray_tank_l: 40, spreader_kg: 50, max_flow_lpm: 24, radar: 'active phased array', battery: 'DB1560', coverage_ha_h: '16-21 ha/h' },
    strengths: ['bay theo bản đồ ruộng vườn', 'radar tránh vật cản đa hướng', 'hữu ích cho địa hình khó đưa máy kéo vào'],
  },
  {
    label: 'Van điện từ tưới tự động',
    model: 'PGV-101',
    brand: 'Hunter',
    category: HARDWARE_CATEGORIES[5],
    basePrice: 690000,
    unit: 'cái',
    keywords: ['solenoid valve', 'irrigation valve', 'farm automation'],
    specs: { size_inch: 1, pressure_bar: '1.4-10.3 bar', flow_m3h: '0.05-9.0 m3/h', coil: '24 VAC', diaphragm: 'EPDM', manual_bleed: true },
    strengths: ['đóng mở ổn định theo khu tưới', 'màng van bền với nước ngoài trời', 'tương thích bộ điều khiển 24 VAC phổ biến'],
  },
];

const fertilizerTemplates: FertilizerTemplate[] = [
  {
    label: 'NPK hòa tan 100% thúc trái',
    formula: '19-19-19 + TE',
    brand: 'Haifa Poly-Feed',
    category: FERTILIZER_CATEGORIES[0],
    basePrice: 1450000,
    unit: 'bao 25 kg',
    crop: 'sầu riêng',
    stage: 'sau đậu trái 45-70 ngày',
    keywords: ['water soluble fertilizer', 'npk fertilizer', 'durian farm'],
    specs: { npk: '19-19-19', solubility: '100%', chloride: 'thấp', ec_1g_l: '1.2 mS/cm', ph_solution: '4.5-5.5', dose: '1.5-2.5 kg/1.000 L nước' },
    strengths: ['cân bằng N-P-K cho giai đoạn nuôi trái', 'tan nhanh khi châm qua Venturi', 'bổ sung TE hạn chế vàng lá sinh lý'],
  },
  {
    label: 'NPK kali cao tăng độ ngọt',
    formula: '13-5-35 + 2MgO + TE',
    brand: 'YaraTera Kristalon',
    category: FERTILIZER_CATEGORIES[8],
    basePrice: 1680000,
    unit: 'bao 25 kg',
    crop: 'dưa lưới',
    stage: 'giai đoạn lớn trái đến trước thu hoạch',
    keywords: ['fertigation fertilizer', 'greenhouse fertilizer', 'melon'],
    specs: { npk: '13-5-35', k2o: '35%', mgo: '2%', solubility: '100%', chloride: 'rất thấp', dose: '1.0-1.8 kg/1.000 L nước' },
    strengths: ['kali cao hỗ trợ tích lũy đường', 'phù hợp nhà màng tưới nhỏ giọt', 'ít cặn trong bồn pha'],
  },
  {
    label: 'MAP kỹ thuật ra rễ mạnh',
    formula: '12-61-0',
    brand: 'Haifa MAP',
    category: FERTILIZER_CATEGORIES[1],
    basePrice: 1320000,
    unit: 'bao 25 kg',
    crop: 'rau màu',
    stage: 'sau trồng 7-20 ngày',
    keywords: ['map fertilizer', 'root growth', 'vegetable farm'],
    specs: { npk: '12-61-0', p2o5: '61%', solubility: '360 g/L ở 20C', nitrogen_form: 'ammonium', insoluble: '<0.1%', dose: '0.8-1.5 kg/1.000 L nước' },
    strengths: ['lân cao kích thích ra rễ', 'hòa tan tốt cho tưới nhỏ giọt', 'hỗ trợ cây con phục hồi sau sang bầu'],
  },
  {
    label: 'Canxi Bo chống nứt trái',
    formula: 'Ca 15% + B 0.2%',
    brand: 'Compo Expert Basfoliar',
    category: FERTILIZER_CATEGORIES[2],
    basePrice: 620000,
    unit: 'can 10 L',
    crop: 'cà chua',
    stage: 'đậu trái đến nuôi trái',
    keywords: ['calcium boron fertilizer', 'foliar fertilizer', 'tomato'],
    specs: { calcium: '15% CaO', boron: '0.2% B', form: 'dung dịch', ph_solution: '5.0-6.5', dose_foliar: '1.5-2.0 ml/L', compatibility: 'không pha chung phosphate đậm đặc' },
    strengths: ['bổ sung canxi dễ hấp thu', 'giảm rủi ro nứt trái và thối đít trái', 'phun lá hoặc châm liều thấp theo khuyến cáo'],
  },
  {
    label: 'Vi lượng chelate tổng hợp',
    formula: 'Fe-Zn-Mn-Cu-B-Mo',
    brand: 'Van Iperen Micro Mix',
    category: FERTILIZER_CATEGORIES[3],
    basePrice: 980000,
    unit: 'thùng 10 kg',
    crop: 'cây ăn trái',
    stage: 'sau phục hồi đọt non',
    keywords: ['micronutrient fertilizer', 'chelated trace elements', 'orchard'],
    specs: { fe: '4.0%', zn: '2.0%', mn: '3.0%', cu: '0.5%', b: '0.8%', chelate: 'EDTA/DTPA', solubility: '100%' },
    strengths: ['bù vi lượng nhanh khi lá non mất màu', 'dạng chelate ổn định trong pH nước tưới phổ biến', 'dùng được cho phun lá và fertigation'],
  },
  {
    label: 'Hữu cơ khoáng phục hồi đất',
    formula: 'OM 55% + NPK 4-3-3',
    brand: 'Sông Gianh Organic Mineral',
    category: FERTILIZER_CATEGORIES[4],
    basePrice: 185000,
    unit: 'bao 25 kg',
    crop: 'hồ tiêu',
    stage: 'sau thu hoạch và đầu mùa mưa',
    keywords: ['organic fertilizer', 'soil conditioner', 'pepper farm'],
    specs: { organic_matter: '>=55%', npk: '4-3-3', humic: '2%', moisture: '<25%', form: 'viên nén', dose: '1-3 kg/gốc tùy tuổi cây' },
    strengths: ['tăng hữu cơ và độ tơi xốp đất', 'giảm sốc rễ sau mùa khô', 'phối hợp tốt với nấm đối kháng và tưới giữ ẩm'],
  },
  {
    label: 'Hữu cơ vi sinh phân giải cellulose',
    formula: 'Bacillus spp. 1x10^8 CFU/g',
    brand: 'BioGro',
    category: FERTILIZER_CATEGORIES[5],
    basePrice: 165000,
    unit: 'bao 20 kg',
    crop: 'cà phê',
    stage: 'ủ phân chuồng và bón sau cắt cành',
    keywords: ['microbial fertilizer', 'compost', 'coffee farm'],
    specs: { microbe_density: '>=1x10^8 CFU/g', organic_matter: '30%', moisture: '<30%', form: 'bột/viên', dose: '0.5-1 kg/gốc hoặc 2 kg/tấn ủ' },
    strengths: ['hỗ trợ phân giải tàn dư hữu cơ', 'cải thiện hệ vi sinh vùng rễ', 'giảm mùi và thời gian ủ phân chuồng'],
  },
  {
    label: 'Humic Fulvic cải tạo rễ',
    formula: 'Humic 70% + Fulvic 10%',
    brand: 'BlackGold Humate',
    category: FERTILIZER_CATEGORIES[6],
    basePrice: 720000,
    unit: 'bao 10 kg',
    crop: 'sầu riêng',
    stage: 'phục hồi rễ sau xiết nước',
    keywords: ['humic acid fertilizer', 'soil conditioner', 'root recovery'],
    specs: { humic_acid: '70%', fulvic_acid: '10%', potassium: '8% K2O', solubility: '>=95%', ph_solution: '9-10', dose: '0.5-1 kg/1.000 L nước' },
    strengths: ['hỗ trợ bung rễ cám', 'tăng khả năng giữ dinh dưỡng trong đất nhẹ', 'dùng tốt trước khi vào chương trình NPK hòa tan'],
  },
  {
    label: 'NPK bón lá xanh lá nhanh',
    formula: '30-10-10 + TE',
    brand: 'GrowMore',
    category: FERTILIZER_CATEGORIES[7],
    basePrice: 520000,
    unit: 'thùng 10 kg',
    crop: 'lan và rau ăn lá',
    stage: 'sinh trưởng thân lá',
    keywords: ['foliar npk fertilizer', 'leaf growth', 'nursery'],
    specs: { npk: '30-10-10', solubility: '100%', nitrogen_total: '30%', trace_elements: 'B, Cu, Fe, Mn, Zn, Mo', dose_foliar: '1-2 g/L nước' },
    strengths: ['đạm cao giúp xanh lá nhanh', 'phù hợp vườn ươm và rau ăn lá', 'hạt mịn, tan nhanh khi khuấy'],
  },
  {
    label: 'Rong biển kích rễ và chống stress',
    formula: 'Ascophyllum nodosum 18%',
    brand: 'Kelpak',
    category: FERTILIZER_CATEGORIES[9],
    basePrice: 980000,
    unit: 'can 5 L',
    crop: 'cây ăn trái',
    stage: 'sau mưa dầm, sau sang chậu hoặc sau thu hoạch',
    keywords: ['seaweed extract fertilizer', 'biostimulant', 'fruit orchard'],
    specs: { seaweed_extract: '18%', auxin_cytokinin_ratio: 'cao auxin tự nhiên', organic_carbon: '6%', ph_solution: '4.0-6.0', dose: '1-2 L/ha hoặc 1 ml/L nước' },
    strengths: ['giúp cây phục hồi sau stress thời tiết', 'kích rễ tơ và đọt non', 'dùng xen kẽ với chương trình dinh dưỡng chính'],
  },
];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function brandId(brand: string) {
  return slugify(brand).slice(0, 32);
}

function unsplashImage(keywords: string[], index: number) {
  const query = encodeURIComponent(keywords.join(','));
  return `https://source.unsplash.com/900x700/?${query}&sig=${index}`;
}

function priceWithVariant(basePrice: number, index: number, step = 0.035) {
  const multiplier = 1 + ((index % 7) - 3) * step;
  return Math.round((basePrice * multiplier) / 1000) * 1000;
}

function availability(index: number) {
  const pool = PROVINCE_POOLS[index % PROVINCE_POOLS.length];
  return [...pool, PROVINCE_POOLS[(index + 1) % PROVINCE_POOLS.length][index % 5]];
}

function buildHardwareDescription(template: HardwareTemplate, variant: number) {
  const areaHint = variant % 3 === 0 ? 'vườn cây ăn trái trên đất dốc' : variant % 3 === 1 ? 'trang trại rau màu tưới nhiều lứa' : 'khu tưới có tuyến ống dài';
  return [
    `${template.label} ${template.model} của ${template.brand} được cấu hình cho ${areaHint}, nơi yêu cầu lưu lượng ổn định và thao tác bảo trì nhanh. Sản phẩm tập trung vào độ bền vật liệu, khả năng làm việc trong áp lực thực tế của hệ thống tưới và tính tương thích với bộ trung tâm hiện có.`,
    `Điểm mạnh kỹ thuật gồm ${template.strengths.join(', ')}. Khi triển khai đúng lọc đầu nguồn và áp suất vận hành, thiết bị giúp giảm lệch nước giữa đầu tuyến và cuối tuyến, hạn chế thất thoát và giữ đồng đều ẩm vùng rễ.`,
    `Khuyến nghị dùng trong thiết kế O2O của Nhà Bè Agri là khảo sát nguồn nước, đo lưu lượng bơm, kiểm tra tổn thất đường ống và chọn số lượng đầu tưới theo mật độ cây. Đại lý địa phương có thể thay nozzle, đầu nối hoặc phụ kiện đi kèm theo thực tế vườn để tối ưu chi phí lắp đặt.`,
  ].join('\n\n');
}

function buildFertilizerDescription(template: FertilizerTemplate, variant: number) {
  const method = variant % 2 === 0 ? 'châm qua hệ thống tưới nhỏ giọt' : 'pha phun lá hoặc tưới gốc theo nồng độ khuyến cáo';
  return [
    `${template.label} ${template.formula} của ${template.brand} được định vị cho ${template.crop} ở ${template.stage}. Công thức tập trung vào chỉ số dinh dưỡng rõ ràng, độ hòa tan cao và khả năng phối hợp trong chương trình canh tác chính xác.`,
    `Sản phẩm phù hợp để ${method}. Các thông số như N-P-K, độ hòa tan, EC dung dịch và liều dùng cần được kiểm soát theo chất lượng nước, pH bồn pha và sức cây tại thời điểm xử lý.`,
    `Trong vận hành thực tế, nên dùng sau khi kiểm tra ẩm đất và tránh phối trộn tùy tiện với sản phẩm chứa canxi, phosphate hoặc thuốc BVTV đậm đặc nếu nhãn không cho phép. Đại lý có thể hiệu chỉnh liều theo tuổi cây, năng suất mục tiêu và lịch tưới hiện có để giảm lãng phí phân bón.`,
  ].join('\n\n');
}

function hardwareProduct(index: number): ProductData {
  const template = hardwareTemplates[index % hardwareTemplates.length];
  const variant = Math.floor(index / hardwareTemplates.length) + 1;
  const name = `${template.label} ${template.brand} ${template.model}-${String(variant).padStart(2, '0')}`;
  const images = [
    unsplashImage(template.keywords, index + 1),
    unsplashImage([...template.keywords, 'farm installation'], index + 101),
  ];

  return {
    id: `p-${index + 1}`,
    type: 'HARDWARE',
    name,
    slug: slugify(name),
    sku: `HW-${String(index + 1).padStart(3, '0')}`,
    category_id: template.category.tier3_id,
    brand: template.brand,
    brand_id: brandId(template.brand),
    price: priceWithVariant(template.basePrice, index),
    unit: template.unit,
    description: buildHardwareDescription(template, variant),
    images,
    thumbnail: images[0],
    gallery: images,
    specs: {
      ...template.specs,
      product_group: 'HARDWARE',
      category_tier: template.category,
      recommended_terrain: variant % 2 === 0 ? 'đất bằng, tuyến tưới dài' : 'đồi dốc, chênh cao 3-12 m',
      warranty_months: template.brand === 'DJI' ? 12 : 24,
    },
    geo_availability: availability(index),
    tags: ['thiết bị', template.category.tier2_name, template.category.tier3_name, variant % 2 === 0 ? 'best seller' : 'tưới chính xác'],
    meta_title: `${name} | Thiết bị tưới chính hãng`,
    meta_description: `${name} - ${template.strengths[0]}, có hàng tại ${availability(index).slice(0, 3).join(', ')}.`,
  };
}

function fertilizerProduct(index: number): ProductData {
  const template = fertilizerTemplates[index % fertilizerTemplates.length];
  const variant = Math.floor(index / fertilizerTemplates.length) + 1;
  const name = `${template.label} ${template.brand} ${template.formula} V${variant}`;
  const images = [
    unsplashImage(template.keywords, index + 501),
    unsplashImage([...template.keywords, 'fertilizer bag'], index + 601),
  ];

  return {
    id: `p-${index + 51}`,
    type: 'FERTILIZER',
    name,
    slug: slugify(name),
    sku: `FT-${String(index + 1).padStart(3, '0')}`,
    category_id: template.category.tier3_id,
    brand: template.brand,
    brand_id: brandId(template.brand),
    price: priceWithVariant(template.basePrice, index, 0.028),
    unit: template.unit,
    description: buildFertilizerDescription(template, variant),
    images,
    thumbnail: images[0],
    gallery: images,
    specs: {
      ...template.specs,
      product_group: 'FERTILIZER',
      category_tier: template.category,
      crop: template.crop,
      stage: template.stage,
      application_window: variant % 2 === 0 ? 'sáng sớm hoặc chiều mát' : 'sau tưới ẩm, tránh nắng gắt',
      storage: 'bảo quản khô, kín miệng bao/can sau khi mở',
    },
    geo_availability: availability(index + 50),
    tags: ['phân bón', template.category.tier3_name, template.crop, variant % 2 === 0 ? 'tan hoàn toàn' : 'dinh dưỡng chính xác'],
    meta_title: `${name} | Dinh dưỡng cây trồng`,
    meta_description: `${name} cho ${template.crop}, ${template.stage}, độ hòa tan và liều dùng rõ ràng.`,
  };
}

export const PRODUCTS_DATA: ProductData[] = Array.from({ length: 100 }, (_, index) =>
  index < 50 ? hardwareProduct(index) : fertilizerProduct(index - 50),
);

export const HARDWARE_PRODUCTS = PRODUCTS_DATA.filter((product) => product.type === 'HARDWARE');
export const FERTILIZER_PRODUCTS = PRODUCTS_DATA.filter((product) => product.type === 'FERTILIZER');

