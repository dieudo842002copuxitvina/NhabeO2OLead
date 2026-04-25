import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Phone, Navigation, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dealers as allDealers } from '@/data/mock';
import { trackEvent } from '@/lib/tracking';
import { useIsMobile } from '@/hooks/use-mobile';

// Default user location: Ho Chi Minh City center (fallback before geolocation)
const DEFAULT_USER: [number, number] = [10.7769, 106.7009];

// Lazy-load the heavy Leaflet inner component only when the section enters viewport.
const LeafletInner = lazy(() => import('./geo/LeafletInner'));

function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * GeoLocatorMap — IntersectionObserver-gated Leaflet map.
 * - Map JS/CSS only loads when section scrolls within 200px of viewport.
 * - Mobile-tuned: tap-to-activate scroll, no animations, simpler markers.
 * - Top-3 nearest dealers list renders immediately (no map dependency).
 */
export default function GeoLocatorMap() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [userPos, setUserPos] = useState<[number, number]>(DEFAULT_USER);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'denied'>('idle');

  // 1) Lazy-load map only when near viewport (saves ~150KB Leaflet on first paint).
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || shouldLoadMap) return;
    if (!('IntersectionObserver' in window)) {
      setShouldLoadMap(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoadMap(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [shouldLoadMap]);

  // 2) Geolocate (cheap, no map dep) — runs once.
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setGeoStatus('ok');
      },
      () => setGeoStatus('denied'),
      { timeout: 6000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  const top3 = useMemo(() => {
    return [...allDealers]
      .map((d) => ({ ...d, distance: distanceKm(userPos, [d.lat, d.lng]) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  }, [userPos]);

  const onCall = (id: string, phone: string) => {
    trackEvent('call_click', { dealerId: id, source: 'geo_locator_map' });
    window.location.href = `tel:${phone}`;
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="geo-locator-heading"
      className="container py-8 md:py-10"
    >
      <header className="mb-5">
        <p className="text-[11px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" /> Đại lý & thợ kỹ thuật quanh bạn
        </p>
        <h2
          id="geo-locator-heading"
          className="font-display text-2xl md:text-3xl font-extrabold mt-1 leading-tight"
        >
          Tìm điểm hỗ trợ gần nhất
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {geoStatus === 'loading' && 'Đang xác định vị trí của bạn…'}
          {geoStatus === 'ok' && 'Đã định vị bạn — hiển thị Top 3 đại lý gần nhất.'}
          {geoStatus === 'denied' && 'Bạn chưa chia sẻ vị trí — đang dùng vị trí mặc định TP.HCM.'}
          {geoStatus === 'idle' && 'Bản đồ hiển thị mạng lưới đại lý và thợ kỹ thuật toàn quốc.'}
        </p>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* Map area — IntersectionObserver-gated */}
        <div className="col-span-12 lg:col-span-7">
          <Card className="overflow-hidden">
            <div className="relative h-[320px] md:h-[440px] w-full bg-muted/40">
              {!shouldLoadMap ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="w-7 h-7 opacity-60" />
                  <p className="text-xs">Bản đồ sẽ tải khi cuộn tới…</p>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-xs">Đang tải bản đồ…</span>
                    </div>
                  }
                >
                  <LeafletInner userPos={userPos} isMobile={isMobile} />
                </Suspense>
              )}

              {geoStatus === 'loading' && (
                <div className="absolute top-3 right-3 z-[400] bg-background/90 backdrop-blur rounded-md px-2 py-1 text-xs flex items-center gap-1.5 shadow">
                  <Loader2 className="w-3 h-3 animate-spin" /> Đang định vị…
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t bg-muted/30 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary" /> Đại lý
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-accent" /> Thợ kỹ thuật
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-info border-2 border-background ring-1 ring-info" />
                Bạn
              </span>
            </div>
          </Card>
        </div>

        {/* Top-3 dealers — renders instantly, independent of map */}
        <div className="col-span-12 lg:col-span-5">
          <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
            🏆 Top 3 đại lý gần nhất
          </h3>
          <div className="space-y-3">
            {top3.map((d, i) => (
              <Card key={d.id} className="hover:shadow-md hover:border-primary/40 transition-all">
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-display font-extrabold flex items-center justify-center shrink-0">
                    #{i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm leading-tight truncate">{d.name}</h4>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {d.distance.toFixed(1)} km
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-start gap-1 line-clamp-2">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {d.address}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => onCall(d.id, d.phone)}
                      className="mt-2 h-9 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1.5" /> Gọi ngay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
