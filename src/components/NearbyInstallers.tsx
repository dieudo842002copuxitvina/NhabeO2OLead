import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hammer, Phone, MessageCircle, Star, MapPin } from 'lucide-react';
import { getInstallers, AVAILABILITY_META, SPECIALTY_META, type Installer } from '@/lib/installers';
import { expandingRadiusSearch } from '@/lib/geo';
import { useApp } from '@/contexts/AppContext';
import { trackEvent } from '@/lib/tracking';

interface NearbyInstallersProps {
  limit?: number;
  context?: string; // for tracking, e.g. "calculator-success"
}

/**
 * Top-N đội thợ gần khách + đánh giá cao nhất.
 * Ưu tiên Đang rảnh > Đang thi công > (Tạm nghỉ ẩn). Tie-break by rating desc.
 */
export default function NearbyInstallers({ limit = 3, context = 'unknown' }: NearbyInstallersProps) {
  const { userLocation } = useApp();
  const approved = getInstallers({ status: 'approved' }).filter(i => i.availability !== 'offline');

  const { results: matched } = expandingRadiusSearch(
    userLocation, approved, i => ({ lat: i.lat, lng: i.lng }), 10, [50, 100, 300]
  );

  const ranked = matched
    .map(r => ({ ...r, item: r.item as Installer }))
    .sort((a, b) => {
      // available first, then by rating
      const aAvail = a.item.availability === 'available' ? 1 : 0;
      const bAvail = b.item.availability === 'available' ? 1 : 0;
      if (aAvail !== bAvail) return bAvail - aAvail;
      if (b.item.rating !== a.item.rating) return b.item.rating - a.item.rating;
      return a.distance - b.distance;
    })
    .slice(0, limit);

  if (ranked.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Hiện chưa có đội thợ trong khu vực của bạn. Bạn có thể yêu cầu Nhà Bè Agri điều phối từ vùng lân cận.
        </CardContent>
      </Card>
    );
  }

  const handleClick = (i: Installer, channel: 'call' | 'zalo') => {
    trackEvent('installer_contact', { installerId: i.id, channel, context });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <Hammer className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Top {ranked.length} đội thợ trong khu vực bạn</h3>
      </div>
      {ranked.map(({ item: i, distance }) => (
        <Card key={i.id} className="hover:border-primary/40 transition-colors">
          <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm truncate">{i.fullName}</p>
                <Badge variant="outline" className={`${AVAILABILITY_META[i.availability].color} text-[10px] px-1.5 py-0`}>
                  {AVAILABILITY_META[i.availability].label}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-warning text-warning" />{i.rating.toFixed(1)} · {i.jobsDone} đơn</span>
                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{distance} km · {i.province}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {i.specialties.slice(0, 3).map(s => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                    {SPECIALTY_META[s].emoji} {SPECIALTY_META[s].label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-1.5 sm:flex-col">
              <Button asChild size="sm" variant="outline" className="flex-1 h-8" onClick={() => handleClick(i, 'call')}>
                <a href={`tel:${i.phone}`}><Phone className="w-3.5 h-3.5 mr-1" />Gọi</a>
              </Button>
              <Button asChild size="sm" className="flex-1 h-8" onClick={() => handleClick(i, 'zalo')}>
                <a href={`https://zalo.me/${i.zalo.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="w-3.5 h-3.5 mr-1" />Zalo
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
