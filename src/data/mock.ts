import { Product, Dealer, DealerProduct, Order, AnalyticsInsight, Customer, NewsArticle, CommodityPrice, WeatherData, MarketAlert } from './types';

export const products: Product[] = [
  {
    id: 'p-1', name: 'Hệ thống tưới nhỏ giọt Netafim Pro', slug: 'tuoi-nho-giot-netafim-pro',
    sku: 'NET-PRO-01', category_id: 'Hệ thống tưới', brand_id: 'netafim',
    price: 4500000, unit: 'bộ', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Hệ thống tưới nhỏ giọt chính xác cao, tiết kiệm 60% nước, phù hợp cho vườn cây ăn trái và rau màu. Thiết kế bền bỉ, dễ lắp đặt.',
    specs: { 'Diện tích phủ': '500m²', 'Lưu lượng': '2L/h', 'Áp suất': '1-3 bar', 'Vật liệu': 'PE cao cấp' },
    tags: ['best seller', 'tiết kiệm nước']
  },
  {
    id: 'p-2', name: 'Máy bơm Grundfos CR 15', slug: 'may-bom-grundfos-cr15',
    sku: 'GRU-CR15', category_id: 'Máy bơm', brand_id: 'grundfos',
    price: 18500000, unit: 'chiếc', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Máy bơm trục đứng đa tầng cánh, hiệu suất cao, phù hợp tưới tiêu quy mô lớn. Tiết kiệm điện, bền bỉ.',
    specs: { 'Công suất': '3HP', 'Lưu lượng max': '15m³/h', 'Cột áp': '45m', 'Điện áp': '220V/380V' },
    tags: ['công nghiệp']
  },
  {
    id: 'p-3', name: 'Cảm biến độ ẩm đất IoT ST-100', slug: 'cam-bien-do-am-st100',
    sku: 'IOT-ST100', category_id: 'Cảm biến IoT', brand_id: 'agriflow',
    price: 1200000, unit: 'chiếc', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Cảm biến đo độ ẩm đất real-time, kết nối WiFi/LoRa, pin mặt trời. Theo dõi từ xa qua app.',
    specs: { 'Kết nối': 'WiFi + LoRa', 'Pin': 'Solar', 'Độ sâu đo': '0-60cm', 'Độ chính xác': '±2%' },
    tags: ['best seller', 'IoT', 'smart farm']
  },
  {
    id: 'p-4', name: 'Ống nhỏ giọt Rivulis T-Tape', slug: 'ong-nho-giot-rivulis',
    sku: 'RIV-TTAPE', category_id: 'Hệ thống tưới', brand_id: 'rivulis',
    price: 850000, unit: 'cuộn 500m', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Ống nhỏ giọt dẹt, dễ lắp đặt, chi phí thấp cho rau màu và cây ngắn ngày.',
    specs: { 'Đường kính': '16mm', 'Khoảng cách lỗ': '20cm', 'Dày': '0.2mm' },
    tags: ['tiết kiệm']
  },
  {
    id: 'p-5', name: 'Trạm thời tiết thông minh WS-200', slug: 'tram-thoi-tiet-ws200',
    sku: 'WS-200-IOT', category_id: 'Cảm biến IoT', brand_id: 'agriflow',
    price: 8500000, unit: 'bộ', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Trạm quan trắc thời tiết tự động: nhiệt độ, độ ẩm, gió, mưa, ánh sáng. Dashboard online.',
    specs: { 'Thông số đo': '6 loại', 'Kết nối': '4G + WiFi', 'Pin': 'Solar 10W' },
    tags: ['IoT', 'smart farm']
  },
  {
    id: 'p-6', name: 'Bộ điều khiển tưới tự động AC-8', slug: 'dieu-khien-tuoi-ac8',
    sku: 'AC-8-CTRL', category_id: 'Điều khiển', brand_id: 'agriflow',
    price: 3200000, unit: 'bộ', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Bộ điều khiển 8 vùng tưới, lập trình linh hoạt, kết nối app điện thoại.',
    specs: { 'Số vùng': '8', 'Kết nối': 'WiFi + Bluetooth', 'Nguồn': 'AC 220V' },
    tags: ['smart farm', 'tự động']
  },
  {
    id: 'p-7', name: 'Van điện từ Hunter PGV-101', slug: 'van-dien-tu-hunter',
    sku: 'HUN-PGV101', category_id: 'Hệ thống tưới', brand_id: 'hunter',
    price: 650000, unit: 'chiếc', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Van điện từ chuyên dụng cho hệ thống tưới tự động, chống rò rỉ, bền bỉ ngoài trời.',
    specs: { 'Kích thước': '1 inch', 'Áp suất': '1-10 bar', 'Điện áp': '24V AC' },
    tags: ['tự động']
  },
  {
    id: 'p-8', name: 'Bộ lọc đĩa Arkal 2"', slug: 'bo-loc-dia-arkal',
    sku: 'ARK-FIL-2', category_id: 'Hệ thống tưới', brand_id: 'arkal',
    price: 1800000, unit: 'bộ', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Bộ lọc đĩa cho hệ thống tưới, lọc tạp chất, bảo vệ đầu tưới nhỏ giọt.',
    specs: { 'Kích thước': '2 inch', 'Lưu lượng': '25m³/h', 'Mesh': '120' },
    tags: ['best seller']
  },
  {
    id: 'p-9', name: 'Máy bơm năng lượng mặt trời Lorentz PS2-150', slug: 'may-bom-solar-lorentz',
    sku: 'LOR-PS2-150', category_id: 'Máy bơm', brand_id: 'lorentz',
    price: 25000000, unit: 'bộ', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Máy bơm chìm chạy năng lượng mặt trời, không cần điện lưới, phù hợp vùng sâu vùng xa.',
    specs: { 'Công suất': '1.5HP', 'Lưu lượng': '8m³/h', 'Cột áp': '30m', 'Tấm pin': '4x250W' },
    tags: ['năng lượng xanh', 'best seller']
  },
  {
    id: 'p-10', name: 'Bộ kit tưới vườn thông minh SmartGarden', slug: 'kit-tuoi-smart-garden',
    sku: 'SMART-G-KIT', category_id: 'Điều khiển', brand_id: 'agriflow',
    price: 2800000, unit: 'bộ', thumbnail: '/placeholder.svg', gallery: [],
    description: 'Bộ kit hoàn chỉnh cho vườn nhỏ: cảm biến + điều khiển + van + ống tưới. Cài đặt trong 30 phút.',
    specs: { 'Diện tích': '100m²', 'Số đầu tưới': '20', 'App': 'iOS + Android' },
    tags: ['dễ lắp đặt', 'smart farm']
  },
];

export const dealers: Dealer[] = [
  { id: 'd-1', name: 'Đại lý Nông Phát', region: 'Đồng Nai', province: 'Đồng Nai', address: '123 Nguyễn Trãi, Long Khánh, Đồng Nai', lat: 10.93, lng: 107.24, rating: 4.8, totalOrders: 342, revenue: 2150000000, status: 'active', phone: '0901234567', zalo: '0901234567', image: '/placeholder.svg' },
  { id: 'd-2', name: 'Đại lý Agri Lâm Đồng', region: 'Tây Nguyên', province: 'Lâm Đồng', address: '45 Trần Phú, Đà Lạt, Lâm Đồng', lat: 11.94, lng: 108.44, rating: 4.6, totalOrders: 287, revenue: 1800000000, status: 'active', phone: '0912345678', zalo: '0912345678', image: '/placeholder.svg' },
  { id: 'd-3', name: 'VTNN Tây Ninh', region: 'Đông Nam Bộ', province: 'Tây Ninh', address: '78 Cách Mạng, Trảng Bàng, Tây Ninh', lat: 11.03, lng: 106.37, rating: 4.3, totalOrders: 156, revenue: 950000000, status: 'active', phone: '0923456789', zalo: '0923456789', image: '/placeholder.svg' },
  { id: 'd-4', name: 'Đại lý Mekong Tech', region: 'ĐBSCL', province: 'Cần Thơ', address: '12 Nguyễn Văn Linh, Ninh Kiều, Cần Thơ', lat: 10.03, lng: 105.77, rating: 4.5, totalOrders: 198, revenue: 1200000000, status: 'active', phone: '0934567890', zalo: '0934567890', image: '/placeholder.svg' },
  { id: 'd-5', name: 'Agri Center Gia Lai', region: 'Tây Nguyên', province: 'Gia Lai', address: '56 Lê Lợi, Pleiku, Gia Lai', lat: 13.98, lng: 108.0, rating: 4.1, totalOrders: 89, revenue: 520000000, status: 'inactive', phone: '0945678901', zalo: '0945678901', image: '/placeholder.svg' },
  { id: 'd-6', name: 'Nông nghiệp Bình Dương', region: 'Đông Nam Bộ', province: 'Bình Dương', address: '234 Đại Lộ BD, Thủ Dầu Một, Bình Dương', lat: 11.00, lng: 106.65, rating: 4.4, totalOrders: 215, revenue: 1350000000, status: 'active', phone: '0956789012', zalo: '0956789012', image: '/placeholder.svg' },
];

export const customers: Customer[] = [
  { id: 'c-1', name: 'Trại rau Phước An', phone: '0981234567', email: 'phuocan@mail.com', region: 'Đồng Nai', address: 'Phước An, Long Thành, Đồng Nai', lat: 10.85, lng: 106.95 },
  { id: 'c-2', name: 'HTX Thanh Bình', phone: '0972345678', email: 'thanhbinh@mail.com', region: 'Lâm Đồng', address: 'Đơn Dương, Lâm Đồng', lat: 11.75, lng: 108.55 },
  { id: 'c-3', name: 'Vườn cam Tây Ninh', phone: '0963456789', email: 'vuoncam@mail.com', region: 'Tây Ninh', address: 'Gò Dầu, Tây Ninh', lat: 11.1, lng: 106.3 },
  { id: 'c-4', name: 'Farm Bình Dương', phone: '0954567890', email: 'farmbd@mail.com', region: 'Bình Dương', address: 'Tân Uyên, Bình Dương', lat: 11.05, lng: 106.65 },
  { id: 'c-5', name: 'HTX Mekong Xanh', phone: '0945678901', email: 'mekongxanh@mail.com', region: 'Cần Thơ', address: 'Phong Điền, Cần Thơ', lat: 10.05, lng: 105.68 },
];

export const dealerProducts: DealerProduct[] = [
  { dealerId: 'd-1', productId: 'p-1', stock: 25, price: 4800000 },
  { dealerId: 'd-1', productId: 'p-3', stock: 80, price: 1350000 },
  { dealerId: 'd-1', productId: 'p-6', stock: 12, price: 3500000 },
  { dealerId: 'd-1', productId: 'p-7', stock: 40, price: 700000 },
  { dealerId: 'd-1', productId: 'p-8', stock: 20, price: 1950000 },
  { dealerId: 'd-1', productId: 'p-9', stock: 3, price: 26500000 },
  { dealerId: 'd-1', productId: 'p-10', stock: 30, price: 3000000 },
  { dealerId: 'd-2', productId: 'p-1', stock: 15, price: 4750000 },
  { dealerId: 'd-2', productId: 'p-5', stock: 5, price: 8900000 },
  { dealerId: 'd-2', productId: 'p-3', stock: 45, price: 1300000 },
  { dealerId: 'd-2', productId: 'p-8', stock: 30, price: 1900000 },
  { dealerId: 'd-2', productId: 'p-10', stock: 15, price: 2950000 },
  { dealerId: 'd-3', productId: 'p-2', stock: 8, price: 19500000 },
  { dealerId: 'd-3', productId: 'p-4', stock: 50, price: 900000 },
  { dealerId: 'd-3', productId: 'p-1', stock: 18, price: 4850000 },
  { dealerId: 'd-3', productId: 'p-7', stock: 35, price: 680000 },
  { dealerId: 'd-4', productId: 'p-3', stock: 60, price: 1300000 },
  { dealerId: 'd-4', productId: 'p-4', stock: 100, price: 880000 },
  { dealerId: 'd-4', productId: 'p-6', stock: 15, price: 3400000 },
  { dealerId: 'd-4', productId: 'p-2', stock: 5, price: 19800000 },
  { dealerId: 'd-4', productId: 'p-9', stock: 2, price: 26000000 },
  { dealerId: 'd-6', productId: 'p-1', stock: 20, price: 4700000 },
  { dealerId: 'd-6', productId: 'p-3', stock: 50, price: 1280000 },
  { dealerId: 'd-6', productId: 'p-5', stock: 8, price: 8800000 },
  { dealerId: 'd-6', productId: 'p-10', stock: 25, price: 2900000 },
];

export const orders: Order[] = [
  {
    id: 'ORD-001', customerId: 'c-1', customerName: 'Trại rau Phước An',
    dealerId: 'd-1', dealerName: 'Đại lý Nông Phát',
    items: [{ productId: 'p-1', productName: 'Hệ thống tưới nhỏ giọt Netafim Pro', quantity: 2, unitPrice: 4800000 }],
    total: 9600000, status: 'delivered', createdAt: '2026-04-10', region: 'Đồng Nai',
    timeline: [
      { status: 'pending', label: 'Đặt hàng', time: '2026-04-10 08:30' },
      { status: 'confirmed', label: 'Xác nhận', time: '2026-04-10 09:15', note: 'Đại lý xác nhận đơn' },
      { status: 'processing', label: 'Đang xử lý', time: '2026-04-10 14:00' },
      { status: 'shipping', label: 'Đang giao', time: '2026-04-11 08:00', note: 'Giao bởi NB Express' },
      { status: 'delivered', label: 'Hoàn thành', time: '2026-04-11 16:30' },
    ]
  },
  {
    id: 'ORD-002', customerId: 'c-2', customerName: 'HTX Thanh Bình',
    dealerId: 'd-2', dealerName: 'Đại lý Agri Lâm Đồng',
    items: [
      { productId: 'p-5', productName: 'Trạm thời tiết thông minh WS-200', quantity: 1, unitPrice: 8900000 },
      { productId: 'p-3', productName: 'Cảm biến độ ẩm đất IoT ST-100', quantity: 5, unitPrice: 1300000 }
    ],
    total: 15400000, status: 'shipping', createdAt: '2026-04-12', region: 'Lâm Đồng',
    timeline: [
      { status: 'pending', label: 'Đặt hàng', time: '2026-04-12 10:00' },
      { status: 'confirmed', label: 'Xác nhận', time: '2026-04-12 11:30' },
      { status: 'processing', label: 'Đang xử lý', time: '2026-04-12 15:00' },
      { status: 'shipping', label: 'Đang giao', time: '2026-04-13 09:00', note: 'Dự kiến giao 14/04' },
    ]
  },
  {
    id: 'ORD-003', customerId: 'c-3', customerName: 'Vườn cam Tây Ninh',
    dealerId: 'd-3', dealerName: 'VTNN Tây Ninh',
    items: [{ productId: 'p-2', productName: 'Máy bơm Grundfos CR 15', quantity: 1, unitPrice: 19500000 }],
    total: 19500000, status: 'confirmed', createdAt: '2026-04-13', region: 'Tây Ninh',
    timeline: [
      { status: 'pending', label: 'Đặt hàng', time: '2026-04-13 14:00' },
      { status: 'confirmed', label: 'Xác nhận', time: '2026-04-13 15:30', note: 'Đại lý xác nhận có hàng' },
    ]
  },
  {
    id: 'ORD-004', customerId: 'c-4', customerName: 'Farm Bình Dương',
    dealerId: 'd-1', dealerName: 'Đại lý Nông Phát',
    items: [{ productId: 'p-6', productName: 'Bộ điều khiển tưới tự động AC-8', quantity: 3, unitPrice: 3500000 }],
    total: 10500000, status: 'pending', createdAt: '2026-04-14', region: 'Bình Dương',
    timeline: [{ status: 'pending', label: 'Đặt hàng', time: '2026-04-14 07:45' }]
  },
  {
    id: 'ORD-005', customerId: 'c-5', customerName: 'HTX Mekong Xanh',
    dealerId: 'd-4', dealerName: 'Đại lý Mekong Tech',
    items: [{ productId: 'p-4', productName: 'Ống nhỏ giọt Rivulis T-Tape', quantity: 10, unitPrice: 880000 }],
    total: 8800000, status: 'delivered', createdAt: '2026-04-08', region: 'Cần Thơ',
    timeline: [
      { status: 'pending', label: 'Đặt hàng', time: '2026-04-08 09:00' },
      { status: 'confirmed', label: 'Xác nhận', time: '2026-04-08 10:00' },
      { status: 'processing', label: 'Đang xử lý', time: '2026-04-08 14:00' },
      { status: 'shipping', label: 'Đang giao', time: '2026-04-09 08:00' },
      { status: 'delivered', label: 'Hoàn thành', time: '2026-04-09 17:00' },
    ]
  },
  {
    id: 'ORD-006', customerId: 'c-1', customerName: 'Trại rau Phước An',
    dealerId: 'd-1', dealerName: 'Đại lý Nông Phát',
    items: [{ productId: 'p-3', productName: 'Cảm biến độ ẩm đất IoT ST-100', quantity: 10, unitPrice: 1350000 }],
    total: 13500000, status: 'delivered', createdAt: '2026-03-20', region: 'Đồng Nai',
    timeline: [
      { status: 'pending', label: 'Đặt hàng', time: '2026-03-20 08:00' },
      { status: 'confirmed', label: 'Xác nhận', time: '2026-03-20 09:30' },
      { status: 'processing', label: 'Đang xử lý', time: '2026-03-20 15:00' },
      { status: 'shipping', label: 'Đang giao', time: '2026-03-21 07:00' },
      { status: 'delivered', label: 'Hoàn thành', time: '2026-03-21 15:00' },
    ]
  },
  {
    id: 'ORD-007', customerId: 'c-2', customerName: 'HTX Thanh Bình',
    dealerId: 'd-2', dealerName: 'Đại lý Agri Lâm Đồng',
    items: [{ productId: 'p-8', productName: 'Bộ lọc đĩa Arkal 2"', quantity: 4, unitPrice: 1900000 }],
    total: 7600000, status: 'processing', createdAt: '2026-04-13', region: 'Lâm Đồng',
    timeline: [
      { status: 'pending', label: 'Đặt hàng', time: '2026-04-13 16:00' },
      { status: 'confirmed', label: 'Xác nhận', time: '2026-04-13 17:00' },
      { status: 'processing', label: 'Đang xử lý', time: '2026-04-14 08:00', note: 'Đang đóng gói' },
    ]
  },
];

export const dealerInsights: AnalyticsInsight[] = [
  { type: 'restock', title: 'Cần nhập thêm bộ điều khiển AC-8', description: 'Tồn kho còn 12 bộ, dự kiến hết trong 5 ngày.', metric: '12 còn lại', change: -45 },
  { type: 'trending', title: 'Hệ thống tưới nhỏ giọt đang hot', description: 'Nhu cầu tăng 35% so với tháng trước tại khu vực của bạn.', metric: '+35%', change: 35 },
  { type: 'warning', title: 'Đơn hàng chờ xử lý', description: '1 đơn hàng đang chờ xác nhận quá 24h.', metric: '1 đơn', change: -15 },
];

export const adminInsights: AnalyticsInsight[] = [
  { type: 'trending', title: 'Tăng trưởng GMV 28%', description: 'Tổng giá trị hàng hóa giao dịch đạt 6.5 tỷ trong tháng 4.', metric: '6.5 tỷ', change: 28 },
  { type: 'regional', title: 'Mở rộng thành công Cần Thơ', description: 'Đại lý Mekong Tech đạt 198 đơn hàng sau 3 tháng.', metric: '198 đơn', change: 45 },
  { type: 'warning', title: '1 đại lý inactive', description: 'Agri Center Gia Lai không có đơn hàng mới trong 30 ngày.', metric: '30 ngày', change: -100 },
];

export const regionData = [
  { region: 'Đồng Nai', revenue: 2150, orders: 342 },
  { region: 'Lâm Đồng', revenue: 1800, orders: 287 },
  { region: 'Cần Thơ', revenue: 1200, orders: 198 },
  { region: 'Tây Ninh', revenue: 950, orders: 156 },
  { region: 'Gia Lai', revenue: 520, orders: 89 },
  { region: 'Bình Dương', revenue: 1350, orders: 215 },
];

export const monthlyRevenue = [
  { month: 'T1', revenue: 3200 },
  { month: 'T2', revenue: 3800 },
  { month: 'T3', revenue: 4500 },
  { month: 'T4', revenue: 6500 },
];

export const dailyRevenue = [
  { day: '08/04', revenue: 180 },
  { day: '09/04', revenue: 250 },
  { day: '10/04', revenue: 320 },
  { day: '11/04', revenue: 150 },
  { day: '12/04', revenue: 420 },
  { day: '13/04', revenue: 270 },
  { day: '14/04', revenue: 380 },
];

export const categoryData = [
  { category: 'Hệ thống tưới', value: 42 },
  { category: 'Cảm biến IoT', value: 28 },
  { category: 'Máy bơm', value: 18 },
  { category: 'Điều khiển', value: 12 },
];

export const regions = ['Tất cả', 'Đồng Nai', 'Lâm Đồng', 'Tây Ninh', 'Cần Thơ', 'Gia Lai', 'Bình Dương'];

export const provinces = ['Tất cả', 'Đồng Nai', 'Lâm Đồng', 'Tây Ninh', 'Cần Thơ', 'Gia Lai', 'Bình Dương', 'TP.HCM', 'Bình Phước', 'Long An'];

// ==================== NEW: Market Data ====================

export const commodityPrices: CommodityPrice[] = [
  {
    name: 'Cà phê Robusta', unit: 'đ/kg', currentPrice: 128500, change: 3.2,
    history: [
      { date: '01/04', price: 124500 }, { date: '03/04', price: 125800 },
      { date: '05/04', price: 123200 }, { date: '07/04', price: 126400 },
      { date: '09/04', price: 127100 }, { date: '11/04', price: 125900 },
      { date: '13/04', price: 128500 },
    ]
  },
  {
    name: 'Hồ tiêu', unit: 'đ/kg', currentPrice: 178000, change: -1.5,
    history: [
      { date: '01/04', price: 180000 }, { date: '03/04', price: 179500 },
      { date: '05/04', price: 181200 }, { date: '07/04', price: 179800 },
      { date: '09/04', price: 178500 }, { date: '11/04', price: 177200 },
      { date: '13/04', price: 178000 },
    ]
  },
  {
    name: 'Cao su RSS3', unit: 'đ/kg', currentPrice: 42500, change: 5.8,
    history: [
      { date: '01/04', price: 40200 }, { date: '03/04', price: 40800 },
      { date: '05/04', price: 41500 }, { date: '07/04', price: 41200 },
      { date: '09/04', price: 42000 }, { date: '11/04', price: 41800 },
      { date: '13/04', price: 42500 },
    ]
  },
  {
    name: 'Lúa IR 504', unit: 'đ/kg', currentPrice: 8200, change: 0.8,
    history: [
      { date: '01/04', price: 8100 }, { date: '03/04', price: 8150 },
      { date: '05/04', price: 8050 }, { date: '07/04', price: 8120 },
      { date: '09/04', price: 8180 }, { date: '11/04', price: 8160 },
      { date: '13/04', price: 8200 },
    ]
  },
  {
    name: 'Sầu riêng Ri6', unit: 'đ/kg', currentPrice: 95000, change: 8.5,
    history: [
      { date: '01/04', price: 82000 }, { date: '03/04', price: 85000 },
      { date: '05/04', price: 87500 }, { date: '07/04', price: 89000 },
      { date: '09/04', price: 91500 }, { date: '11/04', price: 93000 },
      { date: '13/04', price: 95000 },
    ]
  },
];

export const weatherData: WeatherData = {
  location: 'TP. Hồ Chí Minh',
  current: { temp: 33, humidity: 72, rainfall: 0, wind: 12, condition: 'Nắng nóng' },
  forecast: [
    { day: 'T2', temp: 33, humidity: 70, rainfall: 0, condition: '☀️' },
    { day: 'T3', temp: 34, humidity: 68, rainfall: 0, condition: '☀️' },
    { day: 'T4', temp: 32, humidity: 75, rainfall: 15, condition: '🌧️' },
    { day: 'T5', temp: 30, humidity: 82, rainfall: 35, condition: '⛈️' },
    { day: 'T6', temp: 31, humidity: 78, rainfall: 20, condition: '🌧️' },
    { day: 'T7', temp: 32, humidity: 72, rainfall: 5, condition: '⛅' },
    { day: 'CN', temp: 33, humidity: 70, rainfall: 0, condition: '☀️' },
  ]
};

export const marketAlerts: MarketAlert[] = [
  { type: 'warning', title: 'Cảnh báo nắng nóng kéo dài', description: 'Nhiệt độ duy trì trên 35°C trong 5 ngày tới tại Đồng Nai, Bình Dương. Nhu cầu hệ thống tưới có thể tăng 40%.', region: 'Đông Nam Bộ' },
  { type: 'opportunity', title: 'Nhu cầu cảm biến IoT tăng mạnh', description: 'Các HTX tại Lâm Đồng đang chuyển đổi sang nông nghiệp thông minh. Lượng tìm kiếm tăng 65% trong 2 tuần.', region: 'Tây Nguyên' },
  { type: 'warning', title: 'Mưa lớn dự báo tuần tới', description: 'ĐBSCL sẽ có đợt mưa lớn 50-80mm. Cần chuẩn bị máy bơm thoát nước cho khách hàng.', region: 'ĐBSCL' },
  { type: 'opportunity', title: 'Vụ mùa mới bắt đầu', description: 'Vụ Hè-Thu bắt đầu, nông dân cần chuẩn bị hệ thống tưới mới. Thời điểm vàng để marketing.', region: 'Toàn quốc' },
];

// ==================== NEW: News ====================

export const newsArticles: NewsArticle[] = [
  {
    id: 'n-1', title: 'Giá cà phê Robusta đạt đỉnh 5 năm, nông dân Tây Nguyên hưởng lợi',
    summary: 'Giá cà phê Robusta vượt mốc 128.000đ/kg, tăng 45% so với cùng kỳ năm ngoái nhờ nguồn cung thế giới thắt chặt.',
    category: 'Thị trường', date: '2026-04-14', readTime: '3 phút',
    image: '/placeholder.svg', aiSummary: true,
  },
  {
    id: 'n-2', title: 'Công nghệ IoT giúp giảm 40% chi phí tưới tại Đồng Nai',
    summary: 'Hệ thống cảm biến độ ẩm + điều khiển tự động giúp HTX Phước An giảm 40% lượng nước và 30% điện năng.',
    category: 'Công nghệ', date: '2026-04-13', readTime: '5 phút',
    image: '/placeholder.svg', aiSummary: true,
  },
  {
    id: 'n-3', title: 'Dự báo mưa lớn khu vực ĐBSCL từ 16-22/04',
    summary: 'Đài KTTV dự báo đợt mưa lớn 50-80mm tại các tỉnh ĐBSCL, nông dân cần chủ động phương án thoát nước.',
    category: 'Thời tiết', date: '2026-04-12', readTime: '2 phút',
    image: '/placeholder.svg', aiSummary: false,
  },
  {
    id: 'n-4', title: 'Nhà Bè Agri mở rộng mạng lưới đại lý tại Bình Dương',
    summary: 'Đại lý Nông nghiệp Bình Dương chính thức gia nhập mạng lưới, nâng tổng số đại lý active lên 6.',
    category: 'Tin tức', date: '2026-04-11', readTime: '3 phút',
    image: '/placeholder.svg', aiSummary: false,
  },
  {
    id: 'n-5', title: 'Xu hướng nông nghiệp thông minh 2026: Tổng hợp từ Agritechnica',
    summary: 'Các xu hướng nổi bật: AI dự báo sâu bệnh, drone phun tưới, hệ thống quản lý vườn tập trung cloud.',
    category: 'Công nghệ', date: '2026-04-10', readTime: '7 phút',
    image: '/placeholder.svg', aiSummary: true,
  },
  {
    id: 'n-6', title: 'Giá hồ tiêu giảm nhẹ, chuyên gia khuyến cáo không bán tháo',
    summary: 'Giá hồ tiêu giảm 1.5% trong tuần nhưng triển vọng trung hạn vẫn tích cực nhờ nhu cầu xuất khẩu.',
    category: 'Thị trường', date: '2026-04-09', readTime: '4 phút',
    image: '/placeholder.svg', aiSummary: true,
  },
];

// ==================== Solutions ====================

export const solutions = [
  {
    id: 's-1',
    title: 'Giải pháp tưới thông minh cho vườn cây ăn trái',
    description: 'Hệ thống tưới tự động kết hợp cảm biến IoT, tiết kiệm 60% nước và giảm 50% công lao động.',
    products: ['p-1', 'p-3', 'p-6', 'p-7'],
    image: '/placeholder.svg',
    benefits: ['Tiết kiệm 60% nước', 'Giảm 50% công lao động', 'Tăng năng suất 25%', 'Theo dõi từ xa qua app'],
  },
  {
    id: 's-2',
    title: 'Trạm quan trắc thời tiết cho trang trại',
    description: 'Giám sát thời tiết real-time, cảnh báo sớm, hỗ trợ quyết định canh tác chính xác.',
    products: ['p-5', 'p-3'],
    image: '/placeholder.svg',
    benefits: ['Dữ liệu real-time 24/7', 'Cảnh báo thời tiết sớm', 'Tích hợp hệ thống tưới', 'Dashboard trực quan'],
  },
  {
    id: 's-3',
    title: 'Hệ thống bơm năng lượng mặt trời',
    description: 'Giải pháp bơm nước không cần điện lưới, phù hợp vùng sâu vùng xa, chi phí vận hành gần bằng 0.',
    products: ['p-9', 'p-4', 'p-8'],
    image: '/placeholder.svg',
    benefits: ['Không cần điện lưới', 'Chi phí vận hành ~0đ', 'Bảo hành 5 năm', 'Thân thiện môi trường'],
  },
];
