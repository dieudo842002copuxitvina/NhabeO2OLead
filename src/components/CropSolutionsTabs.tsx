"use client";

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
            'relative aspect-[4/3] rounded-2xl overflow-hidden border bg-gradient-to-br group',
            solution.videoPoster,
          )}
          role="img"
          aria-label={`Sơ đồ hệ thống tưới chuẩn cho ${solution.label}`}
        >
          {/* Background with hover zoom effect */}
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <div className="text-8xl drop-shadow-lg opacity-90">{solution.emoji}</div>
          </div>
          
          {/* Grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-30" aria-hidden>
            <defs>
              <pattern id={`grid-${solution.key}`} width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${solution.key})`} />
          </svg>

          {/* Play button with hover scale */}
          <button
            type="button"
            aria-label="Phát video hướng dẫn"
            className="absolute inset-0 flex items-center justify-center group-focus:outline-none"
          >
            <span className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-110">
              <PlayCircle className="w-9 h-9 text-primary" />
            </span>
          </button>

          {/* Multimedia labels */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground border-0 text-[10px] font-bold flex items-center gap-1 shadow-md">
              <Film className="w-3 h-3" /> MULTIMEDIA
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="text-[10px] backdrop-blur bg-white/80 shadow-sm">
              Hệ thống tưới chuẩn
            </Badge>
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
