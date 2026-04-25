import { useState, useMemo } from 'react';
import { Calculator as CalcIcon, Sprout, Droplet, Mountain, Waves, MessageCircle, CheckCircle2, FileText, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  CROPS, SLOPES, WATER_SOURCES,
  type CropKey, type SlopeKey, type WaterSourceKey,
  calculateIrrigation, formatVND,
} from '@/lib/calculator';
import { useApp } from '@/contexts/AppContext';
import NearbyInstallers from '@/components/NearbyInstallers';
import { dealers } from '@/data/mock';
import { expandingRadiusSearch } from '@/lib/geo';
import { pushLead } from '@/lib/leads';
import { trackEvent } from '@/lib/tracking';
import { z } from 'zod';

const phoneSchema = z.string().trim().regex(/^(0|\+84)\d{9,10}$/, { message: 'Số điện thoại không hợp lệ (VD: 0901234567)' });

export default function CalculatorPage() {
  const { userLocation } = useApp();
  const { toast } = useToast();

  const [area, setArea] = useState<number>(1000);
  const [crop, setCrop] = useState<CropKey>('sau_rieng');
  const [slope, setSlope] = useState<SlopeKey>('flat');
  const [waterSource, setWaterSource] = useState<WaterSourceKey>('gieng_khoan');
  const [calculated, setCalculated] = useState(false);

  const [leadOpen, setLeadOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneErr, setPhoneErr] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [assignedDealer, setAssignedDealer] = useState<{ name: string; phone: string } | null>(null);

  const result = useMemo(
    () => calculateIrrigation({ areaM2: area, crop, slope, waterSource }),
    [area, crop, slope, waterSource]
  );

  const handleCalc = () => {
    if (area < 100) {
      toast({ title: 'Diện tích quá nhỏ', description: 'Vui lòng nhập từ 100 m² trở lên', variant: 'destructive' });
      return;
    }
    setCalculated(true);
    trackEvent('calculator_used', { source: `${crop}-${area}m2-${slope}-${waterSource}` });
    setTimeout(() => document.getElementById('calc-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSubmitLead = async () => {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setPhoneErr(parsed.error.errors[0].message);
      return;
    }
    setPhoneErr('');

    // Tìm đại lý gần nhất để phân phối lead
    const { results } = expandingRadiusSearch(userLocation, dealers, d => ({ lat: d.lat, lng: d.lng }), 1);
    const nearestDealer = results[0]?.item ?? dealers[0];
    const cropName = CROPS[crop].name;

    const payload = {
      phone: parsed.data,
      input: { area, crop: cropName, slope: SLOPES[slope].name, waterSource: WATER_SOURCES[waterSource].name },
      output: {
        trees: result.trees,
        emitters: result.emitters,
        mainPipeM: result.mainPipeM,
        branchPipeM: result.branchPipeM,
        pumpHP: result.pumpHP,
        totalBudget: result.totalBudget,
      },
      dealerId: nearestDealer.id,
      dealerName: nearestDealer.name,
      timestamp: new Date().toISOString(),
    };

    // Mock n8n webhook (offline-safe — log + push lead vào CRM nội bộ)
    console.log('[n8n webhook payload]', payload);
    try {
      // attempt fire-and-forget; will silently fail in mock env
      fetch('/api/n8n/calculator-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
    } catch { /* noop */ }

    pushLead({
      dealerId: nearestDealer.id,
      channel: 'inquiry',
      productName: `Bản vẽ tưới ${cropName} · ${area} m² · ${result.pumpHP}HP`,
      customerHint: `SĐT ****${parsed.data.slice(-3)} · Dự toán ${formatVND(result.totalBudget)}`,
      customerPhone: parsed.data,
      customerLat: userLocation.lat,
      customerLng: userLocation.lng,
      source: '/cong-cu/tinh-toan-tuoi',
    });

    trackEvent('calculator_lead_submit', { phone: '****' + parsed.data.slice(-3), dealerId: nearestDealer.id });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container py-6 max-w-5xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2">
            <CalcIcon className="w-8 h-8 text-primary" /> Smart Calculator
          </h1>
          <p className="text-muted-foreground mt-1">
            Tự tính số béc tưới, ống dẫn, công suất bơm và dự toán kinh phí cho mảnh vườn của bạn.
          </p>
        </div>

        {/* INPUT FORM */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl">Nhập thông tin mảnh đất</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Diện tích */}
            <div>
              <Label htmlFor="area" className="text-sm font-medium mb-2 block">Diện tích (m²)</Label>
              <Input
                id="area" type="number" min={100} step={100}
                value={area}
                onChange={e => setArea(Math.max(0, Number(e.target.value) || 0))}
                className="h-12 text-lg"
              />
              <div className="flex gap-2 mt-2">
                {[500, 1000, 5000, 10000].map(v => (
                  <button
                    key={v}
                    onClick={() => setArea(v)}
                    className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/70 transition-colors"
                  >
                    {v.toLocaleString()} m²
                  </button>
                ))}
              </div>
            </div>

            {/* Loại cây */}
            <div>
              <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                <Sprout className="w-4 h-4" /> Loại cây trồng
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.values(CROPS).map(c => (
                  <button
                    key={c.key}
                    onClick={() => setCrop(c.key)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      crop === c.key
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="text-2xl mb-1">{c.emoji}</div>
                    <div className="text-xs font-medium">{c.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Độ dốc */}
            <div>
              <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                <Mountain className="w-4 h-4" /> Độ dốc mảnh đất
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(SLOPES) as SlopeKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setSlope(k)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      slope === k
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    {SLOPES[k].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Nguồn nước */}
            <div>
              <Label className="text-sm font-medium mb-2 block flex items-center gap-1.5">
                <Waves className="w-4 h-4" /> Nguồn nước
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(WATER_SOURCES) as WaterSourceKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setWaterSource(k)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      waterSource === k
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="text-xl">{WATER_SOURCES[k].emoji}</div>
                    <div className="text-xs font-medium mt-1">{WATER_SOURCES[k].name}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleCalc} size="lg" className="w-full h-14 text-base font-semibold">
              <CalcIcon className="w-5 h-5 mr-2" /> Tính toán ngay
            </Button>
          </CardContent>
        </Card>

        {/* RESULT */}
        {calculated && (
          <div id="calc-result" className="mt-6 space-y-4 animate-slide-up">
            {/* Tóm tắt kỹ thuật */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <SummaryStat icon={<Sprout />} label="Số cây" value={result.trees.toLocaleString()} />
              <SummaryStat icon={<Droplet />} label="Số béc tưới" value={result.emitters.toLocaleString()} />
              <SummaryStat icon={<CalcIcon />} label="Công suất bơm" value={`${result.pumpHP} HP`} highlight />
              <SummaryStat icon={<Waves />} label="Nước/ngày" value={`${result.totalWaterPerDay.toLocaleString()} L`} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Bảng dự toán kinh phí sơ bộ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 font-medium">Hạng mục</th>
                        <th className="py-2 font-medium text-right">SL</th>
                        <th className="py-2 font-medium">ĐV</th>
                        <th className="py-2 font-medium text-right">Đơn giá</th>
                        <th className="py-2 font-medium text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.budget.map((line, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2.5 font-medium">{line.item}</td>
                          <td className="py-2.5 text-right">{line.qty.toLocaleString()}</td>
                          <td className="py-2.5 text-muted-foreground">{line.unit}</td>
                          <td className="py-2.5 text-right text-muted-foreground">{formatVND(line.unitPrice)}</td>
                          <td className="py-2.5 text-right font-semibold">{formatVND(line.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-primary/5">
                        <td colSpan={4} className="py-3 font-bold text-base">Tổng cộng (tham khảo)</td>
                        <td className="py-3 text-right font-bold text-lg text-primary">
                          {formatVND(result.totalBudget)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * Đây là dự toán sơ bộ dựa trên giá tham khảo. Giá thực tế có thể chênh lệch ±15% tùy thương hiệu và đại lý.
                </p>
              </CardContent>
            </Card>

            {/* LEAD MAGNET */}
            <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6 text-center">
                <h3 className="font-display text-xl font-bold mb-2">
                  Nhận bản vẽ chi tiết miễn phí qua Zalo
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  Kỹ sư của Nhà Bè Agri sẽ gửi bản vẽ thiết kế hệ thống tưới chi tiết + báo giá chính thức từ đại lý gần bạn nhất.
                </p>
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-semibold"
                  onClick={() => setLeadOpen(true)}
                >
                  <MessageCircle className="w-5 h-5 mr-2" /> Nhận bản vẽ qua Zalo
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* LEAD DIALOG */}
      <Dialog open={leadOpen} onOpenChange={(o) => { setLeadOpen(o); if (!o) { setSubmitted(false); setPhone(''); setPhoneErr(''); } }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {!submitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Nhập số điện thoại Zalo</DialogTitle>
                <DialogDescription>
                  Chúng tôi sẽ gửi bản vẽ + báo giá trong vòng 30 phút (giờ hành chính).
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
                Đại lý sẽ liên hệ qua Zalo trong vòng 30 phút. Trong lúc chờ, bạn có thể gọi trực tiếp tổng đài.
              </p>
              <Button asChild variant="outline" className="w-full mb-5">
                <a href="tel:1900636737"><Phone className="w-4 h-4 mr-2" /> Gọi tổng đài 1900 636 737</a>
              </Button>

              <div className="border-t pt-4 text-left">
                <NearbyInstallers context="calculator-success" />
              </div>
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
