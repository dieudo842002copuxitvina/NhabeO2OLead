"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Droplets, 
  ArrowLeft, 
  Calculator, 
  Settings2, 
  TrendingUp, 
  Box, 
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Maximize2,
  MoveRight,
  Mountain
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SeoMeta from "@/components/SeoMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// --- Constants & Types ---
const CROP_DEFAULTS = {
  "ca-phe": { spacing: 3, flow: 60, name: "Cà phê" },
  "ho-tieu": { spacing: 2.5, flow: 40, name: "Hồ tiêu" },
  "sau-rieng": { spacing: 8, flow: 120, name: "Sầu riêng" },
  "mia": { spacing: 1.2, flow: 2.5, name: "Mía (Nhỏ giọt)" },
  "dieu": { spacing: 6, flow: 90, name: "Điều" },
  "cao-su": { spacing: 7, flow: 60, name: "Cao su" },
  "dua": { spacing: 9, flow: 150, name: "Dừa" },
};

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url?: string;
};

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

// --- Helper Functions ---
const formatVND = (value: number) => 
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

function DuToanTuoiContent() {
  const searchParams = useSearchParams();
  const initialCrop = searchParams.get("crop") || "ca-phe";

  // --- State ---
  const [crop, setCrop] = useState<string>(initialCrop);
  const [area, setArea] = useState<number>(10000); // m2 (1 ha)
  const [spacing, setSpacing] = useState<number>(3);
  const [flow, setFlow] = useState<number>(60);
  const [slope, setSlope] = useState<number>(5);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  // --- Effects ---
  useEffect(() => {
    const defaults = CROP_DEFAULTS[crop as keyof typeof CROP_DEFAULTS];
    if (defaults) {
      setSpacing(defaults.spacing);
      setFlow(defaults.flow);
    }
  }, [crop]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, price, image")
        .or("name.ilike.%rivulis%,name.ilike.%pentax%,category.ilike.%tuoi%")
        .limit(3);
      
      if (data) {
        setSuggestedProducts(data.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.category || "AgriFlow",
          price: p.price || 0,
          image_url: p.image || undefined
        })));
      }
    }
    fetchProducts();
  }, []);

  // --- Calculations ---
  const results = useMemo(() => {
    const treeCount = Math.floor(area / (spacing * spacing));
    const totalFlowLh = treeCount * flow;
    const totalFlowM3h = totalFlowLh / 1000;
    const H = slope + 20; 
    const pumpHP = (totalFlowM3h * H) / (367 * 0.75);

    let mainPipe = "uPVC 60mm";
    if (totalFlowM3h > 40) mainPipe = "uPVC 90mm";
    else if (totalFlowM3h > 80) mainPipe = "uPVC 114mm";
    else if (totalFlowM3h < 15) mainPipe = "uPVC 49mm";

    return {
      treeCount,
      totalFlowM3h,
      pumpHP,
      mainPipe,
      nozzles: treeCount,
      ldpeLength: treeCount * spacing * 1.2,
    };
  }, [area, spacing, flow, slope]);

  const handleSendToDealer = async () => {
    const leadData = {
      tool: "Dự toán Tưới",
      crop: crop,
      area: area,
      results: results,
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
      console.warn("Could not save lead to Supabase:", e);
    }

    // 3. Zalo Smart Ping (Deep link)
    const message = `Chào Đại lý Nhà Bè Agri, tôi cần tư vấn lắp hệ thống tưới cho ${(area/10000).toFixed(1)} ha cây ${crop}. Dự toán lưu lượng: ${results.totalFlowM3h.toFixed(1)} m3/h, công suất bơm: ${results.pumpHP.toFixed(1)} HP. Liên hệ lại tôi nhé!`;
    const zaloUrl = `https://zalo.me/0901234567?text=${encodeURIComponent(message)}`;
    window.open(zaloUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#050a05] text-white pb-20">
      <SeoMeta 
        title="Công cụ Dự toán Hệ thống Tưới - AgriFlow"
        description="Tính toán thủy lực, bóc tách vật tư và gợi ý thiết bị tưới Rivulis/Pentax chính xác cho trang trại của bạn."
      />

      <header className="relative py-12 px-4 border-b border-white/5 bg-gradient-to-b from-emerald-900/20 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <Link href="/cong-cu" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Quay lại Hub Công cụ
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Dự toán Hệ thống Tưới</h1>
              <p className="text-slate-400">Thiết kế hệ thống thủy lực tối ưu theo tiêu chuẩn kỹ thuật AgriFlow.</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Settings2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Trạng thái</div>
                <div className="text-sm font-semibold text-emerald-400">Đang hoạt động (v2.0)</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white text-xl">
                  <Calculator className="w-5 h-5 text-emerald-400" /> Thông số thiết kế
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                    <Label className="text-white flex items-center gap-2 text-sm font-bold">
                      <Droplets className="w-4 h-4 text-emerald-400" /> Loại cây trồng
                    </Label>
                  </div>
                  <Select value={crop} onValueChange={setCrop}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white rounded-xl">
                      <SelectValue placeholder="Chọn loại cây" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      {Object.entries(CROP_DEFAULTS).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <InputWithTooltip 
                    label="Diện tích vườn (m²)"
                    icon={Maximize2}
                    helpText="Tổng diện tích khu vực cần lắp hệ thống tưới. 10.000 m² tương đương với 1 Ha (Mẫu Nam Bộ)."
                    type="number"
                    min={100}
                    max={1000000}
                    placeholder="Ví dụ: 10000"
                    value={area}
                    onChange={(e: any) => setArea(Number(e.target.value))}
                  />
                  <Slider 
                    value={[area]} 
                    min={1000} 
                    max={100000} 
                    step={1000} 
                    onValueChange={(v) => setArea(v[0])}
                    className="py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputWithTooltip 
                    label="Khoảng cách (m)"
                    icon={MoveRight}
                    helpText="Khoảng cách trung bình giữa các cây. Ví dụ: Cà phê thường trồng 3m x 3m, hãy nhập 3."
                    type="number"
                    min={0.5}
                    max={20}
                    step={0.1}
                    placeholder="VD: 3"
                    value={spacing}
                    onChange={(e: any) => setSpacing(Number(e.target.value))}
                  />
                  <InputWithTooltip 
                    label="Lưu lượng béc (L/H)"
                    icon={Droplets}
                    helpText="Lượng nước phun ra mỗi giờ của 1 đầu tưới. Phổ biến từ 30L/H đến 120L/H."
                    type="number"
                    min={2}
                    max={500}
                    placeholder="Nhập 53 nếu dùng béc S2000"
                    value={flow}
                    onChange={(e: any) => setFlow(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-4">
                  <InputWithTooltip 
                    label="Độ dốc địa hình (m)"
                    icon={Mountain}
                    helpText="Chênh lệch độ cao từ nguồn nước đến điểm cao nhất của vườn. Nhập 0 nếu đất bằng phẳng."
                    type="number"
                    min={0}
                    max={200}
                    placeholder="VD: 5"
                    value={slope}
                    onChange={(e: any) => setSlope(Number(e.target.value))}
                  />
                  <Slider 
                    value={[slope]} 
                    min={0} 
                    max={100} 
                    step={1} 
                    onValueChange={(v) => setSlope(v[0])}
                    className="py-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
              <div className="p-4 bg-emerald-500/10 border-b border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Thiết bị gợi ý từ Rivulis/Pentax</h3>
              </div>
              <div className="divide-y divide-white/5">
                {suggestedProducts.map((p) => (
                  <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                       {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Box className="w-6 h-6 text-slate-500" />}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-semibold text-white">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.brand}</div>
                    </div>
                    <div className="text-sm font-mono text-emerald-400">{formatVND(p.price)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-tighter">Tổng lưu lượng (Q)</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {results.totalFlowM3h.toFixed(1)} <span className="text-xl font-normal text-slate-400">m³/h</span>
                </div>
                <p className="text-sm text-slate-400">Dựa trên {results.treeCount.toLocaleString()} béc tưới</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-tighter">Công suất bơm (P)</div>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {results.pumpHP.toFixed(2)} <span className="text-xl font-normal text-slate-400">HP</span>
                </div>
                <p className="text-sm text-slate-400">Công suất máy bơm điện gợi ý</p>
              </motion.div>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-emerald-400" /> Bảng bóc tách vật tư (BOM) sơ bộ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-white/5">
                      <tr>
                        <th className="px-6 py-4">Hạng mục</th>
                        <th className="px-6 py-4">Quy cách</th>
                        <th className="px-6 py-4 text-right">Số lượng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="px-6 py-4 font-medium text-white">Béc tưới</td>
                        <td className="px-6 py-4 text-slate-400">Rivulis / SuperPro {flow}L/H</td>
                        <td className="px-6 py-4 text-right font-mono text-white">{results.treeCount.toLocaleString()} Cái</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-white">Ống nhánh LDPE</td>
                        <td className="px-6 py-4 text-slate-400">LDPE 16mm / 20mm Silver</td>
                        <td className="px-6 py-4 text-right font-mono text-white">{Math.round(results.ldpeLength).toLocaleString()} m</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-white">Ống chính</td>
                        <td className="px-6 py-4 text-slate-400">{results.mainPipe} Class 2</td>
                        <td className="px-6 py-4 text-right font-mono text-white">Tùy thực địa</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-white">Máy bơm gợi ý</td>
                        <td className="px-6 py-4 text-slate-400">Pentax / Lepono {results.pumpHP.toFixed(1)}HP</td>
                        <td className="px-6 py-4 text-right font-mono text-white">01 Bộ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-grow">
                    <h4 className="text-xl font-bold mb-2 text-white">Sẵn sàng triển khai?</h4>
                    <p className="text-slate-400 text-sm">Gửi dự toán này cho Đại lý AgriFlow gần nhất để nhận báo giá chi tiết và hỗ trợ kỹ thuật.</p>
                  </div>
                  <Button 
                    onClick={handleSendToDealer}
                    className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 border-none"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" /> Gửi dự toán cho Đại lý
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-400">
              <div className="p-1 rounded-lg bg-cyan-500/20">
                <Info className="w-5 h-5 text-cyan-400 shrink-0" />
              </div>
              <p>
                * Kết quả trên mang tính chất tham khảo dựa trên dữ liệu tiêu chuẩn. Để có bản vẽ chính xác nhất, AgriFlow khuyến nghị bác nông dân nên kết nối với kỹ sư để khảo sát thực địa.
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 md:hidden z-50">
        <Button 
          onClick={handleSendToDealer}
          className="w-full h-12 bg-emerald-500 text-white font-bold rounded-xl border-none"
        >
          <MessageCircle className="w-4 h-4 mr-2" /> Gửi đại lý tư vấn
        </Button>
      </div>
    </div>
  );
}

export default function DuToanTuoiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050a05] flex items-center justify-center text-white">Đang tải dữ liệu...</div>}>
      <DuToanTuoiContent />
    </Suspense>
  );
}
