'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Coffee,
  Droplets,
  FileText,
  FlaskConical,
  Leaf,
  MapPinned,
  Mountain,
  Phone,
  Ruler,
  Settings2,
  ShieldCheck,
  Sprout,
  Trees,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

type TerrainValue = 'bang-phang' | 'doi-doc';
type FarmingModelValue = 'trong-thuan' | 'xen-canh' | 'luan-canh';

interface EstimatorFormValues {
  region: string;
  areaHa: number;
  terrain: TerrainValue;
  cropType: string;
  farmingModel: FarmingModelValue;
  intercroppedCrop: string;
  treeCount: number;
}

interface LeadCaptureValues {
  fullName: string;
  phone: string;
}

export interface TurnkeyEstimatorPayload {
  packageId: string;
  packageName: string;
  estimatedCost: number;
  estimator: EstimatorFormValues;
  lead: LeadCaptureValues;
}

interface TurnkeyEstimatorProps {
  className?: string;
  onLeadCapture?: (payload: TurnkeyEstimatorPayload) => void;
}

const cropOptions = [
  { value: 'sau-rieng', label: 'Sầu Riêng', icon: Trees },
  { value: 'buoi', label: 'Bưởi', icon: Leaf },
  { value: 'ca-phe', label: 'Cà Phê', icon: Coffee },
  { value: 'tieu', label: 'Hồ Tiêu', icon: Sprout },
];

const intercroppedOptions = [
  { value: 'ca-phe', label: 'Cà Phê xen canh' },
  { value: 'chuoi', label: 'Chuối' },
  { value: 'tieu', label: 'Hồ Tiêu' },
  { value: 'co-phu-dat', label: 'Cỏ phủ đất' },
];

const stepMeta = [
  { id: 1, title: 'Khu đất', description: 'Quy mô và địa hình triển khai' },
  { id: 2, title: 'Canh tác', description: 'Hiện trạng trồng trọt thực tế' },
  { id: 3, title: 'Báo giá', description: 'Dự toán theo gói giải pháp' },
] as const;

function roundToMillion(value: number) {
  return Math.max(1_000_000, Math.round(value / 1_000_000) * 1_000_000);
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ`;
}

function getCropLabel(value: string) {
  return cropOptions.find((option) => option.value === value)?.label || 'Chưa chọn';
}

function getCropIcon(value: string) {
  return cropOptions.find((option) => option.value === value)?.icon || Sprout;
}

export default function TurnkeyEstimator({ className, onLeadCapture }: TurnkeyEstimatorProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const estimatorForm = useForm<EstimatorFormValues>({
    defaultValues: {
      region: '',
      areaHa: 2.5,
      terrain: 'bang-phang',
      cropType: 'sau-rieng',
      farmingModel: 'trong-thuan',
      intercroppedCrop: '',
      treeCount: 800,
    },
    mode: 'onChange',
  });

  const leadForm = useForm<LeadCaptureValues>({
    defaultValues: {
      fullName: '',
      phone: '',
    },
    mode: 'onSubmit',
  });

  const terrain = estimatorForm.watch('terrain');
  const farmingModel = estimatorForm.watch('farmingModel');
  const values = estimatorForm.watch();

  useEffect(() => {
    if (farmingModel !== 'xen-canh') {
      estimatorForm.setValue('intercroppedCrop', '');
    }
  }, [estimatorForm, farmingModel]);

  const hasCompensationRequirement = terrain === 'doi-doc' || farmingModel === 'xen-canh';

  const packageTiers = useMemo(() => {
    const slopeMultiplier = terrain === 'doi-doc' ? 1.08 : 1;
    const intercropMultiplier = farmingModel === 'xen-canh' ? 1.06 : 1;
    const complexityMultiplier = slopeMultiplier * intercropMultiplier;

    const basic = roundToMillion((values.areaHa * 38_000_000 + values.treeCount * 78_000) * complexityMultiplier);
    const fertigation = roundToMillion(
      (values.areaHa * 56_000_000 + values.treeCount * 105_000) * complexityMultiplier
    );
    const allInOne = roundToMillion(
      (values.areaHa * 84_000_000 + values.treeCount * 138_000) * complexityMultiplier
    );

    return [
      {
        id: 'basic',
        name: 'Gói Tưới Cơ Bản',
        price: basic,
        icon: Droplets,
        accent: 'from-slate-50 via-white to-emerald-50/60',
        border: 'border-slate-200',
        features: ['Thiết kế sơ bộ tuyến ống', 'Béc tưới và phụ kiện tiêu chuẩn', 'Dự toán vật tư theo diện tích'],
      },
      {
        id: 'fertigation',
        name: 'Gói Châm Phân Bán Tự Động',
        price: fertigation,
        icon: FlaskConical,
        accent: 'from-[#2E7D32]/10 via-white to-emerald-100/70',
        border: 'border-[#2E7D32]/40',
        highlight: true,
        features: ['Bơm định lượng và cụm châm phân', 'Cân bằng lưu lượng theo từng khu', 'Khuyến nghị phù hợp cho vườn thương mại'],
      },
      {
        id: 'all-in-one',
        name: 'Gói All-In-One',
        price: allInOne,
        icon: ShieldCheck,
        accent: 'from-slate-900/[0.03] via-white to-slate-100',
        border: 'border-slate-200',
        features: ['Khảo sát, thiết kế, thi công trọn gói', 'Nghiệm thu áp lực và hướng dẫn vận hành', 'Đồng hành tối ưu trong giai đoạn chạy thử'],
      },
    ];
  }, [farmingModel, terrain, values.areaHa, values.treeCount]);

  const selectedPackage = packageTiers.find((tier) => tier.id === selectedPackageId) || null;
  const progressPercent = ((step - 1) / (stepMeta.length - 1)) * 100;
  const SelectedCropIcon = getCropIcon(values.cropType);

  async function goNextStep() {
    const fieldsByStep: Record<number, (keyof EstimatorFormValues)[]> = {
      1: ['region', 'areaHa', 'terrain'],
      2: ['cropType', 'farmingModel', 'treeCount', ...(farmingModel === 'xen-canh' ? ['intercroppedCrop'] : [])],
      3: [],
    };

    const isValid = await estimatorForm.trigger(fieldsByStep[step] || []);
    if (!isValid) {
      return;
    }

    if (step < 3) {
      setDirection(1);
      setStep((current) => current + 1);
    }
  }

  function goPreviousStep() {
    if (step > 1) {
      setDirection(-1);
      setStep((current) => current - 1);
    }
  }

  function openLeadDialog(packageId: string) {
    setSelectedPackageId(packageId);
    setSuccessMessage(null);
    leadForm.reset();
    setLeadDialogOpen(true);
  }

  function handleLeadCapture(lead: LeadCaptureValues) {
    if (!selectedPackage) {
      return;
    }

    const payload: TurnkeyEstimatorPayload = {
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      estimatedCost: selectedPackage.price,
      estimator: estimatorForm.getValues(),
      lead,
    };

    if (onLeadCapture) {
      onLeadCapture(payload);
    } else {
      console.log('Turnkey estimator lead captured:', payload);
    }

    setSuccessMessage(`Đã ghi nhận yêu cầu cho ${selectedPackage.name}. Đội ngũ sẽ liên hệ qua Zalo để gửi PDF.`);
    setLeadDialogOpen(false);
  }

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)]',
        className
      )}
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div className="relative overflow-hidden border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-[#2E7D32]/12 via-emerald-50 to-transparent" />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full bg-[#2E7D32] px-3 py-1 text-white hover:bg-[#2E7D32]">
                    Turnkey Estimator
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-slate-200 bg-white/80 px-3 py-1 text-slate-600">
                    Quy trình tư vấn B2B theo 3 bước
                  </Badge>
                </div>
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    Dự toán turnkey irrigation cho đội ngũ kinh doanh và tư vấn kỹ thuật
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                    Khách chỉ cần nhập thông tin vận hành cốt lõi, hệ thống sẽ tạo ra ba tầng giải pháp với định giá
                    mock ngay trên màn hình và điều hướng sang form thu lead ở đúng thời điểm quyết định.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Progress</span>
                  <span>Bước {step}/3</span>
                </div>
                <div className="relative mb-5 h-2 rounded-full bg-slate-100">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-[#2E7D32]"
                    initial={false}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {stepMeta.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'rounded-2xl border px-4 py-3 transition-colors',
                        step === item.id
                          ? 'border-[#2E7D32]/30 bg-[#2E7D32]/5'
                          : step > item.id
                            ? 'border-emerald-200 bg-emerald-50/70'
                            : 'border-slate-200 bg-slate-50/70'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                            step >= item.id ? 'bg-[#2E7D32] text-white' : 'bg-slate-200 text-slate-600'
                          )}
                        >
                          {step > item.id ? <BadgeCheck className="h-3.5 w-3.5" /> : item.id}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <AnimatePresence custom={direction} initial={false} mode="wait">
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 36 : -36 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -36 : 36 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  {step === 1 ? (
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2E7D32]">
                          Bước 1
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">Thông tin khu đất triển khai</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Xác định phạm vi địa lý, diện tích và cấu trúc địa hình để thiết lập khung chi phí cơ sở.
                        </p>
                      </div>

                      <div className="grid gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="region" className="text-sm font-semibold text-slate-800">
                            Tỉnh / Khu vực triển khai
                          </Label>
                          <Input
                            id="region"
                            placeholder="Ví dụ: Krông Pắc, Đắk Lắk"
                            className="h-12 rounded-2xl border-slate-200"
                            {...estimatorForm.register('region', {
                              required: 'Vui lòng nhập tỉnh hoặc khu vực triển khai.',
                              minLength: { value: 2, message: 'Khu vực cần có ít nhất 2 ký tự.' },
                            })}
                          />
                          {estimatorForm.formState.errors.region ? (
                            <p className="text-sm text-red-600">{estimatorForm.formState.errors.region.message}</p>
                          ) : null}
                        </div>

                        <Controller
                          control={estimatorForm.control}
                          name="areaHa"
                          rules={{
                            min: { value: 0.5, message: 'Diện tích tối thiểu là 0.5 ha.' },
                            max: { value: 100, message: 'Diện tích tối đa cho bản demo là 100 ha.' },
                          }}
                          render={({ field, fieldState }) => (
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <Label className="text-sm font-semibold text-slate-800">Diện tích dự kiến (Hecta)</Label>
                                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                                  <Ruler className="h-4 w-4 text-[#2E7D32]" />
                                  <Input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max="100"
                                    value={field.value}
                                    onChange={(event) => field.onChange(Number(event.target.value) || 0.5)}
                                    className="h-auto w-24 border-0 bg-transparent p-0 text-right text-base font-semibold shadow-none focus-visible:ring-0"
                                  />
                                  <span className="text-sm text-slate-500">ha</span>
                                </div>
                              </div>
                              <Slider
                                value={[field.value]}
                                min={0.5}
                                max={100}
                                step={0.5}
                                onValueChange={(nextValue) => field.onChange(nextValue[0] || 0.5)}
                                className="[&_[role=slider]]:border-[#2E7D32] [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-md [&_[data-orientation=horizontal]]:h-2"
                              />
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>0.5 ha</span>
                                <span>Triển khai thử nghiệm</span>
                                <span>100 ha</span>
                              </div>
                              {fieldState.error ? <p className="text-sm text-red-600">{fieldState.error.message}</p> : null}
                            </div>
                          )}
                        />

                        <Controller
                          control={estimatorForm.control}
                          name="terrain"
                          rules={{ required: 'Vui lòng chọn địa hình.' }}
                          render={({ field, fieldState }) => (
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-slate-800">Địa hình</Label>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="grid gap-3 md:grid-cols-2"
                              >
                                <label className="group cursor-pointer rounded-3xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#2E7D32]/30 hover:bg-[#2E7D32]/5">
                                  <div className="flex items-start gap-3">
                                    <RadioGroupItem value="bang-phang" className="mt-1" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Ruler className="h-4 w-4 text-[#2E7D32]" />
                                        <p className="font-semibold text-slate-900">Bằng phẳng</p>
                                      </div>
                                      <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Phù hợp để tối ưu tuyến ống và giảm khối lượng van bù áp.
                                      </p>
                                    </div>
                                  </div>
                                </label>
                                <label className="group cursor-pointer rounded-3xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#2E7D32]/30 hover:bg-[#2E7D32]/5">
                                  <div className="flex items-start gap-3">
                                    <RadioGroupItem value="doi-doc" className="mt-1" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <Mountain className="h-4 w-4 text-[#2E7D32]" />
                                        <p className="font-semibold text-slate-900">Đồi dốc</p>
                                      </div>
                                      <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Cần cân nhắc thêm van bù áp và phân khu áp lực khi triển khai.
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              </RadioGroup>
                              {fieldState.error ? <p className="text-sm text-red-600">{fieldState.error.message}</p> : null}
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2E7D32]">
                          Bước 2
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">Hiện trạng canh tác</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Những trường này quyết định mức độ phân khu tưới, mật độ béc và độ phức tạp của dự toán.
                        </p>
                      </div>

                      <div className="grid gap-5">
                        <Controller
                          control={estimatorForm.control}
                          name="cropType"
                          rules={{ required: 'Vui lòng chọn loại cây trồng chính.' }}
                          render={({ field, fieldState }) => (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-slate-800">Loại cây trồng chính</Label>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                                  <SelectValue placeholder="Chọn loại cây trồng chính" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cropOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {fieldState.error ? <p className="text-sm text-red-600">{fieldState.error.message}</p> : null}
                            </div>
                          )}
                        />

                        <Controller
                          control={estimatorForm.control}
                          name="farmingModel"
                          rules={{ required: 'Vui lòng chọn mô hình canh tác.' }}
                          render={({ field, fieldState }) => (
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-slate-800">Mô hình canh tác</Label>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="grid gap-3 md:grid-cols-3"
                              >
                                {[
                                  {
                                    value: 'trong-thuan',
                                    title: 'Trồng thuần',
                                    description: 'Một loại cây chủ lực, dễ tiêu chuẩn hóa lưu lượng',
                                  },
                                  {
                                    value: 'xen-canh',
                                    title: 'Xen canh',
                                    description: 'Nhiều đối tượng tưới, thường cần cân bằng áp lực',
                                  },
                                  {
                                    value: 'luan-canh',
                                    title: 'Luân canh',
                                    description: 'Thay đổi chu kỳ cây trồng theo giai đoạn sản xuất',
                                  },
                                ].map((option) => (
                                  <label
                                    key={option.value}
                                    className="cursor-pointer rounded-3xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#2E7D32]/30 hover:bg-[#2E7D32]/5"
                                  >
                                    <div className="flex items-start gap-3">
                                      <RadioGroupItem value={option.value} className="mt-1" />
                                      <div>
                                        <p className="font-semibold text-slate-900">{option.title}</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">{option.description}</p>
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </RadioGroup>
                              {fieldState.error ? <p className="text-sm text-red-600">{fieldState.error.message}</p> : null}
                            </div>
                          )}
                        />

                        {farmingModel === 'xen-canh' ? (
                          <Controller
                            control={estimatorForm.control}
                            name="intercroppedCrop"
                            rules={{ required: 'Vui lòng chọn loại cây xen canh.' }}
                            render={({ field, fieldState }) => (
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-800">Loại cây xen canh là gì?</Label>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                                    <SelectValue placeholder="Chọn cây xen canh" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {intercroppedOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {fieldState.error ? (
                                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                                ) : (
                                  <p className="text-sm text-slate-500">
                                    Hệ thống sẽ cộng thêm logic van bù áp cho vùng tưới có tải không đồng đều.
                                  </p>
                                )}
                              </div>
                            )}
                          />
                        ) : null}

                        <div className="space-y-2">
                          <Label htmlFor="treeCount" className="text-sm font-semibold text-slate-800">
                            Tổng số lượng gốc cây ước tính
                          </Label>
                          <Input
                            id="treeCount"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Ví dụ: 1.200"
                            className="h-12 rounded-2xl border-slate-200"
                            {...estimatorForm.register('treeCount', {
                              required: 'Vui lòng nhập tổng số gốc cây.',
                              valueAsNumber: true,
                              min: { value: 1, message: 'Số gốc cây phải lớn hơn 0.' },
                            })}
                          />
                          <p className="text-sm text-slate-500">
                            Trường này được dùng để tính mật độ béc tưới và quy mô bộ châm phân.
                          </p>
                          {estimatorForm.formState.errors.treeCount ? (
                            <p className="text-sm text-red-600">{estimatorForm.formState.errors.treeCount.message}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2E7D32]">
                            Bước 3
                          </p>
                          <h3 className="mt-2 text-2xl font-bold text-slate-900">Bảng giá giải pháp động</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Dự toán dưới đây được tính mock theo diện tích và số lượng gốc cây. Gói châm phân bán tự
                            động được highlight để dẫn hướng quyết định trong kịch bản tư vấn B2B.
                          </p>
                        </div>
                        {hasCompensationRequirement ? (
                          <Badge
                            variant="outline"
                            className="rounded-full border-amber-300 bg-amber-50 px-3 py-1 text-amber-800"
                          >
                            <AlertTriangle className="mr-2 h-3.5 w-3.5" />
                            Đã cấu hình thêm hệ thống van bù áp cho địa hình dốc/xen canh
                          </Badge>
                        ) : null}
                      </div>

                      <div className="grid gap-4 xl:grid-cols-3">
                        {packageTiers.map((tier) => {
                          const TierIcon = tier.icon;

                          return (
                            <motion.div
                              key={tier.id}
                              layout
                              className={cn(
                                'relative overflow-hidden rounded-[28px] border bg-gradient-to-br p-[1px] shadow-sm',
                                tier.highlight
                                  ? 'border-[#2E7D32] shadow-[0_18px_40px_-24px_rgba(46,125,50,0.55)]'
                                  : tier.border
                              )}
                            >
                              <div className={cn('h-full rounded-[27px] bg-gradient-to-br p-5', tier.accent)}>
                                {tier.highlight ? (
                                  <Badge className="mb-4 rounded-full bg-[#2E7D32] px-3 py-1 text-white hover:bg-[#2E7D32]">
                                    Gói được ưu tiên đề xuất
                                  </Badge>
                                ) : (
                                  <div className="mb-4 h-7" />
                                )}

                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                                      {tier.name}
                                    </p>
                                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                                      {formatCurrency(tier.price)}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                      Dự toán sơ bộ cho giai đoạn chào giá và tiền khảo sát.
                                    </p>
                                  </div>
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 shadow-sm">
                                    <TierIcon className="h-5 w-5 text-[#2E7D32]" />
                                  </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                  {tier.features.map((feature) => (
                                    <div key={feature} className="flex items-start gap-3">
                                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
                                      <p className="text-sm leading-6 text-slate-700">{feature}</p>
                                    </div>
                                  ))}
                                </div>

                                {hasCompensationRequirement ? (
                                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                                    Đã cấu hình thêm hệ thống van bù áp cho địa hình dốc/xen canh.
                                  </div>
                                ) : null}

                                <Button
                                  type="button"
                                  onClick={() => openLeadDialog(tier.id)}
                                  className={cn(
                                    'mt-6 h-12 w-full rounded-2xl text-sm font-semibold',
                                    tier.highlight
                                      ? 'bg-[#2E7D32] text-white hover:bg-[#25672a]'
                                      : 'bg-slate-900 text-white hover:bg-slate-800'
                                  )}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Tải Dự Toán PDF & Báo Giá
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goPreviousStep}
                  disabled={step === 1}
                  className="h-11 rounded-2xl border-slate-200 px-5"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={goNextStep}
                    className="h-11 rounded-2xl bg-[#2E7D32] px-5 text-white hover:bg-[#25672a]"
                  >
                    Tiếp tục
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDirection(-1);
                      setStep(2);
                    }}
                    className="h-11 rounded-2xl border-[#2E7D32]/30 px-5 text-[#2E7D32] hover:bg-[#2E7D32]/5"
                  >
                    Chỉnh lại cấu hình
                  </Button>
                )}
              </div>

              {successMessage ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                  {successMessage}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="bg-slate-950 text-white">
          <div className="flex h-full flex-col p-6 sm:p-8">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90">Field Summary</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <MapPinned className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Khu vực</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">{values.region || 'Chưa nhập khu vực'}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-emerald-200">
                      {terrain === 'doi-doc' ? <Mountain className="h-4 w-4" /> : <Ruler className="h-4 w-4" />}
                      <span className="text-xs font-semibold uppercase tracking-[0.16em]">Địa hình</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {terrain === 'doi-doc' ? 'Đồi dốc' : 'Bằng phẳng'}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">{values.areaHa.toFixed(1)} ha triển khai</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-emerald-200">
                      <SelectedCropIcon className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.16em]">Cây trồng</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-white">{getCropLabel(values.cropType)}</p>
                    <p className="mt-1 text-sm text-slate-300">{values.treeCount.toLocaleString('vi-VN')} gốc cây</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <Settings2 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Mô hình canh tác</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {farmingModel === 'xen-canh'
                      ? 'Xen canh'
                      : farmingModel === 'luan-canh'
                        ? 'Luân canh'
                        : 'Trồng thuần'}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {farmingModel === 'xen-canh'
                      ? `Cây xen canh: ${intercroppedOptions.find((item) => item.value === values.intercroppedCrop)?.label || 'Chưa chọn'}`
                      : 'Cấu hình lưu lượng được chuẩn hóa theo một tầng cây chính.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-[#2E7D32]/30 to-emerald-500/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">Quick Insight</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Droplets className="mt-0.5 h-5 w-5 text-emerald-200" />
                  <p className="text-sm leading-6 text-slate-100">
                    Với quy mô hiện tại, đội sales có thể dùng đây như pre-quote trước khi điều phối khảo sát thật.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FlaskConical className="mt-0.5 h-5 w-5 text-emerald-200" />
                  <p className="text-sm leading-6 text-slate-100">
                    Gói châm phân bán tự động được đẩy nổi bật để tăng tỷ lệ chốt ở nhóm khách hàng nông hộ chuyên canh.
                  </p>
                </div>
                {hasCompensationRequirement ? (
                  <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-50">
                    Điều kiện thực địa hiện tại yêu cầu thêm lớp van bù áp để cân bằng lưu lượng giữa các zone.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
        <DialogContent className="overflow-hidden rounded-[28px] border border-slate-200 p-0 sm:max-w-[560px]">
          <div className="bg-gradient-to-br from-[#2E7D32]/10 via-white to-emerald-50/70 p-6 sm:p-7">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
                Tải Dự Toán PDF & Báo Giá
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-6 text-slate-600">
                Điền thông tin để đội ngũ tư vấn gửi báo giá chi tiết qua Zalo cùng phương án phù hợp cho{' '}
                <span className="font-semibold text-slate-900">{selectedPackage?.name || 'gói giải pháp đã chọn'}</span>.
              </DialogDescription>
            </DialogHeader>

            {selectedPackage ? (
              <div className="mt-5 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedPackage.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Dự toán sơ bộ theo thông số khách vừa cung cấp</p>
                  </div>
                  <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">
                    {formatCurrency(selectedPackage.price)}
                  </Badge>
                </div>
              </div>
            ) : null}

            <form onSubmit={leadForm.handleSubmit(handleLeadCapture)} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-slate-800">
                  Họ và Tên
                </Label>
                <Input
                  id="fullName"
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  className="h-12 rounded-2xl border-slate-200"
                  {...leadForm.register('fullName', {
                    required: 'Vui lòng nhập họ và tên.',
                    minLength: { value: 2, message: 'Tên cần có ít nhất 2 ký tự.' },
                  })}
                />
                {leadForm.formState.errors.fullName ? (
                  <p className="text-sm text-red-600">{leadForm.formState.errors.fullName.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-slate-800">
                  Số điện thoại (Zalo)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ví dụ: 0909123456"
                  className="h-12 rounded-2xl border-slate-200"
                  {...leadForm.register('phone', {
                    required: 'Vui lòng nhập số điện thoại.',
                    pattern: {
                      value: /^0\d{8,10}$/,
                      message: 'Số điện thoại cần bắt đầu bằng 0 và có 9-11 số.',
                    },
                  })}
                />
                {leadForm.formState.errors.phone ? (
                  <p className="text-sm text-red-600">{leadForm.formState.errors.phone.message}</p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Thông tin này chỉ phục vụ cho việc gửi PDF dự toán và báo giá, sau đó đội ngũ kỹ thuật sẽ liên hệ xác
                minh nhu cầu thực tế.
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLeadDialogOpen(false)}
                  className="h-11 rounded-2xl border-slate-200 px-5"
                >
                  Để sau
                </Button>
                <Button type="submit" className="h-11 rounded-2xl bg-[#2E7D32] px-5 text-white hover:bg-[#25672a]">
                  <Phone className="mr-2 h-4 w-4" />
                  Gửi yêu cầu báo giá
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
