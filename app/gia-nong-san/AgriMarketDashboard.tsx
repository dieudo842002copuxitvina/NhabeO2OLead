'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, TrendingUp, TrendingDown, Minus, Calculator, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from 'recharts';

export interface AgriCommodity {
  id: string; // Used as slug for routing
  name: string;
  category: string;
  region: string;
  current_price: number;
  unit: string;
  change_percent: number;
  trend_7d: number[];
}

const MOCK_DATA: AgriCommodity[] = [
  {
    id: 'ca-phe-robusta',
    name: 'Cà Phê Robusta',
    category: 'Cà Phê',
    region: 'Đắk Lắk',
    current_price: 107500,
    unit: 'đ/kg',
    change_percent: 1.8,
    trend_7d: [102000, 103500, 104000, 103000, 105000, 106500, 107500]
  },
  {
    id: 'ca-phe-arabica',
    name: 'Cà Phê Arabica',
    category: 'Cà Phê',
    region: 'Lâm Đồng',
    current_price: 128000,
    unit: 'đ/kg',
    change_percent: -0.5,
    trend_7d: [129000, 128500, 129500, 130000, 128000, 128500, 128000]
  },
  {
    id: 'ho-tieu-den',
    name: 'Hồ Tiêu Đen',
    category: 'Hồ Tiêu',
    region: 'Gia Lai',
    current_price: 149800,
    unit: 'đ/kg',
    change_percent: 0.9,
    trend_7d: [145000, 146000, 147500, 148000, 148500, 149000, 149800]
  },
  {
    id: 'ho-tieu-trang',
    name: 'Hồ Tiêu Trắng',
    category: 'Hồ Tiêu',
    region: 'Bà Rịa - Vũng Tàu',
    current_price: 192000,
    unit: 'đ/kg',
    change_percent: 1.4,
    trend_7d: [188000, 189000, 189500, 190000, 191000, 191500, 192000]
  },
  {
    id: 'gao-st25',
    name: 'Gạo ST25',
    category: 'Lúa Gạo',
    region: 'Sóc Trăng',
    current_price: 35000,
    unit: 'đ/kg',
    change_percent: 0.0,
    trend_7d: [35000, 35000, 35000, 35000, 35000, 35000, 35000]
  },
  {
    id: 'lua-om5451',
    name: 'Lúa OM5451',
    category: 'Lúa Gạo',
    region: 'An Giang',
    current_price: 9650,
    unit: 'đ/kg',
    change_percent: -1.2,
    trend_7d: [9800, 9750, 9700, 9700, 9680, 9650, 9650]
  },
  {
    id: 'sau-rieng-ri6',
    name: 'Sầu Riêng Ri6',
    category: 'Trái Cây',
    region: 'Tiền Giang',
    current_price: 76500,
    unit: 'đ/kg',
    change_percent: 2.4,
    trend_7d: [70000, 71500, 72000, 74000, 75000, 76000, 76500]
  },
  {
    id: 'thanh-long-ruot-do',
    name: 'Thanh Long Ruột Đỏ',
    category: 'Trái Cây',
    region: 'Bình Thuận',
    current_price: 22400,
    unit: 'đ/kg',
    change_percent: -0.8,
    trend_7d: [24000, 23500, 23000, 22800, 22500, 22600, 22400]
  },
  {
    id: 'xoai-cat-chu',
    name: 'Xoài Cát Chu',
    category: 'Trái Cây',
    region: 'Đồng Tháp',
    current_price: 28600,
    unit: 'đ/kg',
    change_percent: 1.3,
    trend_7d: [27000, 27500, 27500, 28000, 28200, 28500, 28600]
  },
  {
    id: 'vai-thieu',
    name: 'Vải Thiều',
    category: 'Trái Cây',
    region: 'Bắc Giang',
    current_price: 40200,
    unit: 'đ/kg',
    change_percent: 3.1,
    trend_7d: [35000, 36000, 37500, 38000, 39000, 39500, 40200]
  }
];

const TABS = ['Tất cả', 'Cà Phê', 'Hồ Tiêu', 'Lúa Gạo', 'Trái Cây'];

// Mock function for regional prices based on selected product
const getRegionalPrices = (productId: string) => {
  const baseProduct = MOCK_DATA.find(p => p.id === productId);
  if (!baseProduct) return [];

  const regions = [
    { name: baseProduct.region, multiplier: 1.0, level: 'Cao nhất' },
    { name: 'Khu vực 2', multiplier: 0.98, level: 'Cao' },
    { name: 'Khu vực 3', multiplier: 0.95, level: 'Trung Bình' },
    { name: 'Khu vực 4', multiplier: 0.92, level: 'Thấp' }
  ];

  return regions.map(reg => ({
    region: reg.name,
    level: reg.level,
    price: Math.round(baseProduct.current_price * reg.multiplier),
    change_percent: Number((Math.random() * 4 - 2).toFixed(1)),
    trend_24h: Array.from({ length: 6 }).map((_, i) => 
      Math.round(baseProduct.current_price * reg.multiplier * (1 + (Math.random() * 0.1 - 0.05)))
    )
  }));
};

export default function AgriMarketDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Tất cả');

  // Profit Calculator State
  const [profitProductId, setProfitProductId] = useState(MOCK_DATA[0].id);
  const [yieldAmount, setYieldAmount] = useState<string>('1000');
  const [yieldUnit, setYieldUnit] = useState<'kg' | 'tan'>('kg');
  const [estimatedCost, setEstimatedCost] = useState<string>('20000000');

  // Map State
  const [mapProductId, setMapProductId] = useState(MOCK_DATA[0].id);

  const filteredData = activeTab === 'Tất cả' 
    ? MOCK_DATA 
    : MOCK_DATA.filter(item => item.category === activeTab);

  const handleRowClick = (slug: string) => {
    router.push(`/gia-nong-san/${slug}`);
  };

  const selectedProfitProduct = useMemo(() => 
    MOCK_DATA.find(p => p.id === profitProductId) || MOCK_DATA[0],
  [profitProductId]);

  const estimatedProfit = useMemo(() => {
    const yieldNum = parseFloat(yieldAmount) || 0;
    const costNum = parseFloat(estimatedCost) || 0;
    const finalYield = yieldUnit === 'tan' ? yieldNum * 1000 : yieldNum;
    const revenue = finalYield * selectedProfitProduct.current_price;
    return revenue - costNum;
  }, [yieldAmount, yieldUnit, estimatedCost, selectedProfitProduct]);

  const regionalData = useMemo(() => getRegionalPrices(mapProductId), [mapProductId]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Section 1: Main Table */}
            <div className="space-y-6">
              <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Bảng Giá Nông Sản
                </h1>
                <div className="flex flex-wrap gap-3">
                  {TABS.map(tab => {
                    const isActive = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-out flex items-center justify-center ${
                          isActive 
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden relative z-10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nông Sản</th>
                        <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Khu Vực</th>
                        <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá Hôm Nay</th>
                        <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Biến Động</th>
                        <th className="px-6 py-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Xu Hướng 7N</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.map((item, index) => {
                        const isUp = item.change_percent > 0;
                        const isDown = item.change_percent < 0;
                        const isNeutral = item.change_percent === 0;
                        const trendColor = isDown ? '#f43f5e' : isUp ? '#10b981' : '#94a3b8';
                        const chartData = item.trend_7d.map((val, idx) => ({ value: val, index: idx }));

                        return (
                          <tr 
                            key={item.id} 
                            onClick={() => handleRowClick(item.id)}
                            className="hover:bg-emerald-50/40 transition-colors duration-200 cursor-pointer group"
                          >
                            <td className="px-6 py-5">
                              <div className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                                {item.name}
                              </div>
                              <div className="text-sm text-slate-500 mt-1 font-medium">{item.category}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center text-sm font-medium text-slate-600 bg-slate-100/80 w-fit px-3 py-1.5 rounded-lg">
                                <MapPin className="w-4 h-4 mr-1.5 text-emerald-600" />
                                {item.region}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-extrabold text-lg text-slate-900 tabular-nums tracking-tight">
                                {new Intl.NumberFormat('vi-VN').format(item.current_price)}
                              </div>
                              <div className="text-sm font-medium text-slate-500">{item.unit}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold tracking-wide ${
                                isUp ? 'bg-emerald-100 text-emerald-700' : 
                                isDown ? 'bg-rose-100 text-rose-700' : 
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {isUp && <TrendingUp className="w-4 h-4 mr-1.5 stroke-[2.5]" />}
                                {isDown && <TrendingDown className="w-4 h-4 mr-1.5 stroke-[2.5]" />}
                                {isNeutral && <Minus className="w-4 h-4 mr-1.5 stroke-[2.5]" />}
                                {isUp ? '+' : ''}{item.change_percent}%
                              </div>
                            </td>
                            <td className="px-6 py-5 w-40">
                              <div className="h-12 w-28 opacity-80 group-hover:opacity-100 transition-opacity">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={chartData}>
                                    <Line 
                                      type="monotone" 
                                      dataKey="value" 
                                      stroke={trendColor} 
                                      strokeWidth={2.5} 
                                      dot={false}
                                      isAnimationActive={false}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredData.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-slate-500 font-medium">Không tìm thấy dữ liệu cho danh mục này.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Regional Price Map */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900">Bản Đồ Giá Vùng Miền</h2>
                <div className="w-full sm:w-64">
                  <select 
                    value={mapProductId}
                    onChange={(e) => setMapProductId(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 shadow-sm"
                  >
                    {MOCK_DATA.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {regionalData.map((region, i) => {
                  const isHighest = region.level === 'Cao nhất';
                  const isHigh = region.level === 'Cao';
                  const isMed = region.level === 'Trung Bình';
                  const isLow = region.level === 'Thấp';

                  const borderColor = isHighest ? 'border-emerald-500' : isHigh ? 'border-blue-400' : isMed ? 'border-amber-400' : 'border-rose-400';
                  const badgeBg = isHighest ? 'bg-emerald-500' : isHigh ? 'bg-blue-400' : isMed ? 'bg-amber-400' : 'bg-rose-400';

                  const isUp = region.change_percent > 0;
                  const isDown = region.change_percent < 0;
                  const trendColor = isDown ? '#f43f5e' : isUp ? '#10b981' : '#94a3b8';

                  const chartData = region.trend_24h.map((v, i) => ({ value: v, index: i }));

                  return (
                    <div key={i} className={`bg-white rounded-2xl p-5 border-2 ${borderColor} shadow-sm relative overflow-hidden transition-all hover:shadow-md`}>
                      <div className={`absolute top-0 right-0 ${badgeBg} text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider`}>
                        {region.level}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        <MapPin className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-800 text-lg">{region.region}</h3>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          {new Intl.NumberFormat('vi-VN').format(region.price)} <span className="text-sm font-medium text-slate-500">đ/kg</span>
                        </div>
                        <div className={`text-sm font-semibold mt-1 flex items-center ${isUp ? 'text-emerald-600' : isDown ? 'text-rose-600' : 'text-slate-500'}`}>
                          {isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : isDown ? <TrendingDown className="w-4 h-4 mr-1" /> : <Minus className="w-4 h-4 mr-1" />}
                          {isUp ? '+' : ''}{region.change_percent}% (24h)
                        </div>
                      </div>

                      <div className="h-16 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={trendColor} 
                              strokeWidth={2} 
                              dot={false}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column - Profit Calculator Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 p-6 sm:p-8">
              
              <div className="flex items-center space-x-3 mb-8 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Công Cụ Tính</h2>
                  <p className="text-sm text-slate-500 font-medium">Lợi Nhuận Dự Kiến</p>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Select Crop */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Chọn Nông Sản & Vùng</label>
                  <select 
                    value={profitProductId}
                    onChange={(e) => setProfitProductId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 font-medium transition-colors"
                  >
                    {MOCK_DATA.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.region}</option>
                    ))}
                  </select>
                  <div className="text-sm text-slate-500 mt-1.5 flex justify-between">
                    <span>Giá TT hiện tại:</span>
                    <span className="font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(selectedProfitProduct.current_price)} đ/kg</span>
                  </div>
                </div>

                {/* Yield Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Sản lượng dự kiến</label>
                  <div className="relative flex">
                    <input 
                      type="number"
                      value={yieldAmount}
                      onChange={(e) => setYieldAmount(e.target.value)}
                      className="block w-full p-3 z-20 text-sm text-slate-900 bg-slate-50 rounded-l-xl border-y border-l border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 font-medium" 
                      placeholder="VD: 1000" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setYieldUnit(yieldUnit === 'kg' ? 'tan' : 'kg')}
                      className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-bold text-center text-slate-700 bg-slate-100 border border-slate-200 rounded-r-xl hover:bg-slate-200 focus:ring-2 focus:outline-none focus:ring-emerald-300 transition-colors"
                    >
                      {yieldUnit === 'kg' ? 'Kg' : 'Tấn'} <ArrowRightLeft className="w-3 h-3 ml-2 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Estimated Cost */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Chi phí ước tính (VNĐ)</label>
                  <input 
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="block w-full p-3 text-sm text-slate-900 bg-slate-50 rounded-xl border border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 font-medium" 
                    placeholder="VD: 20000000" 
                  />
                </div>

                {/* Result Box */}
                <div className="pt-6 mt-8 border-t border-slate-100">
                  <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <label className="block text-sm font-bold text-emerald-800/70 uppercase tracking-wider mb-2">Dự Kiến Thu Về</label>
                    <div className={`text-3xl font-black tracking-tight ${estimatedProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {new Intl.NumberFormat('vi-VN').format(estimatedProfit)} <span className="text-lg font-bold text-emerald-600/70">đ</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
