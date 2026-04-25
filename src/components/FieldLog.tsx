"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, MapPin, Wrench, ShieldCheck, Truck, Phone, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityType = 'warranty' | 'install' | 'order' | 'delivery' | 'inquiry';

interface FieldEvent {
  id: string;
  type: ActivityType;
  text: string;
  province: string;
  minutesAgo: number;
}

const SEED: Omit<FieldEvent, 'id' | 'minutesAgo'>[] = [
  { type: 'warranty', text: 'Thợ Nguyễn Văn A vừa kích hoạt bảo hành máy bơm Grundfos', province: 'Đắk Lắk' },
  { type: 'install', text: 'Đội KTV Tâm hoàn thành lắp 2ha tưới nhỏ giọt sầu riêng', province: 'Bình Phước' },
  { type: 'order', text: 'Anh Lê Minh Tuấn đặt 12 cảm biến IoT ST-100', province: 'Lâm Đồng' },
  { type: 'inquiry', text: 'Chị Phạm Thị Hoa nhận báo giá hệ thống tưới cà phê 5ha', province: 'Gia Lai' },
  { type: 'delivery', text: 'Giao thành công bộ điều khiển AC-8 cho HTX Tân Phú', province: 'Đồng Nai' },
  { type: 'install', text: 'KTV Phong lắp 12 điểm cảm biến độ ẩm vườn bưởi', province: 'Long An' },
  { type: 'warranty', text: 'Thợ Trần Quốc Bảo bảo trì máy bơm cho vườn tiêu', province: 'Bà Rịa - Vũng Tàu' },
  { type: 'order', text: 'Anh Hoàng Đức Anh đặt 500m ống nhỏ giọt Rivulis', province: 'Tây Ninh' },
  { type: 'inquiry', text: 'Chị Nguyễn Mai Lan nhận tư vấn tưới phun mưa cho cà phê', province: 'Kon Tum' },
  { type: 'install', text: 'Đội KTV Hùng nghiệm thu trạm thời tiết WS-200', province: 'Đắk Nông' },
];

const TYPE_META: Record<ActivityType, { icon: typeof Wrench; color: string; label: string }> = {
  warranty: { icon: ShieldCheck, color: 'text-info bg-info/10', label: 'Bảo hành' },
  install: { icon: Wrench, color: 'text-primary bg-primary/10', label: 'Lắp đặt' },
  order: { icon: ShoppingCart, color: 'text-accent bg-accent/10', label: 'Đặt hàng' },
  delivery: { icon: Truck, color: 'text-secondary bg-secondary/10', label: 'Giao hàng' },
  inquiry: { icon: Phone, color: 'text-success bg-success/10', label: 'Tư vấn' },
};

function formatAgo(min: number): string {
  if (min < 1) return 'vừa xong';
  if (min < 60) return `${min} phút trước`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

/**
 * FieldLog — Live social-proof activity feed.
 * New entries slide in from the bottom every ~6s using Framer Motion.
 */
export default function FieldLog() {
  const [events, setEvents] = useState<FieldEvent[]>(() =>
    SEED.slice(0, 5).map((e, i) => ({
      ...e,
      id: `init-${i}`,
      minutesAgo: 1 + i * 3,
    })),
  );

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      const seed = SEED[(i + 5) % SEED.length];
      const next: FieldEvent = {
        ...seed,
        id: `live-${Date.now()}-${i}`,
        minutesAgo: 0,
      };
      setEvents((prev) => [next, ...prev.slice(0, 4)].map((e, idx) =>
        idx === 0 ? e : { ...e, minutesAgo: e.minutesAgo + 1 },
      ));
      i += 1;
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      aria-labelledby="field-log-heading"
      className="container py-8 md:py-10"
    >
      <header className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Hoạt động trực tiếp
          </p>
          <h2
            id="field-log-heading"
            className="font-display text-2xl md:text-3xl font-extrabold mt-1 leading-tight"
          >
            Field Log — Nhật ký đồng ruộng
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Hoạt động thực tế từ đại lý & thợ kỹ thuật trên cả nước.
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] hidden md:inline-flex">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse mr-1.5" />
          LIVE
        </Badge>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="p-2 md:p-3">
          <ul className="relative" aria-live="polite">
            <AnimatePresence initial={false}>
              {events.map((e) => {
                const meta = TYPE_META[e.type];
                const Icon = meta.icon;
                return (
                  <motion.li
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                        meta.color,
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          {meta.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {e.province}
                        </span>
                      </div>
                      <p className="text-sm leading-snug font-medium">{e.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatAgo(e.minutesAgo)}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
