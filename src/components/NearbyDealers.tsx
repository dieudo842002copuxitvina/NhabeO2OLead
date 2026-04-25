"use client";

import { dealers, dealerProducts } from '@/data/mock';
import {
  expandingRadiusSearch,
  rankByStockThenDistance,
  rankByComposite,
  DEFAULT_LOCATION,
  GEO_CONFIG,
  type GeoCoord,
} from '@/lib/geo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Package, Phone, AlertCircle, Navigation } from 'lucide-react';
import DealerCTA from './DealerCTA';
import { Dealer } from '@/data/types';
import { useApp } from '@/contexts/AppContext';
import { useControlCenter } from '@/contexts/ControlCenterContext';
import { findNearestProvince } from '@/lib/seoLanding';
import { useEffect, useMemo, useState } from 'react';
import { fetchDistanceMatrix, type MatrixResponse } from '@/lib/distanceMatrix';

interface NearbyDealersProps {
  productId?: string;
  productName?: string;
  userLocation?: GeoCoord;
  maxResults?: number;
  showStock?: boolean;
}

export default function NearbyDealers({
  productId,
  productName,
  userLocation,
  maxResults = GEO_CONFIG.TOP_N,
  showStock = true,
}: NearbyDealersProps) {
  const { userLocation: ctxLocation } = useApp();
  const { config: cc } = useControlCenter();
  const origin = userLocation ?? ctxLocation ?? DEFAULT_LOCATION;
  const customerProvince = useMemo(() => findNearestProvince(origin.lat, origin.lng).name, [origin.lat, origin.lng]);

  const { ranked, radiusUsed, expanded, isEmpty } = useMemo(() => {
    const activeDealers = (dealers || []).filter(d => d.status === 'active');

    const eligible = productId
      ? activeDealers.filter(d =>
          dealerProducts.some(dp => dp.dealerId === d.id && dp.productId === productId)
        )
      : activeDealers;

    const { results, radiusUsed, expanded } = expandingRadiusSearch(
      origin,
      eligible,
      (d: Dealer) => ({ lat: d.lat, lng: d.lng }),
      maxResults,
      GEO_CONFIG.RADIUS_STEPS
    );

    const stockOf = (d: Dealer) => {
      if (!productId) return 999;
      const dp = dealerProducts.find(p => p.dealerId === d.id && p.productId === productId);
      return dp?.stock ?? 0;
    };

    // Composite ranking — Admin-tunable weights from /admin/control
    const composite = rankByComposite(
      (results || []).map((r) => ({
        result: r,
        stock: stockOf(r.item),
        reputation: Math.min(1, Math.max(0, (r.item?.rating ?? 0) / 5)),
      })),
      cc.weights,
      { maxRadiusKm: GEO_CONFIG.MAX_RADIUS_KM, inStockThreshold: cc.inStockThreshold },
    );

    const ranked = (composite || []).length > 0
      ? composite.map((c) => ({ item: c.item, distance: c.distance, stockStatus: c.stockStatus }))
      : rankByStockThenDistance(results, stockOf, cc.inStockThreshold);

    return { ranked, radiusUsed, expanded, isEmpty: results.length === 0 };
  }, [origin, productId, maxResults, cc.weights, cc.inStockThreshold]);

  // Fetch real driving distance from edge function (Google Maps if API key, else Haversine fallback)
  const [matrix, setMatrix] = useState<MatrixResponse | null>(null);
  useEffect(() => {
    if (ranked.length === 0) { setMatrix(null); return; }
    let cancelled = false;
    fetchDistanceMatrix(
      origin,
      (ranked || []).map((r) => ({ id: r.item.id, lat: r.item.lat, lng: r.item.lng })),
    ).then((res) => { if (!cancelled) setMatrix(res); });
    return () => { cancelled = true; };
  }, [origin, ranked]);

  const matrixById = useMemo(() => {
    const map = new Map<string, { distance_m: number; duration_s: number | null }>();
    (matrix?.results || []).forEach((r) => map.set(r.id, { distance_m: r.distance_m, duration_s: r.duration_s }));
    return map;
  }, [matrix]);

  // Re-rank: keep stock-priority groups (in_stock first), sort each group by real driving distance.
  // Falls back to original Haversine ranking if matrix not loaded yet.
  const displayRanked = useMemo(() => {
    if (matrixById.size === 0) return (ranked || []).slice(0, maxResults);
    const withDriving = (ranked || []).map((r) => {
      const m = matrixById.get(r.item.id);
      return { r, drivingM: m?.distance_m ?? (r.distance || 0) * 1000 };
    });
    withDriving.sort((a, b) => {
      // in_stock before others
      const sa = a.r.stockStatus === 'in_stock' ? 0 : 1;
      const sb = b.r.stockStatus === 'in_stock' ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return a.drivingM - b.drivingM;
    });
    return (withDriving || []).slice(0, maxResults).map((x) => x.r);
  }, [ranked, matrixById, maxResults]);

  // Fallback: no dealers within 50km → NBA hotline
  if (isEmpty) {
    return (
      <Card className="border-dashed border-warning/40 bg-warning/5">
        <CardContent className="p-5 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-warning" />
          <h3 className="font-semibold text-base mb-1">Chưa có đại lý trong bán kính {GEO_CONFIG.MAX_RADIUS_KM}km</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Liên hệ trực tiếp Tổng đài Nhà Bè Agri để được tư vấn và giao hàng tận nơi.
          </p>
          <Button
            asChild
            size="lg"
            className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            <a href={`tel:${GEO_CONFIG.HOTLINE}`}>
              <Phone className="w-5 h-5 mr-2" />
              Gọi Tổng đài {GEO_CONFIG.HOTLINE_DISPLAY}
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Radius info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {ranked.length} đại lý · bán kính {radiusUsed}km
          {expanded && <span className="text-warning ml-1">(mở rộng)</span>}
          {matrix?.source === 'google' && (
            <Badge variant="outline" className="ml-1 text-[10px] gap-1 py-0">
              <Navigation className="w-3 h-3" /> Đường bộ
            </Badge>
          )}
        </span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Có sẵn</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> Đặt hàng</span>
        </span>
      </div>

      {(displayRanked || []).map((result, i) => {
        const dealer = result?.item;
        if (!dealer) return null;
        const dp = productId
          ? (dealerProducts || []).find(p => p.dealerId === dealer.id && p.productId === productId)
          : null;
        const isInStock = result.stockStatus === 'in_stock';

        return (
          <Card
            key={dealer.id}
            className={`transition-all hover:shadow-md ${i === 0 ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}
          >
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{dealer.name}</h3>
                    {i === 0 && isInStock && (
                      <Badge className="bg-primary/10 text-primary border-0 text-[10px]">⭐ Đề xuất</Badge>
                    )}
                    <Badge
                      className={`text-[10px] border-0 font-medium ${
                        isInStock
                          ? 'bg-success/15 text-success'
                          : 'bg-warning/15 text-warning'
                      }`}
                    >
                      {isInStock ? '✓ Có sẵn' : '⏳ Đặt hàng'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{dealer.address}</span>
                  </p>
                </div>
                {(() => {
                  const m = matrixById.get(dealer.id);
                  const km = m ? +(m.distance_m / 1000).toFixed(1) : result.distance;
                  const mins = m?.duration_s ? Math.round(m.duration_s / 60) : null;
                  return (
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <Badge variant="outline" className="text-xs font-semibold">{km} km</Badge>
                      {mins !== null && <span className="text-[10px] text-muted-foreground">~{mins} phút</span>}
                    </div>
                  );
                })()}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-accent fill-accent" /> {dealer.rating}
                </span>
                <span>{dealer.totalOrders} đơn</span>
                {dp && showStock && isInStock && (
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" /> Còn {dp.stock}
                  </span>
                )}
              </div>

              {/* Price */}
              {dp && (
                <p className="font-bold text-lg text-primary mb-3">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dp.price)}
                </p>
              )}

              {/* CTA */}
              <DealerCTA
                phone={dealer.phone}
                zalo={dealer.zalo}
                dealerId={dealer.id}
                dealerName={dealer.name}
                productId={productId}
                productName={productName}
                customerProvince={customerProvince}
                size="lg"
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
