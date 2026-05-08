"use client";

/**
 * /tinh-toan — Zero-Login BOM Calculator
 * 
 * Full stepper flow: Crop → Land → Water → Result
 * At the Result step, integrates Zero-Login phone form that:
 *   1. Calls submitCalculatorLeadWithRouting (Server Action → O2O Round-Robin)
 *   2. Auto-opens Zalo with dealer's zalo_number
 *   3. Falls back to Nhà Bè Agri HQ Zalo if no dealer matched
 */

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Sprout, Ruler, Droplet, FileText, Calculator, Loader2, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SeoMeta from '@/components/SeoMeta';
import CropStep from '@/components/calculator/CropStep';
import LandStep from '@/components/calculator/LandStep';
import WaterStep from '@/components/calculator/WaterStep';
import ResultStep from '@/components/calculator/ResultStep';
import AnimatedCounter from '@/components/calculator/AnimatedCounter';
import {
  calculate,
  formatVND,
  CROPS,
  type CropKey,
  type SlopeKey,
  type WaterSourceKey,
  type CalculatorResult,
} from '@/lib/calculators/calculatorV2';

const STEPS = [
  { id: 1, label: 'Cây trồng', icon: Sprout },
  { id: 2, label: 'Thửa đất',  icon: Ruler },
  { id: 3, label: 'Nguồn nước', icon: Droplet },
  { id: 4, label: 'Kết quả',   icon: FileText },
];

const DEFAULT_PARAMS: Record<string, number> = {
  crop_durian_nozzles: 4,
  crop_coffee_nozzles: 2,
  crop_pomelo_nozzles: 2,
  crop_pepper_nozzles: 1,
  crop_dragonfruit_nozzles: 1,
  crop_avocado_nozzles: 1,
  factor_slope_flat: 1.0,
  factor_slope_hilly: 1.15,
  factor_water_well: 1.10,
  factor_water_river: 1.0,
  factor_loss: 1.08,
  pump_hp_per_1000m2: 0.6,
  price_nozzle: 35000,
  price_pipe_main: 18000,
  price_pipe_branch: 6500,
  price_pump_per_hp: 2200000,
  price_filter: 850000,
  price_install_per_m2: 4500,
};

/* ─────────────────────────────────────────────────────────────────────────────
 * URL CROP PARAMS CAPTURE COMPONENT
 * ───────────────────────────────────────────────────────────────────────────── */

interface CropParamsState {
  crop: CropKey | null;
  source: 'url' | 'default';
}

function CropParamsCapture({ 
  onCropDetected 
}: { 
  onCropDetected: (crop: CropKey | null) => void;
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const cropParam = searchParams.get('crop');
    if (cropParam) {
      // Validate crop is in CROPS list
      const validCrop = CROPS.find(c => c.key === cropParam);
      if (validCrop) {
        console.log('[URL] Detected crop param:', cropParam);
        onCropDetected(validCrop.key as CropKey);
      }
    }
  }, [searchParams, onCropDetected]);
  
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MAIN PAGE COMPONENT
 * ───────────────────────────────────────────────────────────────────────────── */

export default function TinhToanPage() {
  const [step, setStep] = useState(1);
  const [crop, setCrop] = useState<CropKey | null>(null);
  const [cropSource, setCropSource] = useState<'url' | 'default'>('default');
  const [area, setArea] = useState(5000);
  const [spacing, setSpacing] = useState(6);
  const [slope, setSlope] = useState<SlopeKey | null>(null);
  const [waterSource, setWaterSource] = useState<WaterSourceKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Handle crop detected from URL params
  const handleCropDetected = (detectedCrop: CropKey | null) => {
    if (detectedCrop && cropSource === 'default') {
      setCrop(detectedCrop);
      setCropSource('url');
      // Auto-advance to step 2 if crop is detected from URL
      setStep(2);
    }
  };

  const result: CalculatorResult | null = useMemo(() => {
    if (!crop || !slope || !waterSource || area < 100) return null;
    return calculate(
      { crop, areaM2: area, spacing, slope, waterSource },
      DEFAULT_PARAMS,
    );
  }, [crop, area, spacing, slope, waterSource]);

  const cropMeta = useMemo(() => CROPS.find(c => c.key === crop), [crop]);

  const canNext = useMemo(() => {
    if (step === 1) return !!crop;
    if (step === 2) return area >= 100 && spacing >= 1;
    if (step === 3) return !!slope && !!waterSource;
    return true;
  }, [step, crop, area, spacing, slope, waterSource]);

  const handleNext = () => {
    if (!canNext) return;
    setStep(s => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setStep(1);
    setCrop(null);
    setCropSource('default');
    setArea(5000);
    setSpacing(6);
    setSlope(null);
    setWaterSource(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SeoMeta
        title="Tính toán hệ thống tưới tự động | Nhà Bè Agri"
        description="Máy tính BOM tưới tự động cho sầu riêng, cà phê, bưởi. Nhận báo giá & bản vẽ chi tiết từ đại lý gần nhất qua Zalo trong 30 phút."
        canonical="/tinh-toan"
      />

      {/* URL Params Capture (hidden) */}
      <Suspense fallback={null}>
        <CropParamsCapture onCropDetected={handleCropDetected} />
      </Suspense>

      <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-background to-blue-50/30">
        <div className="container py-8 max-w-3xl mx-auto px-4">
          {/* URL Crop Detection Banner */}
          {cropSource === 'url' && crop && cropMeta && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  Đã tự động chọn: <span className="font-bold">{cropMeta.name}</span>
                </p>
                <p className="text-xs text-blue-600">
                  Từ liên kết trên trang Giải pháp — Bạn có thể thay đổi ở bước tiếp theo
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setCrop(null);
                  setCropSource('default');
                  setStep(1);
                }}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                Thay đổi
              </Button>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Calculator className="w-4 h-4" />
              Máy tính BOM Thủy lực
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Tính toán hệ thống tưới
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Trả lời 3 câu hỏi đơn giản, nhận ngay dự toán chi phí + bản vẽ kỹ thuật từ đại lý gần bạn.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isDone = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isDone ? 'bg-primary text-primary-foreground' :
                      isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className={`text-xs mt-1.5 font-medium hidden sm:block transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {s.label}
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-all duration-300 ${
                      step > s.id ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <Card className="animate-slide-up">
            <CardContent className="p-6 sm:p-8">

              {/* Step 1: Crop */}
              {step === 1 && (
                <div className="space-y-6">
                  <CropStep
                    value={crop}
                    onSelect={(key) => setCrop(key)}
                  />
                  <div className="flex justify-end pt-2">
                    <Button
                      size="lg"
                      onClick={handleNext}
                      disabled={!canNext}
                      className="min-w-[160px] h-12 font-semibold"
                    >
                      Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Land */}
              {step === 2 && (
                <div className="space-y-6">
                  <LandStep
                    area={area}
                    spacing={spacing}
                    slope={slope}
                    onChange={(patch) => {
                      if (patch.area !== undefined) setArea(patch.area);
                      if (patch.spacing !== undefined) setSpacing(patch.spacing);
                      if (patch.slope !== undefined) setSlope(patch.slope);
                    }}
                  />
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" size="lg" onClick={handleBack} className="h-12">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleNext}
                      disabled={!canNext}
                      className="flex-1 h-12 font-semibold"
                    >
                      Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Water */}
              {step === 3 && (
                <div className="space-y-6">
                  <WaterStep
                    value={waterSource}
                    onSelect={(s) => setWaterSource(s)}
                  />
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" size="lg" onClick={handleBack} className="h-12">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleNext}
                      disabled={!canNext}
                      className="flex-1 h-12 font-semibold"
                    >
                      Xem kết quả <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Result */}
              {step === 4 && result && cropMeta && mounted && (
                <div className="space-y-6">
                  <ResultStep
                    result={result}
                    input={{ crop, areaM2: area, spacing, slope: slope!, waterSource: waterSource! }}
                    cropName={cropMeta.name}
                    onRestart={handleRestart}
                  />
                  <div className="flex gap-3 pt-2 border-t">
                    <Button variant="outline" size="lg" onClick={handleBack} className="h-12">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleRestart}
                      className="h-12 text-muted-foreground"
                    >
                      Tính lại từ đầu
                    </Button>
                  </div>
                </div>
              )}

              {/* Loading Skeleton - mimics ResultStep layout */}
              {step === 4 && (!result || !mounted) && (
                <div className="space-y-6 animate-pulse">
                  {/* Header Skeleton */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2">
                      <div className="h-6 w-32 bg-slate-200 rounded-lg" />
                      <div className="h-8 w-64 bg-slate-200 rounded-lg" />
                      <div className="h-4 w-48 bg-slate-100 rounded" />
                    </div>
                    <div className="h-8 w-24 bg-slate-200 rounded-lg" />
                  </div>

                  {/* KPI Cards Skeleton */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 bg-slate-100 rounded-xl border border-slate-100">
                        <div className="h-5 w-5 bg-slate-200 rounded mb-3" />
                        <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                        <div className="h-6 w-12 bg-slate-200 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* BOM Table Skeleton */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                      <div className="h-4 w-4 bg-slate-200 rounded" />
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Table Header */}
                      <div className="flex gap-4 pb-2 border-b border-slate-100">
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                        <div className="flex-1" />
                        <div className="h-3 w-16 bg-slate-100 rounded" />
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                      </div>
                      {/* Table Rows */}
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4 py-2">
                          <div className="h-4 w-24 bg-slate-100 rounded" />
                          <div className="flex-1" />
                          <div className="h-4 w-16 bg-slate-100 rounded" />
                          <div className="h-4 w-20 bg-slate-100 rounded" />
                          <div className="h-4 w-20 bg-slate-100 rounded" />
                        </div>
                      ))}
                    </div>
                    {/* Total */}
                    <div className="p-5 bg-gradient-to-r from-emerald-50/50 to-slate-50 border-t">
                      <div className="flex items-end justify-between flex-wrap gap-3">
                        <div className="space-y-2">
                          <div className="h-3 w-20 bg-slate-200 rounded" />
                          <div className="h-10 w-40 bg-slate-200 rounded-lg" />
                          <div className="h-3 w-64 bg-slate-100 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lead Form Skeleton */}
                  <div className="border-2 border-slate-200/50 bg-slate-50/50 rounded-xl p-5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-slate-200 rounded-full" />
                        <div className="h-5 w-64 bg-slate-200 rounded" />
                      </div>
                      <div className="h-4 w-48 bg-slate-100 rounded" />
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <div className="h-3 w-12 bg-slate-100 rounded" />
                          <div className="h-10 w-full bg-white border border-slate-200 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-20 bg-slate-100 rounded" />
                          <div className="h-10 w-full bg-white border border-slate-200 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-16 bg-slate-100 rounded" />
                          <div className="h-10 w-full bg-white border border-slate-200 rounded-lg" />
                        </div>
                      </div>
                      <div className="h-14 w-full bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary" />
              Miễn phí tư vấn
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary" />
              Báo giá trong 30 phút
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary" />
              500+ đại lý toàn quốc
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
