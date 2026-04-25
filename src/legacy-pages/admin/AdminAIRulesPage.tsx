import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Sparkles, CloudRain, TrendingUp, Sliders, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  getRules, getGeoWeights, saveRule, deleteRule, toggleRule, updateGeoWeights,
  evaluateWeatherRule, evaluatePriceRule, subscribeRules,
  type WeatherRule, type PriceRule, type AnyRule,
} from '@/lib/aiRules';
import { toast } from 'sonner';

const REGIONS = ['Tây Nguyên', 'Đồng Bằng Sông Cửu Long', 'Đông Nam Bộ', 'Tây Bắc', 'Toàn quốc'];
const COMMODITIES = ['Cà phê', 'Sầu riêng', 'Tiêu', 'Lúa', 'Cao su'];

export default function AdminAIRulesPage() {
  const [rules, setRules] = useState<AnyRule[]>(() => getRules());
  const [geo, setGeo] = useState(() => getGeoWeights());

  useEffect(() => {
    const unsub = subscribeRules(() => {
      setRules(getRules());
      setGeo(getGeoWeights());
    });
    return unsub;
  }, []);

  const weatherRules = useMemo(() => rules.filter((r): r is WeatherRule => r.type === 'weather'), [rules]);
  const priceRules = useMemo(() => rules.filter((r): r is PriceRule => r.type === 'price'), [rules]);

  return (
    <div className="container py-6 max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" /> AI Rules Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổ Vận hành Dữ liệu — thiết lập trigger tự động đẩy banner, popup và tinh chỉnh thuật toán Geo-matching.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5"><CheckCircle2 className="w-3 h-3 text-success" /> {rules.filter(r => r.status === 'active').length} luật đang hoạt động</Badge>
      </div>

      <Tabs defaultValue="weather" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="weather"><CloudRain className="w-4 h-4 mr-1.5" /> Thời tiết ({weatherRules.length})</TabsTrigger>
          <TabsTrigger value="price"><TrendingUp className="w-4 h-4 mr-1.5" /> Giá thị trường ({priceRules.length})</TabsTrigger>
          <TabsTrigger value="algorithm"><Sliders className="w-4 h-4 mr-1.5" /> Thuật toán Geo</TabsTrigger>
        </TabsList>

        <TabsContent value="weather" className="space-y-4">
          <WeatherRulesTab rules={weatherRules} />
        </TabsContent>

        <TabsContent value="price" className="space-y-4">
          <PriceRulesTab rules={priceRules} />
        </TabsContent>

        <TabsContent value="algorithm" className="space-y-4">
          <AlgorithmTuningTab geo={geo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===================== Weather Tab =====================

function WeatherRulesTab({ rules }: { rules: WeatherRule[] }) {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Trigger dựa trên dữ liệu thời tiết (lượng mưa). Khi đáp ứng điều kiện → banner tự động xuất hiện trên trang chủ.
        </p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" /> {showForm ? 'Đóng' : 'Tạo luật mới'}
        </Button>
      </div>

      {showForm && <WeatherRuleForm onSaved={() => setShowForm(false)} />}

      <div className="grid gap-3">
        {rules.map(r => {
          const evalRes = evaluateWeatherRule(r);
          return (
            <Card key={r.id} className={evalRes.triggered && r.status === 'active' ? 'border-warning/60 bg-warning/5' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-bold">{r.name}</h3>
                      <Badge variant={r.status === 'active' ? 'default' : 'secondary'}>{r.status === 'active' ? 'Đang chạy' : 'Tạm dừng'}</Badge>
                      {evalRes.triggered && r.status === 'active' && (
                        <Badge className="bg-warning text-warning-foreground gap-1"><AlertCircle className="w-3 h-3" /> ĐANG KÍCH HOẠT</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Nếu</strong> lượng mưa &lt; <strong>{r.rainfallMmMax}mm</strong> trong <strong>{r.consecutiveDays} ngày</strong> liên tiếp tại <strong>{r.region}</strong>
                      {' → '}đẩy banner: <em>"{r.bannerTitle}"</em>
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Hiện tại: {evalRes.dryDays}/{r.consecutiveDays} ngày khô (mock weather feed)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={r.status === 'active'} onCheckedChange={() => toggleRule(r.id)} />
                    <Button size="icon" variant="ghost" onClick={() => { deleteRule(r.id); toast.success('Đã xoá luật'); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rules.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Chưa có luật thời tiết nào.</p>}
      </div>
    </>
  );
}

function WeatherRuleForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState('');
  const [rainfall, setRainfall] = useState('5');
  const [days, setDays] = useState('10');
  const [region, setRegion] = useState('Tây Nguyên');
  const [bannerTitle, setBannerTitle] = useState('Giải pháp tưới chống hạn');
  const [bannerCta, setBannerCta] = useState('Xem giải pháp');
  const [bannerCtaTo, setBannerCtaTo] = useState('/giai-phap');

  const submit = () => {
    if (!name.trim()) { toast.error('Vui lòng nhập tên luật'); return; }
    saveRule({
      id: `rule-weather-${Date.now()}`,
      type: 'weather', status: 'active', name,
      rainfallMmMax: Number(rainfall), consecutiveDays: Number(days), region,
      bannerTitle, bannerCta, bannerCtaTo,
      createdAt: new Date().toISOString(),
    });
    toast.success('Đã tạo luật thời tiết');
    onSaved();
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader><CardTitle className="text-base">Tạo luật Thời tiết</CardTitle></CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><Label>Tên luật</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Hạn hán Tây Nguyên Q1" /></div>
        <div><Label>Lượng mưa &lt; (mm)</Label><Input type="number" value={rainfall} onChange={e => setRainfall(e.target.value)} /></div>
        <div><Label>Số ngày liên tiếp</Label><Input type="number" value={days} onChange={e => setDays(e.target.value)} /></div>
        <div><Label>Khu vực</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={region} onChange={e => setRegion(e.target.value)}>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div><Label>Link CTA</Label><Input value={bannerCtaTo} onChange={e => setBannerCtaTo(e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>Tiêu đề banner</Label><Input value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>Nhãn nút</Label><Input value={bannerCta} onChange={e => setBannerCta(e.target.value)} /></div>
        <div className="sm:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={onSaved}>Huỷ</Button><Button onClick={submit}>Lưu luật</Button></div>
      </CardContent>
    </Card>
  );
}

// ===================== Price Tab =====================

function PriceRulesTab({ rules }: { rules: PriceRule[] }) {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Trigger theo giá nông sản. Khi vượt ngưỡng → popup xuất hiện cho người dùng vùng trồng tương ứng.</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4 mr-1" /> {showForm ? 'Đóng' : 'Tạo luật mới'}</Button>
      </div>

      {showForm && <PriceRuleForm onSaved={() => setShowForm(false)} />}

      <div className="grid gap-3">
        {rules.map(r => {
          const evalRes = evaluatePriceRule(r);
          return (
            <Card key={r.id} className={evalRes.triggered && r.status === 'active' ? 'border-success/60 bg-success/5' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-bold">{r.name}</h3>
                      <Badge variant={r.status === 'active' ? 'default' : 'secondary'}>{r.status === 'active' ? 'Đang chạy' : 'Tạm dừng'}</Badge>
                      {evalRes.triggered && r.status === 'active' && (
                        <Badge className="bg-success text-success-foreground gap-1"><AlertCircle className="w-3 h-3" /> ĐANG KÍCH HOẠT</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Nếu</strong> giá <strong>{r.commodity}</strong> tăng &gt; <strong>{r.changePctMin}%</strong> trong {r.windowDays} ngày
                      {' → '}popup cho vùng <strong>{r.targetCropRegion}</strong>: <em>"{r.popupTitle}"</em>
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      Biến động hiện tại: <span className={evalRes.changePct > 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>{evalRes.changePct > 0 ? '+' : ''}{evalRes.changePct}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={r.status === 'active'} onCheckedChange={() => toggleRule(r.id)} />
                    <Button size="icon" variant="ghost" onClick={() => { deleteRule(r.id); toast.success('Đã xoá luật'); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {rules.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Chưa có luật giá nào.</p>}
      </div>
    </>
  );
}

function PriceRuleForm({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState('');
  const [commodity, setCommodity] = useState('Cà phê');
  const [changePct, setChangePct] = useState('20');
  const [windowDays, setWindowDays] = useState('7');
  const [region, setRegion] = useState('Tây Nguyên');
  const [popupTitle, setPopupTitle] = useState('Gói nâng cấp hệ thống tưới tự động');
  const [popupBody, setPopupBody] = useState('Giá đang tăng mạnh — đây là thời điểm vàng để đầu tư hệ thống tưới tự động.');
  const [popupCta, setPopupCta] = useState('Xem gói nâng cấp');
  const [popupCtaTo, setPopupCtaTo] = useState('/products?category=Hệ thống tưới');

  const submit = () => {
    if (!name.trim()) { toast.error('Vui lòng nhập tên luật'); return; }
    saveRule({
      id: `rule-price-${Date.now()}`,
      type: 'price', status: 'active', name,
      commodity, changePctMin: Number(changePct), windowDays: Number(windowDays),
      popupTitle, popupBody, popupCta, popupCtaTo,
      targetCropRegion: region,
      createdAt: new Date().toISOString(),
    });
    toast.success('Đã tạo luật giá');
    onSaved();
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader><CardTitle className="text-base">Tạo luật Giá thị trường</CardTitle></CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><Label>Tên luật</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Cà phê tăng 20%/tuần" /></div>
        <div><Label>Nông sản</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={commodity} onChange={e => setCommodity(e.target.value)}>
            {COMMODITIES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div><Label>Mức tăng &gt; (%)</Label><Input type="number" value={changePct} onChange={e => setChangePct(e.target.value)} /></div>
        <div><Label>Cửa sổ (ngày)</Label><Input type="number" value={windowDays} onChange={e => setWindowDays(e.target.value)} /></div>
        <div><Label>Vùng trồng đích</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={region} onChange={e => setRegion(e.target.value)}>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2"><Label>Tiêu đề popup</Label><Input value={popupTitle} onChange={e => setPopupTitle(e.target.value)} /></div>
        <div className="sm:col-span-2"><Label>Nội dung popup</Label><Input value={popupBody} onChange={e => setPopupBody(e.target.value)} /></div>
        <div><Label>Nhãn nút</Label><Input value={popupCta} onChange={e => setPopupCta(e.target.value)} /></div>
        <div><Label>Link CTA</Label><Input value={popupCtaTo} onChange={e => setPopupCtaTo(e.target.value)} /></div>
        <div className="sm:col-span-2 flex justify-end gap-2"><Button variant="ghost" onClick={onSaved}>Huỷ</Button><Button onClick={submit}>Lưu luật</Button></div>
      </CardContent>
    </Card>
  );
}

// ===================== Algorithm Tab =====================

function AlgorithmTuningTab({ geo }: { geo: ReturnType<typeof getGeoWeights> }) {
  const [distance, setDistance] = useState(geo.distanceWeight);
  const [boost, setBoost] = useState(geo.inStockBoost);

  useEffect(() => { setDistance(geo.distanceWeight); setBoost(geo.inStockBoost); }, [geo.distanceWeight, geo.inStockBoost]);

  const reputation = 100 - distance;

  const save = () => {
    updateGeoWeights({ distanceWeight: distance, reputationWeight: reputation, inStockBoost: boost });
    toast.success('Đã cập nhật trọng số Geo-matching');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sliders className="w-5 h-5" /> Tinh chỉnh thuật toán Geo-matching</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <div className="flex justify-between text-sm mb-3">
            <span>📍 Ưu tiên <strong>khoảng cách gần</strong>: <span className="text-primary font-bold">{distance}%</span></span>
            <span>⭐ Ưu tiên <strong>uy tín / tồn kho</strong>: <span className="text-primary font-bold">{reputation}%</span></span>
          </div>
          <Slider value={[distance]} onValueChange={v => setDistance(v[0])} min={0} max={100} step={5} />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Đại lý xa nhưng uy tín hơn</span>
            <span>Đại lý gần nhất luôn đầu tiên</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-3">
            <span>📦 Hệ số ưu tiên <strong>còn hàng</strong>: <span className="text-primary font-bold">{boost.toFixed(1)}x</span></span>
          </div>
          <Slider value={[boost * 10]} onValueChange={v => setBoost(v[0] / 10)} min={10} max={30} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1.0x — không ưu tiên</span>
            <span>3.0x — đại lý còn hàng luôn lên đầu</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
          <p className="font-semibold">📊 Công thức xếp hạng đại lý:</p>
          <code className="block bg-background p-3 rounded text-xs">
            score = (1 / distanceKm) × {(distance / 100).toFixed(2)} + rating × {(reputation / 100).toFixed(2)} + (inStock ? {boost.toFixed(1)} : 1.0)
          </code>
          <p className="text-xs text-muted-foreground">
            Lưu ý: trọng số áp dụng cho component <code className="text-foreground">NearbyDealers</code> trong toàn bộ luồng Lead.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={save}>Lưu thay đổi</Button>
        </div>
      </CardContent>
    </Card>
  );
}
