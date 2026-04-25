import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, Calendar } from 'lucide-react';
import binhPhuoc from '@/assets/installation-binhphuoc.jpg';
import dongNai from '@/assets/installation-dongnai.jpg';
import longAn from '@/assets/installation-longan.jpg';
import lamDong from '@/assets/installation-lamdong.jpg';
import type { StaticImageData } from 'next/image';

interface LogEntry {
  img: StaticImageData;
  province: string;
  type: 'install' | 'maintain';
  product: string;
  date: string;
  technician: string;
}

const entries: LogEntry[] = [
  { img: binhPhuoc, province: 'Bình Phước', type: 'install', product: 'Hệ thống tưới nhỏ giọt 2ha', date: '16/04', technician: 'KTV Hùng' },
  { img: dongNai, province: 'Đồng Nai', type: 'maintain', product: 'Bảo trì máy bơm Grundfos', date: '15/04', technician: 'KTV Tâm' },
  { img: longAn, province: 'Long An', type: 'install', product: 'Cảm biến IoT 12 điểm', date: '14/04', technician: 'KTV Phong' },
  { img: lamDong, province: 'Lâm Đồng', type: 'install', product: 'Bộ điều khiển AC-8 nhà kính', date: '13/04', technician: 'KTV Quốc' },
];

export default function ConstructionLog() {
  return (
    <Card className="p-4 md:p-5 h-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-base flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-primary" /> Nhật ký thi công
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Hình ảnh thực tế từ đội kỹ thuật</p>
        </div>
        <Badge variant="secondary" className="text-[10px]">Tuần này</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {entries.map((e, i) => (
          <div
            key={i}
            className="group relative aspect-[4/5] rounded-lg overflow-hidden border bg-muted animate-slide-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <img
              src={e.img.src}
              alt={`${e.type === 'install' ? 'Lắp đặt' : 'Bảo trì'} tại ${e.province}`}
              loading="lazy"
              width={384}
              height={480}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/40 to-transparent" />
            <div className="absolute top-2 left-2">
              <Badge className={`text-[10px] border-0 ${e.type === 'install' ? 'bg-primary text-primary-foreground' : 'bg-info text-info-foreground'}`}>
                {e.type === 'install' ? '🔧 Lắp đặt' : '🛠️ Bảo trì'}
              </Badge>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2.5 text-background">
              <div className="flex items-center gap-1 text-[10px] font-semibold">
                <MapPin className="w-3 h-3" /> {e.province}
              </div>
              <p className="font-bold text-xs leading-tight mt-0.5 line-clamp-2">{e.product}</p>
              <div className="flex items-center justify-between mt-1.5 text-[10px] opacity-80">
                <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{e.date}</span>
                <span>{e.technician}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
