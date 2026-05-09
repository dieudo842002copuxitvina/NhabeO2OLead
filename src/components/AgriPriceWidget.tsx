"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ArrowRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
 * Types & Mock Data - 10 Nông sản chính
 * ───────────────────────────────────────────── */

interface AgriPriceItem {
  id: string;
  name: string;
  price: number;
  change: number;
  changeAmount: number;
  unit: string;
  icon: string;
}

const AGRI_PRICES: AgriPriceItem[] = [
  {
    id: "sau-rieng-ri6",
    name: "Sầu Riêng Ri6",
    price: 85000,
    change: 8.5,
    changeAmount: 6650,
    unit: "đ/kg",
    icon: "🥭",
  },
  {
    id: "ca-phe-nhan",
    name: "Cà Phê Nhân",
    price: 120000,
    change: 2.1,
    changeAmount: 2469,
    unit: "đ/kg",
    icon: "☕",
  },
  {
    id: "ho-tieu",
    name: "Hồ Tiêu",
    price: 95000,
    change: -3.2,
    changeAmount: -3141,
    unit: "đ/kg",
    icon: "🌶️",
  },
  {
    id: "mac-ca",
    name: "Mắc Ca",
    price: 168000,
    change: 1.2,
    changeAmount: 1990,
    unit: "đ/kg",
    icon: "🥜",
  },
  {
    id: "cao-su",
    name: "Cao Su",
    price: 28500,
    change: -0.8,
    changeAmount: -230,
    unit: "đ/kg",
    icon: "🌳",
  },
  {
    id: "chanh-day",
    name: "Chanh Dây",
    price: 32000,
    change: 5.3,
    changeAmount: 1611,
    unit: "đ/kg",
    icon: "🍋",
  },
  {
    id: "buoi-da-xanh",
    name: "Bưởi Da Xanh",
    price: 45000,
    change: 0,
    changeAmount: 0,
    unit: "đ/kg",
    icon: "🍊",
  },
  {
    id: "hat-dieu-kho",
    name: "Hạt Điều Khô",
    price: 28000,
    change: 0.5,
    changeAmount: 140,
    unit: "đ/kg",
    icon: "🫘",
  },
  {
    id: "cam-can",
    name: "Cam Cao Cấp",
    price: 38000,
    change: 3.1,
    changeAmount: 1142,
    unit: "đ/kg",
    icon: "🍊",
  },
  {
    id: "xoai-cat",
    name: "Xoài Cát",
    price: 55000,
    change: -1.5,
    changeAmount: -842,
    unit: "đ/kg",
    icon: "🥭",
  },
];

/* ─────────────────────────────────────────────
 * Ticker Item Component
 * ───────────────────────────────────────────── */

interface TickerItemProps {
  item: AgriPriceItem;
}

function TickerItem({ item }: TickerItemProps) {
  const isUp = item.change > 0;
  const isDown = item.change < 0;
  const isNeutral = item.change === 0;

  return (
    <Link
      href={`/gia-nong-san/${item.id}`}
      className="group flex-shrink-0"
    >
      <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-full hover:bg-white hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        {/* Icon */}
        <span className="text-xl">{item.icon}</span>
        
        {/* Name */}
        <span className="font-medium text-sm text-slate-700 group-hover:text-emerald-600 transition-colors whitespace-nowrap">
          {item.name}
        </span>
        
        {/* Price */}
        <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
          {new Intl.NumberFormat("vi-VN").format(item.price)}
        </span>
        
        {/* Change Badge */}
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
            isUp && "bg-emerald-100 text-emerald-700",
            isDown && "bg-rose-100 text-rose-700",
            isNeutral && "bg-amber-100 text-amber-700"
          )}
        >
          {isUp && <TrendingUp className="w-3 h-3" />}
          {isDown && <TrendingDown className="w-3 h-3" />}
          {isNeutral && <Minus className="w-3 h-3" />}
          <span>
            {item.change > 0 ? "+" : ""}
            {item.change}%
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
 * CSS Animation for Marquee
 * ───────────────────────────────────────────── */

const TICKER_ANIMATION = `
@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.ticker-track {
  animation: ticker-scroll 60s linear infinite;
}

.ticker-track:hover {
  animation-play-state: paused;
}
`;

/* ─────────────────────────────────────────────
 * AgriPriceWidget Component
 * ───────────────────────────────────────────── */

export default function AgriPriceWidget() {
  // Duplicate items for seamless loop
  const duplicatedItems = [...AGRI_PRICES, ...AGRI_PRICES];

  return (
    <>
      {/* Inject CSS */}
      <style dangerouslySetInnerHTML={{ __html: TICKER_ANIMATION }} />
      
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
        
        <div className="container mx-auto px-0">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                Giá thị trường hôm nay
              </span>
            </div>

            <Link
              href="/prices"
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors group"
            >
              <span>Xem thêm</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Ticker Track - Marquee Animation */}
          <div className="relative py-3 bg-slate-50/50 border-y border-slate-100">
            {/* Fade gradients for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50/50 to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling Track */}
            <div className="ticker-track flex items-center">
              {duplicatedItems.map((item, idx) => (
                <TickerItem key={`${item.id}-${idx}`} item={item} />
              ))}
            </div>
          </div>

          {/* Mobile: Hint to scroll */}
          <div className="sm:hidden text-center py-2 bg-slate-50/30">
            <span className="text-[10px] text-muted-foreground">
              ← Vuốt ngang để xem thêm →
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
