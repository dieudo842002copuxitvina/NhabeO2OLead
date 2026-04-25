import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Zap, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { computeElectrical } from '@/lib/calculatorSuite';
import SeoMeta from '@/components/SeoMeta';

export default function ElectricalCalculatorPage() {
  const [pumpHp, setPumpHp] = useState(3);
  const [voltage, setVoltage] = useState<220 | 380>(380);
  const [cableLengthM, setCable] = useState(50);

  const r = useMemo(() => computeElectrical({ pumpHp, voltage, cableLengthM }), [pumpHp, voltage, cableLengthM]);
  const tooMuchDrop = r.voltageDropPct > 3;

  return (
    <div className="container max-w-4xl py-6 md:py-10 animate-fade-in">
      <SeoMeta title="Tính điện năng & tủ điện máy bơm - Nhà Bè Agri" description="Tự động chọn cỡ dây, CB, RCD theo công suất bơm. Kiểm tra sụt áp dây dẫn cho hệ tưới nông nghiệp." canonical="/cong-cu/dien-nang" />

      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 gap-1">
        <Link to="/cong-cu"><ArrowLeft className="w-4 h-4" /> Tất cả công cụ</Link>
      </Button>

      <header className="mb-6 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Điện năng & Tủ điện</h1>
          <p className="text-sm text-muted-foreground">Tính dây dẫn, CB, RCD cho máy bơm tưới</p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Thông số máy bơm</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Công suất bơm (HP)</Label>
              <Input type="number" min={0.5} step={0.5} value={pumpHp} onChange={(e) => setPumpHp(Math.max(0.5, Number(e.target.value) || 0.5))} className="h-12 mt-1.5 text-base" inputMode="decimal" />
              <p className="text-[11px] text-muted-foreground mt-1">1 HP ≈ 0.746 kW</p>
            </div>
            <div>
              <Label className="text-sm">Điện áp</Label>
              <Select value={String(voltage)} onValueChange={(v) => setVoltage(Number(v) as 220 | 380)}>
                <SelectTrigger className="h-12 mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="220">220V (1 pha)</SelectItem>
                  <SelectItem value="380">380V (3 pha)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Khoảng cách kéo dây (m)</Label>
              <Input type="number" min={5} value={cableLengthM} onChange={(e) => setCable(Math.max(5, Number(e.target.value) || 5))} className="h-12 mt-1.5 text-base" inputMode="decimal" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-card">
          <CardHeader className="pb-3"><CardTitle className="text-base">Khuyến nghị tủ điện</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Dòng định mức" value={`${r.ratedCurrentA} A`} />
              <Stat label="Dòng khởi động" value={`${r.startingCurrentA} A`} sub="≈ 6× định mức" />
              <Stat label="Cỡ dây Cu" value={`${r.cableMm2} mm²`} highlight />
              <Stat label="CB / Aptomat" value={`${r.breakerA} A`} highlight />
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
              <p>RCD chống giật: <strong>30 mA</strong></p>
              <p>Sụt áp dây dẫn: <strong className={tooMuchDrop ? 'text-destructive' : 'text-success'}>{r.voltageDropPct}%</strong></p>
              <p>Tiêu chuẩn IEC: ≤ 3% cho mạch động lực</p>
            </div>
            <Alert variant={tooMuchDrop ? 'destructive' : 'default'}>
              <ShieldAlert className="w-4 h-4" />
              <AlertDescription className="text-xs">{r.recommendation}</AlertDescription>
            </Alert>
            <Badge variant="outline" className="w-full justify-center py-2 text-[11px]">
              Tủ điện đề xuất: 1× CB {r.breakerA}A + 1× RCD 30mA + dây Cu {r.cableMm2}mm²
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-warning/10 border border-warning/30' : 'bg-card border'}`}>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-xl md:text-2xl font-bold ${highlight ? 'text-warning' : ''}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
