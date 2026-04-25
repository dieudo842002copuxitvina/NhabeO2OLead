import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CmsArticle, CmsStatus, ARTICLE_CATEGORIES, uploadToCmsMedia } from '@/lib/cms';
import { PimProduct, CropTag, TerrainTag, slugify } from '@/lib/pim';
import RichTextEditor from './RichTextEditor';
import MediaUploadField from './MediaUploadField';
import { Image as ImageIcon } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  article: CmsArticle | null;
  products: PimProduct[];
  crops: CropTag[];
  terrains: TerrainTag[];
  onSaved: () => void;
}

const blank = (): Omit<CmsArticle, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'author_id'> => ({
  slug: '', title: '', excerpt: '', cover_image: '', body: '',
  category: 'guide', tags: [], crop_tags: [], terrain_tags: [],
  related_product_ids: [], status: 'draft', featured: false, published_at: null,
});

export default function ArticleEditDialog({
  open, onOpenChange, article, products, crops, terrains, onSaved,
}: Props) {
  const [form, setForm] = useState(blank());
  const [tagInput, setTagInput] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(article ? { ...article } : blank());
      setTagInput(''); setProductSearch('');
    }
  }, [open, article]);

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleArr = (k: 'crop_tags' | 'terrain_tags' | 'related_product_ids', key: string) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(key) ? f[k].filter((x) => x !== key) : [...f[k], key],
    }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };
  const removeTag = (t: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const filteredProducts = products.filter((p) =>
    !productSearch.trim() || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Tiêu đề bắt buộc'); return; }

    const payload: any = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title,
      excerpt: form.excerpt,
      cover_image: form.cover_image,
      body: form.body,
      category: form.category,
      tags: form.tags,
      crop_tags: form.crop_tags,
      terrain_tags: form.terrain_tags,
      related_product_ids: form.related_product_ids,
      status: form.status,
      featured: form.featured,
    };
    if (form.status === 'published' && !form.published_at) {
      payload.published_at = new Date().toISOString();
    }

    setSaving(true);
    try {
      if (article) {
        const { error } = await (supabase as any).from('cms_articles').update(payload).eq('id', article.id);
        if (error) throw error;
        toast.success('Đã cập nhật bài viết');
      } else {
        const { error } = await (supabase as any).from('cms_articles').insert(payload);
        if (error) throw error;
        toast.success('Đã tạo bài viết');
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(`Lưu thất bại: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {article ? `Sửa: ${article.title}` : 'Bài viết mới'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basic">Cơ bản & Nội dung</TabsTrigger>
            <TabsTrigger value="meta">
              Phân loại ({form.crop_tags.length + form.terrain_tags.length + form.tags.length})
            </TabsTrigger>
            <TabsTrigger value="related">SP liên quan ({form.related_product_ids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-3 pt-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Label>Tiêu đề *</Label>
                <Input value={form.title} onChange={(e) => setField('title', e.target.value)} />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={form.slug} placeholder={slugify(form.title) || 'auto'}
                  onChange={(e) => setField('slug', e.target.value)} />
              </div>
              <div>
                <Label>Danh mục</Label>
                <Select value={form.category} onValueChange={(v) => setField('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ARTICLE_CATEGORIES.map((c) => (
                      <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={(v) => setField('status', v as CmsStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Publish</SelectItem>
                    <SelectItem value="archived">Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-3 p-3 border rounded-lg">
                <Switch checked={form.featured} onCheckedChange={(v) => setField('featured', v)} />
                <Label className="text-sm">Nổi bật trang chủ</Label>
              </div>
            </div>

            <div>
              <Label>Tóm tắt</Label>
              <Textarea rows={2} value={form.excerpt ?? ''}
                onChange={(e) => setField('excerpt', e.target.value)}
                placeholder="1-2 câu mô tả ngắn xuất hiện ở thẻ list…" />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Ảnh bìa
              </Label>
              <div className="flex gap-2 mt-1">
                <Input value={form.cover_image ?? ''} placeholder="https://..."
                  onChange={(e) => setField('cover_image', e.target.value)} />
                <MediaUploadField
                  label="Tải lên" accept="image/*"
                  uploadFn={(f) => uploadToCmsMedia(f, 'covers')}
                  onUploaded={(url) => setField('cover_image', url)}
                />
              </div>
              {form.cover_image && (
                <img src={form.cover_image} alt="" className="mt-2 max-h-40 rounded border" />
              )}
            </div>

            <div>
              <Label>Nội dung bài viết</Label>
              <RichTextEditor value={form.body} onChange={(html) => setField('body', html)}
                placeholder="Bắt đầu viết — dùng toolbar để chèn ảnh, link, tiêu đề…" />
            </div>
          </TabsContent>

          <TabsContent value="meta" className="space-y-4 pt-3">
            <div>
              <Label>Loại cây trồng</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {crops.map((c) => {
                  const on = form.crop_tags.includes(c.key);
                  return (
                    <Badge key={c.key} variant={on ? 'default' : 'outline'} className="cursor-pointer"
                      onClick={() => toggleArr('crop_tags', c.key)}>
                      {c.icon ? `${c.icon} ` : ''}{c.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Địa hình</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {terrains.map((t) => {
                  const on = form.terrain_tags.includes(t.key);
                  return (
                    <Badge key={t.key} variant={on ? 'default' : 'outline'} className="cursor-pointer"
                      onClick={() => toggleArr('terrain_tags', t.key)}>
                      {t.icon ? `${t.icon} ` : ''}{t.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Tags tự do</Label>
              <div className="flex gap-2 mb-2 mt-1">
                <Input placeholder="vd: tưới nhỏ giọt, tiết kiệm nước…" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} />
                <Button variant="outline" onClick={addTag}>Thêm</Button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {form.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-destructive">×</button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="related" className="space-y-3 pt-3">
            <p className="text-xs text-muted-foreground">
              Gắn các sản phẩm liên quan để hiển thị trong bài và tăng O2O conversion.
            </p>
            <Input placeholder="Tìm sản phẩm…" value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)} />
            <div className="max-h-[400px] overflow-y-auto border rounded-lg divide-y">
              {filteredProducts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Không có sản phẩm.</p>
              )}
              {filteredProducts.map((p) => {
                const on = form.related_product_ids.includes(p.id);
                return (
                  <button key={p.id} type="button"
                    onClick={() => toggleArr('related_product_ids', p.id)}
                    className={`flex items-center gap-3 w-full p-2 text-left hover:bg-muted/50 ${on ? 'bg-primary/5' : ''}`}>
                    <input type="checkbox" checked={on} readOnly className="w-4 h-4" />
                    {p.image && <img src={p.image} alt="" className="w-10 h-10 object-cover rounded" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Hủy</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu…' : article ? 'Cập nhật' : 'Tạo bài'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
