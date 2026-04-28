'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Settings2,
  TrendingUp,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ─── Mock Data ─────────────────────────────────────────────────────────
const CHART_DATA = [
  { date: '01/04', leads: 4, conversion: 25 },
  { date: '05/04', leads: 7, conversion: 42 },
  { date: '10/04', leads: 5, conversion: 40 },
  { date: '15/04', leads: 12, conversion: 58 },
  { date: '20/04', leads: 18, conversion: 61 },
  { date: '25/04', leads: 14, conversion: 50 },
  { date: '30/04', leads: 22, conversion: 68 },
];

export default function DealerProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [tier, setTier] = useState('Gold');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mock fetching dealer data
  const dealer = {
    id,
    name: 'Cửa hàng Xanh Việt',
    owner: 'Nguyễn Văn A',
    phone: '0909.888.777',
    email: 'contact@xanhviet.vn',
    address: '123 QL13, Thủ Dầu Một, Bình Dương',
    joined: '15/02/2025',
    totalLeads: 145,
    convertedLeads: 82,
    conversionRate: 56.5,
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate API call to update Supabase dealers table
    // await supabase.from('dealers').update({ tier, status: isActive ? 'active' : 'inactive' }).eq('id', id);
    
    setTimeout(() => {
      setSaving(false);
      toast({
        title: '✅ Đã lưu cấu hình đại lý',
        description: `Cấp bậc: ${tier} | Nhận Lead: ${isActive ? 'Bật' : 'Tắt'}`,
      });
    }, 800);
  };

  return (
    <AdminShell title="Dealer Profile" subtitle="Chi tiết năng lực và phân bổ Lead cho đối tác">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/partners">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white border border-border/50">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">{dealer.name}</h1>
        <Badge 
          variant="outline" 
          className={
            isActive 
              ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50' 
              : 'border-slate-300 text-slate-500 bg-slate-50'
          }
        >
          {isActive ? 'Đang hoạt động' : 'Tạm khóa'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Info & Settings */}
        <div className="space-y-6 lg:col-span-4">
          
          {/* Thông tin cơ bản */}
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#2E7D32]" />
                Thông tin chung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Địa chỉ</p>
                  <p className="text-sm font-medium">{dealer.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Người đại diện</p>
                  <p className="text-sm font-medium">{dealer.owner}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Điện thoại</p>
                  <p className="text-sm font-medium">{dealer.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium">{dealer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Ngày tham gia</p>
                  <p className="text-sm font-medium">{dealer.joined}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tier Management & Settings */}
          <Card className="border-border/50 border-t-4 border-t-[#2E7D32]">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-[#2E7D32]" />
                Cấu hình hệ thống (Tier Management)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Cấp bậc đối tác (Tier)</Label>
                  <p className="text-[11px] text-muted-foreground mb-2">Ảnh hưởng trực tiếp đến thuật toán phân phối Lead</p>
                </div>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger className="w-full bg-white border-slate-200">
                    <SelectValue placeholder="Chọn cấp bậc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gold"><span className="font-bold text-amber-600">Gold Partner (100% Trọng số)</span></SelectItem>
                    <SelectItem value="Silver"><span className="font-bold text-slate-600">Silver Partner (60% Trọng số)</span></SelectItem>
                    <SelectItem value="Bronze"><span className="font-bold text-amber-800">Bronze Partner (30% Trọng số)</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-slate-50">
                <div>
                  <Label className="text-sm font-bold text-slate-900">Nhận Lead tự động</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Trạng thái Active trong bảng dealers</p>
                </div>
                <Switch 
                  checked={isActive} 
                  onCheckedChange={setIsActive} 
                  className={isActive ? 'bg-[#2E7D32]' : ''} 
                />
              </div>

              <Button 
                onClick={handleSaveSettings} 
                disabled={saving}
                className="w-full rounded-xl bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white font-bold"
              >
                {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Performance Charts */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* KPI Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col justify-center h-full">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Tổng Lead Đã Nhận</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-black text-slate-900">{dealer.totalLeads}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col justify-center h-full">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Lead Đã Chốt (Win)</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-black text-[#2E7D32]">{dealer.convertedLeads}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-slate-900 text-white">
              <CardContent className="p-4 flex flex-col justify-center h-full">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tỷ lệ chuyển đổi</p>
                <div className="flex items-end gap-2">
                  <h3 className="text-3xl font-black text-emerald-400">{dealer.conversionRate}%</h3>
                  <TrendingUp className="h-5 w-5 text-emerald-400 mb-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Hiệu suất tiếp nhận Lead (30 ngày qua)
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    So sánh giữa số lượng Lead hệ thống đẩy về và Tỷ lệ chuyển đổi thành công
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-xs">Tháng 4/2026</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0F172A', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="leads" 
                      name="Số Lead (người)"
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="conversion" 
                      name="Tỷ lệ chuyển đổi (%)"
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </AdminShell>
  );
}
