import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Calculator as CalcIcon, Sprout, Ruler, Droplet, Mountain, Waves, MessageCircle, CheckCircle2, FileText, Phone, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CROPS } from '@/lib/seoLanding';
import { useApp } from '@/contexts/AppContext';
import { dealers } from '@/data/mock';
import { expandingRadiusSearch } from '@/lib/geo';
import { pushLead } from '@/lib/leads';
import { trackEvent } from '@/lib/tracking';
import SeoMeta from '@/components/SeoMeta';
import { z } from 'zod';

type SlopeKey = 'flat' | 'mid' | 'steep';
type WaterSourceKey = 'gieng' | 'ho' | 'song';
type AreaUnit = 'm2' | 'mau';

const SLOPES: Record<SlopeKey, { name: string; emoji: string; pumpFactor: number }> = {
  flat:  { name: 'Bằng phẳng', emoji: '🟰', pumpFactor: 1.0 },
  mid:   { name: 'Dốc nhẹ',     emoji: '📐', pumpFactor: 1.25 },
  steep: { name: 'Dốc cao',     emoji: '⛰️', pumpFactor: 1.6 },
};

const WATER_SOURCES: Record<WaterSourceKey, { name: string; emoji: string; pressureBoost: number }> = {
  gieng: { name: 'Giếng khoan',  emoji: '💧', pressureBoost: 1.2 },
  ho:    { name: 'Hồ / Ao',       emoji: '🏞️', pressureBoost: 1.0 },
  song:  { name: 'Sông / Suối',   emoji: '🌊', pressureBoost: 0.9 },
};

// Mock n8n webhook URL — replace with real production URL when deployed
const N8N_WEBHOOK_URL = 'https://n8n.nhabeagri.com/webhook/calculator-hydraulic-lead';

const phoneSchema = z.string().trim().regex(/^(0|\+84)\d{9,10}$/, { message: 'Số điện thoại không hợp lệ (VD: 0901234567)' });

function formatVND(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';
}

const STEPS = [
  { id: 1, title: 'Cây trồng', icon: Sprout },
  { id: 2, title: 'Diện tích', icon: Ruler },
  { id: 3, title: 'Nguồn nước', icon: Waves },
  { id: 4, title: 'Kết quả', icon: FileText },
];

export default function HydraulicCalculatorPage() {
  const { userLocation } = useApp();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [cropSlug, setCropSlug] = useState<string>('');
  const [areaValue, setAreaValue] = useState<number>(1000);
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('m2');
  const [spacingX, setSpacingX] = useState<number>(8);
  const [spacingY, setSpacingY] = useState<number>(8);
  const [waterSource, setWaterSource] = useState<WaterSourceKey>('gieng');
  const [slope, setSlope] = useState<SlopeKey>('flat');

  const [leadOpen, setLeadOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [assignedDealer, setAssignedDealer] = useState<{ name: string; phone: string } | null>(null);

  const crop = CROPS.find(c => c.slug === cropSlug);

  // Diện tích quy đổi sang m² (1 mẫu = 3600 m² miền Nam)
  const areaM2 = useMemo(() => areaUnit === 'mau' ? Math.round(areaValue * 3600) : areaValue, [areaValue, areaUnit]);

  // === Logic tính toán hệ thống tưới ===
  const result = useMemo(() => {
    if (!crop || areaM2 < 100 || spacingX < 0.5 || spacingY < 0.5) return null;

    // Số béc tưới = Diện tích / (khoảng cách^2). Dùng spacingX × spacingY thực tế.
    const cellArea = spacingX * spacingY;
    const trees = Math.ceil(areaM2 / cellArea);

    // Lưu lượng /cây/ngày (mock theo nhu cầu cây)
    const waterPerTree = crop.slug === 'sau-rieng' ? 100
      : crop.slug === 'ca-phe' ? 70
      : crop.slug === 'buoi' ? 65
      : crop.slug === 'tieu' ? 20
      : 40;
    const emittersPerTree = crop.slug === 'sau-rieng' ? 4 : crop.slug === 'buoi' ? 2 : 1;

    const emitters = trees * emittersPerTree;
    const totalWaterPerDay = trees * waterPerTree;

    // Ống chính & phụ
    const sideLength = Math.sqrt(areaM2);
    const mainPipeM = Math.ceil(sideLength * 2 * SLOPES[slope].pumpFactor);
    const branchPipeM = Math.ceil(trees * 2.5);

    // Công suất bơm: tưới 4h/ngày, 1HP ~ 3000 L/h ở 2 bar
    const requiredFlowLh = totalWaterPerDay / 4;
    const rawHP = (requiredFlowLh / 3000) * SLOPES[slope].pumpFactor * WATER_SOURCES[waterSource].pressureBoost;
    const pumpHP = Math.max(0.5, Math.ceil(rawHP * 2) / 2);

    // Dự toán
    const PRICES = { emitter: 8000, mainPipe: 35000, branchPipe: 12000, pumpPerHP: 3500000, filter: 1800000, controller: 3200000, installPerM2: 8000 };
    const budget = [
      { item: 'Béc tưới nhỏ giọt', qty: emitters, unit: 'cái', subtotal: emitters * PRICES.emitter },
      { item: 'Ống chính PE 32mm', qty: mainPipeM, unit: 'm', subtotal: mainPipeM * PRICES.mainPipe },
      { item: 'Ống phụ PE 16mm', qty: branchPipeM, unit: 'm', subtotal: branchPipeM * PRICES.branchPipe },
      { item: `Máy bơm ${pumpHP} HP`, qty: 1, unit: 'cái', subtotal: PRICES.pumpPerHP * pumpHP },
      { item: 'Bộ lọc đĩa', qty: 1, unit: 'bộ', subtotal: PRICES.filter },
      { item: 'Bộ điều khiển tự động', qty: 1, unit: 'bộ', subtotal: PRICES.controller },
      { item: 'Thi công lắp đặt', qty: areaM2, unit: 'm²', subtotal: areaM2 * PRICES.installPerM2 },
    ];
    const totalBudget = budget.reduce((s, l) => s + l.subtotal, 0);

    return { trees, emitters, mainPipeM, branchPipeM, pumpHP, totalWaterPerDay, budget, totalBudget };
  }, [crop, areaM2, spacingX, spacingY, slope, waterSource]);

  const canNext = useMemo(() => {
    if (step === 1) return !!cropSlug;
    if (step === 2) return areaM2 >= 100 && spacingX >= 0.5 && spacingY >= 0.5;
    if (step === 3) return !!waterSource && !!slope;
    return true;
  }, [step, cropSlug, areaM2, spacingX, spacingY, waterSource, slope]);

  const handleNext = () => {
    if (!canNext) {
      toast({ title: 'Vui lòng hoàn tất bước này', variant: 'destructive' });
      return;
    }
    if (step === 3) {
      trackEvent('calculator_used', { source: `hydraulic-${cropSlug}-${areaM2}m2-${slope}-${waterSource}` });
    }
    setStep(s => Math.min(4, s + 1));
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handleSubmitLead = async () => {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) { setPhoneErr(parsed.error.errors[0].message); return; }
    setPhoneErr('');
    if (!result || !crop) return;

    // Phân phối lead về đại lý gần nhất
    const { results } = expandingRadiusSearch(userLocation, dealers, d => ({ lat: d.lat, lng: d.lng }), 1);
    const nearestDealer = results[0]?.item ?? dealers[0];

    const payload = {
      phone: parsed.data,
      input: {
        crop: crop.name, cropSlug: crop.slug,
        areaM2, areaOriginal: `${areaValue} ${areaUnit === 'mau' ? 'mẫu' : 'm²'}`,
        spacing: `${spacingX}m × ${spacingY}m`,
        waterSource: WATER_SOURCES[waterSource].name,
        slope: SLOPES[slope].name,
      },
      output: {
        trees: result.trees, emitters: result.emitters,
        mainPipeM: result.mainPipeM, branchPipeM: result.branchPipeM,
        pumpHP: result.pumpHP, totalWaterPerDay: result.totalWaterPerDay,
        totalBudget: result.totalBudget,
      },
      dealerId: nearestDealer.id, dealerName: nearestDealer.name,
      source: '/cong-cu/tinh-toan-thuy-luc',
      timestamp: new Date().toISOString(),
    };

    // Bắn webhook n8n (fire-and-forget, no-cors để tránh block dev env)
    console.log('[n8n webhook]', N8N_WEBHOOK_URL, payload);
    try {
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
    } catch { /* noop */ }

    pushLead({
      dealerId: nearestDealer.id,
      channel: 'inquiry',
      productName: `Bản vẽ thuỷ lực ${crop.name} · ${areaM2.toLocaleString()}m² · ${result.pumpHP}HP`,
      customerHint: `SĐT ****${parsed.data.slice(-3)} · Dự toán ${formatVND(result.totalBudget)}`,
      customerPhone: parsed.data,
      customerLat: userLocation.lat,
      customerLng: userLocation.lng,
      source: '/cong-cu/tinh-toan-thuy-luc',
    });

    trackEvent('calculator_lead_submit', { source: 'hydraulic', dealerId: nearestDealer.id });
    setAssignedDealer({ name: nearestDealer.name, phone: nearestDealer.phone });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <SeoMeta
        title="Máy tính Hệ thống Tưới Thông minh | Nhà Bè Agri"
        description="Tự tính số béc tưới, công suất máy bơm, ống dẫn và dự toán kinh phí cho mảnh vườn của bạn theo từng loại cây, diện tích và nguồn nước."
        canonical="/cong-cu/tinh-toan-thuy-luc"
      />
      <div className="container py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2">
            <CalcIcon className="w-8 h-8 text-primary" /> Máy tính Hệ thống Tưới
          </h1>
          <p className="text-muted-foreground mt-1">
            Trả lời 3 câu hỏi, nhận ngay bản tính số béc tưới + công suất bơm + dự toán kinh phí.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = step > s.id;
            const isActive = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDone ? 'bg-primary text-primary-foreground' :
                    isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className={`text-xs mt-1.5 font-medium hidden sm:block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {s.title}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-all ${step > s.id ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              {(() => { const Icon = STEPS[step - 1].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
              Bước {step}/4: {STEPS[step - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* === STEP 1: Crop === */}
            {step === 1 && (
              <div>
                <Label className="text-sm font-medium mb-3 block">Bạn đang trồng cây gì?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {CROPS.map(c => (
                    <button
                      key={c.slug}
                      onClick={() => setCropSlug(c.slug)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        cropSlug === c.slug
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="text-3xl mb-1">{c.emoji}</div>
                      <div className="text-sm font-medium">{c.name}</div>
                    </button>
                  ))}
                </div>
                {crop && (
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                    <p className="font-semibold flex items-center gap-1.5"><Droplet className="w-4 h-4 text-primary" /> Gợi ý cho {crop.name}:</p>
                    <p className="text-muted-foreground mt-1">{crop.irrigationType} — {crop.waterNeed}</p>
                  </div>
                )}
              </div>
            )}

            {/* === STEP 2: Area + Spacing === */}
            {step === 2 && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Diện tích mảnh đất</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number" min={1}
                      value={areaValue}
                      onChange={e => setAreaValue(Math.max(0, Number(e.target.value) || 0))}
                      className="h-12 text-lg flex-1"
                    />
                    <div className="flex border-2 border-border rounded-md overflow-hidden">
                      {(['m2', 'mau'] as AreaUnit[]).map(u => (
                        <button
                          key={u}
                          onClick={() => setAreaUnit(u)}
                          className={`px-4 text-sm font-medium transition-colors ${
                            areaUnit === u ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                          }`}
                        >
                          {u === 'm2' ? 'm²' : 'mẫu'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(areaUnit === 'm2' ? [500, 1000, 5000, 10000] : [1, 2, 5, 10]).map(v => (
                      <button
                        key={v}
                        onClick={() => setAreaValue(v)}
                        className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/70 transition-colors"
                      >
                        {v.toLocaleString()} {areaUnit === 'm2' ? 'm²' : 'mẫu'}
                      </button>
                    ))}
                  </div>
                  {areaUnit === 'mau' && (
                    <p className="text-xs text-muted-foreground mt-1">≈ {areaM2.toLocaleString()} m² (1 mẫu = 3.600 m²)</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Khoảng cách trồng (m × m)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sx" className="text-xs text-muted-foreground">Hàng cách hàng (m)</Label>
                      <Input
                        id="sx" type="number" min={0.5} step={0.5}
                        value={spacingX}
                        onChange={e => setSpacingX(Math.max(0, Number(e.target.value) || 0))}
                        className="h-11 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sy" className="text-xs text-muted-foreground">Cây cách cây (m)</Label>
                      <Input
                        id="sy" type="number" min={0.5} step={0.5}
                        value={spacingY}
                        onChange={e => setSpacingY(Math.max(0, Number(e.target.value) || 0))}
                        className="h-11 mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Mật độ ước tính: <strong>{Math.ceil(areaM2 / Math.max(0.01, spacingX * spacingY)).toLocaleString()}</strong> cây/trụ
                  </p>
                </div>
              </>
            )}

            {/* === STEP 3: Water + Slope === */}
            {step === 3 && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                    <Waves className="w-4 h-4" /> Nguồn nước
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(WATER_SOURCES) as WaterSourceKey[]).map(k => (
                      <button
                        key={k}
                        onClick={() => setWaterSource(k)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          waterSource === k ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="text-2xl">{WATER_SOURCES[k].emoji}</div>
                        <div className="text-xs font-medium mt-1">{WATER_SOURCES[k].name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                    <Mountain className="w-4 h-4" /> Độ dốc mảnh đất
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(SLOPES) as SlopeKey[]).map(k => (
                      <button
                        key={k}
                        onClick={() => setSlope(k)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          slope === k ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="text-2xl">{SLOPES[k].emoji}</div>
                        <div className="text-xs font-medium mt-1">{SLOPES[k].name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* === STEP 4: Result === */}
            {step === 4 && result && crop && (
              <div className="space-y-4">
                <div className="text-center pb-2">
                  <div className="text-4xl mb-1">{crop.emoji}</div>
                  <h3 className="font-display text-xl font-bold">Kết quả thiết kế hệ thống tưới</h3>
                  <p className="text-sm text-muted-foreground">{crop.name} · {areaM2.toLocaleString()} m² · {WATER_SOURCES[waterSource].name}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <SummaryStat icon={<Sprout />} label="Số cây" value={result.trees.toLocaleString()} />
                  <SummaryStat icon={<Droplet />} label="Số béc tưới" value={result.emitters.toLocaleString()} />
                  <SummaryStat icon={<CalcIcon />} label="Công suất bơm" value={`${result.pumpHP} HP`} highlight />
                  <SummaryStat icon={<Waves />} label="Nước/ngày" value={`${result.totalWaterPerDay.toLocaleString()} L`} />
                </div>

                <div>
                  <h4 className="font-semibold text-base mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" /> Dự toán kinh phí sơ bộ
                  </h4>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-left text-muted-foreground">
                          <th className="py-2 px-3 font-medium">Hạng mục</th>
                          <th className="py-2 px-3 font-medium text-right">SL</th>
                          <th className="py-2 px-3 font-medium">ĐV</th>
                          <th className="py-2 px-3 font-medium text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.budget.map((line, i) => (
                          <tr key={i} className="border-t">
                            <td className="py-2 px-3 font-medium">{line.item}</td>
                            <td className="py-2 px-3 text-right">{line.qty.toLocaleString()}</td>
                            <td className="py-2 px-3 text-muted-foreground">{line.unit}</td>
                            <td className="py-2 px-3 text-right font-semibold">{formatVND(line.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-primary/5 border-t-2 border-primary/30">
                          <td colSpan={3} className="py-3 px-3 font-bold">Tổng cộng (tham khảo)</td>
                          <td className="py-3 px-3 text-right font-bold text-lg text-primary">
                            {formatVND(result.totalBudget)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * Dự toán sơ bộ. Giá thực tế có thể chênh lệch ±15% tuỳ thương hiệu và đại lý.
                  </p>
                </div>

                {/* CONVERSION POINT */}
                <div className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-5 text-center">
                  <h3 className="font-display text-lg font-bold mb-1">
                    Nhận báo giá chi tiết & Bản vẽ qua Zalo
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 max-w-md mx-auto">
                    Kỹ sư Nhà Bè Agri sẽ gửi bản vẽ thuỷ lực + báo giá chính thức từ đại lý gần bạn nhất trong 30 phút.
                  </p>
                  <Button size="lg" className="h-13 px-6 font-semibold" onClick={() => setLeadOpen(true)}>
                    <MessageCircle className="w-5 h-5 mr-2" /> Nhận báo giá qua Zalo
                  </Button>
                </div>
              </div>
            )}

            {/* === Navigation === */}
            <div className="flex gap-2 pt-2">
              {step > 1 && step < 4 && (
                <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
                </Button>
              )}
              {step < 4 && (
                <Button onClick={handleNext} disabled={!canNext} className="flex-1 h-12 font-semibold">
                  {step === 3 ? 'Xem kết quả' : 'Tiếp tục'} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
              {step === 4 && (
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Tính lại từ đầu
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LEAD DIALOG */}
      <Dialog open={leadOpen} onOpenChange={(o) => { setLeadOpen(o); if (!o) { setSubmitted(false); setPhone(''); setPhoneErr(''); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {!submitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Nhập số điện thoại Zalo</DialogTitle>
                <DialogDescription>
                  Bản vẽ thuỷ lực + báo giá sẽ được gửi qua Zalo trong vòng 30 phút (giờ hành chính).
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone" type="tel" placeholder="0901234567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="h-12 mt-1.5"
                  maxLength={13}
                />
                {phoneErr && <p className="text-sm text-destructive mt-1.5">{phoneErr}</p>}
              </div>
              <DialogFooter>
                <Button onClick={handleSubmitLead} className="w-full h-12 font-semibold">
                  <MessageCircle className="w-4 h-4 mr-2" /> Gửi yêu cầu
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-3" />
              <h3 className="font-display text-xl font-bold mb-2">Đã gửi yêu cầu thành công!</h3>
              {assignedDealer && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3 text-left">
                  <p className="text-xs text-muted-foreground mb-0.5">Đã phân phối tới đại lý:</p>
                  <p className="font-semibold text-sm">{assignedDealer.name}</p>
                  <p className="text-xs text-muted-foreground">{assignedDealer.phone}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Đại lý sẽ liên hệ qua Zalo trong vòng 30 phút.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="tel:1900636737"><Phone className="w-4 h-4 mr-2" /> Gọi tổng đài 1900 636 737</a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryStat({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <Card className={highlight ? 'border-primary bg-primary/5' : ''}>
      <CardContent className="p-4">
        <div className={`flex items-center gap-1.5 text-xs mb-1 ${highlight ? 'text-primary' : 'text-muted-foreground'}`}>
          <span className="[&_svg]:w-3.5 [&_svg]:h-3.5">{icon}</span>
          {label}
        </div>
        <div className={`font-bold text-lg ${highlight ? 'text-primary' : ''}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
