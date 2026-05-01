'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronRight, MapPin, Clock, TrendingUp, TrendingDown, Minus, 
  ChevronLeft, ChevronRight as IconChevronRight, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- TYPES & MOCK DATA ---

interface CommodityData {
  id: string;
  name: string;
  category: string;
  region: string;
  current_price: number;
  change_percent: number;
  last_updated: string;
}

const getCommodityData = (slug: string): CommodityData => {
  // Giả lập logic fetch data theo slug
  const nameMap: Record<string, string> = {
    'sau-rieng-ri6': 'Sầu riêng Ri6',
    'ca-phe-robusta': 'Cà phê Robusta',
    'ho-tieu-den': 'Hồ tiêu đen',
  };
  
  return {
    id: slug,
    name: nameMap[slug] || 'Sầu riêng Ri6',
    category: 'Trái Cây',
    region: 'Tiền Giang',
    current_price: 76500,
    change_percent: 2.4,
    last_updated: '10:30 AM, Hôm nay'
  };
};

// Data biểu đồ 30 ngày (LineChart)
const MOCK_CHART_DATA = Array.from({ length: 30 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    price: Math.round((70000 + Math.random() * 10000) / 500) * 500
  };
});

// Data OHLCV Lịch sử giá
const MOCK_HISTORY = Array.from({ length: 25 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const open = 75000 + (Math.random() * 4000 - 2000);
  const close = 75000 + (Math.random() * 4000 - 2000);
  const change = ((close - open) / open) * 100;
  return {
    date: d.toLocaleDateString('vi-VN'),
    open: Math.round(open),
    close: Math.round(close),
    change: Number(change.toFixed(2)),
    volume: Math.round(Math.random() * 500 + 100) // Khối lượng Tấn
  };
});

// Contextual Cross-Selling (Phần cứng O2O)
export interface RecommendedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  slug: string;
}

const fetchRelatedProducts = (slug: string): RecommendedProduct[] => {
  return [
    {
      id: 'p1',
      name: 'Máy bơm ly tâm lưu lượng lớn 3HP (Giải pháp tưới diện rộng)',
      image: 'https://images.unsplash.com/photo-1584483786194-e3c35bba622a?q=80&w=300&h=300&fit=crop',
      price: 3200000,
      slug: 'may-bom-ly-tam-3hp'
    },
    {
      id: 'p2',
      name: 'Béc tưới bù áp tự động xòe 360 độ chống côn trùng',
      image: 'https://images.unsplash.com/photo-1598285913217-10499b9e6e44?q=80&w=300&h=300&fit=crop',
      price: 15000,
      slug: 'bec-tuoi-bu-ap-360'
    },
    {
      id: 'p3',
      name: 'Tủ điện điều khiển bơm tự động qua Smartphone (Wifi/4G)',
      image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?q=80&w=300&h=300&fit=crop',
      price: 1850000,
      slug: 'tu-dien-dieu-khien-smartphone'
    }
  ];
};

const MOCK_NEWS = [
  {
    id: 'n1',
    title: 'Thị trường biến động: Giá thu mua tăng kỷ lục trước kỳ nghỉ lễ',
    category: 'Thị Trường',
    date: '01/05/2026',
    image: 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=600&h=337&fit=crop'
  },
  {
    id: 'n2',
    title: 'Kỹ thuật giữ ẩm gốc mùa khô hạn với hệ thống tưới nhỏ giọt',
    category: 'Kỹ Thuật Canh Tác',
    date: '28/04/2026',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=600&h=337&fit=crop'
  },
  {
    id: 'n3',
    title: 'Cơ hội xuất khẩu mở rộng: Hỗ trợ mạnh mẽ cho nhà vườn ĐBSCL',
    category: 'Xuất Khẩu',
    date: '25/04/2026',
    image: 'https://images.unsplash.com/photo-1595856461972-04ce1909a80b?q=80&w=600&h=337&fit=crop'
  }
];

export default function CommodityDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'sau-rieng-ri6';
  
  const commodity = useMemo(() => getCommodityData(slug), [slug]);
  
  // States
  const [timeFilter, setTimeFilter] = useState<'7D' | '1M' | '3M' | '1Y'>('1M');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isUp = commodity.change_percent > 0;
  const isDown = commodity.change_percent < 0;

  const totalPages = Math.ceil(MOCK_HISTORY.length / ITEMS_PER_PAGE);
  const paginatedOHLCV = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return MOCK_HISTORY.slice(start, start + ITEMS_PER_PAGE);
  }, [page]);

  const relatedProducts = useMemo(() => fetchRelatedProducts(slug), [slug]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="container mx-auto px-4 max-w-6xl pt-6">
        
        {/* 1. Top Section - Breadcrumbs & Header */}
        <nav className="flex text-sm text-slate-500 font-medium mb-8">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/gia-nong-san" className="hover:text-emerald-600 transition-colors">Giá Nông Sản</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-slate-900 font-bold">{commodity.name}</span>
        </nav>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Giá {commodity.name} Hôm Nay
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <div className="flex items-center text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                <MapPin className="w-4 h-4 mr-1.5 text-emerald-600" />
                {commodity.region}
              </div>
              <div className="flex items-center text-slate-500">
                <Clock className="w-4 h-4 mr-1.5" />
                Cập nhật: {commodity.last_updated}
              </div>
            </div>
          </div>
          
          <div className="text-left md:text-right">
            <div className="text-5xl md:text-6xl font-black text-slate-900 tabular-nums tracking-tighter mb-2">
              {new Intl.NumberFormat('vi-VN').format(commodity.current_price)}
              <span className="text-2xl text-slate-500 font-bold ml-2">đ/kg</span>
            </div>
            <div className={`inline-flex items-center px-4 py-2 rounded-xl text-lg font-bold tracking-wide ${
              isUp ? 'bg-emerald-100 text-emerald-700' : isDown ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {isUp ? <TrendingUp className="w-5 h-5 mr-2 stroke-[2.5]" /> : isDown ? <TrendingDown className="w-5 h-5 mr-2 stroke-[2.5]" /> : <Minus className="w-5 h-5 mr-2 stroke-[2.5]" />}
              {isUp ? '+' : ''}{commodity.change_percent}% (So với hôm qua)
            </div>
          </div>
        </div>

        {/* 2. Top Section - Biểu đồ Giá */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-6 md:p-8 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Biểu Đồ Biến Động Giá</h2>
            
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              {(['7D', '1M', '3M', '1Y'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                    timeFilter === filter 
                      ? 'bg-white text-emerald-600 shadow-sm shadow-slate-200' 
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
              <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

        {/* 3. Middle Section - Bảng Lịch Sử Giá */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden mb-12">
          <div className="p-6 md:px-8 md:pt-8 md:pb-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">Lịch Sử Giá OHLCV</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Dữ liệu giao dịch chi tiết theo ngày</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Mở Cửa (VNĐ)</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Đóng Cửa (VNĐ)</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Khối Lượng (Tấn)</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Biến Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedOHLCV.map((row, idx) => {
                  const isUpChange = row.change > 0;
                  const isDownChange = row.change < 0;
                  // Zebra striping class (xen kẽ màu)
                  const zebraClass = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

                  return (
                    <tr key={idx} className={`${zebraClass} hover:bg-emerald-50/30 transition-colors`}>
                      <td className="px-8 py-4 font-semibold text-slate-700">{row.date}</td>
                      <td className="px-8 py-4 text-slate-900 font-bold tabular-nums text-right">
                        {new Intl.NumberFormat('vi-VN').format(row.open)}
                      </td>
                      <td className="px-8 py-4 text-slate-900 font-bold tabular-nums text-right">
                        {new Intl.NumberFormat('vi-VN').format(row.close)}
                      </td>
                      <td className="px-8 py-4 text-slate-600 font-medium tabular-nums text-right">
                        {new Intl.NumberFormat('vi-VN').format(row.volume)}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-sm font-bold ${
                          isUpChange ? 'bg-emerald-100 text-emerald-700' : isDownChange ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isUpChange ? '+' : ''}{row.change}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-6 border-t border-slate-100 flex items-center justify-center gap-2 bg-slate-50/30">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({length: totalPages}).map((_, i) => (
              <button 
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  page === i + 1 ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 hover:bg-white hover:border hover:border-slate-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <IconChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4. Contextual Cross-Selling (O2O Hook) */}
        <div className="bg-emerald-50/80 rounded-[2rem] p-8 md:p-10 border border-emerald-100 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none"></div>
          
          <div className="mb-8 relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Giải pháp tăng năng suất & tối ưu chi phí cho <span className="text-emerald-600">{commodity.name}</span>
            </h2>
            <p className="text-slate-600 font-medium mt-2 text-lg">Hệ thống thiết bị được các chuyên gia nông nghiệp khuyên dùng.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
            {relatedProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-5 bg-slate-100">
                  <Image 
                    src={product.image} 
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug mb-3">{product.name}</h3>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="text-xl font-black text-emerald-600 mb-4">
                      {new Intl.NumberFormat('vi-VN').format(product.price)} đ
                    </div>
                    {/* Tuyệt đối không dùng nút Thêm vào giỏ hàng, chỉ dùng Xem Điểm Bán */}
                    <Link href={`/san-pham/${product.slug}`} className="w-full flex items-center justify-center py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-emerald-600 transition-colors shadow-sm">
                      Xem Điểm Bán
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Khối Tin Tức Thị Trường & Kỹ Thuật */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Tin Tức Thị Trường & Kỹ Thuật</h2>
            <Link href="/tin-tuc" className="hidden sm:flex items-center text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_NEWS.map(news => (
              <Link key={news.id} href={`/tin-tuc/${news.id}`} className="group block">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-5 bg-slate-100 shadow-sm border border-slate-100">
                  <Image 
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 shadow-sm">
                    {news.category}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                    {news.title}
                  </h3>
                  <div className="flex items-center text-sm font-medium text-slate-500 mt-3">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {news.date}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
