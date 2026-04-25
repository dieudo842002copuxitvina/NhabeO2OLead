import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hammer, Phone, MessageCircle, Star, Briefcase, MapPin } from 'lucide-react';
import {
  getInstallers, subscribeInstallers, setInstallerAvailability,
  SPECIALTY_META, AVAILABILITY_META, type Installer, type InstallerAvailability,
} from '@/lib/installers';

/** Public Installer Portal — thợ tự cập nhật trạng thái rảnh / bận. */
export default function InstallerPortalPage() {
  const [list, setList] = useState<Installer[]>(() => getInstallers({ status: 'approved' }));
  const [activeId, setActiveId] = useState<string>(() => list[0]?.id ?? '');

  useEffect(() => subscribeInstallers(() => setList(getInstallers({ status: 'approved' }))), []);

  const me = list.find(i => i.id === activeId) ?? list[0];
  if (!me) {
    return (
      <div className="container py-12 max-w-md text-center">
        <Hammer className="w-16 h-16 mx-auto text-muted-foreground mb-3" />
        <h2 className="font-display text-xl font-bold">Chưa có thợ nào được duyệt</h2>
        <p className="text-muted-foreground mt-2">Đăng ký để tham gia mạng lưới.</p>
      </div>
    );
  }

  const setMyAvail = (a: InstallerAvailability) => setInstallerAvailability(me.id, a);

  return (
    <div className="container py-6 max-w-3xl">
      <div className="mb-4">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <Hammer className="w-8 h-8 text-primary" /> Cổng Đội thợ
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Cập nhật trạng thái để hệ thống ưu tiên điều phối đơn lắp đặt.</p>
      </div>

      {/* Demo switcher */}
      <Card className="mb-4 bg-muted/30">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-2">Demo: chọn thợ để xem trải nghiệm</p>
          <div className="flex flex-wrap gap-2">
            {list.map(i => (
              <button
                key={i.id} onClick={() => setActiveId(i.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  activeId === i.id ? 'bg-primary text-primary-foreground' : 'bg-background border'
                }`}
              >
                {i.fullName}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{me.fullName}</CardTitle>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{me.province}</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-warning text-warning" />{me.rating.toFixed(1)} ({me.jobsDone} đơn)</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{me.experienceYears} năm KN</span>
              </div>
            </div>
            <Badge variant="outline" className={AVAILABILITY_META[me.availability].color}>
              {AVAILABILITY_META[me.availability].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-1.5">Chuyên môn</p>
            <div className="flex flex-wrap gap-1.5">
              {me.specialties.map(s => (
                <Badge key={s} variant="secondary">{SPECIALTY_META[s].emoji} {SPECIALTY_META[s].label}</Badge>
              ))}
            </div>
          </div>

          {/* Availability toggle */}
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-2">Trạng thái nhận đơn</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(AVAILABILITY_META) as InstallerAvailability[]).map(a => (
                <button
                  key={a} onClick={() => setMyAvail(a)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    me.availability === a ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  {AVAILABILITY_META[a].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {me.availability === 'available' && '✅ Bạn đang được ưu tiên hiển thị cho khách trong khu vực.'}
              {me.availability === 'busy'      && '⚠️ Bạn vẫn xuất hiện trong danh sách nhưng xếp sau thợ Đang rảnh.'}
              {me.availability === 'offline'   && '🌙 Bạn ẩn khỏi danh sách matching đến khi bật lại.'}
            </p>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button asChild variant="outline" className="flex-1"><a href={`tel:${me.phone}`}><Phone className="w-4 h-4 mr-2" />{me.phone}</a></Button>
            <Button asChild className="flex-1"><a href={`https://zalo.me/${me.zalo.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle className="w-4 h-4 mr-2" />Zalo</a></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
