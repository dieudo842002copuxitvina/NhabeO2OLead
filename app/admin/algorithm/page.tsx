'use client';

import React, { useState, useCallback, useMemo } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Package,
  Star,
  History,
  Save,
  RotateCcw,
  Globe,
  Info,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

// ─── Types ───────────────────────────────────────────────────────────
interface WeightConfig {
  w1_distance: number;
  w2_stock: number;
  w3_reputation: number;
  w4_history: number;
}

const DEFAULT_WEIGHTS: WeightConfig = {
  w1_distance: 40,
  w2_stock: 25,
  w3_reputation: 20,
  w4_history: 15,
};

const WEIGHT_META = [
  {
    key: 'w1_distance' as const,
    label: 'W1 — Khoảng cách',
    description: 'Ưu tiên đại lý gần nhất với tọa độ khách hàng (tính theo PostGIS).',
    icon: MapPin,
    color: '#2196F3',
    bgColor: 'bg-blue-500/10',
  },
  {
    key: 'w2_stock' as const,
    label: 'W2 — Tồn kho',
    description: 'Ưu tiên đại lý có sẵn hàng trong kho (In-stock status từ Dealer Portal).',
    icon: Package,
    color: '#2E7D32',
    bgColor: 'bg-emerald-500/10',
  },
  {
    key: 'w3_reputation' as const,
    label: 'W3 — Uy tín',
    description: 'Đánh giá dựa trên điểm review, tỷ lệ hoàn thành đơn và phản hồi khách hàng.',
    icon: Star,
    color: '#FF9800',
    bgColor: 'bg-amber-500/10',
  },
  {
    key: 'w4_history' as const,
    label: 'W4 — Lịch sử chốt đơn',
    description: 'Tỷ lệ chuyển đổi Lead → Đơn hàng trong 90 ngày gần nhất.',
    icon: History,
    color: '#9C27B0',
    bgColor: 'bg-purple-500/10',
  },
];

// ─── Mock Preview Data ───────────────────────────────────────────────
interface DealerPreview {
  name: string;
  province: string;
  distanceKm: number;
  inStock: boolean;
  rating: number;
  closeRate: number;
}

const MOCK_DEALERS: DealerPreview[] = [
  { name: 'Đại lý Nông Phát', province: 'Đồng Nai', distanceKm: 12, inStock: true, rating: 4.8, closeRate: 32 },
  { name: 'Đại lý Xanh Việt', province: 'Bình Dương', distanceKm: 25, inStock: true, rating: 4.5, closeRate: 28 },
  { name: 'HTX Miền Đông', province: 'Tây Ninh', distanceKm: 48, inStock: false, rating: 4.2, closeRate: 18 },
  { name: 'Đại lý Bình Minh', province: 'Long An', distanceKm: 35, inStock: true, rating: 3.9, closeRate: 22 },
  { name: 'Đại lý Phú Lộc', province: 'Đắk Lắk', distanceKm: 150, inStock: true, rating: 4.7, closeRate: 35 },
];

function calculateScore(dealer: DealerPreview, weights: WeightConfig): number {
  const distScore = Math.max(0, 100 - dealer.distanceKm * 0.8);
  const stockScore = dealer.inStock ? 100 : 0;
  const repScore = (dealer.rating / 5) * 100;
  const histScore = dealer.closeRate * 2.5;

  return (
    (distScore * weights.w1_distance +
      stockScore * weights.w2_stock +
      repScore * weights.w3_reputation +
      histScore * weights.w4_history) /
    100
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function AlgorithmTuningPage() {
  const [weights, setWeights] = useState<WeightConfig>({ ...DEFAULT_WEIGHTS });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const total = weights.w1_distance + weights.w2_stock + weights.w3_reputation + weights.w4_history;
  const isValid = total === 100;

  const handleWeightChange = useCallback(
    (key: keyof WeightConfig, newValue: number) => {
      setWeights((prev) => {
        const oldValue = prev[key];
        const delta = newValue - oldValue;
        if (delta === 0) return prev;

        const otherKeys = (Object.keys(prev) as Array<keyof WeightConfig>).filter((k) => k !== key);
        const otherSum = otherKeys.reduce((sum, k) => sum + prev[k], 0);

        if (otherSum === 0) {
          // Can't redistribute — all other weights are 0
          return { ...prev, [key]: newValue };
        }

        const next = { ...prev, [key]: newValue };

        // Distribute the delta proportionally among other sliders
        let remaining = -delta;
        otherKeys.forEach((k, i) => {
          if (i === otherKeys.length - 1) {
            // Last slider absorbs the remainder to guarantee total = 100
            next[k] = Math.max(0, Math.min(100, prev[k] + remaining));
          } else {
            const proportion = prev[k] / otherSum;
            const adjustment = Math.round(-delta * proportion);
            const adjusted = Math.max(0, Math.min(100, prev[k] + adjustment));
            remaining -= adjusted - prev[k];
            next[k] = adjusted;
          }
        });

        return next;
      });
    },
    []
  );

  const handleReset = () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    toast({ title: '↩️ Đã khôi phục mặc định', description: 'Các trọng số đã được đặt lại về giá trị gốc.' });
  };

  const handleApply = async () => {
    if (!isValid) {
      toast({
        title: '⚠️ Tổng trọng số phải bằng 100%',
        description: `Hiện tại tổng = ${total}%. Vui lòng điều chỉnh.`,
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    // Simulate PATCH API call to Supabase
    await new Promise((r) => setTimeout(r, 1500));

    const now = new Date().toLocaleTimeString('vi-VN');
    setLastSaved(now);

    toast({
      title: '✅ Đã áp dụng cho toàn hệ thống',
      description: `Bộ trọng số mới đã được cập nhật lúc ${now}. Tất cả các lead mới sẽ sử dụng thuật toán mới.`,
    });
    setSaving(false);
  };

  // Live preview ranking
  const rankedDealers = useMemo(() => {
    return [...MOCK_DEALERS]
      .map((d) => ({ ...d, score: calculateScore(d, weights) }))
      .sort((a, b) => b.score - a.score);
  }, [weights]);

  return (
    <AdminShell title="Cấu hình thuật toán" subtitle="Geo-matching Algorithm Tuning — Điều chỉnh trọng số phân phối Lead">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: Sliders */}
        <div className="space-y-6 xl:col-span-7">
          {/* Weight Sliders Card */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Trọng số Geo-matching</CardTitle>
                  <CardDescription className="mt-1">
                    Điều chỉnh 4 trọng số quyết định thứ tự gợi ý đại lý cho Lead.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-mono text-xs',
                      isValid
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-red-500/30 bg-red-500/10 text-red-400'
                    )}
                  >
                    {isValid ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
                    Σ = {total}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {WEIGHT_META.map((meta) => (
                <div key={meta.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn('flex h-9 w-9 items-center justify-center rounded-xl', meta.bgColor)}
                      >
                        <meta.icon className="h-4 w-4" style={{ color: meta.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{meta.label}</p>
                        <p className="text-[11px] text-muted-foreground">{meta.description}</p>
                      </div>
                    </div>
                    <div
                      className="flex h-10 w-14 items-center justify-center rounded-xl border border-border/50 bg-muted/30 font-mono text-sm font-bold"
                      style={{ color: meta.color }}
                    >
                      {weights[meta.key]}%
                    </div>
                  </div>
                  <div className="px-1">
                    <Slider
                      value={[weights[meta.key]]}
                      onValueChange={([v]) => handleWeightChange(meta.key, v)}
                      min={0}
                      max={100}
                      step={5}
                      className="[&_[role=slider]]:border-2 [&_[role=slider]]:shadow-md"
                      style={{
                        // @ts-ignore custom property
                        '--slider-track-color': meta.color,
                      } as any}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Insight Note */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="flex gap-3 p-4">
              <Info className="h-5 w-5 flex-shrink-0 text-amber-400" />
              <div>
                <p className="mb-1 text-sm font-bold text-amber-300">Ghi chú quan trọng</p>
                <p className="text-[12px] leading-relaxed text-amber-400/80">
                  <strong>Tăng trọng số Tồn kho (W2)</strong> sẽ ưu tiên đại lý có sẵn hàng (In-stock)
                  lên <strong>Top 1</strong> bất kể khoảng cách. Điều này hữu ích khi một vùng có nhiều
                  đại lý nhưng chỉ ít đại lý có hàng tồn sẵn. Nông dân sẽ được kết nối với đại lý có
                  thể giao hàng ngay, giảm thời gian chờ đợi.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleApply}
              disabled={!isValid || saving}
              className="flex-1 rounded-xl py-6 text-base font-bold"
              style={{ backgroundColor: isValid ? '#2E7D32' : undefined }}
            >
              {saving ? (
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Globe className="mr-2 h-5 w-5" />
              )}
              Áp dụng cho toàn hệ thống
            </Button>
            <Button variant="outline" onClick={handleReset} className="rounded-xl px-6 py-6">
              <RotateCcw className="mr-2 h-4 w-4" />
              Mặc định
            </Button>
          </div>

          {lastSaved && (
            <p className="text-center text-[11px] text-muted-foreground">
              Lần áp dụng cuối: {lastSaved}
            </p>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="xl:col-span-5">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <CardTitle className="text-sm font-bold">Live Preview — Xếp hạng Đại lý</CardTitle>
              </div>
              <CardDescription className="text-[11px]">
                Mô phỏng thứ tự gợi ý đại lý dựa trên bộ trọng số hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Mock lead scenario */}
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Kịch bản Lead giả định
                </p>
                <p className="text-xs text-foreground">
                  🧑‍🌾 Khách từ <strong>Trảng Bom, Đồng Nai</strong> · Sầu riêng 3ha · Cần hệ thống tưới nhỏ giọt
                </p>
              </div>

              <Separator />

              {/* Ranked List */}
              {rankedDealers.map((dealer, i) => (
                <div
                  key={dealer.name}
                  className={cn(
                    'flex items-center gap-3 rounded-xl p-3 transition-all',
                    i === 0
                      ? 'border border-emerald-500/30 bg-emerald-500/5'
                      : 'border border-border/30 bg-muted/10'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                      i === 0
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    #{i + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{dealer.name}</p>
                      {i === 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] border-0">
                          TOP 1
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{dealer.distanceKm}km</span>
                      <span className={dealer.inStock ? 'text-emerald-400' : 'text-red-400'}>
                        {dealer.inStock ? '✓ Còn hàng' : '✕ Hết hàng'}
                      </span>
                      <span>⭐ {dealer.rating}</span>
                      <span>{dealer.closeRate}% chốt</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-foreground">
                      {dealer.score.toFixed(1)}
                    </p>
                    <p className="text-[9px] text-muted-foreground">điểm</p>
                  </div>
                </div>
              ))}

              {/* Breakdown for top dealer */}
              <div className="mt-2 rounded-xl border border-border/50 bg-muted/20 p-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Phân tích #{1}: {rankedDealers[0]?.name}
                </p>
                <div className="space-y-1.5">
                  {WEIGHT_META.map((meta) => {
                    const dealer = rankedDealers[0];
                    if (!dealer) return null;
                    const raw =
                      meta.key === 'w1_distance'
                        ? Math.max(0, 100 - dealer.distanceKm * 0.8)
                        : meta.key === 'w2_stock'
                        ? dealer.inStock ? 100 : 0
                        : meta.key === 'w3_reputation'
                        ? (dealer.rating / 5) * 100
                        : dealer.closeRate * 2.5;
                    const weighted = (raw * weights[meta.key]) / 100;

                    return (
                      <div key={meta.key} className="flex items-center gap-2 text-[11px]">
                        <div className="w-24 text-muted-foreground">{meta.label.split('—')[0].trim()}</div>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${weighted}%`, backgroundColor: meta.color }}
                          />
                        </div>
                        <div className="w-12 text-right font-mono text-muted-foreground">
                          {weighted.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}


