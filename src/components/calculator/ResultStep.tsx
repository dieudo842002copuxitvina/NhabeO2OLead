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
  type CalculatorResult,
  type CalculatorInput,
} from '@/lib/calculators/calculatorV2';
import AnimatedCounter from './AnimatedCounter';
import { useApp } from '@/contexts/AppContext';
import { trackEvent } from '@/lib/tracking';
import { Droplet, Gauge, MoveHorizontal, MessageCircle, FileText, Sparkles, Loader2, Share2, Facebook } from 'lucide-react';
import { submitCalculatorLeadWithRouting } from '@/app/actions/lead';

// Zalo fallback number for Nhà Bè Agri HQ (when no dealer is matched)
const ZALO_FALLBACK = '0909123456';

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
  const [assignedDealer, setAssignedDealer] = useState<string | null>(null);

  // Base URL for sharing
  const calculatorUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tinh-toan?utm_source=user_share&utm_medium=organic`
    : '/tinh-toan';

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(calculatorUrl + '&utm_source=facebook&utm_medium=share_button')}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareZalo = () => {
    const url = `https://zalo.me/share?link=${encodeURIComponent(calculatorUrl + '&utm_source=zalo&utm_medium=share_button')}&title=${encodeURIComponent('Máy tính dự toán BOM tưới tiêu miễn phí')}&desc=${encodeURIComponent(`Dự toán chi phí hệ thống tưới ${cropName} chỉ trong 30 giây!`)})`;
    window.open(url, '_blank');
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

    // Call Server Action — handles O2O Routing (Round-Robin) + Prisma insert
    const actionResult = await submitCalculatorLeadWithRouting({
      customerName: parsed.data.customer_name,
      customerPhone: parsed.data.customer_phone,
      province: parsed.data.customer_province || undefined,
      cropType: cropName,
      areaM2: input.areaM2,
      latitude: userLocation?.lat,
      longitude: userLocation?.lng,
      calculatorType: 'bom',
      calculatorData: {
        spacing: input.spacing,
        slope: input.slope,
        waterSource: input.waterSource,
        nozzleCount: result.nozzleCount,
        pipeMeters: result.pipeMeters,
        pumpHP: result.pumpHP,
        trees: result.trees,
      },
      bomItems: result.lines.map(l => ({
        item: l.item,
        qty: l.qty,
        unit: l.unit,
        unitPrice: l.unitPrice,
        subtotal: l.subtotal,
      })),
      totalCost: result.totalCost,
    });

    setSubmitting(false);

    if (!actionResult.success || !actionResult.leadId) {
      toast.error(actionResult.error || 'Không gửi được. Vui lòng thử lại.');
      return;
    }

    const id = actionResult.leadId;
    setLeadId(id);
    setAssignedDealer(actionResult.assignedDealerName || null);

    trackEvent('calculator_lead_submit', {
      productId: 'irrigation_calculator',
      customerProvince: parsed.data.customer_province,
    });

    toast.success('Đang kết nối đại lý...', { duration: 2000 });

    // Open Zalo with dealer's zalo_number, or fallback to HQ
    const zaloNumber = actionResult.dealerZaloNumber || ZALO_FALLBACK;
    const zaloUrl = `https://zalo.me/${zaloNumber.replace(/\D/g, '')}`;
    window.location.href = zaloUrl;
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

      {/* Zero-Login Lead Form */}
      {!leadId ? (
        <Card className="p-5 border-2 border-[#0068FF]/30 bg-[#0068FF]/5">
          <h3 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            Nhận bản vẽ chi tiết & báo giá chính thức
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
            className="w-full h-14 bg-[#0068FF] hover:bg-[#0052CC] text-white font-display font-bold text-base shadow-lg shadow-[#0068FF]/30 rounded-xl transition-all"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang kết nối...</>
            ) : (
              <><MessageCircle className="w-5 h-5 mr-2" /> Gửi Đại lý & Chat Zalo Ngay</>
            )}
          </Button>

          {/* Viral Share Section */}
          <div className="pt-2 border-t border-[#0068FF]/20">
            <p className="text-xs text-center text-muted-foreground mb-3">
              Chia sẻ công cụ này cho bà con cùng dùng:
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleShareFacebook}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-[#1877F2]/30 bg-[#1877F2]/5 text-[#1877F2] font-semibold text-sm hover:bg-[#1877F2]/10 transition-all"
              >
                <Facebook className="w-4 h-4" />
                <span>Chia sẻ Facebook</span>
              </button>
              <button
                type="button"
                onClick={handleShareZalo}
                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-[#0068FF]/30 bg-[#0068FF]/5 text-[#0068FF] font-semibold text-sm hover:bg-[#0068FF]/10 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chia sẻ Zalo</span>
              </button>
            </div>
          </div>
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
                {assignedDealer && <span className="ml-2 text-muted-foreground">• Phân phối đến: {assignedDealer}</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Cửa sổ Zalo đã mở — đại lý sẽ liên hệ tư vấn trong 30 phút.
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
