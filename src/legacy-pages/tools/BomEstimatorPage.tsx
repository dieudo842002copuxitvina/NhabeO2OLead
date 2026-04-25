import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Download, Phone, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatVnd } from '@/lib/calculatorSuite';
import SeoMeta from '@/components/SeoMeta';
import { trackEvent } from '@/lib/tracking';

interface BomItem { category: string; name: string; qty: number; unit: string; price: number }
interface Template { id: string; crop_key: string; crop_label: string; area_basis_ha: number; items: BomItem[]; notes: string | null }

export default function BomEstimatorPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [cropKey, setCropKey] = useState<string>('');
  const [areaHa, setAreaHa] = useState<number>(1);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('bom_templates')
        .select('id, crop_key, crop_label, area_basis_ha, items, notes')
        .eq('active', true)
        .order('crop_label');
      const list = (data ?? []).map((d) => ({
        ...d,
        items: Array.isArray(d.items) ? (d.items as unknown as BomItem[]) : [],
      })) as Template[];
      setTemplates(list);
      if (list.length) setCropKey(list[0].crop_key);
      setLoading(false);
    })();
  }, []);

  const template = templates.find((t) => t.crop_key === cropKey);

  const scaled = useMemo(() => {
    if (!template) return null;
    const factor = areaHa / Number(template.area_basis_ha || 1);
    const rows = template.items.map((it) => {
      const qty = Math.ceil(it.qty * factor);
      return { ...it, qtyScaled: qty, lineTotal: qty * it.price };
    });
    const grandTotal = rows.reduce((s, r) => s + r.lineTotal, 0);
    return { rows, grandTotal };
  }, [template, areaHa]);

  const exportCsv = () => {
    if (!scaled || !template) return;
    const header = ['Hạng mục', 'Tên vật tư', 'SL', 'ĐVT', 'Đơn giá', 'Thành tiền'];
    const rows = scaled.rows.map((r) => [r.category, r.name, r.qtyScaled, r.unit, r.price, r.lineTotal]);
    rows.push(['', '', '', '', 'Tổng', scaled.grandTotal]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `du-toan-${template.crop_key}-${areaHa}ha.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    trackEvent('calculator_used', { source: `bom-${template.crop_key}-${areaHa}ha` });
  };

  return (
    <div className="container max-w-5xl py-6 md:py-10 animate-fade-in">
      <SeoMeta title="Dự toán vật tư 1 Hecta - Nhà Bè Agri" description="Tính tự động danh sách béc, ống, phụ kiện, máy bơm cho 1 Hecta sầu riêng, cà phê, hồ tiêu, bơ, chanh dây theo định mức Nhà Bè Agri." canonical="/cong-cu/du-toan-1ha" />

      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 gap-1">
        <Link to="/cong-cu"><ArrowLeft className="w-4 h-4" /> Tất cả công cụ</Link>
      </Button>

      <header className="mb-6 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Dự toán vật tư</h1>
          <p className="text-sm text-muted-foreground">Định mức theo tiêu chuẩn Nhà Bè Agri cho 1 Hecta canh tác</p>
        </div>
      </header>

      <Card className="mb-5">
        <CardContent className="pt-5 grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Cây trồng</Label>
            {loading ? <Skeleton className="h-12 mt-1.5" /> : (
              <Select value={cropKey} onValueChange={setCropKey}>
                <SelectTrigger className="h-12 mt-1.5"><SelectValue placeholder="Chọn cây trồng" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => <SelectItem key={t.crop_key} value={t.crop_key}>{t.crop_label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label className="text-sm">Diện tích (Hecta)</Label>
            <Input type="number" step="0.1" min={0.1} value={areaHa} onChange={(e) => setAreaHa(Math.max(0.1, Number(e.target.value) || 0))} className="h-12 mt-1.5 text-base" inputMode="decimal" />
            <p className="text-[11px] text-muted-foreground mt-1">1 ha = 10.000 m². {template?.notes ?? ''}</p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="pt-5 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</CardContent></Card>
      ) : !scaled ? (
        <Card><CardContent className="pt-5 text-center text-muted-foreground py-10">Chưa có template cho cây này</CardContent></Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Bảng dự toán cho {areaHa} ha {template?.crop_label}</CardTitle>
            <Button onClick={exportCsv} size="sm" variant="outline" className="gap-1.5">
              <Download className="w-4 h-4" /> CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hạng mục</TableHead>
                  <TableHead>Vật tư</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scaled.rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{r.category}</Badge></TableCell>
                    <TableCell className="text-sm font-medium">{r.name}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{r.qtyScaled}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.unit}</TableCell>
                    <TableCell className="text-right text-xs hidden sm:table-cell">{formatVnd(r.price)}</TableCell>
                    <TableCell className="text-right font-semibold text-sm">{formatVnd(r.lineTotal)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-primary/5">
                  <TableCell colSpan={5} className="text-right font-bold">Tổng dự toán</TableCell>
                  <TableCell className="text-right font-bold text-primary text-lg">{formatVnd(scaled.grandTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        <Button asChild className="h-12 gap-2"><Link to="/cong-cu/tinh-toan"><Calculator className="w-4 h-4" /> Tính chi tiết theo địa hình</Link></Button>
        <Button asChild variant="outline" className="h-12 gap-2"><a href="tel:1900xxxx"><Phone className="w-4 h-4" /> Gọi tư vấn 1900-xxxx</a></Button>
      </div>
    </div>
  );
}
