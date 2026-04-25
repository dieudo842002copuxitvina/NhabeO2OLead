"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sprout, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { topCommodity, subscribeProfile, type CommodityKey } from '@/lib/shadowProfile';
import { trackEvent } from '@/lib/tracking';

interface PersonalizedHeroProps {
  search: string;
  setSearch: (v: string) => void;
  searchResults: { id: string; name: string; slug: string; category_id: string }[];
  /** Admin-managed override for the default (non-personalized) variant */
  overrideHeadline?: string;
  overrideSubheadline?: string;
  overrideCtaLabel?: string;
  overrideCtaLink?: string;
}

interface HeroVariant {
  badge: string;
  title: React.ReactNode;
  subtitle: string;
  bgGradient: string;
  emoji: string;
  ctaLabel: string;
  ctaTo: string;
  ctaCategory?: string;
}

const variants: Record<CommodityKey | 'default', HeroVariant> = {
  default: {
    badge: 'Nền tảng Dữ liệu Nông nghiệp',
    title: <>Nền tảng Dữ liệu<br /><span className="text-primary">Nông nghiệp Nhà Bè Agri</span></>,
    subtitle: 'Kết nối nông dân trực tiếp tới mạng lưới đại lý và thợ thi công toàn quốc qua thuật toán Geo-matching.',
    bgGradient: 'from-primary/40 via-foreground/20 to-foreground/40',
    emoji: '🌱',
    ctaLabel: 'Khám phá sản phẩm',
    ctaTo: '/san-pham',
  },
  'sau-rieng': {
    badge: '🤖 Đề xuất riêng cho bạn · Vườn sầu riêng',
    title: <>Hệ thống tưới<br /><span className="text-primary">cho vườn sầu riêng</span></>,
    subtitle: 'Tưới nhỏ giọt chính xác + cảm biến độ ẩm cho cây sầu riêng. Tiết kiệm 60% nước, tăng năng suất 25%.',
    bgGradient: 'from-amber-500/15 via-background to-primary/10',
    emoji: '🌳',
    ctaLabel: 'Xem giải pháp sầu riêng',
    ctaTo: '/san-pham?category=Hệ thống tưới',
    ctaCategory: 'Hệ thống tưới',
  },
  'ca-phe': {
    badge: '🤖 Đề xuất riêng cho bạn · Vườn cà phê',
    title: <>Drone & máy bơm<br /><span className="text-primary">cho vườn cà phê</span></>,
    subtitle: 'Giá cà phê đang cao kỷ lục — nâng cấp drone phun sương và máy bơm công suất lớn để tối ưu mùa vụ.',
    bgGradient: 'from-amber-700/15 via-background to-primary/10',
    emoji: '☕',
    ctaLabel: 'Xem máy bơm công nghiệp',
    ctaTo: '/san-pham?category=Máy bơm',
    ctaCategory: 'Máy bơm',
  },
  'tieu': {
    badge: '🤖 Đề xuất riêng cho bạn · Vườn tiêu',
    title: <>Cảm biến IoT<br /><span className="text-primary">cho vườn tiêu</span></>,
    subtitle: 'Theo dõi độ ẩm đất real-time, tự động tưới khi cây tiêu cần nước. Phòng bệnh chết nhanh hiệu quả.',
    bgGradient: 'from-emerald-700/15 via-background to-primary/10',
    emoji: '🌶',
    ctaLabel: 'Xem cảm biến IoT',
    ctaTo: '/san-pham?category=Cảm biến IoT',
    ctaCategory: 'Cảm biến IoT',
  },
  'lua': {
    badge: '🤖 Đề xuất riêng cho bạn · Cánh đồng lúa',
    title: <>Máy bơm công suất lớn<br /><span className="text-primary">cho ruộng lúa</span></>,
    subtitle: 'Bơm nước chủ động, tiết kiệm điện. Phù hợp cho cánh đồng lúa diện tích lớn ĐBSCL.',
    bgGradient: 'from-yellow-600/15 via-background to-primary/10',
    emoji: '🌾',
    ctaLabel: 'Xem máy bơm',
    ctaTo: '/san-pham?category=Máy bơm',
    ctaCategory: 'Máy bơm',
  },
  'cao-su': {
    badge: '🤖 Đề xuất riêng cho bạn · Vườn cao su',
    title: <>Bộ điều khiển tưới<br /><span className="text-primary">cho vườn cao su</span></>,
    subtitle: 'Lập trình tưới theo lô, tự động hóa toàn bộ vườn cao su quy mô lớn.',
    bgGradient: 'from-stone-600/15 via-background to-primary/10',
    emoji: '🌳',
    ctaLabel: 'Xem bộ điều khiển',
    ctaTo: '/san-pham?category=Điều khiển',
    ctaCategory: 'Điều khiển',
  },
};

export default function PersonalizedHero({
  search, setSearch, searchResults,
  overrideHeadline, overrideSubheadline, overrideCtaLabel, overrideCtaLink,
}: PersonalizedHeroProps) {
  const [topCom, setTopCom] = useState<CommodityKey | null>(() => topCommodity());

  useEffect(() => {
    const unsub = subscribeProfile(() => setTopCom(topCommodity()));
    return () => { unsub(); };
  }, []);

  const baseVariant = variants[topCom ?? 'default'];
  const isPersonalized = topCom !== null;
  // Apply admin overrides only on the default variant (don't clobber personalized hero)
  const v = !isPersonalized
    ? {
        ...baseVariant,
        title: overrideHeadline ?? baseVariant.title,
        subtitle: overrideSubheadline ?? baseVariant.subtitle,
        ctaLabel: overrideCtaLabel ?? baseVariant.ctaLabel,
        ctaTo: overrideCtaLink ?? baseVariant.ctaTo,
      }
    : baseVariant;

  // Cinematic farm/drone footage — Coverr CDN, royalty-free, optimized MP4
  const heroVideoSrc = 'https://videos.pexels.com/video-files/2257010/2257010-uhd_3840_2160_30fps.mp4';
  const heroPoster = 'https://images.pexels.com/videos/2257010/pictures/preview-0.jpg';

  return (
    <section
      key={topCom ?? 'default'}
      className="relative py-16 md:py-24 overflow-hidden bg-foreground"
    >
      {/* Cinematic video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={heroPoster}
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        aria-hidden="true"
      >
        <source src={heroVideoSrc} type="video/mp4" />
      </video>
      {/* Gradient overlays for legibility */}
      <div className={`absolute inset-0 bg-gradient-to-br ${v.bgGradient} opacity-60 pointer-events-none`} />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-foreground/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent pointer-events-none" />

      <div className="container relative">
        <div className="max-w-2xl animate-slide-up text-background">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm ${
              isPersonalized
                ? 'bg-accent/20 text-accent-foreground ring-1 ring-accent/40'
                : 'bg-background/15 text-background ring-1 ring-background/30'
            }`}
          >
            {isPersonalized ? <Sparkles className="w-3.5 h-3.5" /> : <Sprout className="w-3.5 h-3.5" />}
            {v.badge}
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight drop-shadow-lg">
            {v.title}
          </h1>
          <p className="mt-4 text-background/90 text-lg md:text-xl max-w-xl font-sans leading-relaxed drop-shadow">
            {v.subtitle}
          </p>

          {/* Search */}
          <div className="relative max-w-md mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm sản phẩm: máy bơm, ống tưới, cảm biến..."
              className="pl-11 h-14 text-base rounded-xl bg-background/80 backdrop-blur"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (e.target.value.length > 2) trackEvent('search', { searchQuery: e.target.value });
              }}
            />
          </div>

          {/* CTA — personalized variant shows extra badge */}
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Button asChild size="lg" className="h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Link
                href={v.ctaTo}
                onClick={() => v.ctaCategory && trackEvent('category_click', { category: v.ctaCategory, source: 'shadow_profile_hero' })}
              >
                {v.ctaLabel} <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
            {isPersonalized && (
              <Badge variant="outline" className="text-xs font-normal">
                Dựa trên lịch sử bạn xem
              </Badge>
            )}
          </div>

          {/* Search Results */}
          {search && searchResults.length > 0 && (
            <div className="mt-3 bg-card border rounded-xl shadow-lg p-2 max-w-md animate-slide-up">
              {searchResults.slice(0, 4).map(p => (
                <Link
                  key={p.id}
                  href={`/san-pham/${p.slug}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-2xl">🌱</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category_id}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
