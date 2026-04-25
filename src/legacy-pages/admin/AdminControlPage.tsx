import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useControlCenter,
  type EmergencyMode,
  DEFAULT_WEIGHTS,
} from '@/contexts/ControlCenterContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  SlidersHorizontal, MapPin, Boxes, Star, RotateCcw, Save, AlertTriangle,
  Layers, Waves, Sun, Power, ArrowRight, Sparkles, Info, ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';

const formatPct = (v: number, total: number) => `${Math.round((v / Math.max(total, 1)) * 100)}%`;

export default function AdminControlPage() {
  const { config, setWeights, setInStockThreshold, setEmergency, reset } = useControlCenter();
  const [tab, setTab] = useState('algorithm');
  const [draftKwFlood, setDraftKwFlood] = useState('');
  const [draftKwDrought, setDraftKwDrought] = useState('');

  const w = config.weights;
  const total = w.distance + w.stock + w.reputation;
  const em = config.emergency;
  const emergencyOn = em.mode !== 'off';

  /* ---------- Algorithm helpers ---------- */
  const updateWeight = (key: 'distance' | 'stock' | 'reputation', val: number) =>
    setWeights({ ...w, [key]: val });

  const onSaveAlgorithm = () => {
    toast.success('Đã lưu trọng số thuật toán', {
      description: 'Áp dụng ngay cho mọi lượt tìm đại lý của nông dân.',
    });
  };

  const onResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    toast('Đã đặt lại trọng số mặc định');
  };

  /* ---------- Emergency helpers ---------- */
  const setMode = (mode: EmergencyMode) => {
    setEmergency({ mode });
    if (mode === 'off') toast('Đã tắt chế độ khẩn cấp');
    else
      toast.warning(`Đã bật chế độ ${mode === 'flood' ? 'LŨ LỤT' : 'HẠN HÁN'}`, {
        description: 'Trang chủ và mọi lượt tìm sẽ ưu tiên sản phẩm phù hợp.',
      });
  };

  const addKeyword = (kind: 'flood' | 'drought') => {
    const draft = (kind === 'flood' ? draftKwFlood : draftKwDrought).trim();
    if (!draft) return;
    const list = kind === 'flood' ? em.flood_keywords : em.drought_keywords;
    if (list.includes(draft)) return;
    setEmergency(
      kind === 'flood'
        ? { flood_keywords: [...list, draft] }
        : { drought_keywords: [...list, draft] },
    );
    if (kind === 'flood') setDraftKwFlood('');
    else setDraftKwDrought('');
  };

  const removeKeyword = (kind: 'flood' | 'drought', kw: string) => {
    const list = kind === 'flood' ? em.flood_keywords : em.drought_keywords;
    setEmergency(
      kind === 'flood'
        ? { flood_keywords: list.filter((k) => k !== kw) }
        : { drought_keywords: list.filter((k) => k !== kw) },
    );
  };

  return (
    <div className="container py-6 md:py-8 space-y-5">
      {/* ============== Header ============== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Algorithm & UI Command Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Tinh chỉnh thuật toán Geo-Routing, quản lý bố cục trang chủ, kích hoạt kịch bản khẩn cấp.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { reset(); toast('Đã reset toàn bộ Command Center'); }}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset toàn bộ
          </Button>
        </div>
      </div>

      {/* ============== Status row ============== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground uppercase">Thuật toán Geo-Routing</p>
              <p className="text-sm font-semibold">
                D {formatPct(w.distance, total)} · S {formatPct(w.stock, total)} · R {formatPct(w.reputation, total)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={emergencyOn ? 'border-destructive/40 bg-destructive/5' : ''}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${emergencyOn ? 'bg-destructive/15' : 'bg-muted'}`}>
              <ShieldAlert className={`w-5 h-5 ${emergencyOn ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground uppercase">Chế độ khẩn cấp</p>
              <p className="text-sm font-semibold">
                {em.mode === 'off' ? 'Tắt' : em.mode === 'flood' ? '🌊 Lũ lụt — đang BẬT' : '☀️ Hạn hán — đang BẬT'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Layers className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground uppercase">Cập nhật cuối</p>
              <p className="text-sm font-semibold">{new Date(config.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============== Tabs ============== */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="algorithm"><SlidersHorizontal className="w-4 h-4 mr-1.5" />Thuật toán</TabsTrigger>
          <TabsTrigger value="ui"><Layers className="w-4 h-4 mr-1.5" />Headless UI</TabsTrigger>
          <TabsTrigger value="emergency" className={emergencyOn ? 'data-[state=active]:bg-destructive/10' : ''}>
            <ShieldAlert className="w-4 h-4 mr-1.5" />Khẩn cấp
            {emergencyOn && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />}
          </TabsTrigger>
        </TabsList>

        {/* =========================================================
            TAB 1 — Algorithm Tuning
           ========================================================= */}
        <TabsContent value="algorithm" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" /> Trọng số xếp hạng đại lý
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Công thức: <code className="px-1 py-0.5 bg-muted rounded">Score = W₁·Khoảng cách + W₂·Tồn kho + W₃·Uy tín</code>
                . Trọng số tự chuẩn hóa về 100%. Áp dụng tức thì cho mọi widget "Đại lý gần bạn".
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* W1 — Distance */}
              <WeightSlider
                icon={<MapPin className="w-4 h-4 text-info" />}
                label="W₁ · Khoảng cách"
                helper="Đại lý càng gần càng được ưu tiên (Haversine + driving distance)"
                value={w.distance}
                pct={formatPct(w.distance, total)}
                onChange={(v) => updateWeight('distance', v)}
              />
              {/* W2 — Stock */}
              <WeightSlider
                icon={<Boxes className="w-4 h-4 text-success" />}
                label="W₂ · Tồn kho"
                helper="Còn hàng / mức ngưỡng → ưu tiên đại lý sẵn sàng giao ngay"
                value={w.stock}
                pct={formatPct(w.stock, total)}
                onChange={(v) => updateWeight('stock', v)}
              />
              {/* W3 — Reputation */}
              <WeightSlider
                icon={<Star className="w-4 h-4 text-warning" />}
                label="W₃ · Uy tín"
                helper="Composite: rating ⭐ + tổng đơn hàng + tuổi đại lý"
                value={w.reputation}
                pct={formatPct(w.reputation, total)}
                onChange={(v) => updateWeight('reputation', v)}
              />

              <Separator />

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label className="text-sm font-medium">Ngưỡng "còn hàng" (in-stock threshold)</Label>
                  <span className="font-mono text-xs text-primary">≥ {config.inStockThreshold} đơn vị</span>
                </div>
                <Slider value={[config.inStockThreshold]} min={0} max={20} step={1}
                  onValueChange={(v) => setInStockThreshold(v[0])} />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Đại lý có tồn kho ≥ giá trị này được gắn nhãn <Badge variant="secondary" className="text-[9px] mx-0.5">in_stock</Badge>
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={onResetWeights}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Mặc định
                </Button>
                <Button size="sm" onClick={onSaveAlgorithm}>
                  <Save className="w-3.5 h-3.5 mr-1" /> Lưu cấu hình
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Info className="w-3.5 h-3.5" /> Xem trước thứ tự xếp hạng (3 đại lý mẫu)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PreviewTable weights={w} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================================================
            TAB 2 — Headless UI
           ========================================================= */}
        <TabsContent value="ui" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Headless UI Control · Bố cục Trang chủ
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Bật / tắt và sắp xếp các khối: Bảng giá ticker, Thời tiết, Hero, Bản đồ, Sản phẩm nổi bật, Nhật ký.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-dashed bg-muted/20 p-5 text-center space-y-3">
                <p className="text-sm">
                  Bộ điều khiển bố cục đầy đủ (kéo-thả thứ tự, đổi màu accent, ghim sản phẩm) đã có sẵn ở{' '}
                  <Link to="/admin/homepage" className="text-primary font-semibold underline">
                    Quản lý Trang chủ
                  </Link>
                  .
                </p>
                <Button asChild size="sm">
                  <Link to="/admin/homepage">
                    Mở Quản lý Trang chủ <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================================================
            TAB 3 — Emergency Mode
           ========================================================= */}
        <TabsContent value="emergency" className="mt-4 space-y-4">
          <Card className={emergencyOn ? 'border-destructive/40' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${emergencyOn ? 'text-destructive' : 'text-muted-foreground'}`} />
                Kịch bản Khẩn cấp · Thiên tai
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Khi BẬT, trang chủ hiển thị banner đỏ và đẩy sản phẩm phù hợp lên vị trí #1 (100% màn hình đầu tiên).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Master switch */}
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${emergencyOn ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <Power className={`w-6 h-6 ${emergencyOn ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">Master Switch</p>
                    <p className="text-xs text-muted-foreground">
                      {emergencyOn ? 'Đang ưu tiên sản phẩm khẩn cấp toàn site' : 'Trang chủ hiển thị bình thường'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emergencyOn}
                  onCheckedChange={(on) => setMode(on ? 'flood' : 'off')}
                  className="scale-125 data-[state=checked]:bg-destructive"
                />
              </div>

              {/* Mode picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ModeCard
                  active={em.mode === 'flood'}
                  icon={<Waves className="w-6 h-6" />}
                  title="Lũ lụt / Ngập úng"
                  desc="Đẩy máy bơm xả lũ, bơm chìm, thoát nước lên top"
                  accent="info"
                  onClick={() => setMode(em.mode === 'flood' ? 'off' : 'flood')}
                />
                <ModeCard
                  active={em.mode === 'drought'}
                  icon={<Sun className="w-6 h-6" />}
                  title="Hạn hán / Thiếu nước"
                  desc="Đẩy hệ tưới nhỏ giọt, tiết kiệm nước lên top"
                  accent="warning"
                  onClick={() => setMode(em.mode === 'drought' ? 'off' : 'drought')}
                />
              </div>

              {/* Custom headline */}
              <div>
                <Label className="text-xs">Tiêu đề tuỳ chỉnh (tuỳ chọn)</Label>
                <Input
                  placeholder="Để trống để dùng mặc định theo mode"
                  value={em.customHeadline ?? ''}
                  onChange={(e) => setEmergency({ customHeadline: e.target.value })}
                />
              </div>

              <Separator />

              {/* Keywords editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KeywordEditor
                  title="Từ khoá nhận diện sản phẩm — Lũ lụt"
                  icon={<Waves className="w-4 h-4 text-info" />}
                  keywords={em.flood_keywords}
                  draft={draftKwFlood}
                  setDraft={setDraftKwFlood}
                  onAdd={() => addKeyword('flood')}
                  onRemove={(kw) => removeKeyword('flood', kw)}
                />
                <KeywordEditor
                  title="Từ khoá nhận diện sản phẩm — Hạn hán"
                  icon={<Sun className="w-4 h-4 text-warning" />}
                  keywords={em.drought_keywords}
                  draft={draftKwDrought}
                  setDraft={setDraftKwDrought}
                  onAdd={() => addKeyword('drought')}
                  onRemove={(kw) => removeKeyword('drought', kw)}
                />
              </div>

              <p className="text-[11px] text-muted-foreground">
                Hệ thống tìm trong <code>name + category + description + tags</code>. Sản phẩm khớp nhiều từ khoá nhất sẽ lên đầu.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ============== Sub-components ============== */

function WeightSlider({
  icon, label, helper, value, pct, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  helper: string;
  value: number;
  pct: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <div>
            <Label className="text-sm font-medium">{label}</Label>
            <p className="text-[11px] text-muted-foreground">{helper}</p>
          </div>
        </div>
        <span className="font-mono text-base font-bold text-primary tabular-nums">{pct}</span>
      </div>
      <Slider value={[value]} min={0} max={100} step={1} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

function ModeCard({
  active, icon, title, desc, accent, onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: 'info' | 'warning';
  onClick: () => void;
}) {
  const accentBorder = accent === 'info' ? 'border-info' : 'border-warning';
  const accentBg = accent === 'info' ? 'bg-info/10' : 'bg-warning/10';
  const accentText = accent === 'info' ? 'text-info' : 'text-warning';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-lg border-2 transition-all ${
        active ? `${accentBorder} ${accentBg} shadow-md` : 'border-border hover:border-primary/40'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentBg} ${accentText}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{title}</p>
            {active && <Badge className="text-[9px] bg-destructive">ĐANG BẬT</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
    </button>
  );
}

function KeywordEditor({
  title, icon, keywords, draft, setDraft, onAdd, onRemove,
}: {
  title: string;
  icon: React.ReactNode;
  keywords: string[];
  draft: string;
  setDraft: (v: string) => void;
  onAdd: () => void;
  onRemove: (kw: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs flex items-center gap-1.5">{icon}{title}</Label>
      <div className="flex gap-2">
        <Input
          placeholder="thêm từ khoá…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }}
          className="h-8"
        />
        <Button size="sm" variant="outline" onClick={onAdd}>Thêm</Button>
      </div>
      <div className="flex gap-1 flex-wrap min-h-[28px]">
        {keywords.length === 0 && <p className="text-[11px] text-muted-foreground italic">Chưa có từ khoá</p>}
        {keywords.map((kw) => (
          <Badge key={kw} variant="secondary" className="gap-1">
            {kw}
            <button onClick={() => onRemove(kw)} className="hover:text-destructive">×</button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

/* ============== Preview ranking table ============== */
function PreviewTable({ weights }: { weights: { distance: number; stock: number; reputation: number } }) {
  const samples = [
    { name: 'Đại lý A — Cách 5km', distance01: 0.10, stock01: 0.05, rep01: 0.10 }, // gần, sẵn hàng, uy tín
    { name: 'Đại lý B — Cách 25km', distance01: 0.50, stock01: 0.40, rep01: 0.20 },
    { name: 'Đại lý C — Cách 45km', distance01: 0.90, stock01: 0.80, rep01: 0.60 },
  ];
  const total = weights.distance + weights.stock + weights.reputation || 1;
  const wn = {
    d: weights.distance / total, s: weights.stock / total, r: weights.reputation / total,
  };
  const ranked = samples
    .map((x) => ({ ...x, score: wn.d * x.distance01 + wn.s * x.stock01 + wn.r * x.rep01 }))
    .sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-1.5">
      {ranked.map((r, i) => (
        <div key={r.name} className="flex items-center gap-3 p-2 rounded border bg-card text-xs">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
            i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            #{i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{r.name}</p>
            <p className="text-[10px] text-muted-foreground">
              dist={r.distance01.toFixed(2)} · stockGap={r.stock01.toFixed(2)} · repGap={r.rep01.toFixed(2)}
            </p>
          </div>
          <span className="font-mono text-primary">{r.score.toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}
