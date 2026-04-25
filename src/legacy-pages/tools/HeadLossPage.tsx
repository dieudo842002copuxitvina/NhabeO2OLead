import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Droplet, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { computeHeadLoss } from '@/lib/calculatorSuite';
import { Button } from '@/components/ui/button';
import SeoMeta from '@/components/SeoMeta';

const PIPE_SIZES = [
  { mm: 16, label: 'Ø16 mm' }, { mm: 20, label: 'Ø20 mm' }, { mm: 25, label: 'Ø25 mm' },
  { mm: 32, label: 'Ø32 mm' }, { mm: 42, label: 'Ø42 mm' }, { mm: 50, label: 'Ø50 mm' },
  { mm: 63, label: 'Ø63 mm' }, { mm: 75, label: 'Ø75 mm' }, { mm: 90, label: 'Ø90 mm' },
];

export default function HeadLossPage() {
  const [diameterMm, setDiameter] = useState(32);
  const [lengthM, setLength] = useState(100);
  const [flowLpm, setFlow] = useState(80);

  const result = useMemo(() => computeHeadLoss({ diameterMm, lengthM, flowLpm }), [diameterMm, lengthM, flowLpm]);

  return (
    <div className="container max-w-4xl py-6 md:py-10 animate-fade-in">
      <SeoMeta title="Tính sụt áp thuỷ lực - Nhà Bè Agri" description="Tính độ sụt áp Hazen-Williams cho hệ tưới: chọn đường kính ống PE/PVC, chiều dài, lưu lượng → kết quả tức thì." canonical="/cong-cu/sut-ap" />

      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 gap-1">
        <Link to="/cong-cu"><ArrowLeft className="w-4 h-4" /> Tất cả công cụ</Link>
      </Button>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-info/15 text-info flex items-center justify-center">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Sụt áp thuỷ lực</h1>
            <p className="text-sm text-muted-foreground">Hazen-Williams (C=150 cho ống nhựa PE/PVC)</p>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Thông số ống</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Đường kính ống</Label>
              <Select value={String(diameterMm)} onValueChange={(v) => setDiameter(Number(v))}>
                <SelectTrigger className="h-12 mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PIPE_SIZES.map((p) => <SelectItem key={p.mm} value={String(p.mm)}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Chiều dài (m)</Label>
              <Input type="number" min={1} value={lengthM} onChange={(e) => setLength(Math.max(1, Number(e.target.value) || 0))} className="h-12 mt-1.5 text-base" inputMode="decimal" />
            </div>
            <div>
              <Label className="text-sm">Lưu lượng (lít/phút)</Label>
              <Input type="number" min={1} value={flowLpm} onChange={(e) => setFlow(Math.max(1, Number(e.target.value) || 0))} className="h-12 mt-1.5 text-base" inputMode="decimal" />
              <p className="text-[11px] text-muted-foreground mt-1">Tham khảo: 1 béc 50 L/h ≈ 0.83 L/phút</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/5 to-card">
          <CardHeader className="pb-3"><CardTitle className="text-base">Kết quả</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Sụt áp" value={`${result.headLossM} m`} sub={`≈ ${result.headLossBar} bar`} highlight />
              <Stat label="Vận tốc" value={`${result.velocityMs} m/s`} sub="khuyến nghị 0.6-2 m/s" />
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
              <p>Đường kính trong: <strong>Ø{diameterMm} mm</strong></p>
              <p>Chiều dài tuyến: <strong>{lengthM} m</strong></p>
              <p>Lưu lượng thiết kế: <strong>{flowLpm} L/phút</strong> ({(flowLpm * 60 / 1000).toFixed(2)} m³/h)</p>
            </div>
            {result.warning && (
              <Alert variant="default" className="border-warning/40 bg-warning/5">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <AlertDescription className="text-xs">{result.warning}</AlertDescription>
              </Alert>
            )}
            <Badge variant="outline" className="w-full justify-center py-2">
              Tổng cột áp bơm = sụt áp + cột áp địa hình + áp suất béc
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-info/10 border border-info/30' : 'bg-card border'}`}>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-xl md:text-2xl font-bold ${highlight ? 'text-info' : ''}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
