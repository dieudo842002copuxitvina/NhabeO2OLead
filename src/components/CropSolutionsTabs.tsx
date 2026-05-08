"use client";

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageCircle, PlayCircle, ArrowRight, Sprout, CheckCircle2, Film, Wrench, Cog } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/lib/tracking';
import { cn } from '@/lib/utils';

interface Equipment {
  name: string;
  spec: string;
  slug?: string;
}

interface CropSolution {
  key: string;
  label: string;
  emoji: string;
  headline: string;
  description: string;
  benefits: string[];
  equipment: Equipment[];
  videoPoster: string;
  zaloPhone: string;
  badge?: string;
}

const SOLUTIONS: CropSolution[] = [
  {
    key: 'sau-rieng',
    label: 'Sầu riêng',
    emoji: '🌳',
    headline: 'Combo tưới tiết kiệm cho vườn sầu riêng',
    description:
      'Hệ thống tưới nhỏ giọt + cảm biến độ ẩm IoT giúp tối ưu nước cho rễ cọc, hạn chế sốc nước thời kỳ ra bông & nuôi trái.',
    benefits: ['Tiết kiệm 60% nước', 'Tăng tỉ lệ đậu trái', 'Quản lý từ xa qua app'],
    equipment: [
      { name: 'Béc tưới BS5000-Pro', spec: '4 tia · 360°', slug: 'bec-tuoi-bs5000-pro' },
      { name: 'Bộ lọc đĩa 2"', spec: 'Lọc 130 micron', slug: 'bo-loc-dia-2-inch' },
      { name: 'Ống LDPE Φ16', spec: 'Cuộn 400m, PE100', slug: 'ong-ldpe-phi16' },
      { name: 'Cảm biến độ ẩm IoT', spec: 'LoRa, pin 2 năm', slug: 'cam-bien-do-am-iot' },
    ],
    videoPoster: 'from-emerald-500/30 via-primary/20 to-amber-500/20',
    zaloPhone: '0901234567',
    badge: 'hot',
  },
  {
    key: 'ca-phe',
    label: 'Cà phê',
    emoji: '☕',
    headline: 'Giải pháp tưới phun mưa cho cà phê Tây Nguyên',
    description:
      'Máy bơm công suất cao + ống tưới chuyên dụng cho địa hình dốc Tây Nguyên, đảm bảo lưu lượng đều cho từng gốc.',
    benefits: ['Tưới đều địa hình dốc', 'Bơm đa tầng tiết kiệm điện', 'Lắp đặt 1-2 ngày/ha'],
    equipment: [
      { name: 'Máy bơm ly tâm 5HP', spec: '380V · 50m³/h', slug: 'may-bom-ly-tam-5hp' },
      { name: 'Béc phun mưa Rain-Bird', spec: 'Bán kính 12m', slug: 'bec-phun-mua-rainbird' },
      { name: 'Ống PVC Φ60', spec: 'Cấp áp lực PN10', slug: 'ong-pvc-phi60' },
      { name: 'Bộ lọc cát-sỏi', spec: 'Cho nước hồ/giếng', slug: 'bo-loc-cat-soi' },
    ],
    videoPoster: 'from-amber-700/30 via-orange-500/20 to-primary/20',
    zaloPhone: '0901234567',
  },
  {
    key: 'cay-an-trai',
    label: 'Cây ăn trái',
    emoji: '🍊',
    headline: 'Bộ điều khiển tự động cho vườn cam, bưởi, xoài',
    description:
      'Tích hợp cảm biến + bộ điều khiển AC-8 lên lịch tưới, châm phân tự động — giảm 70% công lao động.',
    benefits: ['Tự động lên lịch tưới', 'Châm phân chính xác', 'Giảm 70% công lao động'],
    equipment: [
      { name: 'Bộ điều khiển AC-8', spec: '8 van · WiFi/4G', slug: 'bo-dieu-khien-ac8' },
      { name: 'Béc nhỏ giọt bù áp', spec: '4 L/h, chống tắc', slug: 'bec-nho-giot-bu-ap' },
      { name: 'Ống LDPE Φ20', spec: 'PE100, 6 bar', slug: 'ong-ldpe-phi20' },
      { name: 'Bộ châm phân Venturi', spec: 'Lưu lượng 200 L/h', slug: 'bo-cham-phan-venturi' },
    ],
    videoPoster: 'from-orange-500/30 via-yellow-400/20 to-primary/15',
    zaloPhone: '0901234567',
    badge: 'new',
  },
];

/**
 * CropSolutionsTabs — Crop-specific solutions with equipment list + video placeholder
 * + O2O Split CTA: Primary "Tự tính vật tư" + Secondary "Zalo"
 * + Clickable Equipment Cards with hover effects
 * + Tab Badges for hot/new crops
 */
export default function CropSolutionsTabs() {
  const [active, setActive] = useState<string>(SOLUTIONS[0].key);

  return (
    <section
      aria-labelledby="crop-solutions-heading"
      className="container py-8 md:py-10"
    >
      <header className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5" /> Giải pháp theo cây trồng
          </p>
          <h2
            id="crop-solutions-heading"
            className="font-display text-2xl md:text-3xl font-extrabold mt-1 leading-tight"
          >
            Combo tối ưu cho từng loại cây
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Chọn cây trồng — nhận danh mục thiết bị chuẩn và báo giá trọn gói.
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
          <Link href="/giai-phap">
            Tất cả giải pháp <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </Button>
      </header>

      <Tabs value={active} onValueChange={setActive} className="w-full">
        <TabsList className="grid grid-cols-3 h-12 w-full md:w-auto md:inline-grid bg-muted/60">
          {SOLUTIONS.map((s) => (
            <TabsTrigger
              key={s.key}
              value={s.key}
              className="h-10 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm relative"
            >
              <span className="mr-1.5">{s.emoji}</span>
              {s.label}
              
              {/* Badge for Hot/New crops */}
              {s.badge === 'hot' && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  🔥 Hot
                </span>
              )}
              {s.badge === 'new' && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  ✨ Mới
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {SOLUTIONS.map((s) => (
          <TabsContent key={s.key} value={s.key} className="mt-5 focus-visible:outline-none">
            <SolutionPanel solution={s} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function SolutionPanel({ solution }: { solution: CropSolution }) {
  const zaloUrl = `https://zalo.me/${solution.zaloPhone}`;
  const calculatorUrl = `/tinh-toan?crop=${solution.key}`;

  const onZaloClick = () => {
    trackEvent('zalo_click', {
      source: `crop_solutions_${solution.key}`,
      category: solution.label,
    });
  };

  const onCalculatorClick = () => {
    trackEvent('calculator_click', {
      source: `crop_solutions_${solution.key}`,
      category: solution.label,
    });
  };

  return (
    <motion.article
      key={solution.key}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-5"
    >
      {/* LEFT — Image / video placeholder with hover zoom */}
      <div>
        <div
          className={cn(
            'relative aspect-[4/3] rounded-2xl overflow-hidden border group',
          )}
          role="img"
          aria-label={`Sơ đồ hệ thống tưới chuẩn cho ${solution.label}`}
        >
          {/* ── Real Background Image ── */}
          <div 
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
          >
            <Image
              src="https://images.unsplash.com/photo-1586771107445-d3af28451c11?q=80&w=1000&auto=format&fit=crop"
              alt={`Hệ thống tưới cho ${solution.label}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* ── Gradient Overlay ── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* ── Glassmorphism IoT Widgets ── */}
          {/* Live Farm Badge - Top Left */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Trực tiếp từ Farm
            </div>
          </div>

          {/* Multimedia Badge - Top Right */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
              <Film className="w-3.5 h-3.5" />
              MULTIMEDIA
            </div>
          </div>

          {/* Soil Moisture Widget - Bottom Right */}
          <div className="absolute bottom-4 right-4 z-10 animate-[bounce_3s_infinite]">
            <div className="bg-white/25 backdrop-blur-xl border border-white/40 rounded-xl px-4 py-2.5 shadow-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">💧</span>
                <div>
                  <p className="text-[10px] text-white/80 font-medium">Độ ẩm đất</p>
                  <p className="text-sm font-bold text-white">75%</p>
                </div>
              </div>
              {/* Mini Progress Bar */}
              <div className="mt-1.5 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full" />
              </div>
            </div>
          </div>

          {/* ── Premium Play Button with Ping Effect ── */}
          <button
            type="button"
            aria-label="Phát video hướng dẫn"
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            {/* Ping Effect Ring */}
            <span className="absolute w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm animate-ping" />
            
            {/* Main Play Button */}
            <span className="relative w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border-2 border-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 hover:bg-white/50">
              <PlayCircle className="w-9 h-9 text-white drop-shadow-lg" />
            </span>
          </button>

          {/* Solution Label - Bottom Left */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5">
              <p className="text-xs text-white/90 font-medium flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                Hệ thống tưới chuẩn cho {solution.label}
              </p>
            </div>
          </div>
        </div>

        {/* Content below image */}
        <div className="mt-4">
          <h3 className="font-display text-lg md:text-xl font-bold leading-tight">
            {solution.headline}
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5">{solution.description}</p>

          <ul className="mt-3 space-y-1.5">
            {solution.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT — Equipment list + O2O Split CTA */}
      <Card className="border-primary/20 hover:border-primary/40 transition-colors h-full">
        <CardContent className="p-4 md:p-5 flex flex-col h-full">
          <h3 className="font-display font-bold text-base flex items-center gap-2 mb-1">
            <Wrench className="w-4 h-4 text-primary" /> Thiết bị chính trong combo
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Danh mục chuẩn theo m² — kỹ thuật viên sẽ tinh chỉnh theo địa hình rẫy của bạn.
          </p>

          {/* Equipment List - Clickable with hover effects */}
          <ul className="space-y-2 flex-1">
            {solution.equipment.map((eq, i) => (
              <li key={eq.name}>
                <Link
                  href={eq.slug ? `/san-pham/${eq.slug}` : '/san-pham'}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 hover:border-emerald-400/50 hover:bg-emerald-50/30 transition-all duration-200 group cursor-pointer"
                >
                  <span className="w-7 h-7 shrink-0 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm leading-tight group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                      {eq.name}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{eq.spec}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* O2O Split CTA - 2 buttons side by side */}
          <div className="mt-4 space-y-2">
            {/* Primary CTA: Tự tính vật tư */}
            <Link href={calculatorUrl} onClick={onCalculatorClick} className="block">
              <Button
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-md hover:shadow-lg transition-all rounded-xl"
              >
                <Cog className="w-4 h-4 mr-2" />
                Tự tính vật tư cho rẫy của bạn
              </Button>
            </Link>

            {/* Secondary CTA: Zalo */}
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onZaloClick}
              className="block"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 border-2 border-amber-400 text-amber-600 hover:bg-amber-50 hover:border-amber-500 font-semibold transition-all rounded-xl bg-amber-50/50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Nhận báo giá qua Zalo
              </Button>
            </a>

            <p className="text-[11px] text-muted-foreground text-center">
              Phản hồi trong 5 phút giờ hành chính · Miễn phí khảo sát
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}
