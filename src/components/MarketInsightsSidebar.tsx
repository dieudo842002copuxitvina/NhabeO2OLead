import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, ArrowUpRight, AlertTriangle, Bell } from 'lucide-react';
import { commodityPrices, dealers } from '@/data/mock';
import { PROVINCES, findProvince } from '@/lib/provinceGeo';
import { getEventLog } from '@/lib/tracking';

/**
 * Right-side insights sidebar:
 * - Top 3 hotspots (provinces with biggest 24h demand surge)
 * - Price alerts (commodities with biggest +%)
 */
export default function MarketInsightsSidebar() {
  const hotspots = useMemo(() => {
    const log = getEventLog();
    const day = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const recent = new Map<string, number>();
    const prior = new Map<string, number>();
    log.forEach((ev, i) => {
      if (ev.event !== 'calculator_used' && ev.event !== 'call_click' && ev.event !== 'zalo_click') return;
      const province = (ev.customerProvince as string) || PROVINCES[i % PROVINCES.length].name;
      if (now - ev.timestamp < day) recent.set(province, (recent.get(province) ?? 0) + 1);
      else if (now - ev.timestamp < 2 * day) prior.set(province, (prior.get(province) ?? 0) + 1);
    });
    const merged = PROVINCES.map(p => {
      const r = recent.get(p.name) ?? 0;
      const pr = prior.get(p.name) ?? 0;
      // Add deterministic baseline so demo always shows movement
      const base = ((p.name.charCodeAt(0) * 13) % 9);
      const surge = (r + base) - (pr + base * 0.7);
      return { province: p.name, region: p.region, count: r + base, surge };
    });
    return merged.sort((a, b) => b.surge - a.surge).slice(0, 3);
  }, []);

  const priceAlerts = useMemo(() => {
    return [...commodityPrices]
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
      .slice(0, 3)
      .map(c => {
        // Pick a "headline" province per commodity
        const province =
          c.name.includes('Cà phê') ? 'Gia Lai'
            : c.name.includes('Sầu riêng') ? 'Đắk Lắk'
            : c.name.includes('Tiêu') ? 'Bình Phước'
            : c.name.includes('Cao su') ? 'Bình Dương'
            : 'Cần Thơ';
        return { ...c, province };
      });
  }, []);

  const supplyGaps = useMemo(() => {
    const dealerProvinces = new Set(dealers.map(d => d.province));
    return hotspots.filter(h => !dealerProvinces.has(h.province)).slice(0, 2);
  }, [hotspots]);

  return (
    <Card className="h-full">
      <div className="p-3 border-b bg-gradient-to-r from-primary/10 to-warning/10">
        <div className="flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm">Quick Insights</h3>
          <Badge variant="secondary" className="text-[10px] ml-auto">24h</Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">Tóm tắt nhanh điểm nóng & biến động</p>
      </div>

      <CardContent className="p-3 space-y-4">
        {/* Top Hotspots */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="w-3.5 h-3.5 text-destructive" />
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Top Hotspots</h4>
          </div>
          <div className="space-y-1.5">
            {hotspots.map((h, i) => (
              <div key={h.province} className="flex items-center gap-2 p-2 rounded-md bg-destructive/5 border border-destructive/15 hover:bg-destructive/10 transition">
                <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs">{h.province}</p>
                  <p className="text-[10px] text-muted-foreground">{h.region} · {h.count} lượt tương tác</p>
                </div>
                <Badge className="bg-destructive/15 text-destructive border-0 text-[10px]">
                  <Flame className="w-2.5 h-2.5 mr-0.5" />+{Math.max(1, Math.round(h.surge * 10))}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Price Alerts */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Price Alerts</h4>
          </div>
          <div className="space-y-1.5">
            {priceAlerts.map(a => {
              const up = a.change >= 0;
              return (
                <div key={a.name} className={`p-2 rounded-md border ${up ? 'bg-success/5 border-success/20' : 'bg-info/5 border-info/20'}`}>
                  <div className="flex items-center gap-1.5">
                    <ArrowUpRight className={`w-3.5 h-3.5 ${up ? 'text-success' : 'text-info rotate-90'}`} />
                    <p className="font-semibold text-xs flex-1">{a.name}</p>
                    <span className={`text-xs font-bold ${up ? 'text-success' : 'text-info'}`}>
                      {up ? '+' : ''}{a.change}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Giá {a.name} tại <strong className="text-foreground">{a.province}</strong> {up ? 'vừa lập đỉnh mới' : 'đang điều chỉnh'} · {a.currentPrice.toLocaleString('vi-VN')} {a.unit}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supply gap warnings */}
        {supplyGaps.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
              <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Vùng cần mở đại lý</h4>
            </div>
            <div className="space-y-1.5">
              {supplyGaps.map(g => (
                <div key={g.province} className="p-2 rounded-md bg-warning/10 border border-warning/30">
                  <p className="text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-warning" /> {g.province}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nhu cầu cao nhưng chưa có đại lý</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
