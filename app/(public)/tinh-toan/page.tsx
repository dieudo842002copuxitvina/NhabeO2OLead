"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Calculator, 
  Droplets, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  MapPin,
  Send,
  Info,
  ChevronRight,
  User,
  Phone,
  Loader2,
  Package,
  Wrench,
  Trash2,
  MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { calculatePumpRequirement, HydraulicInput, HydraulicOutput } from "@/lib/agri-engine/hydraulic";
import { formatVND } from "@/lib/agri-engine/utils";
import { getProvinceCoords } from "@/lib/hydraulic";
import { generateBOM, type BOMResult, type BOMItem } from "@/lib/bom";
import { submitCalculatorAndCreateLead } from "@/app/actions/lead";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────────
 * CONSTANTS
 * ───────────────────────────────────────────────────────────────────────────── */

const PIPE_SIZE_OPTIONS = [
  { value: 20, label: "20mm (Φ20)" },
  { value: 25, label: "25mm (Φ25)" },
  { value: 32, label: "32mm (Φ32)" },
  { value: 40, label: "40mm (Φ40)" },
  { value: 50, label: "50mm (Φ50)" },
  { value: 63, label: "63mm (Φ63)" },
  { value: 75, label: "75mm (Φ75)" },
  { value: 90, label: "90mm (Φ90)" },
  { value: 110, label: "110mm (Φ110)" },
];

const EMITTER_FLOW_OPTIONS = [
  { value: 2, label: "2 L/h (Béc tiết kiệm)" },
  { value: 4, label: "4 L/h (Béc tiêu chuẩn)" },
  { value: 8, label: "8 L/h (Béc phun mưa)" },
  { value: 16, label: "16 L/h (Béc tưới rãnh)" },
  { value: 20, label: "20 L/h (Béc công nghiệp)" },
];

/* ─────────────────────────────────────────────────────────────────────────────
 * CONTACT FORM TYPES
 * ───────────────────────────────────────────────────────────────────────────── */

interface ContactInfo {
  customerName: string;
  customerPhone: string;
  province: string;
}

interface ContactErrors {
  customerName?: string;
  customerPhone?: string;
}

const DEFAULT_CONTACT: ContactInfo = {
  customerName: "",
  customerPhone: "",
  province: "",
};

/* ─────────────────────────────────────────────────────────────────────────────
 * VALIDATION
 * ───────────────────────────────────────────────────────────────────────────── */

function validateContact(contact: ContactInfo): ContactErrors {
  const errors: ContactErrors = {};
  
  if (!contact.customerName?.trim()) {
    errors.customerName = "Vui lòng nhập họ tên";
  } else if (contact.customerName.trim().length < 2) {
    errors.customerName = "Tên phải có ít nhất 2 ký tự";
  }
  
  if (!contact.customerPhone?.trim()) {
    errors.customerPhone = "Vui lòng nhập số điện thoại";
  } else {
    const phoneRegex = /^(0[0-9]{9,10})$/;
    const cleanPhone = contact.customerPhone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.customerPhone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    }
  }
  
  return errors;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * DEFAULT VALUES
 * ───────────────────────────────────────────────────────────────────────────── */

const DEFAULT_INPUT: HydraulicInput = {
  areaHa: 5,
  elevationM: 15,
  pipeLengthM: 200,
  pipeDiameterMm: 63,
  emitterFlowLPH: 4,
  emitterCount: 500,
};

/* ─────────────────────────────────────────────────────────────────────────────
 * RESULT CARD COMPONENTS
 * ───────────────────────────────────────────────────────────────────────────── */

interface ResultMetricProps {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  color?: "emerald" | "blue" | "orange" | "purple" | "red" | "slate";
}

function ResultMetric({ icon: Icon, label, value, unit, highlight, color = "emerald" }: ResultMetricProps) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200",
    slate: "bg-slate-50 text-slate-400 border-slate-100",
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl border transition-all",
      highlight ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center border",
        highlight ? colorClasses.emerald : colorClasses.slate
      )}>
        <Icon className={cn("w-6 h-6", highlight ? "text-emerald-600" : "text-slate-400")} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-2xl font-bold",
            highlight ? "text-emerald-700" : "text-slate-900"
          )}>
            {value}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * BOM TABLE COMPONENT
 * ───────────────────────────────────────────────────────────────────────────── */

interface BOMTableProps {
  bom: BOMResult;
  isLoading: boolean;
}

function BOMTable({ bom, isLoading }: BOMTableProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <CardTitle>Danh sách vật tư dự kiến</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Đang tải danh sách vật tư...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bom || bom.items.length === 0) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <CardTitle>Danh sách vật tư dự kiến</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Không có vật tư phù hợp trong database</p>
            <p className="text-sm">Cần tư vấn trực tiếp từ kỹ thuật</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryIcons: Record<string, string> = {
    'Ống chính': '🔵',
    'Bộ lọc': '🟡',
    'Máy bơm': '🟢',
    'Béc tưới': '🟠',
    'Phụ kiện': '⚪',
  };

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <CardTitle>Danh sách vật tư dự kiến</CardTitle>
          </div>
          {bom.requiresManualReview && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Cần rà soát
            </Badge>
          )}
        </div>
        {bom.message && (
          <CardDescription className="text-amber-600">
            {bom.message}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* BOM Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-100/50">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Sản phẩm</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground w-20">SL</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground w-28">Đơn giá</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground w-32">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {bom.items.map((item, index) => (
                <tr key={item.productId + index} className="border-b border-slate-100 hover:bg-slate-100/50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      {/* Product Image */}
                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {item.productId !== 'TBD' ? (
                          <Image
                            src={`/api/products/${item.productId}/image`}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Wrench className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryIcons[item.category] || '⚫'} {item.category} • SKU: {item.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-medium">{item.quantity.toLocaleString('vi-VN')}</span>
                    <span className="text-muted-foreground ml-1">{item.unit}</span>
                  </td>
                  <td className="py-3 px-3 text-right text-muted-foreground">
                    {formatVND(item.unitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-900">
                    {formatVND(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50">
                <td colSpan={3} className="py-3 px-3 text-right font-semibold text-emerald-700">
                  Tổng cộng:
                </td>
                <td className="py-3 px-3 text-right font-bold text-emerald-700">
                  {formatVND(bom.totalCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Warnings */}
        {bom.warnings && bom.warnings.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Lưu ý:</p>
                <ul className="list-disc list-inside text-amber-700 mt-1 space-y-1">
                  {bom.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          * Giá tham khảo, có thể thay đổi theo thực tế công trình
        </p>
      </CardContent>
    </Card>
  );
}

interface ResultsDisplayProps {
  result: HydraulicOutput;
  input: HydraulicInput;
  contact: ContactInfo;
  contactErrors: ContactErrors;
  bom: BOMResult | null;
  isBomLoading: boolean;
  onContactChange: (field: keyof ContactInfo, value: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

function ResultsDisplay({ 
  result, 
  input, 
  contact, 
  contactErrors,
  bom,
  isBomLoading,
  onContactChange, 
  onSubmit, 
  isSubmitting 
}: ResultsDisplayProps) {
  const { toast } = useToast();

  const riskColors = {
    low: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-red-100 text-red-700 border-red-200",
  };

  const riskLabels = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
  };

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-xl border",
        riskColors[result.riskLevel]
      )}>
        <div className="flex items-center gap-3">
          {result.riskLevel === "low" ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : result.riskLevel === "medium" ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
          <div>
            <p className="font-semibold">Đánh giá rủi ro</p>
            <p className="text-sm opacity-80">Dựa trên thông số kỹ thuật</p>
          </div>
        </div>
        <Badge className={cn("text-sm px-3 py-1", riskColors[result.riskLevel])}>
          {riskLabels[result.riskLevel]}
        </Badge>
      </div>

      {/* Primary Result - Pump HP */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <Zap className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm text-emerald-600 font-medium mb-2">Công suất bơm đề xuất</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-black text-emerald-700">
                {result.requiredPumpHP}
              </span>
              <span className="text-2xl text-emerald-600">HP</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              ≈ {result.requiredPumpKW} kW
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultMetric
          icon={Droplets}
          label="Tổng lưu lượng"
          value={result.totalFlowM3H.toString()}
          unit="m³/h"
          color="blue"
        />
        <ResultMetric
          icon={TrendingUp}
          label="Tổng cột áp (Head)"
          value={result.totalHeadM.toString()}
          unit="m"
          color="purple"
        />
        <ResultMetric
          icon={Droplets}
          label="Tổn thất ma sát"
          value={result.frictionLossM.toString()}
          unit="m"
          color="orange"
        />
        <ResultMetric
          icon={MapPin}
          label="Đường kính đề xuất"
          value={result.recommendedPipeMm.toString()}
          unit="mm"
          highlight={result.recommendedPipeMm > input.pipeDiameterMm}
        />
      </div>

      {/* BOM Materials Table */}
      <BOMTable bom={bom} isLoading={isBomLoading} />

      {/* Warning if undersized pipe */}
      {result.recommendedPipeMm > input.pipeDiameterMm && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Đường ống có thể bị quá nhỏ</p>
            <p className="text-sm text-amber-700 mt-1">
              Với lưu lượng {result.totalFlowM3H} m³/h, chúng tôi khuyến nghị sử dụng 
              ống Φ{result.recommendedPipeMm}mm thay vì Φ{input.pipeDiameterMm}mm 
              để giảm tổn thất áp lực và tiết kiệm chi phí năng lượng.
            </p>
          </div>
        </div>
      )}

      {/* Cost Estimate + Contact Form */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <span className="text-lg">₫</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chi phí vật tư ước tính</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatVND(result.estimatedCostVND)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Form */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Nhận tư vấn từ đại lý gần nhất</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <Label htmlFor="customerName" className="text-xs">Họ và tên</Label>
                </div>
                <Input
                  id="customerName"
                  placeholder="VD: Nguyễn Văn A"
                  value={contact.customerName}
                  onChange={(e) => onContactChange("customerName", e.target.value)}
                  className={cn(contactErrors.customerName && "border-red-500 focus:border-red-500")}
                />
                {contactErrors.customerName && (
                  <p className="text-xs text-red-500">{contactErrors.customerName}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <Label htmlFor="customerPhone" className="text-xs">Số điện thoại</Label>
                </div>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="VD: 0912345678"
                  value={contact.customerPhone}
                  onChange={(e) => onContactChange("customerPhone", e.target.value)}
                  className={cn(contactErrors.customerPhone && "border-red-500 focus:border-red-500")}
                />
                {contactErrors.customerPhone && (
                  <p className="text-xs text-red-500">{contactErrors.customerPhone}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="province" className="text-xs">Tỉnh/Thành phố (tùy chọn)</Label>
              <Input
                id="province"
                placeholder="VD: Đắk Lắk"
                value={contact.province}
                onChange={(e) => onContactChange("province", e.target.value)}
              />
              <p className="text-xs text-slate-400">Giúp hệ thống phân bổ đại lý gần bạn nhất</p>
            </div>
          </div>

          <Button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi yêu cầu...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi cho Đại lý
              </>
            )}
          </Button>

          {/* Zalo Button - Gửi báo giá qua Zalo/SĐT */}
          {bom && bom.items.length > 0 && (
            <Button
              variant="outline"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            >
              <MessageCircle className="w-4 h-4" />
              Gửi báo giá cho tôi qua Zalo/SĐT
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Input Summary */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
          <Info className="w-4 h-4" />
          Xem lại thông số đã nhập
        </summary>
        <div className="mt-3 p-4 bg-slate-50 rounded-lg text-sm space-y-2">
          <div className="grid grid-cols-2 gap-x-8">
            <p>Diện tích: <span className="font-medium">{input.areaHa} Ha</span></p>
            <p>Độ cao: <span className="font-medium">{input.elevationM} m</span></p>
            <p>Chiều dài ống: <span className="font-medium">{input.pipeLengthM} m</span></p>
            <p>Đường kính ống: <span className="font-medium">Φ{input.pipeDiameterMm} mm</span></p>
            <p>Lưu lượng béc: <span className="font-medium">{input.emitterFlowLPH} L/h</span></p>
            <p>Số béc tưới: <span className="font-medium">{input.emitterCount} cái</span></p>
          </div>
        </div>
      </details>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MAIN PAGE COMPONENT
 * ───────────────────────────────────────────────────────────────────────────── */

export default function TinhToanPage() {
  const { toast } = useToast();
  
  const [input, setInput] = useState<HydraulicInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<HydraulicOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [bom, setBom] = useState<BOMResult | null>(null);
  const [isBomLoading, setIsBomLoading] = useState(false);
  
  // Contact form state
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setContact(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (contactErrors[field as keyof ContactErrors]) {
      setContactErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setBom(null);
    setIsBomLoading(true);
    
    try {
      // 1. Calculate hydraulic requirements
      const calculatedResult = calculatePumpRequirement(input);
      setResult(calculatedResult);
      
      toast({
        title: "Tính toán hoàn tất",
        description: `Hệ thống tưới cho ${input.areaHa}Ha cần bơm ${calculatedResult.requiredPumpHP}HP`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });

      // 2. Generate BOM from database
      const bomResult = await generateBOM({
        totalFlowM3H: calculatedResult.totalFlowM3H,
        pipeDiameterMm: input.pipeDiameterMm,
        emitterCount: input.emitterCount,
        totalHeadM: calculatedResult.totalHeadM,
        frictionLossM: calculatedResult.frictionLossM,
        emitterFlowLPH: input.emitterFlowLPH,
        pumpHP: calculatedResult.requiredPumpHP,
        pumpKW: calculatedResult.requiredPumpKW,
        pipeLengthM: input.pipeLengthM,
        elevationM: input.elevationM,
      }, {
        pipeLengthM: input.pipeLengthM,
      });

      setBom(bomResult);

      if (bomResult.warnings && bomResult.warnings.length > 0) {
        toast({
          title: "Cảnh báo",
          description: bomResult.warnings[0],
          variant: "default",
          className: "bg-amber-50 border-amber-200 text-amber-800",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi tính toán",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
      setIsBomLoading(false);
    }
  };

  const handleSubmitToDealer = async () => {
    // Validate contact info
    const errors = validateContact(contact);
    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      toast({
        title: "Thông tin không hợp lệ",
        description: "Vui lòng kiểm tra lại tên và số điện thoại",
        variant: "destructive",
      });
      return;
    }

    if (!result) {
      toast({
        title: "Chưa có kết quả tính toán",
        description: "Vui lòng nhấn 'Tính Toán' trước",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get province coordinates for geo-matching
      const provinceCoords = contact.province ? getProvinceCoords(contact.province) : null;

      const leadResult = await submitCalculatorAndCreateLead({
        customerName: contact.customerName.trim(),
        customerPhone: contact.customerPhone.replace(/\s/g, ''),
        province: contact.province || undefined,
        cropType: undefined,
        areaM2: input.areaHa * 10000,
        calculatorType: 'pump',
        calculatorData: {
          areaHa: input.areaHa,
          elevationM: input.elevationM,
          pipeLengthM: input.pipeLengthM,
          pipeDiameterMm: input.pipeDiameterMm,
          emitterFlowLPH: input.emitterFlowLPH,
          emitterCount: input.emitterCount,
          results: result,
          bom: bom ? {
            items: bom.items.map(item => ({
              name: item.name,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
            totalCost: bom.totalCost,
          } : null,
        },
        latitude: provinceCoords?.lat,
        longitude: provinceCoords?.lon,
      });

      if (leadResult.success) {
        toast({
          title: "Gửi yêu cầu thành công!",
          description: leadResult.assignedDealerId 
            ? "Chúng tôi đã phân bổ đại lý gần nhất. Họ sẽ liên hệ trong 24 giờ."
            : "Yêu cầu của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ trong 24 giờ.",
          className: "bg-emerald-50 border-emerald-200 text-emerald-800",
        });

        // Reset contact form
        setContact(DEFAULT_CONTACT);
        setContactErrors({});
      } else {
        toast({
          title: "Gửi thất bại",
          description: leadResult.error || "Đã xảy ra lỗi, vui lòng thử lại",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submit lead error:", error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối với máy chủ, vui lòng thử lại sau",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    setResult(null);
    setBom(null);
    setContact(DEFAULT_CONTACT);
    setContactErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Máy Tính Thủy Lực</h1>
                <p className="text-emerald-100">Tính toán BOM hệ thống tưới tiêu</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-emerald-600" />
                  Thông số hệ thống tưới
                </CardTitle>
                <CardDescription>
                  Nhập thông số kỹ thuật của hệ thống tưới để tính toán BOM vật tư
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Basic Parameters */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Thông số cơ bản
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="areaHa">Diện tích (Ha)</Label>
                      <Input
                        id="areaHa"
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={input.areaHa}
                        onChange={(e) => setInput({ ...input, areaHa: parseFloat(e.target.value) || 0 })}
                        placeholder="VD: 5"
                      />
                      <p className="text-xs text-muted-foreground">Diện tích rẫy cần tưới</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="elevationM">Độ cao chênh lệch (m)</Label>
                      <Input
                        id="elevationM"
                        type="number"
                        min={0}
                        step={1}
                        value={input.elevationM}
                        onChange={(e) => setInput({ ...input, elevationM: parseFloat(e.target.value) || 0 })}
                        placeholder="VD: 15"
                      />
                      <p className="text-xs text-muted-foreground">Chênh lệch độ cao đến điểm cao nhất</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pipe Parameters */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Đường ống
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pipeLengthM">Chiều dài ống chính (m)</Label>
                      <Input
                        id="pipeLengthM"
                        type="number"
                        min={1}
                        step={10}
                        value={input.pipeLengthM}
                        onChange={(e) => setInput({ ...input, pipeLengthM: parseFloat(e.target.value) || 0 })}
                        placeholder="VD: 200"
                      />
                      <p className="text-xs text-muted-foreground">Từ bơm đến cuối rẫy</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pipeDiameterMm">Đường kính ống (mm)</Label>
                      <select
                        id="pipeDiameterMm"
                        value={input.pipeDiameterMm}
                        onChange={(e) => setInput({ ...input, pipeDiameterMm: parseInt(e.target.value) })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {PIPE_SIZE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">Đường kính trong (ID)</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Emitter Parameters */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Béc tưới
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emitterFlowLPH">Lưu lượng béc (L/h)</Label>
                      <select
                        id="emitterFlowLPH"
                        value={input.emitterFlowLPH}
                        onChange={(e) => setInput({ ...input, emitterFlowLPH: parseInt(e.target.value) })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {EMITTER_FLOW_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">Lưu lượng mỗi béc</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emitterCount">Số lượng béc</Label>
                      <Input
                        id="emitterCount"
                        type="number"
                        min={1}
                        step={10}
                        value={input.emitterCount}
                        onChange={(e) => setInput({ ...input, emitterCount: parseInt(e.target.value) || 0 })}
                        placeholder="VD: 500"
                      />
                      <p className="text-xs text-muted-foreground">Tổng số béc trên rẫy</p>
                    </div>
                  </div>

                  {/* Auto-calculate hint */}
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      <strong>Gợi ý:</strong> Với {input.areaHa}Ha và khoảng cách béc 2m×2m, 
                      bạn cần khoảng <strong>{Math.round(input.areaHa * 10000 / 4)} béc</strong>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="flex-1 h-12 text-base gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isCalculating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang tính toán...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-5 h-5" />
                        Tính Toán
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleReset}
                    className="h-12"
                  >
                    Đặt lại
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              <Link href="/dai-ly" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Tìm đại lý <ChevronRight className="w-4 h-4" />
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/blog" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Hướng dẫn lắp đặt <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {result ? (
              <ResultsDisplay 
                result={result} 
                input={input}
                contact={contact}
                contactErrors={contactErrors}
                bom={bom}
                isBomLoading={isBomLoading}
                onContactChange={handleContactChange}
                onSubmit={handleSubmitToDealer}
                isSubmitting={isSubmitting}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Sẵn sàng tính toán
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Nhập thông số bên trái và nhấn "Tính Toán" để xem kết quả BOM vật tư 
                    và công suất bơm yêu cầu cho hệ thống tưới của bạn.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Technical Info */}
            <Card className="bg-slate-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  Thông tin kỹ thuật
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Công thức Hazen-Williams:</strong>{" "}
                  h_f = 10.67 × L × (Q/C)<sup>1.852</sup> × d<sup>-4.87</sup>
                </p>
                <p>
                  <strong>Hệ số C (HDPE/PVC):</strong> 140
                </p>
                <p>
                  <strong>Áp suất làm việc béc:</strong> 15m (≈1.5 bar)
                </p>
                <p>
                  <strong>Hiệu suất bơm:</strong> 65%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
