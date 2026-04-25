import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Pencil, Plus, Trash2, Search, Camera, Eye, EyeOff, Star, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CmsCaseStudy, fetchCaseStudies } from '@/lib/cms';
import { PimProduct, fetchProducts } from '@/lib/pim';
import CaseStudyEditDialog from '@/components/admin/CaseStudyEditDialog';

const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<CmsCaseStudy[]>([]);
  const [products, setProducts] = useState<PimProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<CmsCaseStudy | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [cs, p] = await Promise.all([fetchCaseStudies(), fetchProducts()]);
      setItems(cs); setProducts(p);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter((c) =>
      c.title.toLowerCase().includes(s) ||
      (c.customer_name ?? '').toLowerCase().includes(s) ||
      (c.province ?? '').toLowerCase().includes(s)
    );
  }, [items, search]);

  const handleDelete = async (c: CmsCaseStudy) => {
    if (!confirm(`Xoá case study "${c.title}"?`)) return;
    const { error } = await (supabase as any).from('cms_case_studies').delete().eq('id', c.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Đã xoá'); refresh();
  };

  const togglePublish = async (c: CmsCaseStudy) => {
    const next = c.status === 'published' ? 'draft' : 'published';
    const patch: any = { status: next };
    if (next === 'published' && !c.published_at) patch.published_at = new Date().toISOString();
    const { error } = await (supabase as any).from('cms_case_studies').update(patch).eq('id', c.id);
    if (error) { toast.error(error.message); return; }
    toast.success(next === 'published' ? 'Đã publish' : 'Đã ẩn');
    refresh();
  };

  return (
    <div className="container py-6 md:py-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Case Study · Bằng chứng thép</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} dự án · {items.filter((c) => c.status === 'published').length} đã publish ·{' '}
            {items.filter((c) => c.featured && c.status === 'published').length} hiện ở trang chủ
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} size="lg">
          <Plus className="w-4 h-4 mr-1" /> Case study mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4" /> Danh sách case study
            </span>
            <div className="relative w-64 max-w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input className="pl-7 h-8 text-sm" placeholder="Tìm theo dự án, khách, tỉnh…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-10 text-sm text-muted-foreground">Đang tải…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              {items.length === 0 ? 'Chưa có case study. Bấm "Case study mới" để bắt đầu.' : 'Không có kết quả.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dự án</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Khu vực</TableHead>
                    <TableHead>Cây trồng</TableHead>
                    <TableHead className="text-center">Ảnh</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {c.featured && <Star className="w-3 h-3 fill-primary text-primary" />}
                          <span>{c.title}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">{c.slug}</p>
                      </TableCell>
                      <TableCell className="text-xs">{c.customer_name || '—'}</TableCell>
                      <TableCell className="text-xs">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {[c.district, c.province].filter(Boolean).join(', ') || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{c.crop || '—'}</TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {c.gallery.length}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(c.updated_at)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={c.status === 'published' ? 'default' : 'outline'} className="text-[9px]">
                          {c.status === 'published' ? 'Live' : c.status === 'draft' ? 'Nháp' : 'Lưu trữ'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => togglePublish(c)}
                            title={c.status === 'published' ? 'Ẩn' : 'Publish'}>
                            {c.status === 'published'
                              ? <EyeOff className="w-4 h-4" />
                              : <Eye className="w-4 h-4 text-primary" />}
                          </Button>
                          <Button size="icon" variant="ghost"
                            onClick={() => { setEditing(c); setOpen(true); }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(c)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CaseStudyEditDialog
        open={open}
        onOpenChange={setOpen}
        caseStudy={editing}
        products={products}
        onSaved={refresh}
      />
    </div>
  );
}
