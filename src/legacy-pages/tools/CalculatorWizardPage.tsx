import { useMemo, useState } from 'react';
import { Calculator as CalcIcon, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import SeoMeta from '@/components/SeoMeta';
import {
  CROPS, calculate,
  type CropKey, type SlopeKey, type WaterSourceKey, type CalculatorInput,
} from '@/lib/calculatorV2';
import { useCalculatorParams } from '@/hooks/useCalculatorParams';
import { trackEvent } from '@/lib/tracking';

import CropStep from '@/components/calculator/CropStep';
import LandStep from '@/components/calculator/LandStep';
import WaterStep from '@/components/calculator/WaterStep';
import ResultStep from '@/components/calculator/ResultStep';

const STEPS = [
  { num: 1, label: 'Cây trồng' },
  { num: 2, label: 'Thửa đất' },
  { num: 3, label: 'Nguồn nước' },
  { num: 4, label: 'Báo giá' },
];

export default function CalculatorWizardPage() {
  const { params, loading } = useCalculatorParams();

  const [step, setStep] = useState(1);
  const [crop, setCrop] = useState<CropKey | null>(null);
  const [area, setArea] = useState(0);
  const [spacing, setSpacing] = useState(0);
  const [slope, setSlope] = useState<SlopeKey | null>(null);
  const [water, setWater] = useState<WaterSourceKey | null>(null);

  // Auto-fill spacing default when crop chosen
  const handleCropSelect = (k: CropKey) => {
    setCrop(k);
    const meta = CROPS.find(c => c.key === k);
    if (meta && spacing === 0) {
      const def = params[`${meta.paramPrefix}_spacing`];
      if (def) setSpacing(def);
    }
  };

  const cropMeta = useMemo(() => CROPS.find(c => c.key === crop), [crop]);

  const result = useMemo(() => {
    if (!crop || !area || !spacing || !slope || !water) return null;
    const input: CalculatorInput = { crop, areaM2: area, spacing, slope, waterSource: water };
    return { input, output: calculate(input, params) };
  }, [crop, area, spacing, slope, water, params]);

  const canNext =
    (step === 1 && crop) ||
    (step === 2 && area >= 50 && spacing > 0 && slope) ||
    (step === 3 && water);

  const goNext = () => {
    if (step === 3 && water) {
      trackEvent('calculator_used', { productId: 'irrigation_calculator' });
    }
    setStep(s => Math.min(4, s + 1));
  };
  const goBack = () => setStep(s => Math.max(1, s - 1));
  const restart = () => {
    setStep(1); setCrop(null); setArea(0); setSpacing(0); setSlope(null); setWater(null);
  };

  return (
    <>
      <SeoMeta
        title="Máy tính hệ thống tưới thông minh — dự toán nhanh trong 1 phút"
        description="Nhập diện tích, loại cây và độ dốc — nhận ngay số béc tưới, công suất bơm và tổng dự toán. Báo giá Zalo đại lý gần nhất."
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <CalcIcon className="w-3 h-3 mr-1" /> Smart Calculator
          </Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
            Máy tính Hệ thống Tưới Thông minh
          </h1>
          <p className="text-muted-foreground">
            3 bước · 60 giây · Nhận bản vẽ + báo giá Zalo đại lý gần nhất
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map(s => {
              const reached = step >= s.num;
              const current = step === s.num;
              return (
                <div key={s.num} className="flex-1 flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    current
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : reached
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {reached && !current ? '✓' : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${current ? 'text-primary' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                  {s.num < STEPS.length && <div className="flex-1 h-px bg-border mx-1" />}
                </div>
              );
            })}
          </div>
          <Progress value={(step / STEPS.length) * 100} className="h-1.5" />
        </div>

        {/* Step content */}
        <Card className="p-6 md:p-8">
          {loading && step === 1 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang tải tham số tính toán...
            </div>
          )}

          {step === 1 && <CropStep value={crop} onSelect={handleCropSelect} />}
          {step === 2 && (
            <LandStep
              area={area} spacing={spacing} slope={slope}
              onChange={p => {
                if (p.area !== undefined) setArea(p.area);
                if (p.spacing !== undefined) setSpacing(p.spacing);
                if (p.slope !== undefined) setSlope(p.slope);
              }}
            />
          )}
          {step === 3 && <WaterStep value={water} onSelect={setWater} />}
          {step === 4 && result && cropMeta && (
            <ResultStep
              result={result.output}
              input={result.input}
              cropName={cropMeta.name}
              onRestart={restart}
            />
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="mt-8 pt-6 border-t flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={goBack} disabled={step === 1}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
              </Button>
              <Button
                onClick={goNext}
                disabled={!canNext}
                size="lg"
                className="font-semibold"
              >
                {step === 3 ? 'Xem kết quả' : 'Tiếp tục'} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
