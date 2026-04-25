import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Pencil, Plus, Trash2, Search, Package2, Video, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PimProduct, SpecialtyGroup, CropTag, TerrainTag,
  fetchProducts, fetchSpecialtyGroups, fetchCropTags, fetchTerrainTags,
} from '@/lib/pim';
import ProductEditDialog from '@/components/admin/ProductEditDialog';
import SpecialtyGroupsManager from '@/components/admin/SpecialtyGroupsManager';
import TaxonomyManager from '@/components/admin/TaxonomyManager';

const fmtVND = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

export default function AdminProductsPage() {
  const [products, setProducts] = useState<PimProduct[]>([]);
  const [groups, setGroups] = useState<SpecialtyGroup[]>([]);
  const [crops, setCrops] = useState<CropTag[]>([]);
  const [terrains, setTerrains] = useState<TerrainTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<PimProduct | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [p, g, c, t] = await Promise.all([
        fetchProducts(), fetchSpecialtyGroups(), fetchCropTags(), fetchTerrainTags(),
      ]);
      setProducts(p);
      setGroups(g);
      setCrops(c);
      setTerrains(t);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const s = search.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.slug.toLowerCase().includes(s)
    );
  }, [products, search]);

  const groupLabel = (key: string | null) => {
    if (!key) return '—';
    const g = groups.find((x) => x.key === key);
    return g ? `${g.icon ?? ''} ${g.label}` : key;
  };

  const handleDelete = async (p: PimProduct) => {
    if (!confirm(`Xóa sản phẩm "${p.name}"? Hành động này không thể hoàn tác.`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Đã xóa');
    refresh();
  };

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p: PimProduct) => { setEditing(p); setDialogOpen(true); };

  return (
    <div className="container py-6 md:py-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Master PIM</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} sản phẩm · {products.filter((p) => p.active).length} đang hoạt động
          </p>
        </div>
        <Button onClick={openCreate} size="lg" className="shrink-0">
          <Plus className="w-4 h-4 mr-1" /> Tạo sản phẩm
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main: products table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package2 className="w-4 h-4" /> Catalog sản phẩm
                </span>
                <div className="relative w-64 max-w-full">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    className="pl-7 h-8 text-sm"
                    placeholder="Tìm tên, slug, danh mục…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-10 text-sm text-muted-foreground">Đang tải…</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  {products.length === 0
                    ? 'Chưa có sản phẩm nào. Bấm "Tạo sản phẩm" để thêm mới.'
                    : 'Không có kết quả phù hợp.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Nhóm chuyên môn</TableHead>
                        <TableHead className="text-right">Giá</TableHead>
                        <TableHead className="text-center">Tồn</TableHead>
                        <TableHead className="text-center">Media</TableHead>
                        <TableHead className="text-center">Specs</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>{p.name}</span>
                              {!p.active && <Badge variant="outline" className="text-[9px]">Ẩn</Badge>}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-mono">{p.slug}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.category || '—'}</TableCell>
                          <TableCell className="text-xs">{groupLabel(p.specialty_group_key)}</TableCell>
                          <TableCell className="text-right font-display font-semibold whitespace-nowrap">
                            {fmtVND(p.price)}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {p.stock} <span className="text-muted-foreground text-xs">{p.unit}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Video className="w-3 h-3" />{p.media.videos.length}</span>
                              <span className="flex items-center gap-0.5"><FileText className="w-3 h-3" />{p.media.pdfs.length}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">{p.attributes.length}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-end">
                              <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(p)}>
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
        </div>

        {/* Side: taxonomy managers */}
        <div className="space-y-5">
          <SpecialtyGroupsManager groups={groups} onChange={refresh} />
          <TaxonomyManager
            title="Loại cây trồng"
            hint="Tag dùng để phân loại sản phẩm & bài viết theo cây trồng (vd: Lúa, Sầu riêng, Cà phê)."
            table="crop_tags"
            items={crops}
            onChange={refresh}
            placeholderIcon="🌾"
            placeholderLabel="Tên cây (vd: Lúa)"
          />
          <TaxonomyManager
            title="Loại địa hình"
            hint="Tag địa hình canh tác (vd: Đồng bằng, Đồi dốc, Nhà màng) — gợi ý SP phù hợp."
            table="terrain_tags"
            items={terrains}
            onChange={refresh}
            placeholderIcon="⛰️"
            placeholderLabel="Tên địa hình (vd: Đồi dốc)"
          />
        </div>
      </div>

      <ProductEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        specialtyGroups={groups}
        onSaved={refresh}
      />
    </div>
  );
}
