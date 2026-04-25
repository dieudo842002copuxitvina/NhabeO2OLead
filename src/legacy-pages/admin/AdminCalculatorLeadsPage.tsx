import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dealers } from '@/data/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Calculator, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import LeadDetailDialog, { type CalcLeadDetail } from '@/components/admin/LeadDetailDialog';

type LeadStatus = 'new' | 'contacted' | 'won' | 'lost';
type CalcLead = CalcLeadDetail;

const STATUS_META: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  new: { label: 'Mới', variant: 'default' },
  contacted: { label: 'Đã liên hệ', variant: 'secondary' },
  won: { label: 'Chốt đơn', variant: 'outline' },
  lost: { label: 'Thất bại', variant: 'destructive' },
};

const CROP_LABELS: Record<string, string> = {
  durian: 'Sầu riêng',
  coffee: 'Cà phê',
  pepper: 'Hồ tiêu',
  pomelo: 'Bưởi',
  dragonfruit: 'Thanh long',
  avocado: 'Bơ',
};

export default function AdminCalculatorLeadsPage() {
  const [leads, setLeads] = useState<CalcLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState<string>('all');
  const [dealerFilter, setDealerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<CalcLead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calculator_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Không tải được leads: ' + error.message);
    } else {
      setLeads((data ?? []).map((d) => ({
        ...d,
        status_history: Array.isArray(d.status_history)
          ? (d.status_history as unknown as CalcLead['status_history'])
          : [],
      })) as CalcLead[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (cropFilter !== 'all' && l.crop !== cropFilter) return false;
      if (dealerFilter !== 'all' && l.dealer_id !== dealerFilter) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      return true;
    });
  }, [leads, cropFilter, dealerFilter, statusFilter]);

  const cropOptions = useMemo(() => Array.from(new Set(leads.map((l) => l.crop))), [leads]);

  const dealerName = (id: string | null) => {
    if (!id) return '—';
    return dealers.find((d) => d.id === id)?.name ?? id;
  };

  const updateStatus = async (id: string, status: LeadStatus) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const newHistory = [
      ...(lead.status_history ?? []),
      { status, at: new Date().toISOString() },
    ];
    const { error } = await supabase
      .from('calculator_leads')
      .update({ status, status_history: newHistory as unknown as never })
      .eq('id', id);
    if (error) {
      toast.error('Cập nhật thất bại');
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status, status_history: newHistory } : l)));
    if (selected?.id === id) setSelected({ ...lead, status, status_history: newHistory });
    toast.success('Đã cập nhật trạng thái');
  };

  const exportCSV = () => {
    if (!filtered.length) {
      toast.error('Không có dữ liệu để export');
      return;
    }
    const headers = [
      'ID', 'Ngày tạo', 'Khách hàng', 'SĐT', 'Tỉnh', 'Cây trồng', 'Diện tích (m²)',
      'Nguồn nước', 'Độ dốc', 'Khoảng cách', 'HP máy bơm', 'Mét ống', 'Số béc',
      'Tổng chi phí (VNĐ)', 'Trạng thái', 'Đại lý',
    ];
    const escape = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filtered.map((l) => [
      l.id, l.created_at, l.customer_name, l.customer_phone, l.customer_province ?? '',
      CROP_LABELS[l.crop] ?? l.crop, l.area_m2, l.water_source, l.slope, l.spacing,
      l.pump_hp, l.pipe_meters, l.nozzle_count, l.total_cost,
      STATUS_META[l.status]?.label ?? l.status, dealerName(l.dealer_id),
    ].map(escape).join(','));
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculator-leads-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã export ${filtered.length} leads`);
  };

  const stats = useMemo(() => ({
    total: filtered.length,
    totalValue: filtered.reduce((s, l) => s + Number(l.total_cost), 0),
    won: filtered.filter((l) => l.status === 'won').length,
  }), [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            Leads từ Máy tính Tưới
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các yêu cầu báo giá phát sinh từ Smart Calculator
          </p>
        </div>
        <Button onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Tổng leads</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Giá trị dự toán</p>
            <p className="text-2xl font-bold text-primary">{stats.totalValue.toLocaleString('vi-VN')}đ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Đã chốt</p>
            <p className="text-2xl font-bold text-primary">{stats.won}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Select value={cropFilter} onValueChange={setCropFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Cây trồng" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cây trồng</SelectItem>
              {cropOptions.map((c) => (
                <SelectItem key={c} value={c}>{CROP_LABELS[c] ?? c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dealerFilter} onValueChange={setDealerFilter}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Đại lý" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đại lý</SelectItem>
              {dealers.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="new">Mới</SelectItem>
              <SelectItem value="contacted">Đã liên hệ</SelectItem>
              <SelectItem value="won">Chốt đơn</SelectItem>
              <SelectItem value="lost">Thất bại</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={() => { setCropFilter('all'); setDealerFilter('all'); setStatusFilter('all'); }}>
            Reset
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Chưa có leads nào khớp bộ lọc
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Cây / Diện tích</TableHead>
                  <TableHead>Cấu hình</TableHead>
                  <TableHead className="text-right">Dự toán</TableHead>
                  <TableHead>Đại lý</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow
                    key={l.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setSelected(l)}
                  >
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(l.created_at), 'dd/MM HH:mm')}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{l.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{l.customer_phone}</p>
                      {l.customer_province && <p className="text-xs text-muted-foreground">{l.customer_province}</p>}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{CROP_LABELS[l.crop] ?? l.crop}</p>
                      <p className="text-xs text-muted-foreground">{l.area_m2.toLocaleString()} m²</p>
                    </TableCell>
                    <TableCell className="text-xs">
                      <p>{l.pump_hp}HP · {l.pipe_meters}m ống</p>
                      <p className="text-muted-foreground">{l.nozzle_count} béc · {l.water_source}</p>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary whitespace-nowrap">
                      {Number(l.total_cost).toLocaleString('vi-VN')}đ
                    </TableCell>
                    <TableCell className="text-xs">{dealerName(l.dealer_id)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as LeadStatus)}>
                        <SelectTrigger className="w-32 h-8">
                          <Badge variant={STATUS_META[l.status]?.variant ?? 'secondary'}>
                            {STATUS_META[l.status]?.label ?? l.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Mới</SelectItem>
                          <SelectItem value="contacted">Đã liên hệ</SelectItem>
                          <SelectItem value="won">Chốt đơn</SelectItem>
                          <SelectItem value="lost">Thất bại</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" onClick={() => setSelected(l)} className="gap-1">
                        <Eye className="w-4 h-4" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <LeadDetailDialog
        lead={selected}
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
        onUpdated={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          setSelected(updated);
        }}
      />
    </div>
  );
}
