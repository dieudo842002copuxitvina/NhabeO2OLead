"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Droplet, 
  Leaf, 
  Trees, 
  Coffee, 
  Sprout, 
  Calculator, 
  FlaskConical, 
  Bot,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── 1. DYNAMIC HERO SECTION ─────────────────────────────────────────────

type SolutionType = 'irrigation' | 'fertilizer';

const CROPS = [
  { id: 'saurieng', name: 'Sầu Riêng', icon: Trees },
  { id: 'caphe', name: 'Cà Phê', icon: Coffee },
  { id: 'hotieu', name: 'Hồ Tiêu', icon: Leaf },
  { id: 'raumau', name: 'Rau Màu', icon: Sprout },
];

export default function PersonalizedDashboardHero() {
  const [solutionType, setSolutionType] = useState<SolutionType>('irrigation');

  const isIrrigation = solutionType === 'irrigation';
  
  // Theme colors based on solution type
  // Tưới -> Tông Xanh (Nature Green), Phân bón -> Tông Cam/Nâu
  const themeActiveBg = isIrrigation ? 'bg-[#2D5A27]/10 text-[#2D5A27]' : 'bg-[#B7410E]/10 text-[#B7410E]';
  const themeHoverBorder = isIrrigation ? 'hover:border-[#2D5A27]/30' : 'hover:border-[#B7410E]/30';

  return (
    <div className="w-full bg-background flex flex-col">
      
      {/* --- HERO: Giải pháp kép --- */}
      <section className="px-4 pt-6 pb-4 flex flex-col gap-5 items-center text-center">
        <h1 className="text-2xl md:text-3xl font-display font-bold leading-tight max-w-2xl">
          Giải pháp Toàn diện: <br className="md:hidden" />
          <span className="text-[#2D5A27] font-bold">Nước & Dinh dưỡng</span> cho rẫy của bạn
        </h1>

        {/* Toggle Solutions */}
        <div className="bg-gray-100 p-1 rounded-full inline-flex w-full max-w-sm">
          <button
            onClick={() => setSolutionType('irrigation')}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
              isIrrigation ? 'bg-white shadow-sm text-black' : 'text-gray-500'
            }`}
          >
            Hệ thống Tưới
          </button>
          <button
            onClick={() => setSolutionType('fertilizer')}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
              !isIrrigation ? 'bg-white shadow-sm text-black' : 'text-gray-500'
            }`}
          >
            Phân bón hòa tan
          </button>
        </div>

        {/* 4 Crop Cards (Grid 2x2 Mobile, 4 Cols Desktop) */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {CROPS.map((crop) => {
              const Icon = crop.icon;
              return (
                <motion.button
                  key={crop.id}
                  whileTap={{ scale: 0.96 }}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md ${themeHoverBorder} transition-all duration-300 p-6 flex flex-col items-center justify-center aspect-square`}
                >
                  <div className={`p-4 rounded-full mb-3 ${themeActiveBg} transition-colors duration-300`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <span className="font-semibold text-[15px] md:text-base text-gray-900">{crop.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- 2. TRUST-BUILDING LOG (Marquee) --- */}
      <div className="bg-[#1A3A18] text-white/90 text-sm font-medium tracking-wide overflow-hidden my-6 py-3">
        <div className="flex animate-ticker whitespace-nowrap">
          <span className="px-5 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/> Đại lý Tân Bình vừa xuất 200kg NPK 20-20-20 đi Đắk Lắk</span>
          <span className="px-5 flex items-center gap-2 text-green-300"><Zap className="w-4 h-4 text-yellow-400"/> Hệ thống châm phân 2ha Sầu riêng tại Krông Pắc vừa hoàn thành dự toán</span>
          <span className="px-5 flex items-center gap-2 text-orange-300"><Zap className="w-4 h-4 text-yellow-400"/> Giá Sầu Riêng Ri6 tăng 2.000đ/kg</span>
          
          {/* Duplicate for infinite effect */}
          <span className="px-5 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/> Đại lý Tân Bình vừa xuất 200kg NPK 20-20-20 đi Đắk Lắk</span>
          <span className="px-5 flex items-center gap-2 text-green-300"><Zap className="w-4 h-4 text-yellow-400"/> Hệ thống châm phân 2ha Sầu riêng tại Krông Pắc vừa hoàn thành dự toán</span>
          <span className="px-5 flex items-center gap-2 text-orange-300"><Zap className="w-4 h-4 text-yellow-400"/> Giá Sầu Riêng Ri6 tăng 2.000đ/kg</span>
        </div>
      </div>

      {/* --- 3. QUICK ACTIONS (Lối tắt Nghiệp vụ) --- */}
      <section className="px-4 py-6 flex flex-col md:flex-row justify-center gap-3 bg-muted/30 max-w-5xl mx-auto w-full rounded-2xl mb-6">
        <div className="w-full">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 text-center md:text-left">Lối tắt Nghiệp vụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/cong-cu" className="block">
              <Button variant="outline" className="w-full h-14 justify-start text-base font-semibold border-border/50 bg-background hover:bg-muted shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] flex items-center justify-center mr-3 shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                🧮 Dự Toán Vật Tư Tưới
              </Button>
            </Link>
            
            <Link href="/cong-cu" className="block">
              <Button variant="outline" className="w-full h-14 justify-start text-base font-semibold border-border/50 bg-background hover:bg-muted shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#B7410E]/10 text-[#B7410E] flex items-center justify-center mr-3 shrink-0">
                  <FlaskConical className="w-4 h-4" />
                </div>
                🧪 Công Thức Châm Phân
              </Button>
            </Link>

            <Link href="/tools/ai-doctor" className="block">
              <Button variant="outline" className="w-full h-14 justify-start text-base font-semibold border-border/50 bg-background hover:bg-muted shadow-sm">
                <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center mr-3 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                👨‍⚕️ Bác sĩ Cây trồng AI
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
