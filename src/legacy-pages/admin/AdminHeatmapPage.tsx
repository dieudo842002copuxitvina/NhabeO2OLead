import { useMemo } from 'react';
import { historicalLeads } from '@/data/adminMock';
import { dealers } from '@/data/mock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';

/**
 * Lead Heatmap — phát hiện vùng có nhiều lead để mở thêm đại lý.
 * Sắp xếp tỉnh/thành theo số lead, đánh dấu "vùng trống" (không có đại lý active).
 */
export default function AdminHeatmapPage() {
  const data = useMemo(() => {
    const provinceMap = new Map<string, { leads: number; gap: number; won: number }>();

    historicalLeads.forEach(l => {
      const cur = provinceMap.get(l.province) ?? { leads: 0, gap: 0, won: 0 };
      cur.leads += 1;
      if (l.dealerId === '__gap__') cur.gap += 1;
      if (l.status === 'won') cur.won += 1;
      provinceMap.set(l.province, cur);
    });

    const activeProvinces = new Set(dealers.filter(d => d.status === 'active').map(d => d.province));

    const rows = Array.from(provinceMap.entries()).map(([province, v]) => ({
      province,
      leads: v.leads,
      gap: v.gap,
      won: v.won,
      hasDealer: activeProvinces.has(province),
      conversion: v.leads ? Math.round((v.won / v.leads) * 100) : 0,
    }));

    rows.sort((a, b) => b.leads - a.leads);
    const max = rows[0]?.leads ?? 1;

    const expansionTargets = rows.filter(r => !r.hasDealer && r.leads >= 10);

    return { rows, max, expansionTargets };
  }, []);

  const heatColor = (intensity: number) => {
    // 0..1 → from muted to primary
    if (intensity > 0.75) return 'bg-destructive/70 text-destructive-foreground';
    if (intensity > 0.5)  return 'bg-warning/70 text-warning-foreground';
    if (intensity > 0.25) return 'bg-accent/60 text-accent-foreground';
    if (intensity > 0.1)  return 'bg-primary/40 text-primary-foreground';
    return 'bg-muted text-foreground';
  };

  return (
    <div className="container py-8">
      <h1 className="font-display text-3xl font-bold mb-2">Lead Heatmap</h1>
      <p className="text-muted-foreground mb-6">
        Bản đồ nhiệt theo tỉnh/thành — phát hiện cơ hội mở thêm đại lý ở vùng có nhiều lead nhưng chưa phủ sóng.
      </p>

      {/* Expansion AI suggestion */}
      {data.expansionTargets.length > 0 && (
        <Card className="border-warning/40 bg-warning/5 mb-6">
          <CardContent className="p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">🎯 Đề xuất mở đại lý mới</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Phát hiện <strong>{data.expansionTargets.length} tỉnh</strong> có nhiều lead nhưng chưa có đại lý active.
                Khách phải gọi tổng đài Nhà Bè Agri — bỏ lỡ cơ hội O2O.
              </p>
              <div className="flex flex-wrap gap-2">
                {data.expansionTargets.map(t => (
                  <Badge key={t.province} variant="outline" className="border-warning/40 text-warning text-xs">
                    {t.province} · {t.leads} leads
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heatmap grid */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center justify-between">
            <span>Bản đồ nhiệt theo tỉnh/thành</span>
            <div className="flex items-center gap-2 text-[10px] font-normal">
              <span className="text-muted-foreground">Ít</span>
              <span className="w-3 h-3 rounded bg-muted" />
              <span className="w-3 h-3 rounded bg-primary/40" />
              <span className="w-3 h-3 rounded bg-accent/60" />
              <span className="w-3 h-3 rounded bg-warning/70" />
              <span className="w-3 h-3 rounded bg-destructive/70" />
              <span className="text-muted-foreground">Nhiều</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {data.rows.map(r => {
              const intensity = r.leads / data.max;
              return (
                <div
                  key={r.province}
                  className={`rounded-lg p-3 transition-transform hover:scale-105 ${heatColor(intensity)} ${
                    !r.hasDealer ? 'ring-2 ring-warning/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{r.province}</span>
                    </span>
                    {!r.hasDealer && <AlertTriangle className="w-3 h-3 shrink-0" />}
                  </div>
                  <p className="font-display font-bold text-2xl leading-none">{r.leads}</p>
                  <p className="text-[10px] opacity-80 mt-1">
                    {r.hasDealer ? `${r.conversion}% chốt` : 'Chưa có đại lý'}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail table */}
      <Card>
        <CardHeader><CardTitle className="text-base font-display">Chi tiết theo tỉnh</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground text-xs uppercase">
                  <th className="py-2 pr-4">Tỉnh/Thành</th>
                  <th className="py-2 pr-4">Trạng thái phủ sóng</th>
                  <th className="py-2 pr-4 text-right">Tổng lead</th>
                  <th className="py-2 pr-4 text-right">Lead vùng trống</th>
                  <th className="py-2 pr-4 text-right">Conversion</th>
                  <th className="py-2 text-center">Đề xuất</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map(r => (
                  <tr key={r.province} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{r.province}</td>
                    <td className="py-3 pr-4">
                      {r.hasDealer ? (
                        <Badge className="bg-success/15 text-success border-0 text-[10px]">✓ Đã có đại lý</Badge>
                      ) : (
                        <Badge className="bg-warning/15 text-warning border-0 text-[10px]">⚠ Vùng trống</Badge>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold">{r.leads}</td>
                    <td className="py-3 pr-4 text-right text-warning">{r.gap || '—'}</td>
                    <td className="py-3 pr-4 text-right">
                      {r.hasDealer ? `${r.conversion}%` : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 text-center">
                      {!r.hasDealer && r.leads >= 10 ? (
                        <Button size="sm" variant="outline" className="border-warning/40 text-warning hover:bg-warning/5">
                          <TrendingUp className="w-3 h-3 mr-1" /> Tuyển đại lý
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
