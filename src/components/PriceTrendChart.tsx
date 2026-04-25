import { useState, useMemo, useEffect } from 'react';
import { commodityPrices } from '@/data/mock';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { trackCommodityView, type CommodityKey } from '@/lib/shadowProfile';

type Range = 'week' | 'month';

/** Map commodity display name → shadow profile key */
function commodityKey(name: string): CommodityKey | null {
  const n = name.toLowerCase();
  if (n.includes('sầu riêng') || n.includes('sau rieng')) return 'sau-rieng';
  if (n.includes('cà phê') || n.includes('ca phe')) return 'ca-phe';
  if (n.includes('tiêu') || n.includes('tieu')) return 'tieu';
  if (n.includes('lúa') || n.includes('lua') || n.includes('gạo')) return 'lua';
  if (n.includes('cao su')) return 'cao-su';
  return null;
}

/**
 * Price Trend Chart — biểu đồ xu hướng giá nông sản theo tuần/tháng
 */
export default function PriceTrendChart() {
  const [selected, setSelected] = useState(commodityPrices[0]?.name ?? '');
  const [range, setRange] = useState<Range>('week');

  const active = commodityPrices.find(c => c.name === selected) ?? commodityPrices[0];

  // Shadow Profiling: track commodity views for personalization
  useEffect(() => {
    const k = commodityKey(selected);
    if (k) trackCommodityView(k);
  }, [selected]);

  const chartData = useMemo(() => {
    if (!active) return [];
    // history is base; for "month" we expand by interpolating extra points
    const hist = active.history;
    if (range === 'week') return hist.slice(-7);
    // month: show all (~30 points). If less, repeat-pad with slight variation around mean.
    if (hist.length >= 28) return hist.slice(-30);
    const out = [...hist];
    const mean = hist.reduce((s, p) => s + p.price, 0) / hist.length;
    let i = hist.length;
    while (out.length < 30) {
      const variation = (Math.sin(i * 0.7) * 0.03 + (Math.random() - 0.5) * 0.02) * mean;
      out.unshift({ date: `D-${30 - out.length}`, price: Math.round(mean + variation) });
      i++;
    }
    return out;
  }, [active, range]);

  if (!active) return null;
  const up = active.change >= 0;
  const stroke = up ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-bold text-base">📊 Xu hướng giá nông sản</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Theo dõi biến động theo {range === 'week' ? 'tuần' : 'tháng'}</p>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              size="sm"
              variant={range === 'week' ? 'default' : 'ghost'}
              className="h-7 px-3 text-xs"
              onClick={() => setRange('week')}
            >Tuần</Button>
            <Button
              size="sm"
              variant={range === 'month' ? 'default' : 'ghost'}
              className="h-7 px-3 text-xs"
              onClick={() => setRange('month')}
            >Tháng</Button>
          </div>
        </div>

        {/* Commodity selector chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
          {commodityPrices.map(c => {
            const isActive = c.name === selected;
            const cUp = c.change >= 0;
            return (
              <button
                key={c.name}
                onClick={() => setSelected(c.name)}
                className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card hover:bg-muted border-border'
                }`}
              >
                {c.name}
                <span className={`ml-1.5 ${isActive ? 'opacity-90' : cUp ? 'text-success' : 'text-destructive'}`}>
                  {cUp ? '+' : ''}{c.change}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Current price summary */}
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-display text-2xl font-bold">{active.currentPrice.toLocaleString('vi-VN')}</span>
          <span className="text-sm text-muted-foreground">{active.unit}</span>
          <span className={`flex items-center gap-1 text-sm font-semibold ${up ? 'text-success' : 'text-destructive'}`}>
            {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {up ? '+' : ''}{active.change}%
          </span>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v.toLocaleString('vi-VN')} ${active.unit}`, 'Giá']}
              />
              <Area type="monotone" dataKey="price" stroke={stroke} strokeWidth={2} fill="url(#priceFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
