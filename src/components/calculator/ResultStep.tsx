import { useState } from 'react';
import { z } from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  formatVND,
  buildSalesMessage,
  type CalculatorResult,
  type CalculatorInput,
} from '@/lib/calculatorV2';
import AnimatedCounter from './AnimatedCounter';
import { supabase } from '@/integrations/supabase/client';
import { dealers } from '@/data/mock';
import { expandingRadiusSearch } from '@/lib/geo';
import { useApp } from '@/contexts/AppContext';
import { trackEvent } from '@/lib/tracking';
import { Droplet, Gauge, MoveHorizontal, MessageCircle, FileText, Sparkles, Loader2 } from 'lucide-react';

const leadFormSchema = z.object({
  customer_name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự').max(100, 'Tên quá dài'),
  customer_phone: z.string().trim().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  customer_province: z.string().trim().max(100).optional(),
});

interface Props {
  result: CalculatorResult;
  input: CalculatorInput;
  cropName: string;
  onRestart: () => void;
}

export default function ResultStep({ result, input, cropName, onRestart }: Props) {
  const { userLocation } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);

  /** Find nearest dealer (Haversine) when geo available, else first dealer. */
  const pickNearestDealer = () => {
    if (!userLocation) return dealers[0];
    const search = expandingRadiusSearch(
      userLocation,
      dealers,
      d => ({ lat: d.lat, lng: d.lng }),
      1,
      [25, 50, 100, 500],
    );
    return search.results[0]?.item ?? dealers[0];
  };

  const handleSubmit = async () => {
    const parsed = leadFormSchema.safeParse({
      customer_name: name,
      customer_phone: phone,
      customer_province: province,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const dealer = pickNearestDealer();

    const { data, error } = await supabase
      .from('calculator_leads')
      .insert({
        customer_name: parsed.data.customer_name,
        customer_phone: parsed.data.customer_phone,
        customer_province: parsed.data.customer_province || null,
        crop: cropName,
        area_m2: input.areaM2,
        spacing: `${input.spacing}×${input.spacing}m`,
        slope: input.slope,
        water_source: input.waterSource,
        nozzle_count: result.nozzleCount,
        pipe_meters: result.pipeMeters,
        pump_hp: result.pumpHP,
        total_cost: result.totalCost,
        dealer_id: dealer?.id ?? null,
      })
      .select('id')
      .single();

    setSubmitting(false);

    if (error || !data) {
      toast.error('Không gửi được. Vui lòng thử lại.');
      return;
    }

    const id = data.id;
    setLeadId(id);
    const shortId = id.slice(0, 8).toUpperCase();

    // Build sales proposal message
    const message = buildSalesMessage({
      leadId: shortId,
      customerName: parsed.data.customer_name,
      customerPhone: parsed.data.customer_phone,
      crop: cropName,
      areaM2: input.areaM2,
      total: result.totalCost,
      pumpHP: result.pumpHP,
      nozzleCount: result.nozzleCount,
    });

    // Copy to clipboard so user can paste in Zalo (Zalo web doesn't support ?text=)
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      /* ignore */
    }

    trackEvent('calculator_lead_submit', {
      productId: 'irrigation_calculator',
      customerProvince: parsed.data.customer_province,
    });

    // Forward to n8n via edge function (fire-and-forget)
    void supabase.functions.invoke('notify-lead', {
      body: {
        lead_id: id,
        customer: {
          name: parsed.data.customer_name,
          phone: parsed.data.customer_phone,
          province: parsed.data.customer_province,
        },
        calculator: {
          crop: cropName,
          area_m2: input.areaM2,
          slope: input.slope,
          water_source: input.waterSource,
          spacing: `${input.spacing}×${input.spacing}m`,
          nozzle_count: result.nozzleCount,
          pipe_meters: result.pipeMeters,
          pump_hp: result.pumpHP,
          total_cost: result.totalCost,
        },
        dealer: dealer ? { id: dealer.id, name: dealer.name, phone: dealer.phone, zalo: dealer.zalo } : null,
      },
    }).catch(() => { /* swallow */ });

    toast.success(
      `Mã đơn ${shortId} đã tạo • Tin nhắn đã copy vào clipboard. Mở Zalo và dán để gửi đại lý ${dealer?.name}.`,
      { duration: 7000 },
    );

    // Open Zalo to nearest dealer
    if (dealer?.zalo) {
      window.open(`https://zalo.me/${dealer.zalo.replace(/\D/g, '')}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Badge className="bg-success/10 text-success border-success/20 mb-2">
            <Sparkles className="w-3 h-3 mr-1" /> Kết quả dự toán
          </Badge>
          <h2 className="text-2xl font-display font-bold">Hệ thống tưới {cropName}</h2>
          <p className="text-sm text-muted-foreground">
            Diện tích {input.areaM2.toLocaleString('vi-VN')} m² • Khoảng cách {input.spacing}×{input.spacing}m
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRestart}>← Tính lại</Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Droplet} label="Số béc tưới" value={result.nozzleCount} unit="cái" color="text-info" />
        <KpiCard icon={MoveHorizontal} label="Tổng ống" value={result.pipeMeters} unit="m" color="text-primary" />
        <KpiCard icon={Gauge} label="Máy bơm gợi ý" value={result.pumpHP} unit="HP" color="text-warning" decimals={1} />
        <KpiCard icon={Sparkles} label="Số cây" value={result.trees} unit="cây" color="text-success" />
      </div>

      {/* Quote table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/40 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-display font-semibold">Bảng dự toán chi tiết</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Hạng mục</th>
                <th className="px-4 py-2 font-medium text-right">Số lượng</th>
                <th className="px-4 py-2 font-medium text-right">Đơn giá</th>
                <th className="px-4 py-2 font-medium text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {result.lines.map((l, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2.5">{l.item}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {l.qty.toLocaleString('vi-VN')} {l.unit}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                    {formatVND(l.unitPrice)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                    {formatVND(l.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-5 bg-gradient-to-r from-primary/5 via-success/5 to-primary/5 border-t">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Tổng dự toán</p>
              <p className="text-3xl md:text-4xl font-display font-bold text-primary">
                <AnimatedCounter value={result.totalCost} format={formatVND} />
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                * Giá tham khảo, đại lý sẽ báo giá chính thức theo thực tế công trình
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Lead form + CTA */}
      {!leadId ? (
        <Card className="p-5 border-2 border-warning/30 bg-warning/5">
          <h3 className="font-display font-bold text-lg mb-1">
            🎁 Nhận bản vẽ chi tiết & báo giá qua Zalo
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Đại lý gần bạn sẽ tư vấn miễn phí trong vòng 30 phút.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <div>
              <Label htmlFor="lead-name">Họ tên *</Label>
              <Input id="lead-name" value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" maxLength={100} />
            </div>
            <div>
              <Label htmlFor="lead-phone">Số điện thoại *</Label>
              <Input id="lead-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0901234567" inputMode="tel" maxLength={15} />
            </div>
            <div>
              <Label htmlFor="lead-province">Tỉnh/TP</Label>
              <Input id="lead-province" value={province} onChange={e => setProvince(e.target.value)} placeholder="Đắk Lắk" maxLength={100} />
            </div>
          </div>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-14 bg-gradient-to-r from-warning to-primary hover:opacity-90 text-warning-foreground font-display font-bold text-base shadow-lg shadow-warning/30"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang gửi...</>
            ) : (
              <><MessageCircle className="w-5 h-5 mr-2" /> Nhận bản vẽ & báo giá qua Zalo</>
            )}
          </Button>
        </Card>
      ) : (
        <Card className="p-5 border-2 border-success/40 bg-success/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-success text-success-foreground flex items-center justify-center shrink-0">
              ✓
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-lg">Đã gửi yêu cầu thành công!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Mã đơn của bạn: <span className="font-mono font-bold text-primary">{leadId.slice(0, 8).toUpperCase()}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Tin nhắn báo giá đã được copy vào clipboard. Cửa sổ Zalo đã mở — chỉ cần dán & gửi để đại lý nhận thông tin.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, unit, color, decimals = 0 }: {
  icon: typeof Droplet; label: string; value: number; unit: string; color: string; decimals?: number;
}) {
  return (
    <Card className="p-4">
      <Icon className={`w-5 h-5 ${color} mb-2`} />
      <p className="text-[11px] text-muted-foreground uppercase">{label}</p>
      <p className="text-xl font-display font-bold tabular-nums">
        <AnimatedCounter
          value={value}
          format={n => (decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('vi-VN'))}
        />
        <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>
      </p>
    </Card>
  );
}
