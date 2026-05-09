"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ArrowRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
 * Types & Mock Data
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
    id: "hat-dieu-kho",
    name: "Hạt Điều Khô",
    price: 28000,
    change: 0,
    changeAmount: 0,
    unit: "đ/kg",
    icon: "🥜",
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
];

/* ─────────────────────────────────────────────
 * Price Card Component
 * ───────────────────────────────────────────── */

interface PriceCardProps {
  item: AgriPriceItem;
}

function PriceCard({ item }: PriceCardProps) {
  const isUp = item.change > 0;
  const isDown = item.change < 0;
  const isNeutral = item.change === 0;

  return (
    <div className="flex-shrink-0 w-[200px] md:w-[240px]">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md hover:border-emerald-200 transition-all duration-300 group cursor-pointer">
        {/* Header: Icon + Name */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{item.icon}</span>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
              {item.name}
            </h4>
            <p className="text-[10px] text-muted-foreground">Giá thị trường hôm nay</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-xl md:text-2xl font-bold text-slate-900">
            {new Intl.NumberFormat("vi-VN").format(item.price)}
          </p>
          <p className="text-xs text-muted-foreground">{item.unit}</p>
        </div>

        {/* Change Badge */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
              isUp && "bg-emerald-100 text-emerald-700",
              isDown && "bg-rose-100 text-rose-700",
              isNeutral && "bg-amber-100 text-amber-700"
            )}
          >
            {isUp && <TrendingUp className="w-3.5 h-3.5" />}
            {isDown && <TrendingDown className="w-3.5 h-3.5" />}
            {isNeutral && <Minus className="w-3.5 h-3.5" />}
            <span>
              {isUp && "+"}
              {item.change > 0 ? "+" : ""}
              {item.change}%
            </span>
          </div>

          {/* Change Amount */}
          <span
            className={cn(
              "text-xs font-medium",
              isUp && "text-emerald-600",
              isDown && "text-rose-600",
              isNeutral && "text-amber-600"
            )}
          >
            {item.changeAmount > 0 ? "+" : ""}
            {new Intl.NumberFormat("vi-VN").format(item.changeAmount)}đ
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * AgriPriceWidget Component
 * ───────────────────────────────────────────── */

export default function AgriPriceWidget() {
  return (
    <section className="py-8 bg-gradient-to-b from-slate-50 to-white border-y border-slate-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Bảng Giá Nông Sản Hôm Nay
              </h3>
              <p className="text-xs text-muted-foreground">
                Cập nhật real-time · Thị trường Tây Nguyên & Đông Nam Bộ
              </p>
            </div>
          </div>

          {/* CTA Link */}
          <Link
            href="/gia-nong-san"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            <span>Xem chi tiết biến động thị trường</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Price Cards - Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible md:gap-5 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {AGRI_PRICES.map((item) => (
            <div key={item.id} className="snap-start">
              <PriceCard item={item} />
            </div>
          ))}
        </div>

        {/* Mobile CTA Link */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            href="/gia-nong-san"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors group"
          >
            <span>Xem chi tiết biến động thị trường</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
