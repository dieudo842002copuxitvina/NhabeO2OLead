import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { commodityPrices } from '@/data/mock';
import { PROVINCES } from '@/lib/provinceGeo';
import { TrendingUp } from 'lucide-react';

const MAIN_CROPS = ['Cà phê Robusta', 'Hồ tiêu', 'Sầu riêng Ri6'];

/** Synthesize 30-day daily price series from the 7-point history (linear interp + jitter). */
function expandTo30Days(name: string, provinceSeed = 0) {
  const c = commodityPrices.find(x => x.name === name);
  if (!c) return [];
  const days = 30;
  const out: { date: string; price: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    // Walk through history index based on i
    const histIdx = Math.floor(((days - 1 - i) / (days - 1)) * (c.history.length - 1));
    const base = c.history[histIdx]?.price ?? c.currentPrice;
    // Province-specific jitter — deterministic per (name, province, i)
    const seed = (provinceSeed * 31 + i * 7 + name.length) % 100;
    const jitter = (seed - 50) / 1000; // -5%..+5% normalized small
    const price = Math.round(base * (1 + jitter * 0.3 + provinceSeed * 0.002));
    out.push({ date: `${d.getDate()}/${d.getMonth() + 1}`, price });
  }
  return out;
}

export default function PriceComparisonChart() {
  const [crop, setCrop] = useState(MAIN_CROPS[0]);
  const [provA, setProvA] = useState('Đắk Lắk');
  const [provB, setProvB] = useState('Lâm Đồng');

  // Multi-line series for 3 main crops (national)
  const mainSeries = useMemo(() => {
    const merged: Record<string, { date: string;[k: string]: string | number }> = {};
    MAIN_CROPS.forEach((c, ci) => {
      expandTo30Days(c, ci).forEach(d => {
        merged[d.date] = { ...(merged[d.date] ?? { date: d.date }), [c]: d.price };
      });
    });
    return Object.values(merged);
  }, []);

  // Province-vs-province comparison for selected crop
  const provinceSeries = useMemo(() => {
    const a = expandTo30Days(crop, PROVINCES.findIndex(p => p.name === provA));
    const b = expandTo30Days(crop, PROVINCES.findIndex(p => p.name === provB));
    return a.map((row, i) => ({ date: row.date, [provA]: row.price, [provB]: b[i]?.price ?? row.price }));
  }, [crop, provA, provB]);

  const colors = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card>
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-sm">Giá 3 cây chủ lực · 30 ngày</span>
          </div>
          <div className="flex gap-1">
            {MAIN_CROPS.map((c, i) => (
              <Badge key={c} variant="outline" className="text-[10px]">
                <span className="w-2 h-2 rounded-full mr-1" style={{ background: colors[i] }} />{c.split(' ')[0]}
              </Badge>
            ))}
          </div>
        </div>
        <CardContent className="p-3">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={mainSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={10} interval={3} />
              <YAxis fontSize={10} domain={['auto', 'auto']} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString('vi-VN')}đ`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {MAIN_CROPS.map((c, i) => (
                <Line key={c} type="monotone" dataKey={c} stroke={colors[i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <div className="p-3 border-b">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-4 h-4 text-warning" />
            <span className="font-display font-semibold text-sm">So sánh giá 2 tỉnh</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px]">Cây trồng</Label>
              <Select value={crop} onValueChange={setCrop}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{MAIN_CROPS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Tỉnh A</Label>
              <Select value={provA} onValueChange={setProvA}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{PROVINCES.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Tỉnh B</Label>
              <Select value={provB} onValueChange={setProvB}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{PROVINCES.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <CardContent className="p-3">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={provinceSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={10} interval={3} />
              <YAxis fontSize={10} domain={['auto', 'auto']} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString('vi-VN')}đ`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey={provA} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={provB} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="4 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
