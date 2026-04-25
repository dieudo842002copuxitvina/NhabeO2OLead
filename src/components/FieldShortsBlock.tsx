"use client";

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Clapperboard } from 'lucide-react';
import { trackEvent } from '@/lib/tracking';

// ─── Mock Data ────────────────────────────────────────────────────────────────
interface FieldVideo {
  id: string;
  title: string;
  location: string;
  duration: string;
  views: string;
  gradient: string;
  emoji: string;
  overlayFrom: string;
}

const FIELD_VIDEOS: FieldVideo[] = [
  {
    id: 'fv1',
    title: 'Cận cảnh béc BS5000 tại Lâm Đồng — Tưới nhỏ giọt 4ha sầu riêng',
    location: 'Bảo Lộc, Lâm Đồng',
    duration: '3:42',
    views: '12.4K',
    gradient: 'from-emerald-800 via-green-700 to-teal-800',
    emoji: '💧',
    overlayFrom: 'from-black/70',
  },
  {
    id: 'fv2',
    title: 'Nghiệm thu trạm bơm Inverter 5.5kW — Tiết kiệm 40% điện',
    location: 'Cư M\'gar, Đắk Lắk',
    duration: '5:18',
    views: '8.9K',
    gradient: 'from-blue-900 via-indigo-800 to-violet-900',
    emoji: '⚡',
    overlayFrom: 'from-black/75',
  },
  {
    id: 'fv3',
    title: 'So sánh thực tế: Ống HDPE vs PVC dưới áp lực cao tại vườn tiêu',
    location: 'Chư Sê, Gia Lai',
    duration: '4:05',
    views: '6.2K',
    gradient: 'from-amber-900 via-orange-800 to-red-900',
    emoji: '🔩',
    overlayFrom: 'from-black/70',
  },
  {
    id: 'fv4',
    title: 'Hướng dẫn lắp bộ điều khiển AC-8 từ A đến Z — Không cần thợ điện',
    location: 'Cao Lãnh, Đồng Tháp',
    duration: '7:30',
    views: '21.1K',
    gradient: 'from-violet-900 via-purple-800 to-indigo-900',
    emoji: '📱',
    overlayFrom: 'from-black/80',
  },
  {
    id: 'fv5',
    title: 'Mùa thu hoạch xoài: Hệ thống tưới tự động vận hành thế nào?',
    location: 'Tiền Giang',
    duration: '2:55',
    views: '5.7K',
    gradient: 'from-yellow-800 via-amber-700 to-orange-800',
    emoji: '🥭',
    overlayFrom: 'from-black/65',
  },
  {
    id: 'fv6',
    title: 'Phân NPK tan chậy — Cách bón đúng cho cà phê giai đoạn nuôi trái',
    location: 'Di Linh, Lâm Đồng',
    duration: '4:50',
    views: '9.3K',
    gradient: 'from-green-900 via-emerald-800 to-teal-900',
    emoji: '🌱',
    overlayFrom: 'from-black/70',
  },
];

// ─── VideoCard — 9:16 portrait ────────────────────────────────────────────────
function VideoCard({ video, index }: { video: FieldVideo; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="snap-start shrink-0 relative cursor-pointer group"
      style={{ width: 160 }}
      onClick={() => trackEvent('field_video_click', { videoId: video.id })}
      role="button"
      aria-label={`Xem video: ${video.title}`}
      tabIndex={0}
    >
      {/* Portrait 9:16 container */}
      <div
        className={`relative rounded-2xl overflow-hidden bg-gradient-to-b ${video.gradient} border border-white/10 shadow-lg group-hover:shadow-2xl transition-shadow duration-300`}
        style={{ aspectRatio: '9/16' }}
      >
        {/* Background emoji decoration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl opacity-20 select-none">{video.emoji}</span>
        </div>

        {/* Play button — center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-2xl shadow-black/40 group-hover:bg-white transition-colors"
          >
            <Play className="w-6 h-6 text-[#2D5A27] fill-[#2D5A27] ml-0.5" />
          </motion.div>
        </div>

        {/* Duration badge — top right */}
        <div className="absolute top-2.5 right-2.5 text-[10px] font-bold text-white bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
          {video.duration}
        </div>

        {/* Views badge — top left */}
        <div className="absolute top-2.5 left-2.5 text-[10px] font-semibold text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
          {video.views}
        </div>

        {/* Bottom gradient overlay + text */}
        <div className={`absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t ${video.overlayFrom} to-transparent rounded-b-2xl flex flex-col justify-end p-3`}>
          <p className="text-white font-bold text-[11px] leading-snug line-clamp-3 drop-shadow-sm">
            {video.title}
          </p>
          <p className="text-white/70 text-[10px] mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
            {video.location}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Block ───────────────────────────────────────────────────────────────
export default function FieldShortsBlock() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="field-shorts-heading" className="py-12 md:py-16 overflow-hidden">
      <div className="container">
        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-[#2D5A27] flex items-center gap-1.5 mb-1">
              <Clapperboard className="w-3.5 h-3.5" />
              Thư viện Thực địa
            </p>
            <h2
              id="field-shorts-heading"
              className="font-display text-2xl md:text-3xl font-extrabold leading-tight"
              style={{ color: '#5D4037' }}
            >
              Video <span style={{ color: '#2D5A27' }}>thực tế</span> tại rẫy
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Xem kỹ thuật lắp đặt, kết quả & trải nghiệm thực tế từ nông dân trên toàn quốc.
            </p>
          </div>

          {/* Desktop scroll controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scrollBy('left')}
              aria-label="Cuộn trái"
              className="w-9 h-9 rounded-full border border-border bg-background hover:bg-muted hover:border-[#2D5A27]/40 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollBy('right')}
              aria-label="Cuộn phải"
              className="w-9 h-9 rounded-full border border-border bg-background hover:bg-muted hover:border-[#2D5A27]/40 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scroll strip — extends full width (no container constraint) */}
      <div
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pl-4 pr-4 md:pl-[max(1.5rem,calc((100vw-1400px)/2+1.5rem))] scrollbar-none"
        role="list"
        aria-label="Danh sách video thực địa"
      >
        {FIELD_VIDEOS.map((video, i) => (
          <VideoCard key={video.id} video={video} index={i} />
        ))}
      </div>

      {/* Scroll hint — mobile */}
      <div className="flex justify-center mt-3 md:hidden">
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <ChevronLeft className="w-3 h-3" />
          Vuốt ngang để xem thêm
          <ChevronRight className="w-3 h-3" />
        </p>
      </div>
    </section>
  );
}
