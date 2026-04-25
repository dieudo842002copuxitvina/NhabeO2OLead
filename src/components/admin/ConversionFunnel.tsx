import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import type { FunnelStage } from '@/hooks/useDashboardMetrics';

interface Props { stages: FunnelStage[]; loading?: boolean }

const STAGE_COLORS = [
  'from-info/80 to-info/60',
  'from-primary/80 to-primary/60',
  'from-accent/80 to-accent/60',
  'from-success/80 to-success/60',
];

export default function ConversionFunnel({ stages, loading }: Props) {
  // Find the worst leak (max dropPct after stage 0 with non-zero parent).
  const leakIdx = stages
    .map((s, i) => ({ i, drop: s.dropPct }))
    .slice(1)
    .sort((a, b) => b.drop - a.drop)[0]?.i ?? -1;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center justify-between">
          O2O Conversion Funnel
          <Badge variant="outline" className="text-[10px] font-normal">7 ngày qua</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted/40 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        {!loading && stages.map((s, i) => {
          const width = Math.max(s.pct, 6); // floor width so 0% still visible
          const isLeak = i === leakIdx && s.dropPct >= 30;
          return (
            <div key={s.key} className="relative">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <span className="text-muted-foreground">{i + 1}.</span> {s.label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{s.count.toLocaleString('vi-VN')}</span>
                  <span className="text-muted-foreground">({s.pct}%)</span>
                </span>
              </div>
              <div className="h-9 bg-muted/40 rounded-md overflow-hidden relative">
                <div
                  className={`h-full bg-gradient-to-r ${STAGE_COLORS[i]} rounded-md transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-medium text-white/95`}
                  style={{ width: `${width}%` }}
                >
                  {s.count > 0 && width > 12 ? `${s.pct}%` : ''}
                </div>
              </div>
              {i > 0 && s.dropPct > 0 && (
                <p className={`text-[10px] mt-0.5 flex items-center gap-1 ${isLeak ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                  {isLeak && <AlertTriangle className="w-3 h-3" />}
                  Rớt {s.dropPct}% so với bước trước {isLeak ? '— cần xử lý' : ''}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
