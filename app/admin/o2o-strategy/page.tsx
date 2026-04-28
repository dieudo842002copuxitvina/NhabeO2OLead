'use client';

import React, { useState, useCallback, useMemo } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Package,
  Star,
  Award,
  Save,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Search,
  Zap,
  Globe,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ───────────────────────────────────────────────────────────
interface WeightConfig {
  distance: number;
  stock: number;
  reputation: number;
  partner_level: number;
}

const DEFAULT_WEIGHTS: WeightConfig = {
  distance: 35,
  stock: 25,
  reputation: 20,
  partner_level: 20,
};

const WEIGHT_META = [
  {
    key: 'distance' as const,
    label: 'Khoảng cách',
    desc: 'PostGIS distance scoring',
    icon: MapPin,
    color: '#2196F3',
  },
  {
    key: 'stock' as const,
    label: 'Tồn kho',
    desc: 'In-stock availability',
    icon: Package,
    color: '#2E7D32',
  },
  {
    key: 'reputation' as const,
    label: 'Uy tín',
    desc: 'Review score + completion rate',
    icon: Star,
    color: '#FF9800',
  },
  {
    key: 'partner_level' as const,
    label: 'Cấp độ đối tác',
    desc: 'Gold / Silver / Bronze tier',
    icon: Award,
    color: '#9C27B0',
  },
];

// ─── Mock dealer data for sandbox ────────────────────────────────────
interface DealerResult {
  name: string;
  province: string;
  distanceKm: number;
  inStock: boolean;
  rating: number;
  partnerTier: 'Gold' | 'Silver' | 'Bronze';
  score: number;
}

const MOCK_DEALER_DB: Omit<DealerResult, 'score'>[] = [
  { name: 'Đại lý Nông Phát', province: 'Đồng Nai', distanceKm: 12, inStock: true, rating: 4.8, partnerTier: 'Gold' },
  { name: 'Đại lý Xanh Việt', province: 'Bình Dương', distanceKm: 25, inStock: true, rating: 4.5, partnerTier: 'Silver' },
  { name: 'HTX Miền Đông', province: 'Tây Ninh', distanceKm: 48, inStock: false, rating: 4.2, partnerTier: 'Silver' },
  { name: 'Đại lý Bình Minh', province: 'Long An', distanceKm: 35, inStock: true, rating: 3.9, partnerTier: 'Bronze' },
  { name: 'Đại lý Phú Lộc', province: 'Đắk Lắk', distanceKm: 150, inStock: true, rating: 4.7, partnerTier: 'Gold' },
  { name: 'Đại lý Tân Phú', province: 'TP.HCM', distanceKm: 8, inStock: false, rating: 4.0, partnerTier: 'Silver' },
  { name: 'Đại lý Cao Nguyên', province: 'Lâm Đồng', distanceKm: 120, inStock: true, rating: 4.6, partnerTier: 'Gold' },
];

function calcScore(d: Omit<DealerResult, 'score'>, w: WeightConfig): number {
  const distScore = Math.max(0, 100 - d.distanceKm * 0.6);
  const stockScore = d.inStock ? 100 : 0;
  const repScore = (d.rating / 5) * 100;
  const tierScore = d.partnerTier === 'Gold' ? 100 : d.partnerTier === 'Silver' ? 60 : 30;
  return (
    (distScore * w.distance + stockScore * w.stock + repScore * w.reputation + tierScore * w.partner_level) / 100
  );
}

const TIER_COLORS: Record<string, string> = { Gold: '#FFB300', Silver: '#90A4AE', Bronze: '#A1887F' };

// ─── Main Page ───────────────────────────────────────────────────────
export default function O2OStrategyPage() {
  const [weights, setWeights] = useState<WeightConfig>({ ...DEFAULT_WEIGHTS });
  const [saving, setSaving] = useState(false);
  const [testAddress, setTestAddress] = useState('');
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<DealerResult[] | null>(null);

  const total = weights.distance + weights.stock + weights.reputation + weights.partner_level;
  const isValid = total === 100;

  // ─── Proportional redistribution ───
  const handleWeightChange = useCallback((key: keyof WeightConfig, newValue: number) => {
    setWeights((prev) => {
      const delta = newValue - prev[key];
      if (delta === 0) return prev;
      const otherKeys = (Object.keys(prev) as Array<keyof WeightConfig>).filter((k) => k !== key);
      const otherSum = otherKeys.reduce((sum, k) => sum + prev[k], 0);
      if (otherSum === 0) return { ...prev, [key]: newValue };

      const next = { ...prev, [key]: newValue };
      let remaining = -delta;
      otherKeys.forEach((k, i) => {
        if (i === otherKeys.length - 1) {
          next[k] = Math.max(0, Math.min(100, prev[k] + remaining));
        } else {
          const adj = Math.round(-delta * (prev[k] / otherSum));
          const clamped = Math.max(0, Math.min(100, prev[k] + adj));
          remaining -= clamped - prev[k];
          next[k] = clamped;
        }
      });
      return next;
    });
  }, []);

  // ─── Pie chart data ───
  const pieData = useMemo(
    () =>
      WEIGHT_META.map((m) => ({
        name: m.label,
        value: weights[m.key],
        color: m.color,
      })),
    [weights]
  );

  // ─── Sandbox Test ───
  const runTest = async () => {
    if (!testAddress.trim()) {
      toast({ title: '⚠️ Nhập địa chỉ', description: 'Vui lòng nhập địa chỉ hoặc tọa độ để test.', variant: 'destructive' });
      return;
    }
    setTestRunning(true);

    // Simulate RPC call to smart_geo_routing
    await new Promise((r) => setTimeout(r, 800));
    const results = MOCK_DEALER_DB
      .map((d) => ({ ...d, score: calcScore(d, weights) }))
      .sort((a, b) => b.score - a.score);
    setTestResults(results);
    setTestRunning(false);
  };

  // ─── Save to Supabase ───
  const handleSave = async () => {
    if (!isValid) {
      toast({ title: '⚠️ Tổng phải bằng 100%', description: `Hiện tại: ${total}%`, variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert(
          {
            key: 'o2o_routing_weights',
            value: weights as any,
            description: 'Trọng số O2O Geo-matching — Distance, Stock, Reputation, Partner Level',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      if (error) throw error;
      toast({ title: '✅ Đã lưu cấu hình O2O', description: 'Lead Engine sẽ áp dụng trọng số mới ngay lập tức.' });
    } catch (err: any) {
      toast({ title: '❌ Lỗi', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    setTestResults(null);
    toast({ title: '↩️ Đã khôi phục mặc định' });
  };

  return (
    <AdminShell title="Chiến lược O2O" subtitle="Cấu hình trọng số định tuyến Lead → Đại lý · Test Lab · Realtime Pie">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* ═══ Col 1: Sliders (compact) ═══ */}
        <div className="space-y-3 xl:col-span-4">
          <Card className="border-border/50">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider">Trọng số</CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono text-[10px]',
                    isValid ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'
                  )}
                >
                  {isValid ? <CheckCircle2 className="mr-1 h-2.5 w-2.5" /> : <AlertTriangle className="mr-1 h-2.5 w-2.5" />}
                  Σ={total}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-3 pt-0">
              {WEIGHT_META.map((meta) => (
                <div key={meta.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <meta.icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                      <span className="text-xs font-semibold text-foreground">{meta.label}</span>
                    </div>
                    <span className="w-10 text-right font-mono text-xs font-bold" style={{ color: meta.color }}>
                      {weights[meta.key]}%
                    </span>
                  </div>
                  <Slider
                    value={[weights[meta.key]]}
                    onValueChange={([v]) => handleWeightChange(meta.key, v)}
                    min={0}
                    max={100}
                    step={5}
                    className="h-4"
                  />
                  <p className="text-[9px] text-muted-foreground">{meta.desc}</p>
                </div>
              ))}

              <Separator className="my-2" />

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={!isValid || saving}
                  size="sm"
                  className="flex-1 rounded-lg text-xs"
                  style={{ backgroundColor: isValid ? '#2E7D32' : undefined }}
                >
                  {saving ? <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> : <Save className="mr-1 h-3 w-3" />}
                  Lưu cấu hình
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} className="rounded-lg text-xs">
                  <RotateCcw className="mr-1 h-3 w-3" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ Col 2: Pie Chart ═══ */}
        <div className="xl:col-span-3">
          <Card className="border-border/50">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs font-bold uppercase tracking-wider">Tỷ lệ trọng số</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={300}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value}%`}
                      contentStyle={{
                        background: 'hsl(222 47% 8%)',
                        border: '1px solid hsl(217 33% 17%)',
                        borderRadius: 10,
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 px-1">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[9px] text-muted-foreground">
                      {d.name} <strong className="text-foreground">{d.value}%</strong>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══ Col 3: Test Lab ═══ */}
        <div className="space-y-3 xl:col-span-5">
          <Card className="border-border/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <FlaskConical className="h-3.5 w-3.5 text-amber-400" />
                Test Lab — Sandbox
              </CardTitle>
              <CardDescription className="text-[10px]">
                Nhập địa chỉ để mô phỏng smart_geo_routing với bộ trọng số hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-3 pt-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={testAddress}
                    onChange={(e) => setTestAddress(e.target.value)}
                    placeholder="vd: Trảng Bom, Đồng Nai"
                    className="rounded-lg pl-8 text-xs"
                  />
                </div>
                <Button
                  onClick={runTest}
                  disabled={testRunning}
                  size="sm"
                  className="rounded-lg text-xs"
                  style={{ backgroundColor: '#2E7D32' }}
                >
                  {testRunning ? <RefreshCw className="mr-1 h-3 w-3 animate-spin" /> : <Zap className="mr-1 h-3 w-3" />}
                  Test
                </Button>
              </div>

              {/* Results */}
              {testResults && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Kết quả xếp hạng ({testResults.length} đại lý)
                  </p>
                  {testResults.map((d, i) => (
                    <div
                      key={d.name}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border p-2 transition-all',
                        i === 0
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-border/30 bg-muted/10'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold',
                          i === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs font-semibold text-foreground">{d.name}</p>
                          {i === 0 && <Badge className="border-0 bg-emerald-500/20 text-emerald-400 text-[8px] px-1 py-0">TOP</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                          <span>{d.distanceKm}km</span>
                          <span className={d.inStock ? 'text-emerald-400' : 'text-red-400'}>
                            {d.inStock ? '✓Stock' : '✕OOS'}
                          </span>
                          <span>⭐{d.rating}</span>
                          <span style={{ color: TIER_COLORS[d.partnerTier] }}>{d.partnerTier}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold text-foreground">{d.score.toFixed(1)}</p>
                        <p className="text-[8px] text-muted-foreground">pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!testResults && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-8">
                  <FlaskConical className="mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Nhập địa chỉ và nhấn "Test" để xem kết quả</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Score breakdown for #1 */}
          {testResults && testResults[0] && (
            <Card className="border-border/50">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider">
                  Score Breakdown: {testResults[0].name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 p-3 pt-0">
                {WEIGHT_META.map((meta) => {
                  const d = testResults[0];
                  const raw =
                    meta.key === 'distance' ? Math.max(0, 100 - d.distanceKm * 0.6)
                    : meta.key === 'stock' ? (d.inStock ? 100 : 0)
                    : meta.key === 'reputation' ? (d.rating / 5) * 100
                    : d.partnerTier === 'Gold' ? 100 : d.partnerTier === 'Silver' ? 60 : 30;
                  const weighted = (raw * weights[meta.key]) / 100;

                  return (
                    <div key={meta.key} className="flex items-center gap-2">
                      <meta.icon className="h-3 w-3 flex-shrink-0" style={{ color: meta.color }} />
                      <span className="w-16 text-[9px] text-muted-foreground">{meta.label}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(weighted, 100)}%`, backgroundColor: meta.color }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[9px]">{weighted.toFixed(1)}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
