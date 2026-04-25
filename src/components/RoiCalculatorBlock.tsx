"use client";

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { trackEvent } from '@/lib/tracking';

/**
 * ROI Calculator — Compares cumulative cost over 10 years between
 * traditional irrigation vs Nhà Bè Agri smart irrigation.
 *
 * Assumptions (mock):
 *  - Traditional: low setup, high yearly water + labor cost.
 *  - Smart NB: high setup, much lower yearly cost (water -60%, labor -50%).
 */

const TRAD_SETUP_PER_HA = 5_000_000;     // VND/ha
const TRAD_YEARLY_PER_HA = 18_000_000;   // VND/ha/year (water + labor)

const NB_SETUP_PER_HA = 35_000_000;      // VND/ha
const NB_YEARLY_PER_HA = 6_000_000;      // VND/ha/year (water + labor)

const YEARS = 10;

function formatVnd(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} tỷ`;
  if (v >= 1_000_000) return `${Math.round(v / 1_000_000)}tr`;
  return `${Math.round(v / 1000)}k`;
}

export default function RoiCalculatorBlock() {
  const [area, setArea] = useState<number>(2);

  const data = useMemo(() => {
    const ha = Math.max(0.1, area);
    const rows: { year: number; 'Truyền thống': number; 'Nhà Bè Agri': number }[] = [];
    for (let y = 0; y <= YEARS; y += 1) {
      rows.push({
        year: y,
        'Truyền thống': (TRAD_SETUP_PER_HA + TRAD_YEARLY_PER_HA * y) * ha,
        'Nhà Bè Agri': (NB_SETUP_PER_HA + NB_YEARLY_PER_HA * y) * ha,
      });
    }
    return rows;
  }, [area]);

  // Find break-even year (smallest y where NB <= Traditional)
  const breakEven = useMemo(() => {
    for (const r of data) {
      if (r['Nhà Bè Agri'] <= r['Truyền thống']) return r;
    }
    return null;
  }, [data]);

  const savings10y = useMemo(() => {
    const last = data[data.length - 1];
    return last['Truyền thống'] - last['Nhà Bè Agri'];
  }, [data]);

  return (
    <section
      aria-labelledby="roi-heading"
      className="container py-8 md:py-10"
    >
      <header className="mb-5">
        <p className="text-[11px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Phân tích đầu tư
        </p>
        <h2
          id="roi-heading"
          className="font-display text-2xl md:text-3xl font-extrabold mt-1 leading-tight"
        >
          Bao lâu để hoàn vốn hệ thống tưới Nhà Bè Agri?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          So sánh tổng chi phí 10 năm — chi phí thấp hơn = lợi nhuận cao hơn cho rẫy của bạn.
        </p>
      </header>

      <Card>
        <CardContent className="p-4 md:p-6 grid grid-cols-12 gap-5">
          {/* Inputs + summary */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div>
              <Label htmlFor="roi-area" className="text-sm font-semibold">
                Diện tích canh tác (ha)
              </Label>
              <Input
                id="roi-area"
                type="number"
                min={0.1}
                step={0.5}
                value={area}
                onChange={(e) => setArea(Number(e.target.value) || 0)}
                className="h-11 mt-1.5 text-base font-semibold"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[1, 2, 5, 10].map((v) => (
                  <Button
                    key={v}
                    size="sm"
                    variant={area === v ? 'default' : 'outline'}
                    onClick={() => setArea(v)}
                    className="h-7 text-xs"
                  >
                    {v} ha
                  </Button>
                ))}
              </div>
            </div>

            <motion.div
              key={breakEven?.year ?? 'none'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-primary/10 border border-primary/20"
            >
              <p className="text-[11px] uppercase font-bold tracking-wider text-primary">
                Thời gian hoàn vốn
              </p>
              <p className="font-display text-3xl font-extrabold text-primary mt-0.5">
                {breakEven ? `~ ${breakEven.year} năm` : '> 10 năm'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sau đó mỗi năm tiết kiệm thêm{' '}
                <span className="font-bold text-foreground">
                  {formatVnd((TRAD_YEARLY_PER_HA - NB_YEARLY_PER_HA) * Math.max(0.1, area))} ₫
                </span>
                .
              </p>
            </motion.div>

            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-[11px] uppercase font-bold tracking-wider text-accent">
                Tiết kiệm sau 10 năm
              </p>
              <p className="font-display text-2xl font-extrabold text-accent mt-0.5">
                {formatVnd(savings10y)} ₫
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Trên diện tích {area} ha.
              </p>
            </div>

            <Button
              asChild
              className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() =>
                trackEvent('calculator_used', { tool: 'roi_homepage', area })
              }
            >
              <Link href="/tools/roi">
                Tính chi tiết hơn <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Chart */}
          <div className="col-span-12 lg:col-span-8 min-h-[320px]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-display font-bold text-sm">
                Tổng chi phí tích lũy ({area} ha · 10 năm)
              </h3>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="year"
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => `Năm ${v}`}
                    fontSize={11}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) => formatVnd(v)}
                    fontSize={11}
                    width={56}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${formatVnd(v)} ₫`, '']}
                    labelFormatter={(l) => `Năm ${l}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="Truyền thống"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Nhà Bè Agri"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  {breakEven && (
                    <ReferenceDot
                      x={breakEven.year}
                      y={breakEven['Nhà Bè Agri']}
                      r={7}
                      fill="hsl(var(--accent))"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                      label={{
                        value: 'Hoàn vốn',
                        position: 'top',
                        fontSize: 11,
                        fill: 'hsl(var(--accent))',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <Badge variant="outline">Tiết kiệm 60% nước</Badge>
              <Badge variant="outline">Giảm 50% công lao động</Badge>
              <Badge variant="outline">Bảo hành 24 tháng</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
