import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Phone, MessageCircle, Users, AlertTriangle, BarChart3, Filter, Trophy, Activity, RefreshCw } from 'lucide-react';
import { getCapiBreakdown, getConversionFunnel, getDealerRanking, getQAFlaggedDealers, type CapiRow, type FunnelStage, type DealerRanking } from '@/lib/marketingAnalytics';
import { subscribeEvents } from '@/lib/tracking';
import { subscribeLeads } from '@/lib/leads';
import { toast } from 'sonner';

const RANGES = [
  { label: '24h', ms: 86400000 },
  { label: '7 ngày', ms: 7 * 86400000 },
  { label: '30 ngày', ms: 30 * 86400000 },
  { label: 'Tất cả', ms: undefined as number | undefined },
];

export default function AdminMarketingBIPage() {
  const [rangeIdx, setRangeIdx] = useState(1);
  const [tick, setTick] = useState(0);
  const range = RANGES[rangeIdx];

  // Real-time subscriptions
  useEffect(() => {
    const u1 = subscribeEvents(() => setTick(t => t + 1));
    const u2 = subscribeLeads(() => setTick(t => t + 1));
    const interval = setInterval(() => setTick(t => t + 1), 10000); // refresh every 10s
    return () => { u1(); u2(); clearInterval(interval); };
  }, []);

  const capi = useMemo(() => getCapiBreakdown(range.ms), [rangeIdx, tick]);
  const funnel = useMemo(() => getConversionFunnel(range.ms), [rangeIdx, tick]);
  const ranking = useMemo(() => getDealerRanking(), [tick]);
  const flagged = useMemo(() => getQAFlaggedDealers(), [tick]);

  const totals = useMemo(() => {
    const calls = capi.reduce((s, r) => s + r.callClicks, 0);
    const zalos = capi.reduce((s, r) => s + r.zaloClicks, 0);
    const visits = capi.reduce((s, r) => s + r.pageViews, 0);
    const cvr = visits > 0 ? Math.round(((calls + zalos) / visits) * 1000) / 10 : 0;
    return { calls, zalos, visits, cvr };
  }, [capi]);

  return (
    <div className="container py-6 max-w-7xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-extrabold flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" /> Marketing BI Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time CAPI tracking, Conversion Funnel, Dealer Ranking & QA Flags
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Activity className="w-3 h-3 text-success animate-pulse" /> Live · refresh 10s
          </Badge>
          <div className="flex border rounded-md overflow-hidden">
            {RANGES.map((r, i) => (
              <button
                key={r.label}
                onClick={() => setRangeIdx(i)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === rangeIdx ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard icon={<Users className="w-5 h-5" />} label="Truy cập" value={totals.visits.toLocaleString()} tone="default" />
        <KpiCard icon={<Phone className="w-5 h-5" />} label="Click Gọi" value={totals.calls.toLocaleString()} tone="info" />
        <KpiCard icon={<MessageCircle className="w-5 h-5" />} label="Click Zalo" value={totals.zalos.toLocaleString()} tone="success" />
        <KpiCard icon={<TrendingUp className="w-5 h-5" />} label="CVR Tổng" value={`${totals.cvr}%`} tone="warning" />
      </div>

      {/* Flagged QA banner */}
      {flagged.length > 0 && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5 animate-slide-up">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold">⚠️ {flagged.length} đại lý cần tổ QA hỗ trợ đào tạo lại</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Tỷ lệ chốt đơn &lt; 10% với ≥5 leads: {flagged.slice(0, 5).map(d => d.dealerName).join(', ')}{flagged.length > 5 ? `... +${flagged.length - 5}` : ''}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast.success(`Đã gửi yêu cầu đào tạo cho ${flagged.length} đại lý`)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Trigger QA
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="capi" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="capi"><BarChart3 className="w-4 h-4 mr-1.5" /> CAPI Tracking</TabsTrigger>
          <TabsTrigger value="funnel"><Filter className="w-4 h-4 mr-1.5" /> Conversion Funnel</TabsTrigger>
          <TabsTrigger value="ranking"><Trophy className="w-4 h-4 mr-1.5" /> Dealer Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="capi"><CapiTab rows={capi} /></TabsContent>
        <TabsContent value="funnel"><FunnelTab stages={funnel} /></TabsContent>
        <TabsContent value="ranking"><RankingTab rows={ranking} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ===================== KPI Card =====================

function KpiCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'default' | 'info' | 'success' | 'warning' }) {
  const toneClass = {
    default: 'bg-primary/10 text-primary',
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  }[tone];
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneClass}`}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold font-display">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ===================== CAPI Tab =====================

function CapiTab({ rows }: { rows: CapiRow[] }) {
  const max = Math.max(...rows.map(r => r.totalConversions), 1);
  const ICONS: Record<string, string> = {
    facebook: '📘', tiktok: '🎵', google: '🔍', organic: '🌿', direct: '🔗',
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Click Gọi/Zalo theo nguồn Ads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nguồn</TableHead>
                <TableHead className="text-right">Truy cập</TableHead>
                <TableHead className="text-right">Xem SP</TableHead>
                <TableHead className="text-right">Gọi</TableHead>
                <TableHead className="text-right">Zalo</TableHead>
                <TableHead className="text-right">Inquiry</TableHead>
                <TableHead className="text-right">Tổng CV</TableHead>
                <TableHead className="text-right">CVR</TableHead>
                <TableHead className="min-w-[140px]">Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.adSource}>
                  <TableCell className="font-medium">
                    <span className="mr-1.5">{ICONS[r.adSource]}</span>{r.label}
                  </TableCell>
                  <TableCell className="text-right">{r.pageViews}</TableCell>
                  <TableCell className="text-right">{r.productViews}</TableCell>
                  <TableCell className="text-right text-info font-semibold">{r.callClicks}</TableCell>
                  <TableCell className="text-right text-success font-semibold">{r.zaloClicks}</TableCell>
                  <TableCell className="text-right">{r.inquiries}</TableCell>
                  <TableCell className="text-right font-bold">{r.totalConversions}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={r.cvr >= 5 ? 'default' : r.cvr >= 2 ? 'secondary' : 'outline'}>{r.cvr}%</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(r.totalConversions / max) * 100}%` }} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ===================== Funnel Tab =====================

function FunnelTab({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map(s => s.count), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conversion Funnel: Truy cập → Dùng máy tính ROI → Bấm Gọi/Zalo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((s, i) => {
          const widthPct = (s.count / max) * 100;
          const dropOff = i > 0 ? 100 - s.pctOfPrev : 0;
          return (
            <div key={s.key} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  {s.label}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  {i > 0 && (
                    <span className={dropOff > 50 ? 'text-destructive' : dropOff > 30 ? 'text-warning' : 'text-muted-foreground'}>
                      ↓ {dropOff.toFixed(1)}%
                    </span>
                  )}
                  <span className="font-bold text-base">{s.count.toLocaleString()}</span>
                  <span className="text-muted-foreground">({s.pctOfTotal}%)</span>
                </div>
              </div>
              <div className="h-8 rounded-md bg-muted overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all flex items-center justify-end px-3 text-xs font-semibold text-primary-foreground"
                  style={{ width: `${Math.max(widthPct, 5)}%` }}
                >
                  {s.pctOfPrev.toFixed(1)}% chuyển đổi
                </div>
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground pt-2 border-t">
          💡 Stage chuyển đổi yếu nhất: <strong>{worstStage(stages)}</strong> — đề xuất tối ưu CTA hoặc UX bước này.
        </p>
      </CardContent>
    </Card>
  );
}

function worstStage(stages: FunnelStage[]): string {
  let worst = { label: '-', pct: 100 };
  for (let i = 1; i < stages.length; i++) {
    if (stages[i].pctOfPrev < worst.pct) worst = { label: stages[i].label, pct: stages[i].pctOfPrev };
  }
  return `${worst.label} (${worst.pct.toFixed(1)}%)`;
}

// ===================== Ranking Tab =====================

function RankingTab({ rows }: { rows: DealerRanking[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bảng xếp hạng Đại lý — Response Rate & Close Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Đại lý</TableHead>
                <TableHead>Khu vực</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Đã LH</TableHead>
                <TableHead className="text-right">Đã chốt</TableHead>
                <TableHead className="text-right">Response Rate</TableHead>
                <TableHead className="text-right">Close Rate</TableHead>
                <TableHead className="text-right">TG p.hồi</TableHead>
                <TableHead>QA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.dealerId} className={r.qaFlag ? 'bg-destructive/5' : ''}>
                  <TableCell>
                    {r.rank <= 3 ? (
                      <span className="text-lg">{['🥇','🥈','🥉'][r.rank - 1]}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">{r.rank}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{r.dealerName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.region}</TableCell>
                  <TableCell className="text-right">{r.totalLeads}</TableCell>
                  <TableCell className="text-right">{r.contacted}</TableCell>
                  <TableCell className="text-right">{r.won}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={r.responseRate >= 70 ? 'default' : r.responseRate >= 40 ? 'secondary' : 'outline'}>
                      {r.responseRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={
                        r.closeRate >= 20 ? 'bg-success text-success-foreground' :
                        r.closeRate >= 10 ? 'bg-warning text-warning-foreground' :
                        'bg-destructive text-destructive-foreground'
                      }
                    >
                      {r.closeRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{r.avgResponseMin}p</TableCell>
                  <TableCell>
                    {r.qaFlag ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3" /> Đào tạo
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">OK</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
          🚩 <strong>Auto-flag QA</strong>: Đại lý có Close Rate &lt; 10% và ≥5 leads sẽ tự động được gắn flag "Cần đào tạo lại".
        </p>
      </CardContent>
    </Card>
  );
}
