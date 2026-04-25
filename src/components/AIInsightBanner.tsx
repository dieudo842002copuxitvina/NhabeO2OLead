"use client";

import { useEffect, useMemo, useState } from 'react';
import { products } from '@/data/mock';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { trackEvent } from '@/lib/tracking';
import { fetchPriceTrends, type PriceTrend } from '@/lib/marketPrices';

/**
 * AI Banner — Live triggers (reads from public.market_prices):
 * - Any tracked crop with pctChange > +10% over last 30d → show alert
 * - Personalize headline if user is in matching province
 */

const ALERT_THRESHOLD_PCT = 10;

function isInTayNguyen(lat: number, lng: number): boolean {
  return lat >= 11.5 && lat <= 15.5 && lng >= 107.0 && lng <= 109.0;
}

const CROP_SUGGESTIONS: Record<string, RegExp> = {
  sau_rieng: /(drone|béc|tưới|grundfos|nho gi)/i,
  ca_phe: /(drone|grundfos|công suất|cr ?15|ps2)/i,
  tieu: /(nhỏ giọt|béc|lọc)/i,
};

export default function AIInsightBanner() {
  const { userLocation, geoDetected } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [trends, setTrends] = useState<PriceTrend[]>([]);

  useEffect(() => {
    fetchPriceTrends().then(setTrends).catch(() => setTrends([]));
  }, []);

  const trigger = useMemo(() => {
    const top = trends.find((t) => t.pctChange >= ALERT_THRESHOLD_PCT);
    if (!top) return null;
    const inProvince = geoDetected && userLocation
      && top.province.toLowerCase().includes('đắk') && isInTayNguyen(userLocation.lat, userLocation.lng);
    const re = CROP_SUGGESTIONS[top.crop_key] ?? /(béc|tưới|bơm)/i;
    const suggested = products
      .filter((p) => re.test(`${p.name} ${p.category_id} ${p.description || ''}`))
      .slice(0, 2);
    return { top, inProvince, suggested };
  }, [trends, userLocation, geoDetected]);

  useEffect(() => {
    if (trigger && !dismissed) trackEvent('page_view', { source: `ai_banner_${trigger.top.crop_key}_peak` });
  }, [trigger, dismissed]);

  if (!trigger || dismissed) return null;
  const { top, inProvince, suggested } = trigger;

  return (
    <div className="relative animate-fade-in">
      {/* Ambient glow behind the floating card */}
      <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/15 to-transparent blur-2xl opacity-60 pointer-events-none" />
      <div className="glass relative overflow-hidden rounded-2xl ring-1 ring-foreground/5">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 w-9 h-9 rounded-full hover:bg-foreground/10 flex items-center justify-center text-muted-foreground transition-colors z-10"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 shadow-md shadow-accent/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-warning text-warning-foreground px-2 py-0.5 rounded">
                AI Insight · Live
              </span>
              <span className="text-[10px] font-semibold text-warning flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +{top.pctChange}% / 30 ngày
              </span>
              {inProvince && (
                <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                  📍 {top.province}
                </span>
              )}
            </div>
            <h3 className="font-display font-bold text-base md:text-lg leading-snug">
              Giá {top.crop_label} đạt đỉnh {top.latest.toLocaleString('vi-VN')}đ/{top.unit} — {inProvince ? 'Nâng cấp hệ thống tưới để tối ưu năng suất' : 'Cơ hội mở rộng quy mô vụ tới'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Giá tăng <strong>+{top.pctChange}%</strong> tại {top.province} (từ {top.previous.toLocaleString('vi-VN')}đ lên {top.latest.toLocaleString('vi-VN')}đ). Đầu tư hệ tưới Nhà Bè Agri ngay để không bỏ lỡ vụ.
            </p>

            {suggested.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-2 mt-3">
                {suggested.map((p) => (
                  <Link
                    key={p.id}
                    href={`/san-pham/${p.slug}`}
                    onClick={() => trackEvent('product_view', { productId: p.id, productName: p.name, source: 'ai_banner_live' })}
                    className="flex items-center gap-2 p-2.5 rounded-lg border bg-card hover:border-primary/40 hover:shadow-sm transition-all group min-h-[56px]"
                  >
                    <span>{p.name.toLowerCase().includes('bơm') ? '⚡' : '💧'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{p.name}</p>
                      <p className="text-[11px] text-primary font-bold">Từ {p.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 min-h-[44px]">
                <Link href="/cong-cu">Mở công cụ tính <ArrowRight className="ml-1 w-3 h-3" /></Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="min-h-[44px]">
                <Link href="/gia-nong-san">Xem giá nông sản</Link>
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
