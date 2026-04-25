"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, 
  Leaf, 
  BarChart3, 
  ChevronRight, 
  ArrowLeft,
  Trees,
  Sprout,
  Coffee,
  Palmtree,
  Nut,
  Wind,
  Waves,
  Zap,
  Activity,
  CheckCircle2,
  Calendar,
  AlertCircle,
  CloudRain,
  Sun
} from "lucide-react";
import Link from "next/link";
import SeoMeta from "@/components/SeoMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Types ---
type ToolId = "irrigation" | "nutrition" | "roi" | "dien-nuoc";
type CropCategory = "annual" | "perennial";

interface Tool {
  id: ToolId;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  accentColor: string;
  seasonPriority: "rainy" | "dry" | "all";
}

// --- Hooks ---
function useSeason() {
  const [month, setMonth] = useState(new Date().getMonth());
  
  const isRainySeason = useMemo(() => {
    // Vietnam Rainy Season (roughly May to October)
    return month >= 4 && month <= 9;
  }, [month]);

  return { isRainySeason, monthName: new Intl.DateTimeFormat('vi-VN', { month: 'long' }).format(new Date()) };
}

// --- Data ---
const TOOLS: Tool[] = [
  {
    id: "nutrition",
    title: "Kỹ Sư Dinh Dưỡng",
    description: "Quy trình chăm sóc chuyên sâu & Cảnh báo kết tủa phân bón.",
    icon: Leaf,
    gradient: "from-emerald-600/30 to-green-500/10",
    accentColor: "text-emerald-400",
    seasonPriority: "rainy",
  },
  {
    id: "irrigation",
    title: "Dự toán Tưới tiêu",
    description: "Dự toán vật tư & Tính toán thủy lực Rivulis/Pentax.",
    icon: Droplets,
    gradient: "from-blue-600/30 to-cyan-500/10",
    accentColor: "text-cyan-400",
    seasonPriority: "dry",
  },
  {
    id: "dien-nuoc",
    title: "Máy tính Điện Nước",
    description: "Tối ưu chi phí tiền điện & Kiểm soát hiệu suất máy bơm.",
    icon: Zap,
    gradient: "from-amber-600/30 to-yellow-500/10",
    accentColor: "text-amber-400",
    seasonPriority: "all",
  },
  {
    id: "roi",
    title: "Máy tính ROI",
    description: "Hoạch định tài chính và thời gian hoàn vốn đầu tư.",
    icon: BarChart3,
    gradient: "from-purple-600/30 to-pink-500/10",
    accentColor: "text-purple-400",
    seasonPriority: "all",
  },
];

const CROPS: Record<CropCategory, { id: string; name: string; icon: any; color: string }[]> = {
  annual: [
    { id: "mia-hn", name: "Mía", icon: Wind, color: "bg-green-500/20" },
    { id: "lac", name: "Lạc", icon: Nut, color: "bg-amber-500/20" },
    { id: "dau-tuong", name: "Đậu tương", icon: Sprout, color: "bg-emerald-500/20" },
  ],
  perennial: [
    { id: "ca-phe", name: "Cà phê", icon: Coffee, color: "bg-orange-800/20" },
    { id: "cao-su", name: "Cao su", icon: Waves, color: "bg-slate-400/20" },
    { id: "ho-tieu", name: "Hồ tiêu", icon: Activity, color: "bg-red-500/20" },
    { id: "dieu", name: "Điều", icon: Nut, color: "bg-yellow-600/20" },
    { id: "che", name: "Chè", icon: Leaf, color: "bg-green-600/20" },
    { id: "mia-ln", name: "Mía", icon: Wind, color: "bg-green-500/20" },
    { id: "dua", name: "Dừa", icon: Palmtree, color: "bg-blue-400/20" },
  ],
};

// --- Sub-components ---
const Ticker = () => (
  <div className="w-full bg-emerald-500/10 border-y border-emerald-500/20 py-2.5 overflow-hidden whitespace-nowrap relative">
    <motion.div 
      animate={{ x: ["100%", "-100%"] }}
      transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      className="flex items-center gap-12 text-xs font-bold text-emerald-400 uppercase tracking-widest"
    >
      <span className="flex items-center gap-2"><AlertCircle className="w-3 h-3" /> Dự báo: Khu vực Bình Phước sắp vào cao điểm mùa mưa, hãy kiểm tra hệ thống châm phân</span>
      <span className="flex items-center gap-2"><CloudRain className="w-3 h-3" /> Ưu tiên bón phân đạm cho giai đoạn phát triển cành lá</span>
      <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> AgriFlow Tools: Đã cập nhật thư viện 15 loại cây công nghiệp mới nhất</span>
    </motion.div>
  </div>
);

export default function CongCuHubPage() {
  const router = useRouter();
  const { isRainySeason, monthName } = useSeason();
  const [step, setStep] = useState<"hub" | "crop-selector" | "coming-soon">("hub");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CropCategory>("perennial");
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  // --- Logic ---
  const sortedTools = useMemo(() => {
    return [...TOOLS].sort((a, b) => {
      if (isRainySeason) {
        if (a.seasonPriority === "rainy") return -1;
        if (b.seasonPriority === "rainy") return 1;
      } else {
        if (a.seasonPriority === "dry") return -1;
        if (b.seasonPriority === "dry") return 1;
      }
      return 0;
    });
  }, [isRainySeason]);

  const handleToolSelect = (tool: Tool) => {
    if (tool.id === "dien-nuoc") {
      router.push("/cong-cu/dien-nuoc");
      return;
    }
    setSelectedTool(tool);
    setStep("crop-selector");
  };

  const handleCropSelect = (cropId: string) => {
    setSelectedCrop(cropId);
    if (selectedTool?.id === "irrigation") {
      router.push(`/cong-cu/du-toan-tuoi?crop=${cropId}`);
    } else if (selectedTool?.id === "nutrition") {
      router.push(`/cong-cu/cham-phan?crop=${cropId}`);
    } else {
      setStep("coming-soon");
    }
  };

  const goBack = () => {
    if (step === "crop-selector") setStep("hub");
    if (step === "coming-soon") setStep("crop-selector");
  };

  return (
    <div className="min-h-screen bg-[#050a05] text-white selection:bg-emerald-500/30 font-sans">
      <SeoMeta 
        title="AgriFlow Smart Hub - Điều hành Nông nghiệp Thông minh"
        description="Hub điều hành thông minh tự động nhận diện mùa vụ để gợi ý công cụ tối ưu cho nhà nông."
      />

      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <header className="relative pt-12 md:pt-20 z-10 text-center">
        <div className="container mx-auto px-4 mb-8">
           <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl text-sm font-bold mb-6"
          >
            {isRainySeason ? <CloudRain className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span>Đang là {monthName} — {isRainySeason ? "Cao điểm mùa mưa" : "Mùa khô rực rỡ"}</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
            SMART <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              DASHBOARD
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
            AgriFlow tự động ưu tiên các công cụ quan trọng nhất cho vườn của bác ngay lúc này.
          </p>
        </div>
        
        <Ticker />
      </header>

      <main className="relative container mx-auto px-4 py-16 z-10">
        <AnimatePresence mode="wait">
          {step === "hub" && (
            <motion.div
              key="hub"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={cn(
                        "group relative h-full cursor-pointer border-white/10 bg-white/5 backdrop-blur-3xl transition-all duration-700 hover:scale-[1.02] overflow-hidden",
                        "hover:shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]"
                      )}
                      onClick={() => handleToolSelect(tool)}
                    >
                      {/* Glow Effect Layer */}
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", tool.gradient)} />
                      
                      <CardContent className="p-8 relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-8">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.5)] group-hover:rotate-6", "bg-white/5 border border-white/10")}>
                            <tool.icon className={cn("w-7 h-7", tool.accentColor)} />
                          </div>
                          {((isRainySeason && tool.seasonPriority === "rainy") || (!isRainySeason && tool.seasonPriority === "dry")) && (
                            <Badge className="bg-emerald-500 text-white border-none text-[10px] uppercase font-black px-2 py-0.5 animate-pulse">
                              Khuyên dùng
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-xl font-black mb-3 leading-tight group-hover:text-white transition-colors uppercase tracking-tighter">
                          {tool.title}
                        </h3>
                        <p className="text-slate-400 group-hover:text-slate-200 transition-colors mb-8 flex-grow text-sm leading-relaxed">
                          {tool.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-2">
                            Bắt đầu <ChevronRight className="w-3 h-3" />
                          </span>
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                             <Zap className="w-3 h-3 text-emerald-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "crop-selector" && (
             <motion.div
              key="crop-selector"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-5xl mx-auto"
            >
              <button 
                onClick={goBack}
                className="inline-flex items-center gap-3 text-slate-400 hover:text-white mb-12 transition-colors group font-bold uppercase tracking-tighter"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform text-emerald-400" /> Quay lại Hub điều hành
              </button>

              <header className="mb-16">
                <h2 className="text-5xl font-black mb-4 tracking-tighter">Bác canh tác cây gì?</h2>
                <p className="text-slate-400 text-xl font-medium">Tối ưu cấu hình <span className="text-white border-b-2 border-emerald-500">{selectedTool?.title}</span> cho từng loại cây.</p>
              </header>

              {/* Category Tabs */}
              <div className="flex p-1.5 bg-white/5 rounded-[2rem] border border-white/10 mb-12 w-fit backdrop-blur-xl">
                <button
                  onClick={() => setSelectedCategory("perennial")}
                  className={cn(
                    "px-8 py-3.5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3",
                    selectedCategory === "perennial" ? "bg-emerald-500 text-white shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)]" : "text-slate-500 hover:text-white"
                  )}
                >
                  <Trees className="w-5 h-5" /> Cây lâu năm
                </button>
                <button
                  onClick={() => setSelectedCategory("annual")}
                  className={cn(
                    "px-8 py-3.5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3",
                    selectedCategory === "annual" ? "bg-emerald-500 text-white shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)]" : "text-slate-500 hover:text-white"
                  )}
                >
                  <Sprout className="w-5 h-5" /> Cây ngắn ngày
                </button>
              </div>

              {/* Crop Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {CROPS[selectedCategory].map((crop, index) => (
                  <motion.div
                    key={crop.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCropSelect(crop.id)}
                    className={cn(
                      "group relative flex flex-col items-center justify-center p-8 rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-md cursor-pointer transition-all duration-500 hover:border-emerald-500/50 hover:bg-white/10 hover:-translate-y-2",
                      selectedCrop === crop.id && "border-emerald-500 bg-emerald-500/20"
                    )}
                  >
                    <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 shadow-2xl", crop.color)}>
                      <crop.icon className="w-10 h-10 text-white" />
                    </div>
                    <span className="font-black text-slate-300 group-hover:text-white uppercase tracking-tighter text-sm">{crop.name}</span>
                    
                    {selectedCrop === crop.id && (
                      <div className="absolute top-5 right-5">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "coming-soon" && (
            <motion.div
              key="coming-soon"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center py-24"
            >
               <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <Activity className="w-16 h-16 text-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-5xl font-black mb-6 tracking-tighter">ĐANG PHÁT TRIỂN</h2>
              <p className="text-slate-400 text-xl font-medium mb-12 leading-relaxed">
                Hệ thống đang được AI của AgriFlow cấu hình riêng cho vùng trồng của bác. Chúng tôi sẽ thông báo ngay khi module hoàn tất.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button onClick={goBack} variant="outline" className="h-14 px-10 border-white/20 text-white hover:bg-white/10 rounded-2xl font-bold uppercase tracking-widest">
                   Quay lại
                </Button>
                <Button asChild className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-900/50 rounded-2xl font-bold uppercase tracking-widest">
                  <Link href="/tu-van">Nhận tư vấn ngay</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Sticky CTA Decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-0" />
    </div>
  );
}
