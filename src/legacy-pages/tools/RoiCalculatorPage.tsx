import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { computeRoi, formatVnd } from '@/lib/calculatorSuite';
import SeoMeta from '@/components/SeoMeta';

export default function RoiCalculatorPage() {
  const [areaHa, setAreaHa] = useState(2);
  const [yieldKg, setYieldKg] = useState(15000);
  const [pricePerKg, setPrice] = useState(85000);
  const [nhaBeInvest, setNhaBe] = useState(180_000_000);
  const [tradInvest, setTrad] = useState(60_000_000);
  const horizon = 10;

  const r = useMemo(() => computeRoi({
    areaHa, yearlyYieldKgPerHa: yieldKg, pricePerKg,
    nhaBeInvest, traditionalInvest: tradInvest,
    nhaBeYieldUplift: 0.20, nhaBeWaterSavingPct: 0.55,
    laborSavedHoursYear: 800, laborCostHour: 35_000,
    yearsHorizon: horizon,
  }), [areaHa, yieldKg, pricePerKg, nhaBeInvest, tradInvest]);

  const chartData = useMemo(() => {
    const data: { year: string; nhabe: number; truyenThong: number }[] = [];
    let nhabeCum = -nhaBeInvest;
    let tradCum = -tradInvest;
    const baseRev = areaHa * yieldKg * pricePerKg;
    const nhabeYearly = baseRev * 1.20 + areaHa * 1_500_000 * 0.55 + 800 * 35_000;
    const tradYearly = baseRev;
    for (let y = 0; y <= horizon; y++) {
      data.push({ year: `Năm ${y}`, nhabe: Math.round(nhabeCum / 1_000_000), truyenThong: Math.round(tradCum / 1_000_000) });
      nhabeCum += nhabeYearly;
      tradCum += tradYearly;
    }
    return data;
  }, [areaHa, yieldKg, pricePerKg, nhaBeInvest, tradInvest]);

  return (
    <div className="container max-w-5xl py-6 md:py-10 animate-fade-in">
      <SeoMeta title="ROI hoàn vốn đầu tư hệ tưới - Nhà Bè Agri" description="So sánh hiệu quả kinh tế giữa hệ tưới Nhà Bè Agri và tưới truyền thống: payback, lợi nhuận tích luỹ 10 năm." canonical="/cong-cu/roi" />

      <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2 gap-1">
        <Link to="/cong-cu"><ArrowLeft className="w-4 h-4" /> Tất cả công cụ</Link>
      </Button>

      <header className="mb-6 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">ROI - Hoàn vốn đầu tư</h1>
          <p className="text-sm text-muted-foreground">So sánh Nhà Bè Agri vs hệ tưới truyền thống</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="text-base">Thông số đầu tư</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Diện tích (ha)" value={areaHa} setValue={setAreaHa} step={0.1} min={0.1} />
            <Field label="Năng suất hiện tại (kg/ha/năm)" value={yieldKg} setValue={setYieldKg} step={500} min={100} />
            <Field label="Giá bán (đ/kg)" value={pricePerKg} setValue={setPrice} step={1000} min={1000} />
            <Field label="Đầu tư Nhà Bè Agri (đ)" value={nhaBeInvest} setValue={setNhaBe} step={1_000_000} min={1_000_000} />
            <Field label="Đầu tư truyền thống (đ)" value={tradInvest} setValue={setTrad} step={1_000_000} min={1_000_000} />
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Payback" value={`${r.paybackYears} năm`} accent="text-primary" sub="thời gian thu hồi vốn chênh lệch" />
            <KpiCard label="ROI 10 năm" value={`${r.roiPct}%`} accent="text-success" sub="trên vốn đầu tư bổ sung" />
            <KpiCard label="Lợi nhuận năm" value={formatVnd(r.yearlySavings)} accent="text-info" sub="bao gồm năng suất + nước + nhân công" />
            <KpiCard label="Tích luỹ 10 năm" value={formatVnd(r.cumulativeAdvantage)} accent="text-warning" sub="lợi thế tổng cộng so với truyền thống" />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Dòng tiền tích luỹ (triệu đồng)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      formatter={(v: number) => `${v.toLocaleString('vi-VN')} triệu`}
                    />
                    <Bar dataKey="nhabe" name="Nhà Bè Agri" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="truyenThong" name="Truyền thống" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary" /> Nhà Bè Agri</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted-foreground" /> Truyền thống</span>
              </div>
            </CardContent>
          </Card>

          <Badge variant="outline" className="w-full justify-center py-2 text-[11px]">
            Giả định: +20% năng suất · -55% lượng nước · tiết kiệm 800h nhân công/năm
          </Badge>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, setValue, step, min }: { label: string; value: number; setValue: (n: number) => void; step: number; min: number }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input type="number" value={value} step={step} min={min}
        onChange={(e) => setValue(Math.max(min, Number(e.target.value) || min))}
        className="h-12 mt-1.5 text-base" inputMode="decimal" />
    </div>
  );
}

function KpiCard({ label, value, accent, sub }: { label: string; value: string; accent: string; sub: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={`text-xl md:text-2xl font-bold mt-0.5 ${accent}`}>{value}</p>
        <p className="text-[10px] text-muted-foreground leading-tight mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
