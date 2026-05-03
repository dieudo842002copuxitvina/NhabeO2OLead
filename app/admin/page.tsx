'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Users, 
  CircleDollarSign, 
  TrendingUp, 
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BookOpen,
  Settings2,
  Clock,
  MapPin,
  Package
} from 'lucide-react';
import Link from 'next/link';

// ─── MOCK DATA VÀ TIỆN ÍCH ───────────────────────────────────────────────

const KPI_DATA = {
  totalLeads: { value: 1248, change: 12.5, isUp: true },
  pipelineValue: { value: 15400000000, change: 8.2, isUp: true }, // 15.4 Tỷ VNĐ
  conversionRate: { value: 68.4, change: -2.1, isUp: false },
  activeDealers: { value: 142, change: 5.0, isUp: true }
};

const REGION_DATA = [
  { region: 'Đắk Lắk', leads: 420 },
  { region: 'Lâm Đồng', leads: 380 },
  { region: 'Gia Lai', leads: 290 },
  { region: 'Miền Tây', leads: 150 },
  { region: 'Bình Phước', leads: 110 }
];

const COLORS = ['#2E7D32', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'];

const LIVE_FEEDS = [
  { id: 1, name: 'Nguyễn Văn Hải', region: 'Buôn Ma Thuột, Đắk Lắk', requirement: 'Hệ thống tưới sầu riêng 2ha', status: 'new', time: '5 phút trước' },
  { id: 2, name: 'Lê Thị Thu', region: 'Bảo Lộc, Lâm Đồng', requirement: 'Bơm ly tâm trục ngang 5HP', status: 'progress', time: '12 phút trước' },
  { id: 3, name: 'Trần Đại', region: 'Chư Sê, Gia Lai', requirement: 'Máy tính châm phân tự động', status: 'won', time: '1 giờ trước' },
  { id: 4, name: 'Phạm Văn Nam', region: 'Châu Thành, Bến Tre', requirement: 'Ống HDPE phi 90 & Van điều áp', status: 'new', time: '2 giờ trước' },
  { id: 5, name: 'HTX Nông Nghiệp Xanh', region: 'Gia Nghĩa, Đắk Nông', requirement: 'Trạm bơm tăng áp kép (Booster)', status: 'progress', time: '3 giờ trước' },
];

const formatVND = (val: number) => {
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' Tỷ';
  if (val >= 1000000) return (val / 1000000).toFixed(1) + ' Tr';
  return val.toLocaleString('vi-VN');
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Mới</Badge>;
    case 'progress': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Đang tư vấn</Badge>;
    case 'won': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Đã chốt</Badge>;
    default: return <Badge variant="outline">Không rõ</Badge>;
  }
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
        
        {/* TẦNG 1: KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Tổng Leads (Tháng này)</p>
                <h3 className="text-2xl font-black text-slate-900">{KPI_DATA.totalLeads.value.toLocaleString()}</h3>
                <div className="flex items-center mt-1 text-xs font-semibold">
                  <span className={KPI_DATA.totalLeads.isUp ? 'text-emerald-600 flex items-center' : 'text-red-500 flex items-center'}>
                    {KPI_DATA.totalLeads.isUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {KPI_DATA.totalLeads.change}%
                  </span>
                  <span className="text-slate-400 ml-1.5 font-normal">so với tháng trước</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Pipeline Dự án (VNĐ)</p>
                <h3 className="text-2xl font-black text-slate-900">{formatVND(KPI_DATA.pipelineValue.value)}</h3>
                <div className="flex items-center mt-1 text-xs font-semibold">
                  <span className={KPI_DATA.pipelineValue.isUp ? 'text-emerald-600 flex items-center' : 'text-red-500 flex items-center'}>
                    {KPI_DATA.pipelineValue.isUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {KPI_DATA.pipelineValue.change}%
                  </span>
                  <span className="text-slate-400 ml-1.5 font-normal">đang chờ duyệt</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <CircleDollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Tỷ lệ chuyển đổi O2O</p>
                <h3 className="text-2xl font-black text-slate-900">{KPI_DATA.conversionRate.value}%</h3>
                <div className="flex items-center mt-1 text-xs font-semibold">
                  <span className={KPI_DATA.conversionRate.isUp ? 'text-emerald-600 flex items-center' : 'text-red-500 flex items-center'}>
                    {KPI_DATA.conversionRate.isUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {Math.abs(KPI_DATA.conversionRate.change)}%
                  </span>
                  <span className="text-slate-400 ml-1.5 font-normal">đại lý tiếp nhận</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Đại lý Hoạt động</p>
                <h3 className="text-2xl font-black text-slate-900">{KPI_DATA.activeDealers.value}</h3>
                <div className="flex items-center mt-1 text-xs font-semibold">
                  <span className={KPI_DATA.activeDealers.isUp ? 'text-emerald-600 flex items-center' : 'text-red-500 flex items-center'}>
                    {KPI_DATA.activeDealers.isUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    +{KPI_DATA.activeDealers.change}
                  </span>
                  <span className="text-slate-400 ml-1.5 font-normal">đại lý mới mở</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* TẦNG 2: DỮ LIỆU & PHÂN TÍCH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cột trái 65%: Biểu đồ */}
          <Card className="lg:col-span-7 border-border/50 shadow-sm">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#2E7D32]" />
                Phân bổ Lead theo Vùng trồng
              </CardTitle>
              <CardDescription className="text-xs">
                Số lượng khách hàng tiềm năng đổ về từ hệ thống Marketing theo từng khu vực địa lý.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REGION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="region" 
                      tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="leads" name="Số lượng Lead" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      {REGION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cột phải 35%: Live Feed */}
          <Card className="lg:col-span-5 border-border/50 shadow-sm flex flex-col h-full">
            <CardHeader className="pb-2 border-b border-border/30 shrink-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Lead Vừa Đổ Về (Live Feed)
              </CardTitle>
              <CardDescription className="text-xs">
                Luồng dữ liệu thời gian thực từ các công cụ máy tính.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-4">
                {LIVE_FEEDS.map((feed) => (
                  <div key={feed.id} className="group p-3 rounded-xl border border-border/50 hover:border-[#2E7D32]/30 hover:bg-[#2E7D32]/5 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {feed.name}
                          <span className="text-[10px] font-normal text-muted-foreground whitespace-nowrap hidden sm:inline">
                            • {feed.time}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {feed.region}
                        </p>
                      </div>
                      {getStatusBadge(feed.status)}
                    </div>
                    <div className="bg-white rounded-md px-2.5 py-1.5 border border-slate-100 mt-2 flex items-start gap-2">
                      <Package className="h-3.5 w-3.5 text-[#2E7D32] mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-slate-700 line-clamp-1">{feed.requirement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* TẦNG 3: LỐI TẮT */}
        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Lối tắt thao tác (Quick Actions)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <Link href="/admin/products/new" className="block group">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-white group-hover:border-[#2E7D32]/50 group-hover:shadow-sm transition-all">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-[#2E7D32]/10 transition-colors">
                    <Plus className="h-5 w-5 text-[#2E7D32]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#2E7D32] transition-colors">Thêm Sản phẩm</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Cập nhật danh mục PIM</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/wiki/new" className="block group">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-white group-hover:border-blue-500/50 group-hover:shadow-sm transition-all">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Wiki Kỹ thuật</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Tài liệu & Base kiến thức</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/algorithm" className="block group">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-white group-hover:border-amber-500/50 group-hover:shadow-sm transition-all">
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                    <Settings2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">Cấu hình O2O</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Trọng số phân phối Lead</p>
                  </div>
                </div>
              </Link>

            </div>
          </CardContent>
        </Card>

      </div>
  );
}
