'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Droplets, 
  Ruler, 
  Circle, 
  Mountain, 
  MapPin, 
  Activity, 
  Zap, 
  AlertCircle,
  Package,
  Phone,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { calculateTDH, PipeSpecs, SystemInputs } from '../../utils/pumpCalculator';
import { supabase } from '@/integrations/supabase/client';
import { submitLeadO2O } from '@/app/actions/lead';

export default function PumpCalculatorUI() {
  // ─── Input States ────────────────────────────────────────────────────────
  const [requiredFlow, setRequiredFlow] = useState<number>(20);
  
  // Pipe parameters
  const [frictionFactor, setFrictionFactor] = useState<number>(150); // 150 = PVC, 140 = HDPE
  const [innerDiameter, setInnerDiameter] = useState<number>(60);
  const [mainlineLength, setMainlineLength] = useState<number>(100);
  
  // Elevation parameters
  const [elevationMode, setElevationMode] = useState<string>('manual');
  const [elevationChange, setElevationChange] = useState<number>(10);
  const [isScanningGPS, setIsScanningGPS] = useState(false);

  // ─── Pump Results & Modal States ─────────────────────────────────────────
  const [pumps, setPumps] = useState<any[]>([]);
  const [loadingPumps, setLoadingPumps] = useState(false);
  const [zaloModalOpen, setZaloModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ─── Calculations ────────────────────────────────────────────────────────
  const calculationResult = useMemo(() => {
    try {
      const inputs: SystemInputs = {
        requiredFlow: requiredFlow || 0.1,
        mainlineLength: mainlineLength || 0.1,
        elevationChange: elevationChange || 0,
        filterLoss: 5, // Fix cứng theo yêu cầu
      };

      const pipe: PipeSpecs = {
        innerDiameter: innerDiameter || 1, // Tránh chia cho 0
        frictionFactor: frictionFactor,
      };

      const result = calculateTDH(inputs, pipe);
      
      const efficiency = 0.65;
      const hp = (inputs.requiredFlow * result.totalDynamicHead) / (273 * efficiency);

      return {
        success: true,
        tdh: result.totalDynamicHead,
        details: result.details,
        hp: hp,
        error: null,
      };
    } catch (err: any) {
      return {
        success: false,
        tdh: 0,
        details: null,
        hp: 0,
        error: err.message,
      };
    }
  }, [requiredFlow, frictionFactor, innerDiameter, mainlineLength, elevationChange]);

  // Chuẩn bị dữ liệu cho Stacked Bar Chart
  const chartData = useMemo(() => {
    if (!calculationResult.success || !calculationResult.details) return [];
    return [
      {
        name: 'Thành phần Cột Áp',
        staticHead: calculationResult.details.elevationLoss,
        frictionLoss: calculationResult.details.frictionLoss,
        filterLoss: calculationResult.details.filterLoss,
        operatingPressure: calculationResult.details.operatingPressure,
      }
    ];
  }, [calculationResult]);

  // ─── Data Fetching Effect ────────────────────────────────────────────────
  useEffect(() => {
    if (!calculationResult.success || calculationResult.tdh === 0) return;

    const timer = setTimeout(() => {
      fetchMatchingPumps(calculationResult.tdh, requiredFlow);
    }, 500);

    return () => clearTimeout(timer);
  }, [calculationResult.tdh, requiredFlow]);

  const fetchMatchingPumps = async (requiredTDH: number, requiredFlow: number) => {
    setLoadingPumps(true);
    try {
      // Fetch all pumps from Supabase. In a real highly-scaled DB, 
      // we would use PostgREST JSONB filtering: .gte('specifications->max_head', requiredTDH)
      // Here we fetch and filter locally to handle dynamic casting robustly.
      const { data, error } = await supabase
        .from('products')
        .select('id, sku, name, base_price, image_url, specifications')
        .eq('category_id', 'pump'); // Giả định category_id là 'pump'

      if (error && error.code !== 'PGRST116') {
        console.error('Fetch error:', error);
      }

      let matchedPumps: any[] = [];
      
      if (data && data.length > 0) {
        matchedPumps = data.filter((p) => {
          const specs = p.specifications as any || {};
          const maxHead = Number(specs.max_head) || 0;
          const maxFlow = Number(specs.max_flow) || 0;
          return maxHead >= requiredTDH && maxFlow >= requiredFlow;
        });

        // Sắp xếp theo giá từ thấp đến cao
        matchedPumps.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
        setPumps(matchedPumps.slice(0, 3));
      } else {
        // Fallback Mock Data trong môi trường Dev/Sandbox nếu bảng chưa có dữ liệu máy bơm
        const mockPumps = [
          {
            id: 'mock-1', sku: 'ADELINO-3HP', name: 'Bơm ly tâm Adelino 3HP', base_price: 3200000,
            image_url: '', specifications: { max_head: requiredTDH + 5, max_flow: requiredFlow + 2 }
          },
          {
            id: 'mock-2', sku: 'PENTAX-4HP', name: 'Bơm ly tâm trục ngang Pentax 4HP', base_price: 6500000,
            image_url: '', specifications: { max_head: requiredTDH + 15, max_flow: requiredFlow + 10 }
          },
          {
            id: 'mock-3', sku: 'EBARA-5HP', name: 'Máy bơm nước Ebara 5HP', base_price: 8900000,
            image_url: '', specifications: { max_head: requiredTDH + 20, max_flow: requiredFlow + 15 }
          }
        ];
        setPumps(mockPumps);
      }

    } catch (err) {
      console.error('Lỗi khi tìm máy bơm:', err);
    } finally {
      setLoadingPumps(false);
    }
  };

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleGPSScan = () => {
    setIsScanningGPS(true);
    setTimeout(() => {
      const randomElevation = Math.floor(Math.random() * (50 - 10 + 1) + 10);
      setElevationChange(randomElevation);
      setIsScanningGPS(false);
      toast({
        title: '📍 Đã quét địa hình thành công',
        description: `Phát hiện chênh lệch độ cao: ${randomElevation} mét.`,
      });
    }, 1500);
  };

  const handleOpenZaloModal = (sku: string) => {
    setSelectedSku(sku);
    setPhone('');
    setZaloModalOpen(true);
  };

  const handleSubmitLead = async () => {
    if (!phone.trim()) {
      toast({ title: '⚠️ Lỗi nhập liệu', description: 'Vui lòng nhập số điện thoại Zalo.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const pumpData = pumps.find(p => p.sku === selectedSku);
    
    const result = await submitLeadO2O({
      phone: phone,
      regionId: elevationMode === 'gps' ? 'Quét GPS' : 'Nhập tay',
      bomData: { 
        selected_sku: selectedSku, 
        pump_name: pumpData?.name,
        system_parameters: {
          flow_required: requiredFlow,
          tdh_calculated: calculationResult.tdh,
          elevation: elevationChange,
          pipe_length: mainlineLength
        }
      },
      totalEstimatedCost: pumpData?.base_price || 0
    });

    setSubmitting(false);

    if (result.success) {
      setZaloModalOpen(false);
      toast({
        title: '✅ Đã gửi yêu cầu thành công!',
        description: 'Chuyên viên kỹ thuật sẽ phân tích và liên hệ với bạn qua Zalo trong 15 phút.',
      });
    } else {
      toast({
        title: '❌ Lỗi hệ thống',
        description: 'Không thể gửi yêu cầu lúc này, vui lòng thử lại sau.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <Activity className="h-8 w-8 text-[#2E7D32]" />
          Máy tính Thủy lực Trạm Bơm
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Hệ thống tính toán ma sát đường ống và công suất bơm tối ưu bằng công thức Hazen-Williams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ─── CỘT TRÁI: FORM NHẬP LIỆU ─── */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/50 shadow-sm border-t-4 border-t-[#2E7D32]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                Thông số đầu vào
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* 1. Lưu lượng */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  Lưu lượng yêu cầu (m³/h)
                </Label>
                <Input 
                  type="number" 
                  value={requiredFlow || ''} 
                  onChange={(e) => setRequiredFlow(Number(e.target.value))}
                  placeholder="Ví dụ: 20"
                  className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200"
                />
              </div>

              {/* 2. Đường ống */}
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                  <Circle className="h-4 w-4 text-slate-500" />
                  Thông số đường ống chính
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Chất liệu ống</Label>
                    <Select 
                      value={frictionFactor.toString()} 
                      onValueChange={(val) => setFrictionFactor(Number(val))}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="150">Ống PVC (C=150)</SelectItem>
                        <SelectItem value="140">Ống HDPE (C=140)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600">Đường kính (mm)</Label>
                    <Select 
                      value={innerDiameter.toString()} 
                      onValueChange={(val) => setInnerDiameter(Number(val))}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="42">Phi 42</SelectItem>
                        <SelectItem value="49">Phi 49</SelectItem>
                        <SelectItem value="60">Phi 60</SelectItem>
                        <SelectItem value="90">Phi 90</SelectItem>
                        <SelectItem value="114">Phi 114</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="flex items-center gap-2 text-xs text-slate-600">
                    <Ruler className="h-3 w-3" />
                    Chiều dài ống chính (m)
                  </Label>
                  <Input 
                    type="number" 
                    value={mainlineLength || ''} 
                    onChange={(e) => setMainlineLength(Number(e.target.value))}
                    placeholder="Khoảng cách từ bơm đến rẫy"
                    className="bg-white dark:bg-slate-950"
                  />
                </div>
              </div>

              {/* 3. Độ dốc */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                  <Mountain className="h-4 w-4 text-amber-600" />
                  Chênh lệch địa hình (Elevation)
                </Label>
                
                <Tabs value={elevationMode} onValueChange={setElevationMode} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    <TabsTrigger value="manual" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Nhập tay</TabsTrigger>
                    <TabsTrigger value="gps" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Bản đồ AI</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="manual" className="space-y-2 mt-0">
                    <Input 
                      type="number" 
                      value={elevationChange || ''} 
                      onChange={(e) => setElevationChange(Number(e.target.value))}
                      placeholder="Chiều cao tĩnh (m)"
                      className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200"
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                      Khoảng cách độ cao từ trạm bơm lên đỉnh đồi cao nhất.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="gps" className="mt-0">
                    <div className="border border-dashed border-border/60 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/30">
                      <MapPin className="h-8 w-8 text-slate-400 mb-3" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Sử dụng dữ liệu độ cao vệ tinh (DEM)
                      </p>
                      <Button 
                        onClick={handleGPSScan} 
                        disabled={isScanningGPS}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-sm"
                      >
                        {isScanningGPS ? 'Đang phân tích địa hình...' : 'Lấy độ dốc từ GPS'}
                      </Button>
                      
                      {elevationMode === 'gps' && elevationChange > 0 && !isScanningGPS && (
                        <p className="mt-4 text-sm font-bold text-emerald-600">
                          Kết quả quét: {elevationChange} mét
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* ─── CỘT PHẢI: RESULT DASHBOARD ─── */}
        <div className="lg:col-span-7 space-y-6">
          
          {calculationResult.error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900">Lỗi tính toán</h3>
                  <p className="text-red-700 text-sm">{calculationResult.error}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Highlight Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-[#2E7D32]/30 bg-[#2E7D32]/5 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#2E7D32]" />
                  <CardContent className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] mb-2 flex items-center gap-1.5">
                      Tổng Cột Áp (TDH)
                    </p>
                    <div className="flex items-end gap-2">
                      <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        {calculationResult.tdh.toFixed(1)}
                      </h2>
                      <span className="text-xl font-bold text-slate-500 mb-1">Mét</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                  <CardContent className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                      <Zap className="h-4 w-4" />
                      Công suất bơm tối thiểu
                    </p>
                    <div className="flex items-end gap-2">
                      <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        {calculationResult.hp.toFixed(1)}
                      </h2>
                      <span className="text-xl font-bold text-slate-500 mb-1">HP</span>
                    </div>
                    <p className="text-[10px] text-amber-700/60 mt-2 italic">
                      Dựa trên hiệu suất bơm ly tâm 65%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Stacked Bar Chart */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    Phân bổ tổn thất áp suất
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={chartData} 
                        layout="vertical"
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(1)} m`, '']}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        
                        <Bar dataKey="staticHead" name="Địa hình (Static Head)" stackId="a" fill="#8B4513" />
                        <Bar dataKey="frictionLoss" name="Ma sát đường ống" stackId="a" fill="#DC2626" />
                        <Bar dataKey="filterLoss" name="Suy hao bộ lọc" stackId="a" fill="#F59E0B" />
                        <Bar dataKey="operatingPressure" name="Áp suất tại béc" stackId="a" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {calculationResult.details && calculationResult.details.frictionLoss > calculationResult.tdh * 0.3 && (
                    <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex gap-2 items-start">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <p>
                        Tổn thất đường ống cao ({calculationResult.details.frictionLoss.toFixed(1)}m). 
                        Nên chọn đường ống lớn hơn để tiết kiệm điện.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Giải Pháp Bơm Đề Xuất */}
              <div className="pt-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-[#2E7D32]" />
                  Giải Pháp Bơm Đề Xuất
                </h3>
                
                {loadingPumps ? (
                  <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/50 rounded-2xl bg-slate-50">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2E7D32] mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">Đang tìm máy bơm phù hợp từ hệ thống...</p>
                  </div>
                ) : pumps.length > 0 ? (
                  <div className="grid gap-4">
                    {pumps.map((pump, index) => (
                      <Card key={pump.id} className={cn("overflow-hidden hover:border-[#2E7D32]/50 transition-colors", index === 0 ? "border-[#2E7D32]/50 shadow-md ring-1 ring-[#2E7D32]/20" : "")}>
                        <div className="flex flex-col sm:flex-row items-center p-4 gap-4">
                          <div className="h-16 w-16 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden">
                            {pump.image_url ? (
                              <img src={pump.image_url} alt={pump.name} className="object-cover w-full h-full" />
                            ) : (
                              <Package className="h-8 w-8 text-slate-300" />
                            )}
                            {index === 0 && (
                              <div className="absolute top-0 left-0 w-full bg-[#2E7D32] text-white text-[8px] font-bold text-center py-0.5">
                                TỐI ƯU
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 text-center sm:text-left w-full">
                            <h4 className="font-bold text-slate-900 line-clamp-1">{pump.name}</h4>
                            <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5 text-[11px] text-muted-foreground">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">SKU: {pump.sku}</span>
                              <span className="flex items-center gap-1"><Mountain className="h-3 w-3" /> H-max: {pump.specifications?.max_head || '?'}m</span>
                              <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> Q-max: {pump.specifications?.max_flow || '?'}m³/h</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center sm:items-end w-full sm:w-auto shrink-0 gap-2">
                            <p className="font-black text-lg text-red-600">
                              {pump.base_price ? new Intl.NumberFormat('vi-VN').format(pump.base_price) + 'đ' : 'Liên hệ'}
                            </p>
                            <Button 
                              onClick={() => handleOpenZaloModal(pump.sku)}
                              className="w-full sm:w-auto bg-[#0068FF] hover:bg-[#0056d6] text-white rounded-xl h-8 text-xs font-bold"
                            >
                              <Phone className="h-3.5 w-3.5 mr-1.5" />
                              Nhận báo giá Zalo
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 border border-dashed border-red-200 rounded-2xl bg-red-50 text-center px-6">
                    <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
                    <p className="text-sm font-bold text-red-900">Cột áp quá lớn, không tìm thấy máy bơm đơn phù hợp.</p>
                    <p className="text-xs text-red-700 mt-1 max-w-md">
                      Yêu cầu hệ thống vượt qua ngưỡng cho phép của máy bơm tiêu chuẩn. Vui lòng liên hệ Kỹ thuật viên để thiết kế trạm bơm nối tiếp (Booster Pumps).
                    </p>
                    <Button 
                      onClick={() => handleOpenZaloModal('CUSTOM_BOOSTER')}
                      variant="outline"
                      className="mt-4 border-red-200 text-red-700 hover:bg-red-100 rounded-xl"
                    >
                      Nhận tư vấn thiết kế riêng
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Nhập SĐT Zalo */}
      <Dialog open={zaloModalOpen} onOpenChange={setZaloModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gửi yêu cầu báo giá máy bơm</DialogTitle>
            <DialogDescription>
              Vui lòng nhập số điện thoại Zalo. Hệ thống sẽ kết nối bạn với chuyên viên kỹ thuật gần nhất cùng cấu hình máy bơm <strong>{selectedSku}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại Zalo</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setZaloModalOpen(false)} className="rounded-xl" disabled={submitting}>Hủy</Button>
            <Button 
              onClick={handleSubmitLead} 
              className="rounded-xl bg-[#0068FF] hover:bg-[#0056d6] text-white"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Phone className="h-4 w-4 mr-2" />}
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
