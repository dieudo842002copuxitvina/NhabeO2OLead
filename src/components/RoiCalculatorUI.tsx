'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { 
  Wallet, 
  Calculator, 
  TrendingUp, 
  CircleDollarSign, 
  Zap, 
  Droplet,
  Users,
  Leaf,
  DownloadCloud,
  FileText,
  MapPin,
  Phone,
  User,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  calculateAnnualSavings, 
  calculatePaybackPeriod, 
  generateCashflowProjection, 
  CurrentCosts, 
  SystemEfficiency 
} from '@/lib/calculators/roiCalculator';
import { submitCalculatorAndCreateLead } from '@/app/actions/lead';
import { toast } from '@/components/ui/use-toast';

// @ts-ignore - Assuming user installs these
import { jsPDF } from 'jspdf';
// @ts-ignore - Assuming user installs these
import html2canvas from 'html2canvas';

// Utility format tiền tệ
const formatVND = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function RoiCalculatorUI() {
  // ─── States: Chi phí hiện tại (VNĐ/tháng) ─────────────────────────────
  const [laborCost, setLaborCost] = useState<number>(5000000);
  const [waterPowerCost, setWaterPowerCost] = useState<number>(2000000);
  const [fertilizerCost, setFertilizerCost] = useState<number>(10000000);

  // ─── States: Đầu tư & Hiệu suất ──────────────────────────────────────
  const [capEx, setCapEx] = useState<number>(150000000); // 150 Triệu
  const [laborSaved, setLaborSaved] = useState<number[]>([70]); // 70%
  const [waterPowerSaved, setWaterPowerSaved] = useState<number[]>([30]); // 30%
  const [fertilizerSaved, setFertilizerSaved] = useState<number[]>([20]); // 20%
  
  const lifespan = 5; // Tính trong 5 năm

  // ─── States: Modal & Export ──────────────────────────────────────────
  const [exportingPdf, setExportingPdf] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // ─── Calculations ──────────────────────────────────────────────────────
  const calculationResult = useMemo(() => {
    try {
      const current: CurrentCosts = {
        laborCostPerMonth: laborCost || 0,
        waterPowerCostPerMonth: waterPowerCost || 0,
        fertilizerCostPerMonth: fertilizerCost || 0,
      };

      const efficiency: SystemEfficiency = {
        laborSavedPercent: laborSaved[0],
        waterPowerSavedPercent: waterPowerSaved[0],
        fertilizerSavedPercent: fertilizerSaved[0],
      };

      const annualSavings = calculateAnnualSavings(current, efficiency);
      
      let paybackMonths = 0;
      if (annualSavings > 0 && capEx > 0) {
        paybackMonths = calculatePaybackPeriod(capEx, annualSavings);
      }

      const totalSavings5Years = annualSavings * lifespan;
      const netProfit = totalSavings5Years - capEx;

      const cashflowData = generateCashflowProjection(capEx, annualSavings, lifespan);

      return {
        success: true,
        annualSavings,
        paybackMonths,
        netProfit,
        cashflowData,
      };
    } catch (error) {
      return { success: false, annualSavings: 0, paybackMonths: 0, netProfit: 0, cashflowData: [] };
    }
  }, [laborCost, waterPowerCost, fertilizerCost, capEx, laborSaved, waterPowerSaved, fertilizerSaved]);

  const getPaybackColorClass = (months: number) => {
    if (months <= 0) return 'text-slate-900 dark:text-white';
    if (months < 18) return 'text-emerald-600 dark:text-emerald-400';
    if (months > 24) return 'text-orange-500 dark:text-orange-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  // ─── Handlers: Export PDF ──────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExportingPdf(true);
    
    try {
      // Setup styles cho canvas đẹp hơn
      const element = reportRef.current;
      const originalBg = element.style.backgroundColor;
      element.style.backgroundColor = '#ffffff';
      element.style.padding = '20px';

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      element.style.backgroundColor = originalBg;
      element.style.padding = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Header logo giả lập
      pdf.setFontSize(16);
      pdf.setTextColor(46, 125, 50); // #2E7D32
      pdf.text('BÁO CÁO THẨM ĐỊNH HIỆU QUẢ ĐẦU TƯ (ROI)', 10, 15);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Được tạo bởi: Nhà Bè Agri Platform | Ngày: ${new Date().toLocaleDateString('vi-VN')}`, 10, 22);
      
      pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);
      pdf.save(`Bao-Cao-ROI-${new Date().getTime()}.pdf`);
      
      toast({ title: '✅ Thành công', description: 'Đã tải Báo cáo Thẩm định dưới dạng PDF.' });
    } catch (error) {
      console.error(error);
      toast({ title: '❌ Lỗi xuất file', description: 'Đã xảy ra lỗi khi tạo PDF. Vui lòng thử lại.', variant: 'destructive' });
    } finally {
      setExportingPdf(false);
    }
  };

  // ─── Handlers: High Ticket Lead ─────────────────────────────────────────
  const handleSubmitSurveyLead = async () => {
    if (!customerPhone.trim() || !customerName.trim()) {
      toast({ title: '⚠️ Lỗi nhập liệu', description: 'Vui lòng cung cấp Họ Tên và Số Điện Thoại.', variant: 'destructive' });
      return;
    }

    setSubmittingLead(true);

    const result = await submitCalculatorAndCreateLead({
      customerName: customerName,
      customerPhone: customerPhone,
      province: customerAddress.split(',').pop()?.trim() || undefined,
      calculatorType: 'roi',
      calculatorData: {
        type: 'high_ticket_project',
        financial_inputs: {
          current_monthly_costs: { labor: laborCost, water: waterPowerCost, fertilizer: fertilizerCost },
          capex_budget: capEx,
          efficiency_target: { labor: laborSaved[0], water: waterPowerSaved[0], fertilizer: fertilizerSaved[0] }
        },
        financial_results: {
          annual_savings: calculationResult.annualSavings,
          payback_months: calculationResult.paybackMonths,
          net_profit_5y: calculationResult.netProfit
        },
        n8n_alert_message: `🚨 CÓ DỰ ÁN MỚI: Chủ farm quan tâm đầu tư hệ thống ${formatVND(capEx)}, thời gian hoàn vốn ${calculationResult.paybackMonths.toFixed(1)} tháng. Cần khảo sát gấp!`
      },
    });

    setSubmittingLead(false);

    if (result.success) {
      setSurveyModalOpen(false);
      toast({
        title: '🎉 Đã gửi yêu cầu khảo sát!',
        description: 'Đại lý và Giám đốc vùng đã nhận được yêu cầu. Chúng tôi sẽ liên hệ trong ít phút.',
      });
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    } else {
      toast({ title: '❌ Lỗi hệ thống', description: result.error || 'Không thể gửi yêu cầu lúc này.', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      {/* ─── Header & Action Buttons ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Calculator className="h-8 w-8 text-[#2E7D32]" />
            Máy tính ROI & Điểm Hòa Vốn
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Dự phóng tỷ suất hoàn vốn dựa trên sự tiết kiệm chi phí vật tư và nhân công vận hành hệ thống nông nghiệp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportPDF} 
            variant="outline" 
            className="border-slate-300 text-slate-700 bg-white"
            disabled={exportingPdf}
          >
            {exportingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            {exportingPdf ? 'Đang tạo PDF...' : 'Tải Báo Cáo Đầu Tư'}
          </Button>
          <Button 
            onClick={() => setSurveyModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Yêu Cầu Đại Lý Khảo Sát Tận Nơi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" ref={reportRef}>
        
        {/* ─── CỘT TRÁI: FORM NHẬP LIỆU ─── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Khối 1: Chi phí hiện tại */}
          <Card className="border-border/50 shadow-sm border-t-4 border-t-amber-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                Chi phí hiện tại (Hàng tháng)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Users className="h-4 w-4 text-slate-500" />
                  Nhân công vận hành
                </Label>
                <Input 
                  type="number" 
                  value={laborCost || ''} 
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="rounded-xl bg-slate-50 border-slate-200"
                />
                <p className="text-[11px] text-muted-foreground text-right font-mono font-bold text-slate-500">
                  {formatVND(laborCost || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  Điện / Nước
                </Label>
                <Input 
                  type="number" 
                  value={waterPowerCost || ''} 
                  onChange={(e) => setWaterPowerCost(Number(e.target.value))}
                  className="rounded-xl bg-slate-50 border-slate-200"
                />
                <p className="text-[11px] text-muted-foreground text-right font-mono font-bold text-slate-500">
                  {formatVND(waterPowerCost || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Leaf className="h-4 w-4 text-[#2E7D32]" />
                  Phân bón & Hóa chất
                </Label>
                <Input 
                  type="number" 
                  value={fertilizerCost || ''} 
                  onChange={(e) => setFertilizerCost(Number(e.target.value))}
                  className="rounded-xl bg-slate-50 border-slate-200"
                />
                <p className="text-[11px] text-muted-foreground text-right font-mono font-bold text-slate-500">
                  {formatVND(fertilizerCost || 0)}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Khối 2: Hệ thống Đề xuất */}
          <Card className="border-border/50 shadow-sm border-t-4 border-t-[#2E7D32]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                Hệ thống Đề xuất
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <CircleDollarSign className="h-4 w-4 text-[#2E7D32]" />
                  Tổng mức đầu tư (CapEx)
                </Label>
                <Input 
                  type="number" 
                  value={capEx || ''} 
                  onChange={(e) => setCapEx(Number(e.target.value))}
                  className="rounded-xl font-bold text-[#2E7D32] bg-[#2E7D32]/5 border-[#2E7D32]/30"
                />
                <p className="text-xs text-[#2E7D32] text-right font-bold font-mono">
                  {formatVND(capEx || 0)}
                </p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-bold text-slate-700 mb-5">Tỷ lệ tiết kiệm dự kiến</h4>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" /> Nhân công</Label>
                      <span className="text-sm font-bold text-blue-600">{laborSaved[0]}%</span>
                    </div>
                    <Slider value={laborSaved} onValueChange={setLaborSaved} max={100} step={5} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1.5"><Droplet className="h-3.5 w-3.5 text-blue-400" /> Điện/Nước</Label>
                      <span className="text-sm font-bold text-blue-600">{waterPowerSaved[0]}%</span>
                    </div>
                    <Slider value={waterPowerSaved} onValueChange={setWaterPowerSaved} max={100} step={5} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1.5"><Leaf className="h-3.5 w-3.5 text-[#2E7D32]" /> Phân bón</Label>
                      <span className="text-sm font-bold text-[#2E7D32]">{fertilizerSaved[0]}%</span>
                    </div>
                    <Slider value={fertilizerSaved} onValueChange={setFertilizerSaved} max={100} step={5} className="[&_[role=slider]]:border-[#2E7D32]" />
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* ─── CỘT PHẢI: KẾT QUẢ & BIỂU ĐỒ ─── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Executive Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50 shadow-sm relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  Thời gian hoàn vốn
                </p>
                <div className="flex items-end gap-2">
                  <h2 className={cn("text-5xl font-black tracking-tight", getPaybackColorClass(calculationResult.paybackMonths))}>
                    {calculationResult.paybackMonths > 0 ? calculationResult.paybackMonths.toFixed(1) : '∞'}
                  </h2>
                  <span className="text-xl font-bold text-slate-500 mb-1">Tháng</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  {calculationResult.paybackMonths < 18 && <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold">Rất khả thi! Nên đầu tư.</span>}
                  {calculationResult.paybackMonths >= 18 && calculationResult.paybackMonths <= 24 && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold">Mức đầu tư hợp lý.</span>}
                  {calculationResult.paybackMonths > 24 && <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded font-bold">Cần cân nhắc thêm.</span>}
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#2E7D32]/30 bg-[#2E7D32]/5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2E7D32]" />
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] mb-2 flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" />
                  Lợi ích thuần (Sau 5 Năm)
                </p>
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl md:text-4xl font-black text-[#1B5E20] tracking-tight truncate">
                    {formatVND(calculationResult.netProfit)}
                  </h2>
                </div>
                <div className="text-[10px] text-[#2E7D32]/70 mt-3 font-medium bg-white/50 p-2 rounded border border-[#2E7D32]/10 space-y-1">
                  <p className="flex justify-between"><span>Tổng tiết kiệm:</span> <span className="font-bold">{formatVND(calculationResult.annualSavings * lifespan)}</span></p>
                  <p className="flex justify-between"><span>Vốn đầu tư:</span> <span className="font-bold text-slate-700">-{formatVND(capEx)}</span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Break-even Chart */}
          <Card className="border-border/50 shadow-sm bg-white">
            <CardHeader className="pb-2 border-b border-border/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Dự phóng Dòng tiền & Điểm Hòa Vốn
              </CardTitle>
              <CardDescription className="text-xs">
                Mô phỏng dòng tiền tích lũy từ năm 0 (xuống tiền đầu tư) đến hết vòng đời 5 năm.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={calculationResult.cashflowData} 
                    margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="year" 
                      tickFormatter={(val) => `Năm ${val}`} 
                      tick={{ fontSize: 12, fill: '#64748B', fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(val) => `${(val / 1000000).toFixed(0)} Tr`} 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                      axisLine={false} 
                      tickLine={false} 
                      width={60}
                    />
                    
                    <Tooltip 
                      formatter={(value: number) => [formatVND(value), 'Dòng tiền tích lũy']}
                      labelFormatter={(label) => `Năm ${label}`}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#0F172A', marginBottom: '8px' }}
                    />
                    
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />

                    {/* Đường Reference Line tại Y = 0 */}
                    <ReferenceLine 
                      y={0} 
                      stroke="#EF4444" 
                      strokeDasharray="5 5" 
                      strokeWidth={2}
                      label={{ 
                        position: 'insideTopLeft', 
                        value: 'ĐIỂM HÒA VỐN (BREAK-EVEN)', 
                        fill: '#EF4444', 
                        fontSize: 10, 
                        fontWeight: 'bold',
                        dy: -10
                      }} 
                    />

                    {/* Đường Dòng tiền tích lũy */}
                    <Line 
                      type="monotone" 
                      dataKey="cumulativeCashflow" 
                      name="Dòng tiền tích lũy (VNĐ)" 
                      stroke="#2E7D32" 
                      strokeWidth={4} 
                      dot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#2E7D32' }}
                      activeDot={{ r: 8, stroke: '#1B5E20', strokeWidth: 2 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ─── MODAL: High-Ticket Lead Survey ─── */}
      <Dialog open={surveyModalOpen} onOpenChange={setSurveyModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-slate-900">
              <MapPin className="h-5 w-5 text-amber-600" />
              Yêu Cầu Khảo Sát Dự Án
            </DialogTitle>
            <DialogDescription>
              Hệ thống sẽ gửi thông báo khẩn cấp đến Đại lý hoặc Giám đốc vùng phụ trách gần nhất để khảo sát trực tiếp rẫy của bạn.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-1.5"><User className="h-4 w-4" /> Họ và Tên</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên chủ Farm"
                className="rounded-xl border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-1.5"><Phone className="h-4 w-4" /> Số điện thoại Zalo</Label>
              <Input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="rounded-xl border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Vị trí Farm (Khu vực)</Label>
              <Input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Ví dụ: Xã Tân Lập, Huyện Đồng Phú, Bình Phước"
                className="rounded-xl border-slate-300"
              />
            </div>

            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">
              <p className="text-xs text-amber-800 flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 pt-0.5">💡</span>
                Thông tin đính kèm: Hệ thống sẽ tự động đính kèm cấu hình tổng mức đầu tư <strong>{formatVND(capEx)}</strong> mà bạn vừa giả lập trong báo cáo gửi Đại lý.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSurveyModalOpen(false)} className="rounded-xl" disabled={submittingLead}>Hủy</Button>
            <Button 
              onClick={handleSubmitSurveyLead} 
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
              disabled={submittingLead}
            >
              {submittingLead ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
              {submittingLead ? 'Đang gửi tín hiệu...' : 'Gửi Yêu Cầu Gấp'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
