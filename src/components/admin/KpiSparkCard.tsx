import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, YAxis } from 'recharts';
import type { SparkPoint } from '@/hooks/useDashboardMetrics';

interface KpiSparkCardProps {
  label: string;
  value: string;
  unit?: string;
  series: SparkPoint[];
  icon: LucideIcon;
  /** "up" = tăng tốt; "down" = giảm tốt (vd: bounce rate). Mặc định "up". */
  goodDirection?: 'up' | 'down';
  loading?: boolean;
}

export default function KpiSparkCard({
  label, value, unit, series, icon: Icon, goodDirection = 'up', loading,
}: KpiSparkCardProps) {
  // Trend: compare last vs first non-zero value of week.
  const first = series[0]?.value ?? 0;
  const last = series[series.length - 1]?.value ?? 0;
  const delta = last - first;
  const pct = first === 0 ? (last > 0 ? 100 : 0) : Math.round((delta / first) * 1000) / 10;
  const isFlat = Math.abs(pct) < 0.5;
  const isPositive = goodDirection === 'up' ? delta > 0 : delta < 0;
  const trendColor = isFlat
    ? 'text-muted-foreground'
    : isPositive
      ? 'text-success'
      : 'text-destructive';
  const TrendIcon = isFlat ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const sparkColor = isFlat
    ? 'hsl(var(--muted-foreground))'
    : isPositive
      ? 'hsl(var(--success))'
      : 'hsl(var(--destructive))';

  return (
    <Card className="overflow-hidden relative group hover:shadow-md transition-all border-primary/10">
      {/* subtle deep-forest gradient accent */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-info/40" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{label}</p>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-2xl font-display font-bold leading-none">
                {loading ? <span className="inline-block w-16 h-5 bg-muted animate-pulse rounded" /> : value}
              </p>
              {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
            </div>
            <p className={`text-[11px] mt-1.5 font-medium flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              {isFlat ? 'Ổn định' : `${pct > 0 ? '+' : ''}${pct}% / 7 ngày`}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-primary/8">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        {/* Sparkline */}
        <div className="h-10 mt-2 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  fontSize: 11, padding: '4px 8px', borderRadius: 6,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--popover))',
                }}
                labelFormatter={(d) => String(d)}
                formatter={(v: number) => [v, 'Giá trị']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                strokeWidth={1.6}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
