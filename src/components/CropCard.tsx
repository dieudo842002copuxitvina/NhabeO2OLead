"use client";

import { motion } from "framer-motion";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface CropData {
  id: string;
  name: string;
  emoji: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  unit: string;
  highPrice: number;
  lowPrice: number;
  region: string;
  quality?: string;
  lastUpdate?: string;
  trend: "up" | "down" | "neutral";
}

interface CropCardProps {
  crop: CropData;
  index: number;
  onClick?: () => void;
}

export const CropCard = ({ crop, index, onClick }: CropCardProps) => {
  const isPositive = crop.trend === "up";
  const trendColor = isPositive ? "text-emerald-400" : crop.trend === "down" ? "text-rose-400" : "text-slate-400";
  const trendBgColor = isPositive ? "bg-emerald-500/10 border-emerald-500/30" : crop.trend === "down" ? "bg-rose-500/10 border-rose-500/30" : "bg-slate-500/10 border-slate-500/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="h-full cursor-pointer group"
    >
      <div className="relative h-full bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 md:p-6 transition-all duration-300 overflow-hidden flex flex-col">
        {/* Accent Bar - Top Left */}
        <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-emerald-500 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Layer 1: Top Row - Emoji + Chevron */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl md:text-6xl transition-transform group-hover:scale-110 duration-300">
            {crop.emoji}
          </div>
          <motion.div
            initial={{ x: 0, opacity: 0.5 }}
            animate={{ x: 8, opacity: 1 }}
            whileHover={{ x: 12 }}
            className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5 md:w-6 h-6" />
          </motion.div>
        </div>

        {/* Layer 2: Title - Crop Name */}
        <div className="mb-4 flex-1">
          <h3 className="text-base md:text-lg font-black uppercase tracking-tight leading-tight text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">
            {crop.name}
          </h3>
          {crop.region && (
            <p className="text-[11px] md:text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">
              {crop.region}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-4" />

        {/* Layer 3: Price - Large Bold with Unit */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              {crop.currentPrice.toLocaleString("vi-VN")}
            </span>
            <span className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
              đ/{crop.unit}
            </span>
          </div>
        </div>

        {/* Layer 4: Trend - Delta + Percentage */}
        <div className={cn("mb-4 p-3 rounded-xl border", trendBgColor)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : crop.trend === "down" ? (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              ) : (
                <div className="w-4 h-4 text-slate-400">→</div>
              )}
              <div>
                <div className={cn("text-sm font-black", trendColor)}>
                  {crop.change >= 0 ? "+" : ""}{crop.change.toLocaleString("vi-VN")} đ
                </div>
                <div className={cn("text-[10px] font-bold", trendColor)}>
                  {crop.changePercent >= 0 ? "+" : ""}{crop.changePercent.toFixed(1)}%
                </div>
              </div>
            </div>
            <div className={cn("text-lg font-black", trendColor)}>
              {isPositive ? "▲" : crop.trend === "down" ? "▼" : "→"}
            </div>
          </div>
        </div>

        {/* Layer 5: Bottom - High/Low Range */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 font-bold uppercase tracking-widest">Cao nhất</span>
            <span className="text-emerald-400 font-black">
              {crop.highPrice.toLocaleString("vi-VN")} đ
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 font-bold uppercase tracking-widest">Thấp nhất</span>
            <span className="text-rose-400 font-black">
              {crop.lowPrice.toLocaleString("vi-VN")} đ
            </span>
          </div>
          {crop.lastUpdate && (
            <div className="flex items-center justify-between text-[10px] pt-1 mt-1 border-t border-white/5">
              <span className="text-slate-600 font-medium">Cập nhật</span>
              <span className="text-slate-400 font-bold">{crop.lastUpdate}</span>
            </div>
          )}
        </div>

        {/* Background Gradient Accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/0 transition-all pointer-events-none rounded-2xl" />
      </div>
    </motion.div>
  );
};

export default CropCard;
