"use client";

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useHomepageConfig } from '@/contexts/HomepageConfigContext';
import { getMarketPrices, QUERY_KEYS, type MarketPriceTicker } from '@/lib/supabaseQueries';
import { commodityPrices } from '@/data/mock';

/**
 * TickerTape — dải băng giá chạy ngang.
 * - Real data từ Supabase (market_prices), fallback → mock
 * - Stale 5 phút, refetch mỗi 10 phút
 * - Admin override: manual mode → text từ HomepageConfig
 */
export default function TickerTape() {
  const { config, isBlockVisible } = useHomepageConfig();

  const { data: liveItems, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.marketPrices,
    queryFn:  getMarketPrices,
    staleTime:   5  * 60 * 1000,  // 5 min
    refetchInterval: 10 * 60 * 1000, // 10 min
    // Keep previous data while refetching (no flicker)
    placeholderData: (prev) => prev,
  });

  // Priority sort (same as before for consistency)
  const items = useMemo<MarketPriceTicker[]>(() => {
    const priority = ['Cà phê', 'Tiêu', 'Sầu riêng', 'Cao su', 'Lúa'];
    const source = liveItems ?? commodityPrices.map((c, i) => ({
      id: `mock-${i}`,
      cropLabel: c.name,
      province: 'Tây Nguyên',
      priceVnd: c.currentPrice,
      unit: c.unit,
      changePct: c.change,
      recordedAt: '',
    }));
    return [...source].sort((a, b) => {
      const ai = priority.findIndex(p => a.cropLabel.includes(p));
      const bi = priority.findIndex(p => b.cropLabel.includes(p));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [liveItems]);

  if (!isBlockVisible('ticker')) return null;

  const manualMode = config.ticker.mode === 'manual';
  const manualLoop = manualMode
    ? Array.from({ length: 4 }, () => config.ticker.manualText).join('   ·   ')
    : '';

  return (
    <div className="bg-foreground text-background overflow-hidden border-b border-foreground/10">
      <div className="flex items-center">
        {/* Badge */}
        <div className="shrink-0 bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1">
          {isLoading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-background animate-pulse" />
          )}
          {manualMode ? 'Tin' : 'Live'}
        </div>

        {/* Scroll strip */}
        <div className="relative flex-1 overflow-hidden">
          {manualMode ? (
            <div className="flex animate-ticker whitespace-nowrap py-1.5">
              <span className="px-5 text-xs font-semibold">{manualLoop}   ·   {manualLoop}</span>
            </div>
          ) : isError ? (
            /* Soft error — still shows mock via items fallback */
            <div className="flex animate-ticker whitespace-nowrap py-1.5">
              {[...items, ...items].map((c, i) => (
                <TickerItem key={`${c.id}-${i}`} item={c} />
              ))}
            </div>
          ) : (
            <div className="flex animate-ticker whitespace-nowrap py-1.5">
              {[...items, ...items].map((c, i) => (
                <TickerItem key={`${c.id}-${i}`} item={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TickerItem ───────────────────────────────────────────────────────────────
function TickerItem({ item }: { item: MarketPriceTicker }) {
  const change = item.changePct;
  const up = change === null ? null : change >= 0;

  return (
    <div className="flex items-center gap-2 px-5 text-xs">
      <span className="font-semibold">{item.cropLabel}</span>
      {item.province && item.province !== 'Tây Nguyên' && (
        <span className="text-background/50 text-[10px]">{item.province}</span>
      )}
      <span className="font-mono">
        {item.priceVnd.toLocaleString('vi-VN')} {item.unit}
      </span>
      {change !== null && up !== null && (
        <span className={`flex items-center gap-0.5 font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {up ? '+' : ''}{change}%
        </span>
      )}
      <span className="text-background/30">·</span>
    </div>
  );
}
