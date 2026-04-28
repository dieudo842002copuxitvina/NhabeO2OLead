'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Activity,
  Send,
  AlertCircle,
  CheckCircle2,
  Map,
  Star,
  Award,
  Settings2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

// ─── MOCK DATA ──────────────────────────────────────────────────────────

const MOCK_LEAD = {
  id: 'L-20231024-001',
  customer_name: 'Nguyễn Văn Hải',
  customer_phone: '0912 345 678',
  region: 'Buôn Ma Thuột, Đắk Lắk (Tọa độ: 12.666, 108.038)',
  created_at: '24/10/2023 09:30 AM',
  status: 'new', // new, assigned, progressing, won, lost
  project_type: 'pump_system', // pump_system or roi_project
  bom_data: {
    sku: 'ADELINO-3HP',
    pump_name: 'Bơm ly tâm Adelino 3HP',
    tdh: 32.5,
    flow: 20,
    elevation: 15,
    pipe_length: 100,
    estimated_cost: 3200000
  }
};

const MOCK_DEALERS = [
  { id: 'd1', name: 'Đại lý VTNN Hai Lúa', distance: '3.2 km', tier: 'Vàng', rating: 4.8 },
  { id: 'd2', name: 'Cửa hàng Nông Nghiệp Xanh', distance: '5.5 km', tier: 'Bạc', rating: 4.5 },
  { id: 'd3', name: 'Công ty Thủy Lợi Tây Nguyên', distance: '12.0 km', tier: 'Đồng', rating: 4.0 },
];

// ─── COMPONENT ──────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id || MOCK_LEAD.id;

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<string>('d1'); // Default to top suggestion
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadStatus, setLeadStatus] = useState(MOCK_LEAD.status);

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleAssignLead = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setAssignDialogOpen(false);
      setLeadStatus('assigned');
      toast({
        title: '✅ Đã phân bổ thành công!',
        description: 'Tin nhắn Zalo ZNS đã được gửi đến Khách hàng và Đại lý.',
      });
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 px-3 py-1 text-sm"><AlertCircle className="w-4 h-4 mr-1.5" /> Mới tinh</Badge>;
      case 'assigned': return <Badge className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 px-3 py-1 text-sm"><Send className="w-4 h-4 mr-1.5" /> Đã phân bổ</Badge>;
      case 'progressing': return <Badge className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 px-3 py-1 text-sm"><Activity className="w-4 h-4 mr-1.5" /> Đang chăm sóc</Badge>;
      case 'won': return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 px-3 py-1 text-sm"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Chốt thành công</Badge>;
      default: return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  const selectedDealerName = MOCK_DEALERS.find(d => d.id === selectedDealer)?.name;

  return (
    <AdminShell title={"Chi tiết Yêu cầu #" + leadId} subtitle="Điều phối & Xử lý Yêu cầu Khách hàng (O2O Routing)">
      
      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-300">
            <Settings2 className="h-4 w-4 mr-2" />
            Cập nhật trạng thái
          </Button>
          <Button 
            className="rounded-xl bg-[#EF6C00] hover:bg-[#E65100] text-white shadow-md shadow-orange-600/20 border-none"
            onClick={() => setAssignDialogOpen(true)}
            disabled={leadStatus === 'assigned' || leadStatus === 'won'}
          >
            <Send className="h-4 w-4 mr-2" />
            Phân bổ & Gửi Zalo Đại Lý
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ─── CỘT TRÁI (7): CHI TIẾT NHU CẦU ─── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Customer Info */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4 border-b border-border/30 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Thông tin Khách hàng
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs text-slate-500 bg-white">ID: {leadId}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ & Tên</p>
                  <p className="font-bold text-slate-900 text-lg">{MOCK_LEAD.customer_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số điện thoại</p>
                  <p className="font-bold text-[#2E7D32] text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {MOCK_LEAD.customer_phone}
                  </p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Khu vực / Vị trí Farm</p>
                  <p className="font-medium text-slate-700 flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    {MOCK_LEAD.region}
                  </p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày gửi yêu cầu</p>
                  <p className="font-medium text-slate-700 flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {MOCK_LEAD.created_at}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Technical Specs (BOM) */}
          <Card className="border-border/50 shadow-sm border-t-4 border-t-[#2E7D32]">
            <CardHeader className="pb-4 border-b border-border/30">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2E7D32]" />
                Bản vẽ & Dự toán kỹ thuật
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              
              {MOCK_LEAD.project_type === 'pump_system' && (
                <div className="space-y-6">
                  <div className="bg-[#2E7D32]/5 border border-[#2E7D32]/20 rounded-xl p-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#2E7D32] uppercase mb-1">Mã SKU Đề Xuất</p>
                      <h4 className="font-black text-xl text-slate-900">{MOCK_LEAD.bom_data.sku}</h4>
                      <p className="text-sm text-slate-600 mt-1">{MOCK_LEAD.bom_data.pump_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Giá Dự Toán</p>
                      <p className="font-black text-xl text-red-600">{formatVND(MOCK_LEAD.bom_data.estimated_cost)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Lưu lượng (Q)</p>
                      <p className="font-bold text-slate-800 text-lg mt-1">{MOCK_LEAD.bom_data.flow} <span className="text-xs font-normal">m³/h</span></p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Cột áp tổng (TDH)</p>
                      <p className="font-bold text-slate-800 text-lg mt-1">{MOCK_LEAD.bom_data.tdh} <span className="text-xs font-normal">m</span></p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Độ dốc rẫy</p>
                      <p className="font-bold text-slate-800 text-lg mt-1">{MOCK_LEAD.bom_data.elevation} <span className="text-xs font-normal">m</span></p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Đường ống</p>
                      <p className="font-bold text-slate-800 text-lg mt-1">{MOCK_LEAD.bom_data.pipe_length} <span className="text-xs font-normal">m</span></p>
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-border/30 pt-4 pb-4 rounded-b-xl flex justify-end">
              <Button variant="outline" className="border-slate-300">
                <Download className="h-4 w-4 mr-2 text-[#2E7D32]" /> Tải xuống BOM (PDF)
              </Button>
            </CardFooter>
          </Card>

        </div>

        {/* ─── CỘT PHẢI (5): O2O ROUTING CONSOLE ─── */}
        <div className="lg:col-span-5 space-y-6">
          
          <Card className="border-border/50 shadow-md ring-1 ring-black/5">
            <CardHeader className="pb-4 border-b border-border/30 bg-slate-900 text-white rounded-t-xl">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-amber-400" />
                  O2O Routing Console
                </div>
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Thuật toán phân phối khu vực
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              {/* Trạng thái hiện tại */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Trạng thái xử lý Lead</Label>
                <div className="mt-1">
                  {getStatusBadge(leadStatus)}
                </div>
              </div>

              {/* Gợi ý Đại lý */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase text-slate-500">Gợi ý Đại lý gần nhất</Label>
                  <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 hover:bg-amber-100">Thuật toán khớp 98%</Badge>
                </div>
                
                <div className="space-y-2">
                  {MOCK_DEALERS.map((dealer, index) => (
                    <div 
                      key={dealer.id}
                      onClick={() => setSelectedDealer(dealer.id)}
                      className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        selectedDealer === dealer.id 
                          ? 'border-[#EF6C00] bg-[#EF6C00]/5 ring-1 ring-[#EF6C00]/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{dealer.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-[#EF6C00] font-medium">
                            <MapPin className="h-3 w-3" /> {dealer.distance}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {dealer.rating}
                          </span>
                        </div>
                      </div>
                      <Badge className={`${
                        dealer.tier === 'Vàng' ? 'bg-amber-400 hover:bg-amber-500 text-amber-950' : 
                        dealer.tier === 'Bạc' ? 'bg-slate-300 hover:bg-slate-400 text-slate-900' : 
                        'bg-amber-700 hover:bg-amber-800 text-white'
                      }`}>
                        {dealer.tier === 'Vàng' && <Award className="h-3 w-3 mr-1" />}
                        {dealer.tier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Override */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <Label className="text-xs font-bold uppercase text-slate-500">Ghi đè thủ công (Tùy chọn)</Label>
                <Select value={selectedDealer} onValueChange={setSelectedDealer}>
                  <SelectTrigger className="w-full bg-slate-50">
                    <SelectValue placeholder="Chọn đại lý để bàn giao" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_DEALERS.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.distance})</SelectItem>
                    ))}
                    <SelectItem value="other">--- Chọn đại lý khác từ danh bạ ---</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </CardContent>
            
            <CardFooter className="bg-slate-50/80 border-t border-border/30 p-4 rounded-b-xl flex flex-col gap-3">
              <Button 
                className="w-full rounded-xl bg-[#EF6C00] hover:bg-[#E65100] text-white shadow-md shadow-orange-600/20 h-12 text-base font-bold"
                onClick={() => setAssignDialogOpen(true)}
                disabled={leadStatus === 'assigned' || leadStatus === 'won'}
              >
                <Send className="h-5 w-5 mr-2" />
                Phân bổ & Gửi Zalo ZNS
              </Button>
              <p className="text-[10px] text-center text-slate-500">
                Nhấn Phân bổ sẽ tự động trừ Credit trong tài khoản Đại lý.
              </p>
            </CardFooter>
          </Card>

        </div>
      </div>

      {/* ─── DIALOG XÁC NHẬN PHÂN BỔ ─── */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-slate-900">
              <AlertCircle className="h-5 w-5 text-[#EF6C00]" />
              Xác nhận Phân bổ Lead
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-600">
              Bạn sắp bàn giao Lead khách hàng <strong>{MOCK_LEAD.customer_name}</strong> cho đại lý <strong>{selectedDealerName}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl my-2">
            <h4 className="text-xs font-bold text-orange-800 uppercase mb-2">Hành động tự động (Automation)</h4>
            <ul className="text-sm text-orange-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">💬</span>
                <span>Gửi Zalo ZNS cho <strong>Khách hàng</strong> thông báo Đại lý sẽ liên hệ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📱</span>
                <span>Bắn Notification & Zalo ZNS báo có Lead mới cho <strong>Đại lý</strong>.</span>
              </li>
            </ul>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} disabled={isSubmitting}>Hủy</Button>
            <Button 
              className="bg-[#EF6C00] hover:bg-[#E65100] text-white" 
              onClick={handleAssignLead}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận & Gửi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
