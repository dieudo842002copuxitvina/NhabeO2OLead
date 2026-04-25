"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Leaf, 
  ArrowLeft, 
  Beaker, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Droplets,
  Timer,
  ShoppingCart,
  Download,
  Plus,
  Trash2,
  ChevronRight,
  TrendingUp,
  Package,
  MessageCircle,
  HelpCircle,
  Maximize2,
  History,
  Wind,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SeoMeta from "@/components/SeoMeta";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// --- Constants & Data ---
const CROP_LIST = [
  { id: "ca-phe", name: "Cà phê", type: "perennial" },
  { id: "cao-su", name: "Cao su", type: "perennial" },
  { id: "ho-tieu", name: "Hồ tiêu", type: "perennial" },
  { id: "dieu", name: "Điều", type: "perennial" },
  { id: "che", name: "Chè", type: "perennial" },
  { id: "dua", name: "Dừa", type: "perennial" },
  { id: "sau-rieng", name: "Sầu riêng", type: "perennial" },
  { id: "mia", name: "Mía", type: "annual" },
  { id: "lac", name: "Lạc", type: "annual" },
  { id: "dau-tuong", name: "Đậu tương", type: "annual" },
  { id: "khoai-lang", name: "Khoai lang", type: "annual" },
  { id: "ngo", name: "Ngô", type: "annual" },
  { id: "mac-ca", name: "Mắc ca", type: "perennial" },
  { id: "buoi", name: "Bưởi/Cam", type: "perennial" },
  { id: "xoai", name: "Xoài", type: "perennial" },
];

const FERTILIZERS = [
  { id: "npk-20-20-15", name: "NPK 20-20-15+TE", composition: { n: 20, p: 20, k: 15 }, color: "bg-blue-500" },
  { id: "npk-16-16-8", name: "NPK 16-16-8", composition: { n: 16, p: 16, k: 8 }, color: "bg-emerald-500" },
  { id: "urea", name: "Đạm Urea (46% N)", composition: { n: 46, p: 0, k: 0 }, color: "bg-white" },
  { id: "dap", name: "DAP (18-46-0)", composition: { n: 18, p: 46, k: 0 }, color: "bg-yellow-600" },
  { id: "kali-clorua", name: "Kali Clorua (60% K2O)", composition: { n: 0, p: 0, k: 60 }, color: "bg-red-500" },
  { id: "canxi-nitrat", name: "Canxi Nitrat (Ca(NO3)2)", composition: { n: 15, p: 0, k: 0, ca: 19 }, color: "bg-cyan-200" },
  { id: "magie-sunfat", name: "Magie Sunfat (MgSO4)", composition: { mg: 9, s: 12 }, color: "bg-purple-300" },
];

const INCOMPATIBILITY_RULES = [
  {
    pair: ["canxi-nitrat", "magie-sunfat"],
    reason: "Gây kết tủa Canxi Sunfat (thạch cao), làm nghẹt đầu nhỏ giọt.",
    severity: "critical"
  },
  {
    pair: ["canxi-nitrat", "dap"],
    reason: "Kết tủa Canxi Phosphate, làm mất hiệu dụng của lân và nghẹt ống.",
    severity: "critical"
  }
];

// --- Helper Components ---
const InputWithTooltip = ({ 
  label, 
  icon: Icon, 
  helpText, 
  ...props 
}: { 
  label: string; 
  icon: any; 
  helpText: string; 
  [key: string]: any 
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <Label className="text-white flex items-center gap-2 text-sm font-bold">
        <Icon className="w-4 h-4 text-emerald-400" /> {label}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="outline-none">
              <HelpCircle className="w-4 h-4 text-slate-500 hover:text-emerald-400 transition-colors cursor-help" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 border border-white/10 text-slate-200 p-3 max-w-[250px] shadow-2xl z-[100]">
            <p className="text-xs leading-relaxed">{helpText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <Input 
      {...props} 
      className="bg-white/5 border-white/10 h-12 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl" 
    />
  </div>
);

// --- Components ---

function ChamPhanContent() {
  const searchParams = useSearchParams();
  const [crop, setCrop] = useState(searchParams.get("crop") || "ca-phe");
  const [area, setArea] = useState(10000); // m2
  const [age, setAge] = useState(5); // years
  const [systemFlow, setSystemFlow] = useState(30); // m3/h (from previous step)
  const [selectedFertilizers, setSelectedFertilizers] = useState<string[]>([]);
  const [tankVolume, setTankVolume] = useState(500); // Liters
  
  // Seasonal stage state
  const [stage, setStage] = useState<"early" | "mid" | "late">("early");

  // --- Logic ---
  
  // Calculate required nutrients based on crop, age, and stage
  const nutrientRequirements = useMemo(() => {
    // Mock logic for demo
    const base = { n: 150, p: 80, k: 120 }; // kg/ha/year
    const multiplier = age > 5 ? 1.2 : age / 5;
    const ha = area / 10000;
    
    const stageDistribution = {
      early: { n: 0.4, p: 0.5, k: 0.2 },
      mid: { n: 0.4, p: 0.3, k: 0.4 },
      late: { n: 0.2, p: 0.2, k: 0.4 }
    };

    const dist = stageDistribution[stage];
    
    return {
      n: base.n * multiplier * ha * dist.n,
      p: base.p * multiplier * ha * dist.p,
      k: base.k * multiplier * ha * dist.k,
    };
  }, [crop, area, age, stage]);

  // Compatibility Check
  const warnings = useMemo(() => {
    const activeWarnings: typeof INCOMPATIBILITY_RULES = [];
    INCOMPATIBILITY_RULES.forEach(rule => {
      if (rule.pair.every(p => selectedFertilizers.includes(p))) {
        activeWarnings.push(rule);
      }
    });
    return activeWarnings;
  }, [selectedFertilizers]);

  // Dosing Time calculation
  // Time = Tank Volume / Injection Rate
  // Injection Rate (Venturi) typically 10% of flow for safe concentration
  const injectionRate = systemFlow * 0.1 * 1000; // L/h
  const dosingTime = (tankVolume / injectionRate) * 60; // Minutes

  const handleAddFertilizer = (id: string) => {
    if (!selectedFertilizers.includes(id)) {
      setSelectedFertilizers([...selectedFertilizers, id]);
    }
  };

  const removeFertilizer = (id: string) => {
    setSelectedFertilizers(selectedFertilizers.filter(f => f !== id));
  };

  const handleSendToDealer = async () => {
    const leadData = {
      tool: "Kỹ Sư Dinh Dưỡng",
      crop: crop,
      area: area,
      stage: stage,
      results: nutrientRequirements,
      timestamp: new Date().toISOString()
    };

    // 1. Save to LocalStorage
    const history = JSON.parse(localStorage.getItem("agriflow_leads") || "[]");
    localStorage.setItem("agriflow_leads", JSON.stringify([leadData, ...history].slice(0, 10)));

    // 2. Save to Supabase
    try {
      await (supabase as any).from("leads").insert([{
        customer_name: "Khách hàng Web",
        content: JSON.stringify(leadData),
        status: "pending"
      }]);
    } catch (e) {
      console.warn("Lead save error:", e);
    }

    // 3. Zalo Smart Ping
    const message = `Chào Đại lý Nhà Bè Agri, tôi cần tư vấn dinh dưỡng cho ${(area/10000).toFixed(1)} ha cây ${crop} giai đoạn ${stage === 'early' ? 'Đầu mùa mưa' : stage === 'mid' ? 'Giữa mùa' : 'Cuối mùa'}. Nhu cầu NPK dự kiến: ${nutrientRequirements.n.toFixed(1)}N - ${nutrientRequirements.p.toFixed(1)}P - ${nutrientRequirements.k.toFixed(1)}K. Liên hệ lại tôi nhé!`;
    const zaloUrl = `https://zalo.me/0901234567?text=${encodeURIComponent(message)}`;
    window.open(zaloUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#050a05] text-white pb-24">
      <SeoMeta 
        title="Kỹ Sư Dinh Dưỡng AgriFlow - Tối ưu bón phân"
        description="Công cụ chẩn đoán dinh dưỡng, cảnh báo kết tủa và tính toán thời gian châm phân Venturi chính xác."
      />

      {/* Header */}
      <header className="relative py-12 px-4 border-b border-white/5 bg-gradient-to-b from-emerald-900/20 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <Link href="/cong-cu" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Quay lại Hub Công cụ
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">Kỹ Sư Dinh Dưỡng</h1>
                <p className="text-slate-400 italic">"Ăn đúng lúc, bón đúng liều - Mùa màng bội thu"</p>
              </div>
            </div>
            
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
               {(["early", "mid", "late"] as const).map((s) => (
                 <button
                  key={s}
                  onClick={() => setStage(s)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                    stage === s ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
                  )}
                 >
                   {s === "early" ? "Đầu mùa mưa" : s === "mid" ? "Giữa mùa" : "Cuối mùa"}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Inputs & Compatibility */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white text-xl">
                  <Beaker className="w-5 h-5 text-emerald-400" /> Cấu hình vườn & Phân bón
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2 text-sm font-bold">
                    <Wind className="w-4 h-4 text-emerald-400" /> Loại cây trồng
                  </Label>
                  <Select value={crop} onValueChange={setCrop}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white rounded-xl">
                      <SelectValue placeholder="Chọn loại cây" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      {CROP_LIST.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputWithTooltip 
                    label="Diện tích (m²)"
                    icon={Maximize2}
                    helpText="Tổng diện tích khu vực canh tác. Ví dụ: 1 mẫu Nam Bộ nhập 10000."
                    type="number"
                    min={100}
                    max={1000000}
                    placeholder="VD: 5000"
                    value={area}
                    onChange={(e: any) => setArea(Number(e.target.value))}
                  />
                  <InputWithTooltip 
                    label="Tuổi cây (Năm)"
                    icon={History}
                    helpText="Số năm tính từ khi xuống giống. Cây càng lớn nhu cầu dinh dưỡng càng cao."
                    type="number"
                    min={1}
                    max={100}
                    placeholder="VD: 4"
                    value={age}
                    onChange={(e: any) => setAge(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-white flex items-center gap-2 text-sm font-bold">
                    <Layers className="w-4 h-4 text-emerald-400" /> Chọn loại phân phối trộn
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {FERTILIZERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => handleAddFertilizer(f.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          selectedFertilizers.includes(f.id) 
                            ? "bg-emerald-500 border-emerald-400 text-white" 
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        )}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                  {selectedFertilizers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                       {selectedFertilizers.map(id => (
                         <Badge key={id} variant="secondary" className="bg-white/10 text-white gap-1 py-1">
                           {FERTILIZERS.find(f => f.id === id)?.name}
                           <Trash2 className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => removeFertilizer(id)} />
                         </Badge>
                       ))}
                    </div>
                  )}
                </div>

                {/* Compatibility Warning Panel */}
                <AnimatePresence>
                  {warnings.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                          <AlertTriangle className="w-5 h-5" /> CẢNH BÁO KẾT TỦA (SAFETY FIRST)
                        </div>
                        {warnings.map((w, i) => (
                          <div key={i} className="text-xs text-red-200/80 leading-relaxed">
                            <span className="font-bold text-red-300">[{w.pair.map(id => FERTILIZERS.find(f => f.id === id)?.name).join(" + ")}]:</span> {w.reason}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Venturi Logic */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-transparent border-blue-500/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Droplets className="w-5 h-5 text-blue-400" /> Tính toán Châm phân (Fertigation)
                </CardTitle>
                <CardDescription className="text-blue-200/60 text-xs">Dựa trên lưu lượng hệ thống: {systemFlow} m³/h</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputWithTooltip 
                  label="Thể tích bồn phân (Lít)"
                  icon={Beaker}
                  helpText="Dung tích của bồn chứa dung dịch phân bón đậm đặc. Phổ biến từ 200L đến 1000L."
                  type="number"
                  min={10}
                  max={5000}
                  placeholder="VD: 500"
                  value={tankVolume}
                  onChange={(e: any) => setTankVolume(Number(e.target.value))}
                />
                <Slider 
                  value={[tankVolume]} 
                  min={100} 
                  max={2000} 
                  step={100} 
                  onValueChange={(v) => setTankVolume(v[0])}
                />

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-blue-300 font-bold mb-1">Thời gian xả bồn (Dosing Time)</div>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-1">
                      {dosingTime.toFixed(0)} <span className="text-sm font-normal text-blue-400">Phút</span>
                    </div>
                  </div>
                  <Timer className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Nutrient Results & Roadmap */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Nutrient Bars */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
               <div className="p-6 border-b border-white/5">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Nhu cầu dinh dưỡng giai đoạn này
                </h3>
               </div>
               <CardContent className="p-8 space-y-8">
                 {/* N - P - K Progress Bars */}
                 <div className="space-y-6">
                   <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span className="font-bold text-blue-300">Đạm (N)</span>
                       <span className="font-mono">{nutrientRequirements.n.toFixed(1)} kg</span>
                     </div>
                     <Progress value={75} className="h-3 bg-white/5" />
                     <div className="flex justify-end text-[10px] text-slate-500 italic">Mục tiêu: {nutrientRequirements.n.toFixed(1)} kg cho {area/10000} ha</div>
                   </div>

                   <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span className="font-bold text-yellow-500">Lân (P2O5)</span>
                       <span className="font-mono">{nutrientRequirements.p.toFixed(1)} kg</span>
                     </div>
                     <Progress value={40} className="h-3 bg-white/5" />
                   </div>

                   <div className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span className="font-bold text-red-400">Kali (K2O)</span>
                       <span className="font-mono">{nutrientRequirements.k.toFixed(1)} kg</span>
                     </div>
                     <Progress value={60} className="h-3 bg-white/5" />
                   </div>
                 </div>

                 <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-sm text-amber-200/80">
                   <Info className="w-5 h-5 text-amber-400 shrink-0" />
                   <p>Lượng phân bón phối trộn hiện tại đáp ứng khoảng <span className="text-amber-400 font-bold">65%</span> nhu cầu Đạm. Bác nên bổ sung thêm Urea hoặc NPK chỉ số cao.</p>
                 </div>
               </CardContent>
            </Card>

            {/* Multimedia SOP (Care Roadmap) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold text-white">Lộ trình chăm sóc & Vật tư</h3>
                <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                  <Download className="w-4 h-4 mr-2" /> Lưu làm ảnh
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600/20 to-transparent border border-emerald-500/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold italic">Step 1</div>
                    <div className="font-bold">Bón lót / Cải tạo đất</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Hữu cơ vi sinh Omri
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Vôi bột sát khuẩn
                    </li>
                  </ul>
                  <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 border-white/5 text-xs">
                    <Package className="w-3 h-3 mr-2" /> Xem trong kho Nhà Bè
                  </Button>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold italic">Step 2</div>
                    <div className="font-bold">Phun phòng nấm/sâu</div>
                  </div>
                   <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" /> Thuốc đặc trị nấm Rivulis
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" /> Bám dính sinh học
                    </li>
                  </ul>
                   <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 border-white/5 text-xs">
                    <Package className="w-3 h-3 mr-2" /> Xem trong kho Nhà Bè
                  </Button>
                </motion.div>
              </div>

              <Card className="bg-emerald-500 border-none shadow-2xl shadow-emerald-900/50">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4 text-white">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <ShoppingCart className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-sm font-medium opacity-80">Tổng hợp danh sách mua sắm</div>
                        <div className="text-2xl font-bold">8 hạng mục vật tư</div>
                      </div>
                   </div>
                   <Button className="bg-white text-emerald-600 hover:bg-slate-100 font-bold px-8 h-12 rounded-xl">
                      Thêm vào giỏ hàng ngay <ChevronRight className="w-4 h-4 ml-2" />
                   </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50">
        <div className="bg-black/60 backdrop-blur-2xl border border-white/20 p-4 rounded-3xl flex items-center justify-between shadow-2xl">
          <div className="flex -space-x-2">
            {selectedFertilizers.map(id => {
              const f = FERTILIZERS.find(item => item.id === id);
              return (
                <div key={id} className={cn("w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-900", f?.color)}>
                  {f?.name.split(' ')[0]}
                </div>
              );
            })}
            <button className="w-10 h-10 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center text-white/60">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="h-10 w-px bg-white/10 mx-4" />
          <Button 
            onClick={handleSendToDealer}
            className="bg-emerald-500 hover:bg-emerald-600 rounded-2xl px-6 font-bold flex-grow md:flex-grow-0"
          >
             <MessageCircle className="w-4 h-4 mr-2" /> Gửi báo giá kỹ thuật
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ChamPhanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050a05] flex items-center justify-center text-white">Khởi động Kỹ Sư Dinh Dưỡng...</div>}>
      <ChamPhanContent />
    </Suspense>
  );
}
