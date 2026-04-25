"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, BadgeCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/tracking';

// ─── Mock Data ───────────────────────────────────────────────────────────────
type ProductCategory = 'Tất cả' | 'Trạm Trung Tâm' | 'Béc Tưới' | 'Ống Dẫn' | 'Phân bón';

interface EcoProduct {
  id: string;
  slug: string;
  name: string;
  category: Exclude<ProductCategory, 'Tất cả'>;
  badge: string;
  badgeColor: 'green' | 'orange' | 'blue' | 'brown';
  specs: string;
  emoji: string;
  gradient: string;
}

const ECO_PRODUCTS: EcoProduct[] = [
  {
    id: 'p1',
    slug: 'tram-bom-inverter-3pha',
    name: 'Trạm Bơm Inverter 3 Pha AC-Series',
    category: 'Trạm Trung Tâm',
    badge: 'Phù hợp Sầu riêng',
    badgeColor: 'green',
    specs: '2.2–5.5 kW · Tiết kiệm 40% điện · IP55',
    emoji: '⚡',
    gradient: 'from-emerald-500/20 via-primary/10 to-teal-400/10',
  },
  {
    id: 'p2',
    slug: 'bec-tuoi-bs5000',
    name: 'Béc Tưới Nhỏ Giọt BS5000',
    category: 'Béc Tưới',
    badge: 'Bảo hành 5 năm',
    badgeColor: 'orange',
    specs: '2–4 L/h · Tự bù áp · Chống tắc nghẽn',
    emoji: '💧',
    gradient: 'from-blue-500/20 via-cyan-400/10 to-sky-300/10',
  },
  {
    id: 'p3',
    slug: 'ong-pe-hdpe-32mm',
    name: 'Ống HDPE 32mm Áp Lực Cao',
    category: 'Ống Dẫn',
    badge: 'Chịu UV 20 năm',
    badgeColor: 'brown',
    specs: 'PN16 · Đường kính 20–110mm · Cuộn 100m',
    emoji: '🔩',
    gradient: 'from-amber-600/20 via-orange-400/10 to-yellow-300/10',
  },
  {
    id: 'p4',
    slug: 'phan-bon-nk-tan-chay',
    name: 'Phân NK Tan Chậy Chuyên Sầu Riêng',
    category: 'Phân bón',
    badge: 'Phù hợp Cà phê',
    badgeColor: 'green',
    specs: 'NPK 20-10-10+TE · Bao 25kg · Tan hoàn toàn',
    emoji: '🌱',
    gradient: 'from-green-600/20 via-lime-400/10 to-emerald-300/10',
  },
  {
    id: 'p5',
    slug: 'bo-dieu-khien-ac8',
    name: 'Bộ Điều Khiển Tưới AC-8 Zone',
    category: 'Trạm Trung Tâm',
    badge: 'Kết nối App',
    badgeColor: 'blue',
    specs: '8 van · WiFi · Hẹn giờ 128 lịch/tuần',
    emoji: '📱',
    gradient: 'from-violet-500/20 via-primary/10 to-indigo-300/10',
  },
  {
    id: 'p6',
    slug: 'bec-phun-suong-micro',
    name: 'Béc Phun Sương Micro 360°',
    category: 'Béc Tưới',
    badge: 'Phù hợp Tiêu · Cà phê',
    badgeColor: 'green',
    specs: '40–60 L/h · Góc 360° · Tầm phủ 1.2m',
    emoji: '🌫️',
    gradient: 'from-sky-400/20 via-blue-300/10 to-cyan-200/10',
  },
  {
    id: 'p7',
    slug: 'ong-pvc-uPVC-phi27',
    name: 'Ống PVC-U áp lực PN10 Phi 27',
    category: 'Ống Dẫn',
    badge: 'Tiết kiệm 30%',
    badgeColor: 'orange',
    specs: 'Nhựa PVC-U · 6m/cây · Kết nối ren/keo',
    emoji: '🧱',
    gradient: 'from-orange-500/20 via-amber-400/10 to-yellow-200/10',
  },
  {
    id: 'p8',
    slug: 'phan-trung-luong-nano',
    name: 'Phân Trung Lượng Nano Ca-Mg',
    category: 'Phân bón',
    badge: 'Bảo hành chất lượng',
    badgeColor: 'brown',
    specs: 'CaO 15% · MgO 10% · pH 6.5–7.2',
    emoji: '🧪',
    gradient: 'from-teal-500/20 via-emerald-400/10 to-green-200/10',
  },
];

const CATEGORIES: ProductCategory[] = ['Tất cả', 'Trạm Trung Tâm', 'Béc Tưới', 'Ống Dẫn', 'Phân bón'];

const BADGE_STYLES: Record<EcoProduct['badgeColor'], string> = {
  green:  'bg-[#2D5A27]/10 text-[#2D5A27] border border-[#2D5A27]/25',
  orange: 'bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/25',
  blue:   'bg-blue-50 text-blue-700 border border-blue-200',
  brown:  'bg-[#5D4037]/10 text-[#5D4037] border border-[#5D4037]/25',
};

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, index }: { product: EcoProduct; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-[#2D5A27]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image area — square ratio */}
      <div className={`aspect-square bg-gradient-to-br ${product.gradient} relative flex items-center justify-center`}>
        <span className="text-5xl md:text-6xl drop-shadow-sm select-none">{product.emoji}</span>

        {/* Floating badge */}
        <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm ${BADGE_STYLES[product.badgeColor]}`}>
          <BadgeCheck className="w-3 h-3 inline mr-0.5 -mt-px" />
          {product.badge}
        </span>

        {/* Category chip */}
        <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 backdrop-blur text-gray-600">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 gap-2">
        <h3 className="font-display font-bold text-sm leading-tight line-clamp-2 group-hover:text-[#2D5A27] transition-colors">
          {product.name}
        </h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {product.specs}
        </p>

        {/* CTA — Safety Orange, always at bottom */}
        <div className="mt-auto pt-2">
          <Link
            href={`/san-pham/${product.slug}`}
            onClick={() => trackEvent('product_inquiry_click', { productId: product.id })}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E55C00] active:scale-95 transition-all duration-200 shadow-sm shadow-[#FF6B00]/30"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Hỏi giá Đại lý
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Block ───────────────────────────────────────────────────────────────
export default function ProductEcosystemBlock() {
  const [active, setActive] = useState<ProductCategory>('Tất cả');

  const filtered = active === 'Tất cả'
    ? ECO_PRODUCTS
    : ECO_PRODUCTS.filter(p => p.category === active);

  return (
    <section aria-labelledby="product-ecosystem-heading" className="container py-12 md:py-16">
      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wider text-[#2D5A27] flex items-center gap-1.5 mb-1">
            <span className="w-4 h-0.5 bg-[#2D5A27] rounded-full inline-block" />
            Hệ sinh thái Sản phẩm
          </p>
          <h2
            id="product-ecosystem-heading"
            className="font-display text-2xl md:text-3xl font-extrabold leading-tight"
            style={{ color: '#2D5A27' }}
          >
            Đúng sản phẩm — <span style={{ color: '#5D4037' }}>Đúng vùng canh tác</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Hệ thống tưới & phân bón được lựa chọn theo cây trồng và địa hình thực địa.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild className="hidden md:inline-flex shrink-0">
          <Link href="/san-pham">
            Xem toàn bộ sản phẩm <ChevronRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      {/* Category filter — horizontal scroll on mobile (snap-x) */}
      <div
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 mb-6 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0"
        role="tablist"
        aria-label="Lọc theo danh mục"
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={active === cat}
            onClick={() => setActive(cat)}
            className={`snap-start shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 whitespace-nowrap
              ${active === cat
                ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-md shadow-[#2D5A27]/20'
                : 'bg-background text-muted-foreground border-border hover:border-[#2D5A27]/50 hover:text-[#2D5A27]'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid — 2 cols mobile / 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {/* Mobile view-all button */}
      <div className="mt-6 md:hidden">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/san-pham">
            Xem toàn bộ sản phẩm <ChevronRight className="ml-1 w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
