import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Pencil, Plus, Trash2, Search, FileText, Eye, EyeOff, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CmsArticle, fetchArticles } from '@/lib/cms';
import { PimProduct, fetchProducts, fetchCropTags, fetchTerrainTags, CropTag, TerrainTag } from '@/lib/pim';
import ArticleEditDialog from '@/components/admin/ArticleEditDialog';

const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';

export default function AdminCmsPage() {
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [products, setProducts] = useState<PimProduct[]>([]);
  const [crops, setCrops] = useState<CropTag[]>([]);
  const [terrains, setTerrains] = useState<TerrainTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<CmsArticle | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [a, p, c, t] = await Promise.all([
        fetchArticles(), fetchProducts(), fetchCropTags(), fetchTerrainTags(),
      ]);
      setArticles(a); setProducts(p); setCrops(c); setTerrains(t);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return articles;
    const s = search.toLowerCase();
    return articles.filter((a) =>
      a.title.toLowerCase().includes(s) ||
      a.slug.toLowerCase().includes(s) ||
      a.category.toLowerCase().includes(s)
    );
  }, [articles, search]);

  const handleDelete = async (a: CmsArticle) => {
    if (!confirm(`Xoá bài "${a.title}"?`)) return;
    const { error } = await (supabase as any).from('cms_articles').delete().eq('id', a.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Đã xoá'); refresh();
  };

  const togglePublish = async (a: CmsArticle) => {
    const next = a.status === 'published' ? 'draft' : 'published';
    const patch: any = { status: next };
    if (next === 'published' && !a.published_at) patch.published_at = new Date().toISOString();
    const { error } = await (supabase as any).from('cms_articles').update(patch).eq('id', a.id);
    if (error) { toast.error(error.message); return; }
    toast.success(next === 'published' ? 'Đã publish' : 'Đã ẩn');
    refresh();
  };

  return (
    <div className="container py-6 md:py-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Agri-CMS · Bài viết kỹ thuật</h1>
          <p className="text-sm text-muted-foreground">
            {articles.length} bài · {articles.filter((a) => a.status === 'published').length} đã publish
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} size="lg">
          <Plus className="w-4 h-4 mr-1" /> Bài viết mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Danh sách bài viết
            </span>
            <div className="relative w-64 max-w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input className="pl-7 h-8 text-sm" placeholder="Tìm theo tiêu đề, slug…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-10 text-sm text-muted-foreground">Đang tải…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              {articles.length === 0 ? 'Chưa có bài viết. Bấm "Bài viết mới" để bắt đầu.' : 'Không có kết quả.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Cây trồng</TableHead>
                    <TableHead>Sản phẩm liên quan</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {a.featured && <Star className="w-3 h-3 fill-primary text-primary" />}
                          <span>{a.title}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">{a.slug}</p>
                      </TableCell>
                      <TableCell className="text-xs">{a.category}</TableCell>
                      <TableCell className="text-xs">
                        {a.crop_tags.length === 0 ? '—' : a.crop_tags.slice(0, 2).join(', ')}
                        {a.crop_tags.length > 2 && ` +${a.crop_tags.length - 2}`}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.related_product_ids.length} SP
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(a.updated_at)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={a.status === 'published' ? 'default' : 'outline'} className="text-[9px]">
                          {a.status === 'published' ? 'Live' : a.status === 'draft' ? 'Nháp' : 'Lưu trữ'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" title={a.status === 'published' ? 'Ẩn' : 'Publish'}
                            onClick={() => togglePublish(a)}>
                            {a.status === 'published'
                              ? <EyeOff className="w-4 h-4" />
                              : <Eye className="w-4 h-4 text-primary" />}
                          </Button>
                          <Button size="icon" variant="ghost"
                            onClick={() => { setEditing(a); setOpen(true); }}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(a)}>
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

      <ArticleEditDialog
        open={open}
        onOpenChange={setOpen}
        article={editing}
        products={products}
        crops={crops}
        terrains={terrains}
        onSaved={refresh}
      />
    </div>
  );
}
