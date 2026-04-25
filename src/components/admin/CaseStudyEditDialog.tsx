import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CmsCaseStudy, CmsStatus, uploadToCmsMedia } from '@/lib/cms';
import { PimProduct, slugify } from '@/lib/pim';
import RichTextEditor from './RichTextEditor';
import MediaUploadField from './MediaUploadField';
import { Image as ImageIcon, Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  caseStudy: CmsCaseStudy | null;
  products: PimProduct[];
  onSaved: () => void;
}

const blank = (): Omit<CmsCaseStudy, 'id' | 'created_at' | 'updated_at'> => ({
  slug: '', title: '', customer_name: '', province: '', district: '',
  crop: '', area_ha: null, summary: '', body: '',
  cover_image: '', gallery: [], related_product_ids: [],
  dealer_name: '', installer_name: '',
  status: 'draft', featured: false, published_at: null,
});

export default function CaseStudyEditDialog({
  open, onOpenChange, caseStudy, products, onSaved,
}: Props) {
  const [form, setForm] = useState(blank());
  const [productSearch, setProductSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(caseStudy ? { ...caseStudy } : blank());
      setProductSearch('');
    }
  }, [open, caseStudy]);

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const pushImage = (url: string) =>
    setForm((f) => ({ ...f, gallery: [...f.gallery, url] }));
  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, idx) => idx !== i) }));

  const toggleProduct = (id: string) =>
    setForm((f) => ({
      ...f,
      related_product_ids: f.related_product_ids.includes(id)
        ? f.related_product_ids.filter((x) => x !== id)
        : [...f.related_product_ids, id],
    }));

  const filteredProducts = products.filter((p) =>
    !productSearch.trim() || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Tiêu đề bắt buộc'); return; }

    const payload: any = {
      slug: form.slug.trim() || slugify(form.title),
      title: form.title,
      customer_name: form.customer_name,
      province: form.province,
      district: form.district,
      crop: form.crop,
      area_ha: form.area_ha == null || form.area_ha === ('' as any) ? null : Number(form.area_ha),
      summary: form.summary,
      body: form.body,
      cover_image: form.cover_image,
      gallery: form.gallery,
      related_product_ids: form.related_product_ids,
      dealer_name: form.dealer_name,
      installer_name: form.installer_name,
      status: form.status,
      featured: form.featured,
    };
    if (form.status === 'published' && !form.published_at) {
      payload.published_at = new Date().toISOString();
    }

    setSaving(true);
    try {
      if (caseStudy) {
        const { error } = await (supabase as any).from('cms_case_studies').update(payload).eq('id', caseStudy.id);
        if (error) throw error;
        toast.success('Đã cập nhật');
      } else {
        const { error } = await (supabase as any).from('cms_case_studies').insert(payload);
        if (error) throw error;
        toast.success('Đã tạo case study');
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
            {caseStudy ? `Sửa: ${caseStudy.title}` : 'Case study mới'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basic">Thông tin & Nội dung</TabsTrigger>
            <TabsTrigger value="gallery">Album thi công ({form.gallery.length})</TabsTrigger>
            <TabsTrigger value="related">SP đã dùng ({form.related_product_ids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-3 pt-3">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Label>Tiêu đề dự án *</Label>
                <Input value={form.title} onChange={(e) => setField('title', e.target.value)}
                  placeholder="vd: Hệ tưới sầu riêng 3ha tại Đắk Lắk" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} placeholder={slugify(form.title) || 'auto'}
                  onChange={(e) => setField('slug', e.target.value)} />
              </div>
              <div>
                <Label>Tên khách hàng</Label>
                <Input value={form.customer_name ?? ''} placeholder="Anh Nguyễn Văn A"
                  onChange={(e) => setField('customer_name', e.target.value)} />
              </div>
              <div>
                <Label>Tỉnh/Thành</Label>
                <Input value={form.province ?? ''} placeholder="Đắk Lắk"
                  onChange={(e) => setField('province', e.target.value)} />
              </div>
              <div>
                <Label>Huyện/Xã</Label>
                <Input value={form.district ?? ''} placeholder="Krông Pắk"
                  onChange={(e) => setField('district', e.target.value)} />
              </div>
              <div>
                <Label>Cây trồng</Label>
                <Input value={form.crop ?? ''} placeholder="Sầu riêng"
                  onChange={(e) => setField('crop', e.target.value)} />
              </div>
              <div>
                <Label>Diện tích (ha)</Label>
                <Input type="number" step="0.1" value={form.area_ha ?? ''}
                  onChange={(e) => setField('area_ha', e.target.value === '' ? null : Number(e.target.value))} />
              </div>
              <div>
                <Label>Đại lý phụ trách</Label>
                <Input value={form.dealer_name ?? ''}
                  onChange={(e) => setField('dealer_name', e.target.value)} />
              </div>
              <div>
                <Label>Thợ thi công</Label>
                <Input value={form.installer_name ?? ''}
                  onChange={(e) => setField('installer_name', e.target.value)} />
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
                <Label className="text-sm">Hiện ở trang chủ (Bằng chứng thép)</Label>
              </div>
            </div>

            <div>
              <Label>Tóm tắt ngắn</Label>
              <Textarea rows={2} value={form.summary ?? ''}
                onChange={(e) => setField('summary', e.target.value)}
                placeholder="1-2 câu nổi bật cho thẻ trên trang chủ" />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Ảnh bìa
              </Label>
              <div className="flex gap-2 mt-1">
                <Input value={form.cover_image ?? ''} placeholder="https://..."
                  onChange={(e) => setField('cover_image', e.target.value)} />
                <MediaUploadField label="Tải lên" accept="image/*"
                  uploadFn={(f) => uploadToCmsMedia(f, 'case-covers')}
                  onUploaded={(url) => setField('cover_image', url)} />
              </div>
              {form.cover_image && (
                <img src={form.cover_image} alt="" className="mt-2 max-h-40 rounded border" />
              )}
            </div>

            <div>
              <Label>Câu chuyện chi tiết</Label>
              <RichTextEditor value={form.body} onChange={(html) => setField('body', html)}
                placeholder="Bối cảnh — thách thức — giải pháp Nhà Bè Agri — kết quả thực tế…" />
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-3 pt-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Upload ảnh thi công thực tế để làm <strong>bằng chứng thép</strong>. Khuyến khích ≥6 ảnh chất lượng tốt.
              </p>
              <MediaUploadField label="Upload ảnh" accept="image/*"
                uploadFn={(f) => uploadToCmsMedia(f, 'case-gallery')}
                onUploaded={(url) => pushImage(url)} />
            </div>
            {form.gallery.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground border border-dashed rounded-lg">
                Chưa có ảnh. Bấm "Upload ảnh" để thêm.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {form.gallery.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-md p-1 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="related" className="space-y-3 pt-3">
            <p className="text-xs text-muted-foreground">Sản phẩm đã sử dụng trong dự án này.</p>
            <Input placeholder="Tìm sản phẩm…" value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)} />
            <div className="max-h-[400px] overflow-y-auto border rounded-lg divide-y">
              {filteredProducts.map((p) => {
                const on = form.related_product_ids.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => toggleProduct(p.id)}
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
            {saving ? 'Đang lưu…' : caseStudy ? 'Cập nhật' : 'Tạo case study'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
