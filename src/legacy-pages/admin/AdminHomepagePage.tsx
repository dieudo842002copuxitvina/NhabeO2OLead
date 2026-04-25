import { useState } from 'react';
import { useHomepageConfig, BlockKey, MapMode, PromoBanner } from '@/contexts/HomepageConfigContext';
import { products } from '@/data/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  Layers, Megaphone, Type, Search, Map as MapIcon, Star, Flame, Pin,
  Plus, Trash2, RotateCcw, Eye, EyeOff, ArrowUp, ArrowDown,
} from 'lucide-react';
import { PROVINCES } from '@/lib/provinceGeo';

const BLOCK_THUMB: Record<BlockKey, string> = {
  ticker: 'linear-gradient(90deg,hsl(var(--foreground)) 0%,hsl(var(--foreground)) 100%)',
  weather: 'linear-gradient(135deg,hsl(var(--info)/.3),hsl(var(--primary)/.2))',
  hero: 'linear-gradient(135deg,hsl(var(--primary)/.25),hsl(var(--secondary)))',
  map: 'linear-gradient(135deg,hsl(var(--success)/.2),hsl(var(--info)/.25))',
  bento: 'linear-gradient(135deg,hsl(var(--accent)),hsl(var(--primary)/.2))',
  diary: 'linear-gradient(135deg,hsl(var(--warning)/.25),hsl(var(--accent)))',
};

function hslToHex(hsl?: string): string {
  if (!hsl) return '#2F855A';
  const m = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  if (!m) return '#2F855A';
  const h = +m[1] / 360, s = +m[2] / 100, l = +m[3] / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function AdminHomepagePage() {
  const { config, setConfig, updateBlock, resetDefaults } = useHomepageConfig();
  const [tab, setTab] = useState('layout');

  const moveBlock = (key: BlockKey, dir: -1 | 1) => {
    const sorted = [...config.blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(b => b.key === key);
    const swap = idx + dir;
    if (swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    setConfig({
      ...config,
      blocks: config.blocks.map(blk => {
        if (blk.key === a.key) return { ...blk, order: b.order };
        if (blk.key === b.key) return { ...blk, order: a.order };
        return blk;
      }),
    });
  };

  const save = () => toast.success('Đã lưu cấu hình trang chủ', { description: 'Áp dụng ngay trên trang chủ.' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" /> Quản lý Trang chủ
          </h1>
          <p className="text-sm text-muted-foreground">Tùy biến bố cục, nội dung, banner và dữ liệu hiển thị trên trang chủ.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { resetDefaults(); toast('Đã đặt lại mặc định'); }}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button size="sm" onClick={save}>Lưu thay đổi</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          <TabsTrigger value="layout"><Layers className="w-4 h-4 mr-1.5" />Bố cục</TabsTrigger>
          <TabsTrigger value="content"><Type className="w-4 h-4 mr-1.5" />Nội dung</TabsTrigger>
          <TabsTrigger value="promos"><Megaphone className="w-4 h-4 mr-1.5" />Banner</TabsTrigger>
          <TabsTrigger value="data"><MapIcon className="w-4 h-4 mr-1.5" />Dữ liệu</TabsTrigger>
          <TabsTrigger value="heatmap"><Flame className="w-4 h-4 mr-1.5" />Heatmap</TabsTrigger>
          <TabsTrigger value="seo"><Search className="w-4 h-4 mr-1.5" />SEO</TabsTrigger>
        </TabsList>

        {/* ===== LAYOUT ===== */}
        <TabsContent value="layout" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bố cục các khối trên trang chủ</CardTitle>
              <p className="text-xs text-muted-foreground">Kéo thứ tự bằng nút mũi tên hoặc chỉnh số. Tắt nút gạt để ẩn khối.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...config.blocks].sort((a, b) => a.order - b.order).map((b, i, arr) => (
                <div key={b.key} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition">
                  <div
                    className="w-16 h-12 rounded-md border shrink-0 flex items-center justify-center text-xl"
                    style={{
                      background: b.accentHsl
                        ? `linear-gradient(135deg, hsl(${b.accentHsl} / 0.35), hsl(${b.accentHsl} / 0.15))`
                        : BLOCK_THUMB[b.key],
                    }}
                  >
                    {b.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{b.label}</p>
                      {b.visible ? (
                        <Badge variant="secondary" className="text-[10px]"><Eye className="w-3 h-3 mr-1" />Hiện</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground"><EyeOff className="w-3 h-3 mr-1" />Ẩn</Badge>
                      )}
                      {b.accentHsl && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span className="w-3 h-3 rounded-full border" style={{ background: `hsl(${b.accentHsl})` }} />
                          {b.accentHsl}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Khối #{b.order} · key=<code>{b.key}</code></p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="color"
                      title="Màu accent (chiến dịch theo mùa)"
                      className="w-8 h-8 rounded border cursor-pointer p-0"
                      value={hslToHex(b.accentHsl)}
                      onChange={(e) => updateBlock(b.key, { accentHsl: hexToHsl(e.target.value) })}
                    />
                    {b.accentHsl && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="Bỏ màu tuỳ biến"
                        onClick={() => updateBlock(b.key, { accentHsl: undefined })}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                    <Input
                      type="number" min={1} value={b.order}
                      onChange={e => updateBlock(b.key, { order: Number(e.target.value) || 1 })}
                      className="w-16 h-8 text-center"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === 0}
                      onClick={() => moveBlock(b.key, -1)}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={i === arr.length - 1}
                      onClick={() => moveBlock(b.key, 1)}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Switch checked={b.visible} onCheckedChange={v => updateBlock(b.key, { visible: v })} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== CONTENT ===== */}
        <TabsContent value="content" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ticker giá nông sản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-sm">Chế độ:</Label>
                <Select
                  value={config.ticker.mode}
                  onValueChange={(v: 'auto' | 'manual') => setConfig({ ...config, ticker: { ...config.ticker, mode: v } })}
                >
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🤖 Tự động lấy giá</SelectItem>
                    <SelectItem value="manual">✍️ Nhập thủ công</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {config.ticker.mode === 'manual' && (
                <div>
                  <Label className="text-xs">Nội dung chạy thủ công</Label>
                  <Textarea
                    value={config.ticker.manualText}
                    onChange={e => setConfig({ ...config, ticker: { ...config.ticker, manualText: e.target.value } })}
                    rows={2} placeholder="VD: Khuyến mãi tháng 4 — giảm 15% máy bơm Grundfos…"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Hero Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Headline</Label>
                <Input value={config.hero.headline}
                  onChange={e => setConfig({ ...config, hero: { ...config.hero, headline: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Sub-headline</Label>
                <Textarea rows={2} value={config.hero.subheadline}
                  onChange={e => setConfig({ ...config, hero: { ...config.hero, subheadline: e.target.value } })} />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">CTA Label</Label>
                  <Input value={config.hero.ctaLabel}
                    onChange={e => setConfig({ ...config, hero: { ...config.hero, ctaLabel: e.target.value } })} />
                </div>
                <div>
                  <Label className="text-xs">CTA Link</Label>
                  <Input value={config.hero.ctaLink}
                    onChange={e => setConfig({ ...config, hero: { ...config.hero, ctaLink: e.target.value } })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== PROMOS ===== */}
        <TabsContent value="promos" className="space-y-3 mt-4">
          <PromoManager />
        </TabsContent>

        {/* ===== DATA ===== */}
        <TabsContent value="data" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MapIcon className="w-4 h-4" /> Cấu hình bản đồ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Chế độ bản đồ</Label>
                  <Select
                    value={config.map.mode}
                    onValueChange={(v: MapMode) => setConfig({ ...config, map: { ...config.map, mode: v } })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ Sáng (Voyager)</SelectItem>
                      <SelectItem value="dark">🌙 Tối (Dark Matter)</SelectItem>
                      <SelectItem value="satellite">🛰️ Vệ tinh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Bán kính quét đại lý mặc định (km)</Label>
                  <Input type="number" min={5} max={200} value={config.map.defaultRadiusKm}
                    onChange={e => setConfig({ ...config, map: { ...config.map, defaultRadiusKm: Number(e.target.value) || 50 } })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Star className="w-4 h-4" /> Sản phẩm nổi bật (Bento Grid)</CardTitle>
              <p className="text-xs text-muted-foreground">Click để ghim sản phẩm lên trang chủ. Bỏ trống = dùng "best seller" tự động.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                {products.map(p => {
                  const pinned = config.featuredProductIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        const next = pinned
                          ? config.featuredProductIds.filter(id => id !== p.id)
                          : [...config.featuredProductIds, p.id];
                        setConfig({ ...config, featuredProductIds: next });
                      }}
                      className={`flex items-center gap-2 p-2 rounded-md border text-left transition ${
                        pinned ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${pinned ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                        {pinned && <Star className="w-3 h-3 text-primary-foreground fill-current" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.category_id}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Đã ghim: <strong>{config.featuredProductIds.length}</strong> sản phẩm</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== HEATMAP SENSITIVITY ===== */}
        <TabsContent value="heatmap" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Flame className="w-4 h-4 text-destructive" /> Độ nhạy bản đồ nhiệt</CardTitle>
              <p className="text-xs text-muted-foreground">Áp dụng cho trang <code>/thi-truong</code>.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <Label>Bán kính điểm (Radius)</Label>
                  <span className="font-mono text-primary">{config.heatmap.radius}px</span>
                </div>
                <Slider value={[config.heatmap.radius]} min={10} max={80} step={1}
                  onValueChange={v => setConfig({ ...config, heatmap: { ...config.heatmap, radius: v[0] } })} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <Label>Độ mờ (Blur)</Label>
                  <span className="font-mono text-primary">{config.heatmap.blur}px</span>
                </div>
                <Slider value={[config.heatmap.blur]} min={5} max={50} step={1}
                  onValueChange={v => setConfig({ ...config, heatmap: { ...config.heatmap, blur: v[0] } })} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <Label>Cường độ tối đa</Label>
                  <span className="font-mono text-primary">{config.heatmap.maxIntensity.toFixed(2)}x</span>
                </div>
                <Slider value={[config.heatmap.maxIntensity * 100]} min={50} max={300} step={5}
                  onValueChange={v => setConfig({ ...config, heatmap: { ...config.heatmap, maxIntensity: v[0] / 100 } })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Pin className="w-4 h-4 text-primary" /> Ghim vùng thị trường trọng điểm</CardTitle>
              <p className="text-xs text-muted-foreground">Hiển thị marker đặc biệt trên Heatmap thị trường.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Bật ghim vùng trọng điểm</Label>
                <Switch checked={config.pinnedHotspot.enabled}
                  onCheckedChange={v => setConfig({ ...config, pinnedHotspot: { ...config.pinnedHotspot, enabled: v } })} />
              </div>
              <div>
                <Label className="text-xs">Tỉnh / vùng</Label>
                <Select value={config.pinnedHotspot.province}
                  onValueChange={v => setConfig({ ...config, pinnedHotspot: { ...config.pinnedHotspot, province: v } })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map(p => <SelectItem key={p.name} value={p.name}>{p.name} — {p.region}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ghi chú trên popup</Label>
                <Textarea rows={2} value={config.pinnedHotspot.note}
                  onChange={e => setConfig({ ...config, pinnedHotspot: { ...config.pinnedHotspot, note: e.target.value } })}
                  placeholder="VD: Sầu riêng tăng giá kỷ lục — cơ hội bán hệ thống tưới" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SEO ===== */}
        <TabsContent value="seo" className="space-y-3 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Meta SEO trang chủ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Title (≤ 60 ký tự) — hiện: {config.seo.title.length}</Label>
                <Input value={config.seo.title}
                  onChange={e => setConfig({ ...config, seo: { ...config.seo, title: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Description (≤ 160 ký tự) — hiện: {config.seo.description.length}</Label>
                <Textarea rows={3} value={config.seo.description}
                  onChange={e => setConfig({ ...config, seo: { ...config.seo, description: e.target.value } })} />
              </div>
              <Separator />
              <div className="rounded-lg border p-3 bg-muted/30">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Preview Google</p>
                <p className="text-info text-base leading-tight">{config.seo.title}</p>
                <p className="text-success text-xs mt-0.5">https://farm-supply-chain.lovable.app/</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{config.seo.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PromoManager() {
  const { config, setConfig } = useHomepageConfig();
  const [draft, setDraft] = useState<PromoBanner>({
    id: '', imageUrl: '', link: '', alt: '', expiresAt: '', active: true,
  });

  const add = () => {
    if (!draft.imageUrl || !draft.expiresAt) {
      toast.error('Cần nhập URL ảnh và ngày hết hạn');
      return;
    }
    const item: PromoBanner = { ...draft, id: `promo-${Date.now()}` };
    setConfig({ ...config, promos: [...config.promos, item] });
    setDraft({ id: '', imageUrl: '', link: '', alt: '', expiresAt: '', active: true });
    toast.success('Đã thêm banner');
  };

  const remove = (id: string) =>
    setConfig({ ...config, promos: config.promos.filter(p => p.id !== id) });
  const toggle = (id: string) =>
    setConfig({
      ...config,
      promos: config.promos.map(p => (p.id === id ? { ...p, active: !p.active } : p)),
    });

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4" /> Tạo banner thủ công</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">URL ảnh banner</Label>
              <Input value={draft.imageUrl} onChange={e => setDraft({ ...draft, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Link đích khi click</Label>
              <Input value={draft.link} onChange={e => setDraft({ ...draft, link: e.target.value })} placeholder="/products?category=..." />
            </div>
            <div>
              <Label className="text-xs">Alt text (mô tả)</Label>
              <Input value={draft.alt} onChange={e => setDraft({ ...draft, alt: e.target.value })} placeholder="Khuyến mãi tháng 4" />
            </div>
            <div>
              <Label className="text-xs">Ngày hết hạn</Label>
              <Input type="datetime-local" value={draft.expiresAt} onChange={e => setDraft({ ...draft, expiresAt: e.target.value })} />
            </div>
          </div>
          <Button onClick={add} size="sm"><Plus className="w-4 h-4 mr-1" /> Thêm banner</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Banner đã tạo ({config.promos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {config.promos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Chưa có banner nào.</p>
          ) : (
            <div className="space-y-2">
              {config.promos.map(p => {
                const expired = new Date(p.expiresAt).getTime() < Date.now();
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg border">
                    <div className="w-20 h-12 rounded bg-muted overflow-hidden shrink-0">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.alt} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{p.alt || p.imageUrl}</p>
                      <p className="text-[11px] text-muted-foreground truncate">→ {p.link || '(không link)'}</p>
                      <p className="text-[11px]">
                        {expired ? <Badge variant="destructive" className="text-[10px]">Hết hạn</Badge>
                          : <span className="text-muted-foreground">Hết hạn: {new Date(p.expiresAt).toLocaleString('vi-VN')}</span>}
                      </p>
                    </div>
                    <Switch checked={p.active && !expired} disabled={expired} onCheckedChange={() => toggle(p.id)} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
