'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  Target,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Eye,
  ShoppingCart,
  Activity,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AGRI_GREEN = '#2E7D32';

// --- Mock KPI Data ---
const kpis = [
  {
    title: 'Tổng Lead',
    value: '1,284',
    change: '+18.2%',
    trend: 'up' as const,
    icon: Users,
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    title: 'Lead Nóng',
    value: '342',
    change: '+24.5%',
    trend: 'up' as const,
    icon: Flame,
    color: 'bg-red-500/10 text-red-500',
  },
  {
    title: 'Tỷ lệ chuyển đổi',
    value: '12.4%',
    change: '+2.1%',
    trend: 'up' as const,
    icon: Target,
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    title: 'Đại lý hoạt động',
    value: '23/25',
    change: '-1',
    trend: 'down' as const,
    icon: MapPin,
    color: 'bg-amber-500/10 text-amber-500',
  },
];

// --- Mock Chart Data ---
const leadTrendData = [
  { date: 'T2', leads: 42, converted: 5 },
  { date: 'T3', leads: 38, converted: 7 },
  { date: 'T4', leads: 55, converted: 8 },
  { date: 'T5', leads: 48, converted: 6 },
  { date: 'T6', leads: 62, converted: 12 },
  { date: 'T7', leads: 71, converted: 15 },
  { date: 'CN', leads: 45, converted: 9 },
];

const channelData = [
  { name: 'Zalo', value: 45, color: '#2196F3' },
  { name: 'Call', value: 28, color: '#FF9800' },
  { name: 'Dự toán', value: 18, color: AGRI_GREEN },
  { name: 'Inquiry', value: 9, color: '#9C27B0' },
];

const topDealers = [
  { name: 'Đại lý Nông Phát', province: 'Đồng Nai', leads: 48, converted: 12, revenue: '156M' },
  { name: 'Đại lý Xanh Việt', province: 'Bình Dương', leads: 35, converted: 8, revenue: '98M' },
  { name: 'HTX Miền Đông', province: 'Tây Ninh', leads: 29, converted: 6, revenue: '72M' },
  { name: 'Đại lý Bình Minh', province: 'Long An', leads: 24, converted: 5, revenue: '65M' },
  { name: 'Đại lý Phú Lộc', province: 'Đắk Lắk', leads: 21, converted: 4, revenue: '54M' },
];

const recentActivity = [
  { user: 'Nguyễn Văn Hùng', action: 'gửi dự toán tưới 3ha Sầu riêng', time: '3 phút trước', type: 'hot' },
  { user: 'Trần Thị Mai', action: 'yêu cầu báo giá máy bơm', time: '12 phút trước', type: 'warm' },
  { user: 'Lê Văn Tâm', action: 'xem trang đại lý Nông Phát', time: '25 phút trước', type: 'cold' },
  { user: 'Phạm Đức Anh', action: 'tải tài liệu kỹ thuật PE', time: '1 giờ trước', type: 'cold' },
  { user: 'Võ Minh Tuấn', action: 'click gọi Zalo đại lý', time: '1.5 giờ trước', type: 'hot' },
];

const regionBarData = [
  { region: 'Đông Nam Bộ', leads: 420 },
  { region: 'Tây Nguyên', leads: 310 },
  { region: 'ĐBSCL', leads: 280 },
  { region: 'Bắc', leads: 145 },
  { region: 'Trung', leads: 129 },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell title="Dashboard tổng" subtitle="Tổng quan hoạt động hệ thống Agri-OS">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-border/50 bg-card transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-bold ${
                    kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-400'
                  }`}
                >
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {kpi.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{kpi.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Lead Trend Chart */}
        <Card className="border-border/50 xl:col-span-8">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Lead Trend (7 ngày)</CardTitle>
              <Badge variant="outline" className="text-[10px]">
                Tuần này
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadTrendData}>
                  <defs>
                    <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={AGRI_GREEN} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={AGRI_GREEN} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9800" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(215 20% 40%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(215 20% 40%)" />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(222 47% 8%)',
                      border: '1px solid hsl(217 33% 17%)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="leads" stroke={AGRI_GREEN} fill="url(#leadGrad)" strokeWidth={2} name="Leads" />
                  <Area type="monotone" dataKey="converted" stroke="#FF9800" fill="url(#convGrad)" strokeWidth={2} name="Chuyển đổi" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel Pie */}
        <Card className="border-border/50 xl:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Kênh Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(222 47% 8%)',
                      border: '1px solid hsl(217 33% 17%)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {channelData.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs text-muted-foreground">
                    {c.name} ({c.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Region Bar Chart */}
        <Card className="border-border/50 xl:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Lead theo Vùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionBarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(215 20% 40%)" />
                  <YAxis dataKey="region" type="category" tick={{ fontSize: 10 }} stroke="hsl(215 20% 40%)" width={90} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(222 47% 8%)',
                      border: '1px solid hsl(217 33% 17%)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="leads" fill={AGRI_GREEN} radius={[0, 6, 6, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Dealers */}
        <Card className="border-border/50 xl:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Top Đại lý</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDealers.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                  #{i + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.province} · {d.leads} leads · {d.converted} chốt</p>
                </div>
                <span className="text-xs font-bold text-emerald-500">₫{d.revenue}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border/50 xl:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Hoạt động gần đây</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    a.type === 'hot'
                      ? 'bg-red-500/10 text-red-400'
                      : a.type === 'warm'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}
                >
                  {a.user[0]}
                </div>
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{a.user}</span>{' '}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
