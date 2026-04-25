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
import { Plus, Trash2, Video, FileText, Image as ImageIcon, Youtube, Sprout, Mountain } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PimProduct, ProductAttribute, MediaItem, SpecialtyGroup, CropTag, TerrainTag,
  EMPTY_MEDIA, slugify, fetchCropTags, fetchTerrainTags, youtubeId,
} from '@/lib/pim';
import { uploadProductDoc, uploadToCmsMedia } from '@/lib/cms';
import MediaUploadField from './MediaUploadField';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: PimProduct | null;
  specialtyGroups: SpecialtyGroup[];
  onSaved: () => void;
}

const blank = (): Omit<PimProduct, 'id' | 'created_at' | 'updated_at'> => ({
  slug: '', name: '', category: '', specialty_group_key: null,
  description: '', price: 0, unit: 'cái', image: '', stock: 0,
  attributes: [], media: { ...EMPTY_MEDIA },
  tags: [], crop_tags: [], terrain_tags: [], active: true,
});

export default function ProductEditDialog({ open, onOpenChange, product, specialtyGroups, onSaved }: Props) {
  const [form, setForm] = useState(blank());
  const [tagInput, setTagInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [crops, setCrops] = useState<CropTag[]>([]);
  const [terrains, setTerrains] = useState<TerrainTag[]>([]);

  useEffect(() => {
    if (open) {
      setForm(product ? { ...product } : blank());
      setTagInput(''); setImageInput('');
      Promise.all([fetchCropTags(), fetchTerrainTags()])
        .then(([c, t]) => { setCrops(c); setTerrains(t); })
        .catch(() => {});
    }
  }, [open, product]);

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Attributes
  const addAttribute = () =>
    setForm((f) => ({
      ...f,
      attributes: [...f.attributes, { group: 'Thông số chính', key: '', label: '', value: '', unit: '' }],
    }));
  const updateAttribute = (i: number, patch: Partial<ProductAttribute>) =>
    setForm((f) => ({ ...f, attributes: f.attributes.map((a, idx) => (idx === i ? { ...a, ...patch } : a)) }));
  const removeAttribute = (i: number) =>
    setForm((f) => ({ ...f, attributes: f.attributes.filter((_, idx) => idx !== i) }));

  // Media
  const addMedia = (kind: 'videos' | 'pdfs', item: MediaItem = { title: '', url: '' }) =>
    setForm((f) => ({ ...f, media: { ...f.media, [kind]: [...f.media[kind], item] } }));
  const updateMedia = (kind: 'videos' | 'pdfs', i: number, patch: Partial<MediaItem>) =>
    setForm((f) => ({
      ...f,
      media: { ...f.media, [kind]: f.media[kind].map((m, idx) => (idx === i ? { ...m, ...patch } : m)) },
    }));
  const removeMedia = (kind: 'videos' | 'pdfs', i: number) =>
    setForm((f) => ({ ...f, media: { ...f.media, [kind]: f.media[kind].filter((_, idx) => idx !== i) } }));
  const addImageUrl = () => {
    const url = imageInput.trim();
    if (!url) return;
    setForm((f) => ({ ...f, media: { ...f.media, images: [...f.media.images, url] } }));
    setImageInput('');
  };
  const pushImage = (url: string) =>
    setForm((f) => ({ ...f, media: { ...f.media, images: [...f.media.images, url] } }));
  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, media: { ...f.media, images: f.media.images.filter((_, idx) => idx !== i) } }));

  // Tags
  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };
  const removeTag = (t: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const toggleArr = (k: 'crop_tags' | 'terrain_tags', key: string) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(key) ? f[k].filter((x) => x !== key) : [...f[k], key],
    }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Tên sản phẩm bắt buộc'); return; }

    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.name),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      attributes: form.attributes.filter((a) => a.label.trim() && a.value.trim()),
      media: {
        videos: form.media.videos.filter((m) => m.url.trim()),
        pdfs: form.media.pdfs.filter((m) => m.url.trim()),
        images: form.media.images.filter((u) => u.trim()),
      },
    };

    const dbRow = {
      slug: payload.slug, name: payload.name, category: payload.category,
      specialty_group_key: payload.specialty_group_key, description: payload.description,
      price: payload.price, unit: payload.unit, image: payload.image,
      stock: payload.stock,
      attributes: payload.attributes as unknown as never,
      media: payload.media as unknown as never,
      tags: payload.tags, crop_tags: payload.crop_tags, terrain_tags: payload.terrain_tags,
      active: payload.active,
    };

    setSaving(true);
    try {
      if (product) {
        const { error } = await supabase.from('products').update(dbRow).eq('id', product.id);
        if (error) throw error;
        toast.success('Đã cập nhật sản phẩm');
      } else {
        const { error } = await supabase.from('products').insert(dbRow);
        if (error) throw error;
        toast.success('Đã tạo sản phẩm');
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(`Lưu thất bại: ${e instanceof Error ? e.message : 'Lỗi không xác định'}`);
    } finally {
      setSaving(false);
    }
  };

  const totalTags = form.crop_tags.length + form.terrain_tags.length + form.tags.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {product ? `Sửa: ${product.name}` : 'Tạo sản phẩm mới'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Cơ bản</TabsTrigger>
            <TabsTrigger value="attrs">Thông số ({form.attributes.length})</TabsTrigger>
            <TabsTrigger value="media">
              Media ({form.media.videos.length + form.media.pdfs.length + form.media.images.length})
            </TabsTrigger>
            <TabsTrigger value="meta">Tags ({totalTags})</TabsTrigger>
          </TabsList>

          {/* Basic */}
          <TabsContent value="basic" className="space-y-3 pt-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Tên sản phẩm *</Label>
                <Input value={form.name} onChange={(e) => setField('name', e.target.value)} />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={form.slug} placeholder={slugify(form.name) || 'auto-generated'}
                  onChange={(e) => setField('slug', e.target.value)} />
              </div>
              <div>
                <Label>Danh mục</Label>
                <Input value={form.category} placeholder="vd: Hệ thống tưới"
                  onChange={(e) => setField('category', e.target.value)} />
              </div>
              <div>
                <Label>Nhóm chuyên môn (O2O matching)</Label>
                <Select value={form.specialty_group_key ?? '__none__'}
                  onValueChange={(v) => setField('specialty_group_key', v === '__none__' ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Chọn nhóm…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Không gán —</SelectItem>
                    {specialtyGroups.map((g) => (
                      <SelectItem key={g.key} value={g.key}>
                        {g.icon ? `${g.icon} ` : ''}{g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Giá nền tảng (VND)</Label>
                <Input type="number" value={form.price}
                  onChange={(e) => setField('price', Number(e.target.value))} />
              </div>
              <div>
                <Label>Đơn vị</Label>
                <Input value={form.unit} onChange={(e) => setField('unit', e.target.value)} />
              </div>
              <div>
                <Label>Tồn kho</Label>
                <Input type="number" value={form.stock}
                  onChange={(e) => setField('stock', Number(e.target.value))} />
              </div>
              <div>
                <Label>Ảnh đại diện</Label>
                <div className="flex gap-2">
                  <Input value={form.image ?? ''} placeholder="https://..."
                    onChange={(e) => setField('image', e.target.value)} />
                  <MediaUploadField
                    label="Tải lên" accept="image/*"
                    uploadFn={(f) => uploadToCmsMedia(f, 'products')}
                    onUploaded={(url) => setField('image', url)}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea rows={4} value={form.description ?? ''}
                onChange={(e) => setField('description', e.target.value)} />
            </div>
          </TabsContent>

          {/* Attributes */}
          <TabsContent value="attrs" className="space-y-3 pt-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Thông số kỹ thuật JSONB không giới hạn — gợi ý nhóm: "Thông số chính", "Vật lý", "Điện".
              </p>
              <Button size="sm" variant="outline" onClick={addAttribute}>
                <Plus className="w-3 h-3 mr-1" /> Thêm thông số
              </Button>
            </div>
            {form.attributes.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
                Chưa có thông số. Bấm "Thêm thông số" để bắt đầu.
              </div>
            )}
            {form.attributes.map((a, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-muted/30">
                <div className="col-span-3">
                  <Label className="text-[10px]">Nhóm</Label>
                  <Input value={a.group} onChange={(e) => updateAttribute(i, { group: e.target.value })} />
                </div>
                <div className="col-span-3">
                  <Label className="text-[10px]">Tên thông số</Label>
                  <Input value={a.label} onChange={(e) => updateAttribute(i, { label: e.target.value })}
                    placeholder="vd: Cột áp" />
                </div>
                <div className="col-span-3">
                  <Label className="text-[10px]">Giá trị</Label>
                  <Input value={a.value} onChange={(e) => updateAttribute(i, { value: e.target.value })}
                    placeholder="vd: 50" />
                </div>
                <div className="col-span-2">
                  <Label className="text-[10px]">Đơn vị</Label>
                  <Input value={a.unit ?? ''} onChange={(e) => updateAttribute(i, { unit: e.target.value })}
                    placeholder="m" />
                </div>
                <div className="col-span-1">
                  <Button size="icon" variant="ghost" onClick={() => removeAttribute(i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Media Hub */}
          <TabsContent value="media" className="space-y-5 pt-3">
            {/* Videos */}
            <section>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm flex items-center gap-1">
                  <Youtube className="w-4 h-4 text-destructive" /> Video YouTube/Vimeo (thực tế thi công)
                </h4>
                <Button size="sm" variant="outline" onClick={() => addMedia('videos')}>
                  <Plus className="w-3 h-3 mr-1" /> Thêm video
                </Button>
              </div>
              {form.media.videos.map((v, i) => {
                const yt = youtubeId(v.url);
                return (
                  <div key={i} className="space-y-2 mb-3 p-2 border rounded-lg bg-muted/20">
                    <div className="grid grid-cols-12 gap-2">
                      <Input className="col-span-4" placeholder="Tiêu đề (vd: Lắp đặt tại Đắk Lắk)"
                        value={v.title} onChange={(e) => updateMedia('videos', i, { title: e.target.value })} />
                      <Input className="col-span-7" placeholder="https://youtu.be/..."
                        value={v.url} onChange={(e) => updateMedia('videos', i, { url: e.target.value })} />
                      <Button size="icon" variant="ghost" onClick={() => removeMedia('videos', i)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    {yt && (
                      <div className="aspect-video w-full max-w-xs rounded overflow-hidden bg-black">
                        <iframe src={`https://www.youtube.com/embed/${yt}`} className="w-full h-full"
                          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture" />
                      </div>
                    )}
                  </div>
                );
              })}
            </section>

            {/* PDFs */}
            <section>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm flex items-center gap-1">
                  <FileText className="w-4 h-4" /> File PDF (Catalogue/Hướng dẫn lắp đặt)
                </h4>
                <div className="flex gap-2">
                  <MediaUploadField
                    label="Upload PDF" accept="application/pdf"
                    uploadFn={(f) => uploadProductDoc(f, form.slug || slugify(form.name))}
                    onUploaded={(url, file) => addMedia('pdfs', { title: file.name.replace(/\.pdf$/i, ''), url })}
                  />
                  <Button size="sm" variant="outline" onClick={() => addMedia('pdfs')}>
                    <Plus className="w-3 h-3 mr-1" /> URL thủ công
                  </Button>
                </div>
              </div>
              {form.media.pdfs.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Chưa có tài liệu. Upload PDF hoặc dán URL.</p>
              )}
              {form.media.pdfs.map((p, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                  <Input className="col-span-4" placeholder="Tên tài liệu"
                    value={p.title} onChange={(e) => updateMedia('pdfs', i, { title: e.target.value })} />
                  <Input className="col-span-6" placeholder="URL .pdf"
                    value={p.url} onChange={(e) => updateMedia('pdfs', i, { url: e.target.value })} />
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                    className="col-span-1 flex items-center justify-center text-xs text-primary hover:underline">
                    Mở
                  </a>
                  <Button size="icon" variant="ghost" onClick={() => removeMedia('pdfs', i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </section>

            {/* Image gallery */}
            <section>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" /> Album ảnh
                </h4>
                <MediaUploadField
                  label="Upload ảnh" accept="image/*"
                  uploadFn={(f) => uploadToCmsMedia(f, 'products')}
                  onUploaded={(url) => pushImage(url)}
                />
              </div>
              <div className="flex gap-2 mb-2">
                <Input placeholder="hoặc dán URL ảnh rồi Enter…" value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }} />
                <Button variant="outline" onClick={addImageUrl}>Thêm URL</Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {form.media.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
                    <button onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Tags */}
          <TabsContent value="meta" className="space-y-4 pt-3">
            <div>
              <Label className="flex items-center gap-1.5">
                <Sprout className="w-4 h-4 text-primary" /> Loại cây trồng
                <span className="text-xs text-muted-foreground font-normal">(phục vụ gợi ý)</span>
              </Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {crops.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Chưa có taxonomy. Thêm tại bảng crop_tags.</p>
                )}
                {crops.map((c) => {
                  const on = form.crop_tags.includes(c.key);
                  return (
                    <Badge key={c.key} variant={on ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                      onClick={() => toggleArr('crop_tags', c.key)}>
                      {c.icon ? `${c.icon} ` : ''}{c.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1.5">
                <Mountain className="w-4 h-4 text-primary" /> Địa hình phù hợp
              </Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {terrains.map((t) => {
                  const on = form.terrain_tags.includes(t.key);
                  return (
                    <Badge key={t.key} variant={on ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
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
                <Input placeholder="best seller, mới về…" value={tagInput}
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

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch checked={form.active} onCheckedChange={(v) => setField('active', v)} />
              <div>
                <Label>Hoạt động</Label>
                <p className="text-xs text-muted-foreground">Tắt để ẩn khỏi catalog public</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu…' : product ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
