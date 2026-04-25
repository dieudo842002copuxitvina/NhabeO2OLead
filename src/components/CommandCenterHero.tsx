"use client";

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search, Thermometer, Droplets, CloudRain, Sparkles,
  LayoutGrid, Banknote, Stethoscope, Upload, ArrowRight, Loader2, X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { weatherData } from '@/data/mock';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/tracking';

type ToolKey = 'bom' | 'cost' | 'doctor';

interface ToolCard {
  key: ToolKey;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  cta: string;
  tone: 'primary' | 'accent' | 'secondary';
}

const TOOL_CARDS: ToolCard[] = [
  {
    key: 'bom',
    icon: LayoutGrid,
    title: 'Tính toán vật tư (BOM)',
    desc: 'Nhận danh sách thiết bị chuẩn cho rẫy của bạn.',
    cta: 'Tính ngay',
    tone: 'primary',
  },
  {
    key: 'cost',
    icon: Banknote,
    title: 'Dự toán chi phí',
    desc: 'Tính toán ngân sách lắp đặt dự kiến.',
    cta: 'Dự toán',
    tone: 'primary',
  },
  {
    key: 'doctor',
    icon: Stethoscope,
    title: 'Bác sĩ hệ thống AI',
    desc: 'Chụp ảnh sự cố, nhận giải pháp ngay.',
    cta: 'Chẩn đoán',
    tone: 'primary',
  },
];

const CROPS = ['Sầu riêng', 'Cà phê', 'Hồ tiêu'];

/**
 * Trung tâm điều khiển nông vụ — Hero block
 * - Weather card với soil humidity + AI advice
 * - Smart search
 * - 3 AgriCalc tool cards mở Dialog
 */
export default function CommandCenterHero() {
  const router = useRouter();
  const { current, location } = weatherData;
  const [search, setSearch] = useState('');
  const [openTool, setOpenTool] = useState<ToolKey | null>(null);

  // Soil humidity derived from current humidity (mock IoT reading)
  const soil = Math.max(20, Math.min(95, current.humidity - 18));

  // Simple rule-based "AI" agronomy advice
  const advice = useMemo(() => {
    if (current.temp >= 32 && current.rainfall < 3) {
      return `Vùng ${location} đang vào mùa khô, khuyến nghị tưới 20 lít/gốc/ngày — ưu tiên nhỏ giọt 5-7h sáng.`;
    }
    if (current.rainfall >= 10) {
      return 'Mưa lớn — tạm dừng tưới, kiểm tra thoát nước & bón phân để tránh rửa trôi.';
    }
    if (soil < 35) {
      return 'Độ ẩm đất giảm dưới ngưỡng — kích hoạt hệ thống tưới tự động hôm nay.';
    }
    return 'Điều kiện canh tác ổn định — duy trì lịch tưới hiện tại và theo dõi cảm biến.';
  }, [current.temp, current.rainfall, soil, location]);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    trackEvent('search', { searchQuery: search });
    router.push(`/san-pham?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border/40">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative py-6 md:py-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> Trung tâm điều khiển nông vụ
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold leading-tight mt-3">
            Mọi quyết định canh tác —{' '}
            <span className="text-primary">trong một bảng điều khiển</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Thời tiết siêu địa phương · Tính vật tư · Dự toán chi phí · Chẩn đoán thiết bị bằng AI.
          </p>
        </motion.div>

        {/* Smart search */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          onSubmit={onSubmitSearch}
          className="mt-5 flex items-stretch gap-2 max-w-3xl"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm giải pháp tưới cho cây sầu riêng, cà phê..."
              className="h-14 pl-11 pr-4 text-base rounded-2xl border-2 bg-background/80 backdrop-blur shadow-sm focus-visible:border-primary"
              aria-label="Tìm kiếm giải pháp"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-14 px-6 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-md"
          >
            Tìm
          </Button>
        </motion.form>

        {/* Bento: Weather (left) + 3 tool cards (right) */}
        <div className="mt-6 grid grid-cols-12 gap-3 md:gap-4">
          {/* WEATHER WIDGET */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="col-span-12 lg:col-span-5"
          >
            <Card className="h-full glass border-primary/20 overflow-hidden">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      Thời tiết siêu địa phương
                    </p>
                    <p className="text-sm font-bold mt-0.5">{location}</p>
                  </div>
                  <div className="text-4xl leading-none">
                    {current.condition.toLowerCase().includes('nóng') ? '☀️' : '⛅'}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <WeatherStat
                    icon={Thermometer}
                    label="Nhiệt độ"
                    value={`${current.temp}°C`}
                    tone="text-accent"
                  />
                  <WeatherStat
                    icon={Droplets}
                    label="Ẩm đất"
                    value={`${soil}%`}
                    tone="text-info"
                  />
                  <WeatherStat
                    icon={CloudRain}
                    label="Lượng mưa"
                    value={`${current.rainfall}mm`}
                    tone="text-primary"
                  />
                </div>

                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-primary/8 border border-primary/15">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-primary tracking-wider">
                      Lời khuyên AI nông vụ
                    </p>
                    <p className="text-xs md:text-sm text-foreground mt-0.5 leading-relaxed">
                      {advice}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AGRICALC CARDS */}
          <div className="col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TOOL_CARDS.map((tool, i) => (
              <motion.button
                key={tool.key}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => {
                  trackEvent('calculator_used', { source: `agricalc_${tool.key}_open` });
                  setOpenTool(tool.key);
                }}
                className={cn(
                  'group text-left rounded-2xl p-4 border-2 transition-all',
                  'bg-card hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  tool.tone === 'primary' && 'border-primary/20 hover:border-primary',
                  tool.tone === 'accent' && 'border-accent/30 hover:border-accent',
                  tool.tone === 'secondary' && 'border-secondary/30 hover:border-secondary',
                )}
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center mb-3',
                    tool.tone === 'primary' && 'bg-primary/10 text-primary',
                    tool.tone === 'accent' && 'bg-accent/15 text-accent',
                    tool.tone === 'secondary' && 'bg-secondary/15 text-secondary',
                  )}
                >
                  <tool.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base leading-tight">{tool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{tool.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all">
                  {tool.cta} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <BomDialog open={openTool === 'bom'} onClose={() => setOpenTool(null)} />
      <CostDialog open={openTool === 'cost'} onClose={() => setOpenTool(null)} />
      <DoctorDialog open={openTool === 'doctor'} onClose={() => setOpenTool(null)} />
    </section>
  );
}

/* ---------- Sub-components ---------- */

function WeatherStat({
  icon: Icon, label, value, tone,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl bg-background/70 border p-2.5 text-center">
      <Icon className={cn('w-4 h-4 mx-auto', tone)} />
      <p className="font-bold text-sm mt-1 leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

/* ---------- Dialog: BOM ---------- */
function BomDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [area, setArea] = useState('');
  const [crop, setCrop] = useState<string | undefined>();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('calculator_used', { source: 'agricalc_bom_submit', category: crop });
    onClose();
    const params = new URLSearchParams();
    if (area) params.set('area', area);
    if (crop) params.set('crop', crop);
    router.push(`/cong-cu/du-toan-1ha?${params.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" /> Tính toán vật tư (BOM)
          </DialogTitle>
          <DialogDescription>
            Nhập diện tích và loại cây để nhận danh mục vật tư đề xuất.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bom-area">Diện tích (m²)</Label>
            <Input
              id="bom-area" type="number" inputMode="decimal" min={1}
              placeholder="VD: 5000"
              value={area} onChange={(e) => setArea(e.target.value)}
              className="h-12" required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bom-crop">Loại cây trồng</Label>
            <Select value={crop} onValueChange={setCrop}>
              <SelectTrigger id="bom-crop" className="h-12">
                <SelectValue placeholder="Chọn cây trồng" />
              </SelectTrigger>
              <SelectContent>
                {CROPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Huỷ</Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Xem kết quả
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Dialog: Cost estimate ---------- */
function CostDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [area, setArea] = useState('');
  const [system, setSystem] = useState<string | undefined>();
  const [estimate, setEstimate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(area);
    if (!a || !system) return;
    setLoading(true);
    // Mock per-m² rate
    const rate = system === 'drip' ? 12000 : system === 'sprinkler' ? 18000 : 25000;
    setTimeout(() => {
      const total = Math.round(a * rate);
      setEstimate(total);
      setLoading(false);
      trackEvent('calculator_used', { source: 'agricalc_cost_submit', category: system });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" /> Dự toán chi phí
          </DialogTitle>
          <DialogDescription>Ước tính nhanh tổng đầu tư hệ thống tưới.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cost-area">Diện tích (m²)</Label>
            <Input
              id="cost-area" type="number" min={1} value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="VD: 10000" className="h-12" required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost-system">Loại hệ thống tưới</Label>
            <Select value={system} onValueChange={setSystem}>
              <SelectTrigger id="cost-system" className="h-12">
                <SelectValue placeholder="Chọn loại tưới" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drip">Tưới nhỏ giọt</SelectItem>
                <SelectItem value="sprinkler">Tưới phun mưa</SelectItem>
                <SelectItem value="smart">Tưới thông minh IoT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {estimate !== null && !loading && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Ước tính tổng chi phí
              </p>
              <p className="font-display text-2xl font-extrabold text-primary mt-1">
                {estimate.toLocaleString('vi-VN')} ₫
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                * Mức giá tham khảo, chưa gồm thi công.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Đóng</Button>
            <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Đang tính</> : 'Dự toán'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Dialog: Doctor (image upload) ---------- */
function DoctorDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = (f: File | null) => {
    setFile(f);
    setResult(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setDiagnosing(true);
    setTimeout(() => {
      setResult(
        'Phát hiện dấu hiệu tắc đầu nhỏ giọt do cặn vôi. Đề xuất: súc rửa bằng dung dịch axit citric 2%, kiểm tra bộ lọc 120 mesh.',
      );
      setDiagnosing(false);
      trackEvent('calculator_used', { source: 'agricalc_doctor_submit' });
    }, 900);
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setNote(''); setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-secondary" /> Bác sĩ hệ thống
          </DialogTitle>
          <DialogDescription>
            Upload ảnh thiết bị / sự cố — AI sẽ chẩn đoán và gợi ý cách xử lý.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!preview ? (
            <label
              htmlFor="doctor-file"
              className="flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition"
            >
              <Upload className="w-7 h-7 text-muted-foreground" />
              <p className="text-sm font-semibold mt-2">Chọn ảnh để upload</p>
              <p className="text-[11px] text-muted-foreground">JPG / PNG, tối đa 10MB</p>
              <input
                id="doctor-file" type="file" accept="image/*" className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden border">
              <img src={preview} alt="Ảnh chẩn đoán" className="w-full h-48 object-cover" />
              <button
                type="button" onClick={() => handleFile(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 hover:bg-background flex items-center justify-center shadow"
                aria-label="Xoá ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="doctor-note">Mô tả thêm (tuỳ chọn)</Label>
            <Input
              id="doctor-note" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="VD: đầu nhỏ giọt không ra nước"
              className="h-11"
            />
          </div>

          {result && (
            <div className="rounded-xl bg-info/10 border border-info/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-info font-bold">
                Kết quả chẩn đoán AI
              </p>
              <p className="text-sm mt-1 leading-relaxed">{result}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Đóng</Button>
            <Button
              type="submit" disabled={!file || diagnosing}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {diagnosing ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Đang chẩn đoán</> : 'Chẩn đoán'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
