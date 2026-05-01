'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronRight, MapPin, Clock, TrendingUp, TrendingDown, Minus, 
  ChevronLeft, ChevronRight as IconChevronRight, ShoppingCart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- MOCK DATA ---

const MOCK_INFO = {
  name: 'Sầu riêng Ri6',
  category: 'Trái Cây',
  region: 'Tiền Giang',
  current_price: 76500,
  change_percent: 2.4,
  last_updated: '10:30 AM, Hôm nay'
};

// Generate chart data
const generateChartData = (days: number, basePrice: number) => {
  const data = [];
  const now = new Date();
  let currentPrice = basePrice * 0.8; // start lower
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    currentPrice = currentPrice + (Math.random() * 4000 - 1500); // random walk leaning positive
    data.push({
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      price: Math.round(currentPrice / 500) * 500
    });
  }
  return data;
};

const CHART_DATA = {
  '7D': generateChartData(7, MOCK_INFO.current_price),
  '1M': generateChartData(30, MOCK_INFO.current_price),
  '3M': generateChartData(90, MOCK_INFO.current_price),
  '1Y': generateChartData(365, MOCK_INFO.current_price),
};

// OHLCV Mock Data
const MOCK_OHLCV = Array.from({ length: 25 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const open = MOCK_INFO.current_price - Math.random() * 2000;
  const close = MOCK_INFO.current_price - Math.random() * 2000;
  const change = ((close - open) / open) * 100;
  return {
    date: d.toLocaleDateString('vi-VN'),
    open: Math.round(open),
    close: Math.round(close),
    change: Number(change.toFixed(2)),
    volume: Math.round(Math.random() * 50 + 10)
  };
});

// Recommended Products
export interface RecommendedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  specs: string;
  slug: string;
}

const fetchRelatedProducts = (slug: string): RecommendedProduct[] => {
  // Logic mock based on crop (default to Durian specific tools)
  return [
    {
      id: 'p1',
      name: 'Béc tưới bù áp tự động xòe 360 độ',
      image: 'https://images.unsplash.com/photo-1598285913217-10499b9e6e44?q=80&w=300&h=300&fit=crop',
      price: 15000,
      specs: 'Lưu lượng 60L/H, chống côn trùng',
      slug: 'bec-tuoi-bu-ap-360'
    },
    {
      id: 'p2',
      name: 'Thuốc BVTV Sinh Học phòng rệp sáp',
      image: 'https://images.unsplash.com/photo-1584065609476-b639e3f605cb?q=80&w=300&h=300&fit=crop',
      price: 245000,
      specs: 'Chai 500ml, chiết xuất Neem',
      slug: 'thuoc-bvtv-sinh-hoc-neem'
    },
    {
      id: 'p3',
      name: 'Phân bón lá NPK siêu Kali',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=300&h=300&fit=crop',
      price: 180000,
      specs: 'Gói 1kg, 10-10-30+TE',
      slug: 'phan-bon-la-sieu-kali'
    },
    {
      id: 'p4',
      name: 'Bộ châm phân Venturi 34mm',
      image: 'https://images.unsplash.com/photo-1620213197669-798782a2da18?q=80&w=300&h=300&fit=crop',
      price: 320000,
      specs: 'Van chỉnh lưu lượng, hút sâu 2m',
      slug: 'bo-cham-phan-venturi'
    }
  ];
};

const MOCK_NEWS = [
  {
    id: 'n1',
    title: 'Thị trường Sầu riêng Ri6: Giá thu mua tăng kỷ lục trước kỳ nghỉ lễ',
    category: 'Thị Trường',
    date: '01/05/2026',
    image: 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=600&h=337&fit=crop'
  },
  {
    id: 'n2',
    title: 'Kỹ thuật giữ ẩm gốc sầu riêng mùa khô hạn với hệ thống tưới nhỏ giọt',
    category: 'Kỹ Thuật Canh Tác',
    date: '28/04/2026',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=600&h=337&fit=crop'
  },
  {
    id: 'n3',
    title: 'Trung Quốc tăng hạn ngạch nhập khẩu trái cây: Cơ hội lớn cho nhà vườn ĐBSCL',
    category: 'Xuất Khẩu',
    date: '25/04/2026',
    image: 'https://images.unsplash.com/photo-1595856461972-04ce1909a80b?q=80&w=600&h=337&fit=crop'
  }
];

export default function CommodityDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'sau-rieng-ri6';
  
  // States
  const [timeFilter, setTimeFilter] = useState<'7D' | '1M' | '3M' | '1Y'>('1M');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isUp = MOCK_INFO.change_percent > 0;
  
  const chartData = CHART_DATA[timeFilter];

  const totalPages = Math.ceil(MOCK_OHLCV.length / ITEMS_PER_PAGE);
  const paginatedOHLCV = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return MOCK_OHLCV.slice(start, start + ITEMS_PER_PAGE);
  }, [page]);

  const relatedProducts = fetchRelatedProducts(slug);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="container mx-auto px-4 max-w-6xl pt-6">
        
        {/* 1. Breadcrumbs */}
        <nav className="flex text-sm text-slate-500 font-medium mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/gia-nong-san" className="hover:text-emerald-600 transition-colors">Giá Nông Sản</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-400">{MOCK_INFO.category}</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 font-bold">{MOCK_INFO.name}</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Giá {MOCK_INFO.name} Hôm Nay
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <div className="flex items-center text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                <MapPin className="w-4 h-4 mr-1.5 text-emerald-600" />
                {MOCK_INFO.region}
              </div>
              <div className="flex items-center text-slate-500">
                <Clock className="w-4 h-4 mr-1.5" />
                Cập nhật: {MOCK_INFO.last_updated}
              </div>
            </div>
          </div>
          
          <div className="text-left md:text-right">
            <div className="text-5xl md:text-6xl font-black text-slate-900 tabular-nums tracking-tighter mb-2">
              {new Intl.NumberFormat('vi-VN').format(MOCK_INFO.current_price)}
              <span className="text-2xl text-slate-500 font-bold ml-2">đ/kg</span>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-xl text-lg font-bold tracking-wide ${
              isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {isUp ? <TrendingUp className="w-5 h-5 mr-2 stroke-[2.5]" /> : <TrendingDown className="w-5 h-5 mr-2 stroke-[2.5]" />}
              {isUp ? '+' : ''}{MOCK_INFO.change_percent}% (So với hôm qua)
            </div>
          </div>
        </div>

        {/* 2. Price Chart Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Biểu Đồ Biến Động Giá</h2>
            
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              {(['7D', '1M', '3M', '1Y'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                    timeFilter === filter 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {filter === '7D' ? '7 Ngày' : filter === '1M' ? '1 Tháng' : filter === '3M' ? '3 Tháng' : '1 Năm'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} 
                  tickFormatter={(val) => `${val/1000}k`}
                  domain={['auto', 'auto']}
                  dx={-10}
                />
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                  itemStyle={{ color: '#059669', fontWeight: '900', fontSize: '18px' }}
                  labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(value: number) => [new Intl.NumberFormat('vi-VN').format(value) + ' đ/kg', 'Giá GD']}
                  cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#10b981" 
                  strokeWidth={3.5} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. OHLCV Table Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden mb-12">
          <div className="p-6 md:px-8 md:pt-8 md:pb-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">Lịch Sử Giá</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Dữ liệu giao dịch chi tiết theo ngày</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Mở Cửa</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Đóng Cửa</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Biến Động</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Khối Lượng (Tấn)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOHLCV.map((row, idx) => {
                  const isUp = row.change > 0;
                  const isDown = row.change < 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-4 font-semibold text-slate-700">{row.date}</td>
                      <td className="px-8 py-4 text-slate-900 font-bold tabular-nums">
                        {new Intl.NumberFormat('vi-VN').format(row.open)}
                      </td>
                      <td className="px-8 py-4 text-slate-900 font-bold tabular-nums">
                        {new Intl.NumberFormat('vi-VN').format(row.close)}
                      </td>
                      <td className="px-8 py-4">
                        <span className={`font-bold ${isUp ? 'text-emerald-600' : isDown ? 'text-rose-600' : 'text-slate-500'}`}>
                          {isUp ? '+' : ''}{row.change}%
                        </span>
                      </td>
                      <td className="px-8 py-4 text-slate-600 font-medium tabular-nums">{row.volume}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-6 border-t border-slate-100 flex items-center justify-center gap-2">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({length: totalPages}).map((_, i) => (
              <button 
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                  page === i + 1 ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4. Cross-selling Hook (Recommended Products) */}
        <div className="bg-emerald-50/50 rounded-3xl p-8 border border-emerald-100 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          <div className="mb-8 relative z-10">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Nâng cấp năng suất <span className="text-emerald-600">{MOCK_INFO.name}</span> với thiết bị chuyên dụng
            </h2>
            <p className="text-slate-600 font-medium mt-2">Gợi ý vật tư, thiết bị phù hợp nhất với giai đoạn canh tác hiện tại.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {relatedProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100/50 hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4 bg-slate-100">
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug mb-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-1">{product.specs}</p>
                </div>
                <div className="mt-auto">
                  <div className="text-lg font-black text-emerald-600 mb-3">
                    {new Intl.NumberFormat('vi-VN').format(product.price)} đ
                  </div>
                  <Link href={`/san-pham/${product.slug}`} className="w-full flex items-center justify-center py-2.5 rounded-xl bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-600 hover:text-white transition-colors">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Xem điểm bán
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Market News CMS Integration */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Tin Tức & Phân Tích Thị Trường</h2>
              <p className="text-slate-500 font-medium mt-1">Cập nhật nhanh diễn biến mới nhất.</p>
            </div>
            <Link href="/tin-tuc" className="hidden sm:flex items-center text-emerald-600 font-bold hover:text-emerald-700">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_NEWS.map(news => (
              <Link key={news.id} href={`/tin-tuc/${news.id}`} className="group block">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-100 shadow-sm">
                  <Image 
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                    {news.category}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {news.title}
                  </h3>
                  <div className="flex items-center text-sm font-medium text-slate-500 mt-2">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {news.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/tin-tuc" className="sm:hidden flex items-center justify-center w-full mt-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">
            Xem tất cả bài viết
          </Link>
        </div>

      </div>
    </div>
  );
}
