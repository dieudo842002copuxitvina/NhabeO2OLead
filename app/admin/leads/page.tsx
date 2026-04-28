'use client';

import React, { useState, useMemo } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Filter,
  Flame,
  Thermometer,
  Snowflake,
  Eye,
  Phone,
  MapPin,
  Package,
  ChevronRight,
  Download,
  RefreshCw,
  Calendar,
  User,
  Sprout,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────
type HeatLevel = 'hot' | 'warm' | 'cold';

interface LeadRow {
  id: string;
  name: string;
  phone: string;
  province: string;
  district: string;
  crop: string;
  heat: HeatLevel;
  lastAction: string;
  lastActionTime: string;
  areaHa: number;
  dealerSuggested: string;
  bom: BomItem[];
}

interface BomItem {
  sku: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────
const MOCK_LEADS: LeadRow[] = [
  {
    id: 'L-001', name: 'Nguyễn Văn Hùng', phone: '0912***567', province: 'Đắk Lắk',
    district: 'Buôn Ma Thuột', crop: 'Sầu riêng', heat: 'hot',
    lastAction: 'Gửi dự toán tưới 3ha', lastActionTime: '3 phút trước', areaHa: 3,
    dealerSuggested: 'Đại lý Phú Lộc',
    bom: [
      { sku: 'PE-020', name: 'Ống PE Ø20mm', qty: 450, unit: 'm', price: 12000 },
      { sku: 'BEC-001', name: 'Béc tưới nhỏ giọt 4L/h', qty: 750, unit: 'cái', price: 3500 },
      { sku: 'PMP-S01', name: 'Máy bơm Solar 1.5HP', qty: 1, unit: 'bộ', price: 12500000 },
      { sku: 'FLT-001', name: 'Bộ lọc đĩa 2"', qty: 1, unit: 'bộ', price: 850000 },
    ],
  },
  {
    id: 'L-002', name: 'Trần Thị Mai', phone: '0987***812', province: 'Đồng Nai',
    district: 'Trảng Bom', crop: 'Cà phê', heat: 'warm',
    lastAction: 'Yêu cầu báo giá máy bơm', lastActionTime: '12 phút trước', areaHa: 2,
    dealerSuggested: 'Đại lý Nông Phát',
    bom: [
      { sku: 'PMP-E02', name: 'Máy bơm điện 2HP Pentax', qty: 1, unit: 'bộ', price: 5800000 },
      { sku: 'PE-025', name: 'Ống PE Ø25mm', qty: 200, unit: 'm', price: 18000 },
    ],
  },
  {
    id: 'L-003', name: 'Lê Văn Tâm', phone: '0365***034', province: 'Bình Dương',
    district: 'Bến Cát', crop: 'Tiêu', heat: 'cold',
    lastAction: 'Xem trang đại lý', lastActionTime: '2 giờ trước', areaHa: 1.5,
    dealerSuggested: 'Đại lý Xanh Việt',
    bom: [
      { sku: 'PE-016', name: 'Ống PE Ø16mm', qty: 300, unit: 'm', price: 8500 },
      { sku: 'BEC-002', name: 'Béc phun sương', qty: 600, unit: 'cái', price: 2800 },
    ],
  },
  {
    id: 'L-004', name: 'Phạm Đức Anh', phone: '0901***221', province: 'Long An',
    district: 'Đức Hòa', crop: 'Bưởi', heat: 'hot',
    lastAction: 'Click gọi Zalo đại lý', lastActionTime: '45 phút trước', areaHa: 5,
    dealerSuggested: 'Đại lý Bình Minh',
    bom: [
      { sku: 'SPK-001', name: 'Sprinkler xoay 360°', qty: 120, unit: 'cái', price: 45000 },
      { sku: 'PE-032', name: 'Ống PE Ø32mm', qty: 500, unit: 'm', price: 28000 },
      { sku: 'PMP-D01', name: 'Máy bơm dầu 3HP', qty: 1, unit: 'bộ', price: 8500000 },
    ],
  },
  {
    id: 'L-005', name: 'Võ Minh Tuấn', phone: '0777***445', province: 'Đắk Nông',
    district: 'Gia Nghĩa', crop: 'Sầu riêng', heat: 'hot',
    lastAction: 'Gửi form yêu cầu tư vấn', lastActionTime: '1 giờ trước', areaHa: 4,
    dealerSuggested: 'HTX Miền Đông',
    bom: [
      { sku: 'PE-020', name: 'Ống PE Ø20mm', qty: 600, unit: 'm', price: 12000 },
      { sku: 'BEC-001', name: 'Béc tưới nhỏ giọt 4L/h', qty: 1000, unit: 'cái', price: 3500 },
      { sku: 'CTL-001', name: 'Bộ điều khiển tưới AC-8', qty: 1, unit: 'bộ', price: 3200000 },
    ],
  },
  {
    id: 'L-006', name: 'Bùi Thanh Hà', phone: '0898***667', province: 'Lâm Đồng',
    district: 'Di Linh', crop: 'Cà phê', heat: 'warm',
    lastAction: 'Tải tài liệu kỹ thuật', lastActionTime: '3 giờ trước', areaHa: 2.5,
    dealerSuggested: 'Đại lý Phú Lộc',
    bom: [
      { sku: 'PE-020', name: 'Ống PE Ø20mm', qty: 380, unit: 'm', price: 12000 },
      { sku: 'BEC-003', name: 'Béc bù áp 8L/h', qty: 500, unit: 'cái', price: 5200 },
    ],
  },
  {
    id: 'L-007', name: 'Đặng Minh Quân', phone: '0912***889', province: 'Gia Lai',
    district: 'Pleiku', crop: 'Hồ tiêu', heat: 'cold',
    lastAction: 'Xem bảng giá', lastActionTime: '5 giờ trước', areaHa: 1,
    dealerSuggested: 'HTX Miền Đông',
    bom: [
      { sku: 'PE-016', name: 'Ống PE Ø16mm', qty: 200, unit: 'm', price: 8500 },
    ],
  },
  {
    id: 'L-008', name: 'Ngô Thị Lan', phone: '0933***112', province: 'Tây Ninh',
    district: 'Trảng Bàng', crop: 'Mãng cầu', heat: 'warm',
    lastAction: 'Yêu cầu tư vấn phân bón', lastActionTime: '4 giờ trước', areaHa: 1.2,
    dealerSuggested: 'Đại lý Xanh Việt',
    bom: [
      { sku: 'FRT-001', name: 'Phân NPK 20-20-15', qty: 50, unit: 'kg', price: 15000 },
      { sku: 'FRT-002', name: 'Phân hữu cơ vi sinh', qty: 100, unit: 'kg', price: 8000 },
    ],
  },
];

const PROVINCES = ['Tất cả', 'Đắk Lắk', 'Đồng Nai', 'Bình Dương', 'Long An', 'Đắk Nông', 'Lâm Đồng', 'Gia Lai', 'Tây Ninh'];
const CROPS = ['Tất cả', 'Sầu riêng', 'Cà phê', 'Tiêu', 'Hồ tiêu', 'Bưởi', 'Mãng cầu'];
const HEATS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'hot', label: '🔥 Hot' },
  { value: 'warm', label: '🌡 Warm' },
  { value: 'cold', label: '❄ Cold' },
];

// ─── Heat Badge ──────────────────────────────────────────────────────
function HeatBadge({ heat }: { heat: HeatLevel }) {
  const config = {
    hot: { label: 'Hot', icon: Flame, className: 'border-red-500/30 bg-red-500/10 text-red-400' },
    warm: { label: 'Warm', icon: Thermometer, className: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
    cold: { label: 'Cold', icon: Snowflake, className: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
  }[heat];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn('gap-1 font-bold', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function LeadCommandCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvince, setFilterProvince] = useState('Tất cả');
  const [filterCrop, setFilterCrop] = useState('Tất cả');
  const [filterHeat, setFilterHeat] = useState('all');
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    return MOCK_LEADS.filter((lead) => {
      if (searchQuery && !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !lead.phone.includes(searchQuery)) return false;
      if (filterProvince !== 'Tất cả' && lead.province !== filterProvince) return false;
      if (filterCrop !== 'Tất cả' && lead.crop !== filterCrop) return false;
      if (filterHeat !== 'all' && lead.heat !== filterHeat) return false;
      return true;
    });
  }, [searchQuery, filterProvince, filterCrop, filterHeat]);

  const openDrawer = (lead: LeadRow) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const stats = useMemo(() => ({
    total: MOCK_LEADS.length,
    hot: MOCK_LEADS.filter((l) => l.heat === 'hot').length,
    warm: MOCK_LEADS.filter((l) => l.heat === 'warm').length,
    cold: MOCK_LEADS.filter((l) => l.heat === 'cold').length,
  }), []);

  return (
    <AdminShell title="Lead Command Center" subtitle="Quản lý và phân tích khách hàng tiềm năng">
      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng Lead', value: stats.total, color: 'text-foreground' },
          { label: 'Hot', value: stats.hot, color: 'text-red-400', icon: Flame },
          { label: 'Warm', value: stats.warm, color: 'text-amber-400', icon: Thermometer },
          { label: 'Cold', value: stats.cold, color: 'text-blue-400', icon: Snowflake },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              {s.icon && <s.icon className={cn('h-5 w-5', s.color)} />}
              <div>
                <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border/50">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Province Filter */}
          <Select value={filterProvince} onValueChange={setFilterProvince}>
            <SelectTrigger className="w-[160px] rounded-xl border-border/50 bg-muted/30">
              <MapPin className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Crop Filter */}
          <Select value={filterCrop} onValueChange={setFilterCrop}>
            <SelectTrigger className="w-[150px] rounded-xl border-border/50 bg-muted/30">
              <Sprout className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CROPS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Heat Filter */}
          <Select value={filterHeat} onValueChange={setFilterHeat}>
            <SelectTrigger className="w-[130px] rounded-xl border-border/50 bg-muted/30">
              <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HEATS.map((h) => (
                <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" className="rounded-xl">
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Làm mới
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <Download className="mr-2 h-3.5 w-3.5" />
            Xuất CSV
          </Button>
        </CardContent>
      </Card>

      {/* DataTable */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[60px]">ID</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead>Cây trồng</TableHead>
                <TableHead>Diện tích</TableHead>
                <TableHead>Độ nóng</TableHead>
                <TableHead>Hành động gần nhất</TableHead>
                <TableHead className="text-right">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer border-border/30 transition-colors hover:bg-muted/30"
                  onClick={() => openDrawer(lead)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{lead.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-[11px] text-muted-foreground">{lead.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{lead.province}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{lead.district}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[11px]">
                      {lead.crop}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{lead.areaHa} ha</TableCell>
                  <TableCell>
                    <HeatBadge heat={lead.heat} />
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">{lead.lastAction}</p>
                    <p className="text-[10px] text-muted-foreground">{lead.lastActionTime}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    Không tìm thấy lead nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lead Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg" side="right">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {selectedLead.name[0]}
                  </div>
                  <div>
                    <p>{selectedLead.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">{selectedLead.phone}</p>
                  </div>
                </SheetTitle>
                <SheetDescription>Chi tiết lead và dự toán vật tư (BOM)</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Lead Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Khu vực', value: `${selectedLead.district}, ${selectedLead.province}`, icon: MapPin },
                    { label: 'Cây trồng', value: selectedLead.crop, icon: Sprout },
                    { label: 'Diện tích', value: `${selectedLead.areaHa} ha`, icon: Calendar },
                    { label: 'Đại lý gợi ý', value: selectedLead.dealerSuggested, icon: User },
                  ].map((info) => (
                    <div key={info.label} className="rounded-xl border border-border/50 bg-muted/30 p-3">
                      <div className="mb-1 flex items-center gap-1.5">
                        <info.icon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {info.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{info.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <HeatBadge heat={selectedLead.heat} />
                  <span className="text-xs text-muted-foreground">
                    {selectedLead.lastAction} · {selectedLead.lastActionTime}
                  </span>
                </div>

                <Separator />

                {/* BOM Table */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                    <Package className="h-4 w-4" style={{ color: '#2E7D32' }} />
                    Dự toán vật tư (BOM)
                  </h3>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50 hover:bg-transparent">
                          <TableHead className="text-xs">SKU</TableHead>
                          <TableHead className="text-xs">Sản phẩm</TableHead>
                          <TableHead className="text-right text-xs">SL</TableHead>
                          <TableHead className="text-right text-xs">Đơn giá</TableHead>
                          <TableHead className="text-right text-xs">Thành tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedLead.bom.map((item) => (
                          <TableRow key={item.sku} className="border-border/30">
                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                              {item.sku}
                            </TableCell>
                            <TableCell className="text-sm">{item.name}</TableCell>
                            <TableCell className="text-right text-sm">
                              {item.qty} {item.unit}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {item.price.toLocaleString('vi-VN')}đ
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              {(item.qty * item.price).toLocaleString('vi-VN')}đ
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex items-center justify-between border-t border-border/50 bg-muted/30 px-4 py-3">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Tổng cộng</span>
                      <span className="text-base font-bold text-foreground">
                        {selectedLead.bom
                          .reduce((sum, item) => sum + item.qty * item.price, 0)
                          .toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1 rounded-xl" style={{ backgroundColor: '#2E7D32' }}>
                    <Phone className="mr-2 h-4 w-4" />
                    Liên hệ ngay
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl">
                    Gán Đại lý
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}
