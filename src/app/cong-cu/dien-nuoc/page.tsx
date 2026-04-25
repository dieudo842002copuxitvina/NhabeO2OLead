"use client";

import { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Droplets, 
  ArrowUpCircle, 
  Clock, 
  HelpCircle, 
  ArrowLeft,
  Calculator,
  AlertTriangle,
  Info,
  TrendingDown,
  MapPin,
  CheckCircle2,
  Settings
} from "lucide-react";
import Link from "next/link";
import SeoMeta from "@/components/SeoMeta";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
          <TooltipContent className="bg-white border border-slate-200 text-slate-700 p-3 max-w-[250px] shadow-2xl z-[100]">
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

const formatVND = (value: number) => 
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

// --- Main Component ---

function DienNuocContent() {
  const [powerHP, setPowerHP] = useState<number>(3); // HP
  const [head, setHead] = useState<number>(40); // Meters
  const [flow, setFlow] = useState<number>(20); // m3/h
  const [hoursPerDay, setHoursPerDay] = useState<number>(4);
  const [electricityPrice, setElectricityPrice] = useState<number>(2500); // VND/kWh

  // --- Logic ---
  const results = useMemo(() => {
    const powerKW = powerHP * 0.746;
    const monthlykWh = powerKW * hoursPerDay * 30;
    const monthlyCost = monthlykWh * electricityPrice;
    
    // Efficiency calculation (mock)
    // Theoretically: Power (W) = (Q * H * g * rho) / efficiency
    // Simplified score: 100 is very efficient, < 40 is wasteful
    const hydraulicPowerKW = (flow * head * 9.81 * 1000) / (3600 * 1000);
    const efficiency = (hydraulicPowerKW / powerKW) * 100;
    const efficiencyScore = Math.min(Math.max(efficiency, 0), 100);

    return {
      powerKW,
      monthlykWh,
      monthlyCost,
      efficiencyScore,
      totalHead: head // Assuming head input is total head for this tool
    };
  }, [powerHP, head, flow, hoursPerDay, electricityPrice]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] pb-24">
      <SeoMeta 
        title="Máy tính Điện Nước AgriFlow - Tối ưu chi phí vận hành"
        description="Tính toán chi phí tiền điện máy bơm, đánh giá hiệu quả năng lượng và tư vấn nâng cấp hệ thống tiết kiệm điện."
      />

      {/* Header */}
      <header className="relative py-12 px-4 border-b border-white/5 bg-gradient-to-b from-emerald-900/20 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <Link href="/cong-cu" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Quay lại Hub Công cụ
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Máy tính Điện Nước</h1>
              <p className="text-slate-400">Kiểm soát chi phí năng lượng và tối ưu công suất máy bơm.</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Tiêu chuẩn</div>
                <div className="text-sm font-semibold text-blue-400">Zero Friction UX</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Input Form */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white text-xl">
                  <Calculator className="w-5 h-5 text-emerald-400" /> Thông số vận hành
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputWithTooltip 
                  label="Công suất máy bơm (HP)"
                  icon={Zap}
                  helpText="Sức mạnh của máy bơm, tính bằng Ngựa (HP). 1 HP ≈ 0.746 kW."
                  type="number"
                  min={0.5}
                  max={100}
                  step={0.5}
                  placeholder="VD: 3"
                  value={powerHP}
                  onChange={(e: any) => setPowerHP(Number(e.target.value))}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputWithTooltip 
                    label="Cột áp tổng (m)"
                    icon={ArrowUpCircle}
                    helpText="Độ cao đẩy nước + áp suất béc. Lưu ý: Thường từ 20m-60m cho hệ thống tưới béc."
                    type="number"
                    min={1}
                    max={300}
                    placeholder="VD: 40"
                    value={head}
                    onChange={(e: any) => setHead(Number(e.target.value))}
                  />
                  <InputWithTooltip 
                    label="Lưu lượng (m³/h)"
                    icon={Droplets}
                    helpText="Lượng nước bơm được trong 1 giờ. Kiểm tra trên tem máy bơm."
                    type="number"
                    min={1}
                    max={500}
                    placeholder="VD: 20"
                    value={flow}
                    onChange={(e: any) => setFlow(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                    <Label className="text-white flex items-center gap-2 text-sm font-bold">
                      <Clock className="w-4 h-4 text-emerald-400" /> Thời gian tưới (Giờ/Ngày)
                    </Label>
                    <span className="text-emerald-400 font-mono font-bold">{hoursPerDay}h</span>
                  </div>
                  <Slider 
                    value={[hoursPerDay]} 
                    min={0.5} 
                    max={24} 
                    step={0.5} 
                    onValueChange={(v) => setHoursPerDay(v[0])}
                  />
                </div>

                <InputWithTooltip 
                  label="Giá điện (VND/kWh)"
                  icon={Zap}
                  helpText="Giá điện trung bình bác đang trả. Mặc định là 2.500 VND."
                  type="number"
                  min={1000}
                  max={10000}
                  placeholder="VD: 2500"
                  value={electricityPrice}
                  onChange={(e: any) => setElectricityPrice(Number(e.target.value))}
                />

                {/* Validation Warnings */}
                <AnimatePresence>
                  {results.totalHead > 150 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert className="bg-amber-500/10 border-amber-500/50 text-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <AlertTitle className="font-bold">Cảnh báo cột áp!</AlertTitle>
                        <AlertDescription className="text-xs">
                          Cột áp {results.totalHead}m có vẻ quá lớn. Hãy kiểm tra lại đường kính ống (để giảm ma sát) hoặc công suất thực tế của bơm.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <Button 
              asChild
              className="w-full h-14 bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl font-bold transition-all group"
            >
              <Link href="/dai-ly">
                <MapPin className="w-5 h-5 mr-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                📍 Tư vấn nâng cấp bơm tiết kiệm điện
              </Link>
            </Button>
          </div>

          {/* Right: Results View */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Cost Alert */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert className="bg-emerald-500/10 border-emerald-500/30 p-8 rounded-[2rem] shadow-2xl shadow-emerald-900/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 text-white">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm font-medium opacity-70 uppercase tracking-widest mb-1">Chi phí tiền điện ước tính</div>
                      <div className="text-4xl md:text-5xl font-black text-emerald-400">
                        {formatVND(results.monthlyCost)}
                        <span className="text-lg font-normal text-white/50 ml-2">/ tháng</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono opacity-50 mb-1">Tiêu thụ: {results.monthlykWh.toFixed(1)} kWh</div>
                    <div className="text-xs font-mono opacity-50">Tương đương: {results.powerKW.toFixed(2)} kW</div>
                  </div>
                </div>
              </Alert>
            </motion.div>

            {/* Efficiency Analysis */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <TrendingDown className="w-5 h-5 text-emerald-400" /> Phân tích hiệu quả năng lượng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-10 p-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">Chỉ số tiết kiệm điện</div>
                      <div className="text-xs text-slate-500">Dựa trên tỷ lệ Công suất thủy lực / Công suất điện</div>
                    </div>
                    <div className={cn(
                      "text-2xl font-black",
                      results.efficiencyScore > 70 ? "text-emerald-400" : results.efficiencyScore > 40 ? "text-amber-400" : "text-red-400"
                    )}>
                      {results.efficiencyScore.toFixed(0)}%
                    </div>
                  </div>
                  <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${results.efficiencyScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]",
                        results.efficiencyScore > 70 ? "bg-emerald-500" : results.efficiencyScore > 40 ? "bg-amber-500" : "bg-red-500"
                      )}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-black tracking-widest">
                    <span className="text-red-500">Lãng phí</span>
                    <span className="text-amber-500">Trung bình</span>
                    <span className="text-emerald-500">Tiết kiệm</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div className="font-bold text-sm">Ưu điểm</div>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                      <li>• Máy bơm hoạt động ổn định trong dải áp suất.</li>
                      <li>• Cột áp phù hợp với các dòng béc tưới Rivulis.</li>
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <Info className="w-5 h-5 text-blue-400" />
                      <div className="font-bold text-sm">Lời khuyên</div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Nếu chỉ số tiết kiệm <span className="text-amber-400 font-bold">dưới 60%</span>, bác nên cân nhắc thay thế bằng dòng bơm cao cấp có hiệu suất motor IE3 để giảm 20-30% hóa đơn điện.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/20">
               <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-400 mb-1">Mẹo kỹ thuật</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Sử dụng biến tần (VFD) có thể giúp máy bơm khởi động mềm và điều chỉnh lưu lượng linh hoạt, giúp tiết kiệm thêm 15% điện năng tiêu thụ.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DienNuocPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center text-[#1A1A1A]">Khởi động Máy tính điện nước...</div>}>
      <DienNuocContent />
    </Suspense>
  );
}
