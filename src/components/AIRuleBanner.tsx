"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloudRain, ArrowRight, Sparkles } from 'lucide-react';
import { getActiveWeatherBanner, subscribeRules, type WeatherRule } from '@/lib/aiRules';
import { trackEvent } from '@/lib/tracking';

/**
 * Top-of-page banner injected by AI Rules Manager (Weather triggers).
 * Shows when weather rule conditions are met (e.g. drought in Tây Nguyên).
 */
export default function AIRuleBanner() {
  const [rule, setRule] = useState<WeatherRule | null>(() => getActiveWeatherBanner());

  useEffect(() => {
    const unsub = subscribeRules(() => setRule(getActiveWeatherBanner()));
    return unsub;
  }, []);

  useEffect(() => {
    if (rule) trackEvent('page_view', { source: `ai_weather_banner_${rule.id}` });
  }, [rule?.id]);

  if (!rule) return null;

  return (
    <Card className="relative overflow-hidden border-warning/50 bg-gradient-to-r from-warning/10 via-warning/5 to-background animate-slide-up">
      <div className="p-4 md:p-5 flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
          <CloudRain className="w-6 h-6 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-warning text-warning-foreground px-2 py-0.5 rounded inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Rule · Thời tiết
            </span>
            <span className="text-[10px] font-semibold text-warning">⚠️ Cảnh báo hạn — {rule.region}</span>
          </div>
          <h3 className="font-display font-bold text-base md:text-lg leading-snug">
            {rule.bannerTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mưa &lt; {rule.rainfallMmMax}mm trong {rule.consecutiveDays} ngày liên tiếp tại {rule.region}
          </p>
        </div>
        <Button asChild className="bg-warning text-warning-foreground hover:bg-warning/90">
          <Link href={rule.bannerCtaTo} onClick={() => trackEvent('category_click', { category: rule.bannerTitle, source: 'ai_weather_banner' })}>
            {rule.bannerCta} <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
