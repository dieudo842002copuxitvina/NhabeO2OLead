import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, MapPin, AlertTriangle, Droplets, Gauge, Zap, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import { dealersData } from '@/data/dealersData';
import SeoMeta from '@/components/SeoMeta';

// --- MOCK DATA ---
const CROP_DATA = {
  durian: { name: 'Sầu riêng', spacingX: 8, spacingY: 8, flowRate: 150 }, // L/h per tree
  coffee: { name: 'Cà phê', spacingX: 3, spacingY: 3, flowRate: 60 },
  pepper: { name: 'Hồ tiêu', spacingX: 2.5, spacingY: 2.5, flowRate: 40 },
};

const PIPE_SPECS = {
  pvc60: { name: 'Ống PVC 60mm', thickness: 2.0, internalDia: 56, lengthPerRoll: 4 }, // meters
  pvc49: { name: 'Ống PVC 49mm', thickness: 1.8, internalDia: 45.4, lengthPerRoll: 4 },
  ldpe20: { name: 'Ống LDPE 20mm', lengthPerRoll: 200 },
  ldpe16: { name: 'Ống LDPE 16mm', lengthPerRoll: 200 },
};

export default function IrrigationPlanner() {
  const { profile } = useFarmerProfile();
  
  // Inputs
  const [areaHa, setAreaHa] = useState<string>('');
  const [lengthM, setLengthM] = useState<string>('');
  const [widthM, setWidthM] = useState<string>('');
  const [cropKey, setCropKey] = useState<string>('durian');
  const [isSloped, setIsSloped] = useState<boolean>(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Calculations
  const results = useMemo(() => {
    const area = parseFloat(areaHa);
    const length = parseFloat(lengthM);
    const width = parseFloat(widthM);
    
    if (!area || !length || !width || area <= 0 || length <= 0 || width <= 0) return null;

    const crop = CROP_DATA[cropKey as keyof typeof CROP_DATA];
    
    // 1. Total flow
    const totalAreaM2 = area * 10000;
    const treeCount = Math.floor(totalAreaM2 / (crop.spacingX * crop.spacingY));
    const totalFlowLh = treeCount * crop.flowRate;
    const totalFlowM3h = totalFlowLh / 1000;

    // 2. Head Loss (Hazen-Williams simplification)
    // Hf = 10.67 * L * (Q/C)^1.85 / D^4.87 (metric)
    // Q in m3/s, D in meters, L in meters
    const Q_m3s = totalFlowM3h / 3600;
    const D_m = PIPE_SPECS.pvc60.internalDia / 1000;
    const C = 150; // PVC Roughness
    
    let headLoss = 10.67 * length * Math.pow(Q_m3s / C, 1.852) / Math.pow(D_m, 4.87);
    let headLossPercent = (headLoss / length) * 100; // rough indicator

    // 3. Operating Pressure
    let basePressureBar = 2.5; // Emitters usually need 1.5 - 2.5 bar
    let operatingPressure = basePressureBar + (headLoss / 10); // 10m head = 1 bar
    
    if (isSloped) {
      operatingPressure *= 1.15; // +15% for slope
    }

    // 4. Pump Power (HP)
    // P(kW) = (Q(m3/h) * H(m)) / (367 * efficiency)
    const pumpEfficiency = 0.65;
    const H_m = operatingPressure * 10;
    const pumpKw = (totalFlowM3h * H_m) / (367 * pumpEfficiency);
    const pumpHp = pumpKw * 1.341;

    // 5. BOM
    const bom = [
      { name: 'Béc tưới bù áp', qty: treeCount, unit: 'Cái' },
      { name: 'Ống LDPE 20mm (Khởi thủy nhánh)', qty: Math.ceil((treeCount * crop.spacingY) / PIPE_SPECS.ldpe20.lengthPerRoll), unit: 'Cuộn (200m)' },
      { name: 'Ống chính PVC 60mm', qty: Math.ceil(length / PIPE_SPECS.pvc60.lengthPerRoll), unit: 'Cây (4m)' },
      { name: 'Lọc đĩa trung tâm 60mm', qty: Math.ceil(totalFlowM3h / 15), unit: 'Bộ' },
      { name: 'Châm phân Venturi', qty: 1, unit: 'Bộ' },
    ];

    return {
      treeCount,
      totalFlowM3h,
      headLossPercent,
      operatingPressure,
      pumpHp,
      bom,
      hasWarning: headLossPercent > 20
    };
  }, [areaHa, lengthM, widthM, cropKey, isSloped]);

  const getClosestDealer = () => {
    const userProvince = profile.provinceName || 'Đồng Nai';
    const matchedDealers = dealersData.filter(d => d.province === userProvince && !d.isHeadOffice);
    if (matchedDealers.length > 0) return matchedDealers[0];
    return dealersData.find(d => d.isHeadOffice) || dealersData[0];
  };

  const dealer = getClosestDealer();

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-24 relative overflow-hidden">
      <SeoMeta 
        title="Máy Tính Dự Toán Thủy Lực & Vật Tư Tưới"
        description="Tính toán thiết kế thủy lực, tổn thất áp suất và lập bảng dự toán vật tư (BOM) chính xác cho vườn sầu riêng, cà phê."
        canonical="/cong-cu/du-toan-thuy-luc"
      />

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/3 -translate-y-1/3" />
      
      <div className="max-w-4xl mx-auto px-4 z-10 relative">
        <div className="text-center mb-10">
          <Badge className="bg-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#2D5A27]/20 border-0 mb-3 px-3 py-1">Engine V2.0</Badge>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-3">Dự Toán Thủy Lực Chuyên Nghiệp</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">Tính toán chính xác áp suất, công suất máy bơm và vật tư cần thiết theo chuẩn kỹ thuật tưới công nghệ cao.</p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* INPUT FORM */}
          <div className="md:col-span-5">
            <Card className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-lg shadow-slate-200/50 sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#2D5A27]" /> Thông số vườn
                </h2>

                <div className="space-y-5">
                  <div>
                    <Label className="text-slate-600 mb-1.5 block">Loại cây trồng</Label>
                    <Select value={cropKey} onValueChange={setCropKey}>
                      <SelectTrigger className="w-full h-12 bg-white rounded-xl border-slate-200 focus:ring-[#2D5A27]">
                        <SelectValue placeholder="Chọn cây trồng" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="durian">Sầu riêng (8x8m)</SelectItem>
                        <SelectItem value="coffee">Cà phê (3x3m)</SelectItem>
                        <SelectItem value="pepper">Hồ tiêu (2.5x2.5m)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-600 mb-1.5 block">Diện tích (Hecta)</Label>
                    <Input 
                      type="number" 
                      placeholder="Ví dụ: 1.5" 
                      value={areaHa}
                      onChange={e => setAreaHa(e.target.value)}
                      className="h-12 bg-white rounded-xl border-slate-200 focus-visible:ring-[#2D5A27]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600 mb-1.5 block">Chiều dài (m)</Label>
                      <Input 
                        type="number" 
                        placeholder="Trục chính" 
                        value={lengthM}
                        onChange={e => setLengthM(e.target.value)}
                        className="h-12 bg-white rounded-xl border-slate-200 focus-visible:ring-[#2D5A27]"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-600 mb-1.5 block">Chiều rộng (m)</Label>
                      <Input 
                        type="number" 
                        placeholder="Ngang" 
                        value={widthM}
                        onChange={e => setWidthM(e.target.value)}
                        className="h-12 bg-white rounded-xl border-slate-200 focus-visible:ring-[#2D5A27]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="space-y-0.5">
                        <Label className="font-semibold text-slate-800">Địa hình dốc</Label>
                        <p className="text-xs text-slate-500">Cộng thêm 15% áp suất</p>
                      </div>
                      <Switch checked={isSloped} onCheckedChange={setIsSloped} className="data-[state=checked]:bg-[#2D5A27]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RESULTS DASHBOARD */}
          <div className="md:col-span-7">
            <AnimatePresence mode="wait">
              {!results ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px] border-2 border-dashed border-slate-200 rounded-3xl"
                >
                  <Gauge className="w-16 h-16 mb-4 opacity-20" />
                  <p>Nhập thông số để xem phân tích thủy lực</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Warning if loss > 20% */}
                  {results.hasWarning && (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-200 flex gap-3 shadow-sm">
                      <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-red-800">Cảnh báo tổn thất áp suất!</h4>
                        <p className="text-sm text-red-600 mt-1">Đường ống PVC 60mm quá nhỏ cho chiều dài và lưu lượng này (tổn thất {results.headLossPercent.toFixed(1)}%). Gây mất áp cuối dòng. Cần tăng đường kính lên 90mm hoặc 114mm.</p>
                      </div>
                    </div>
                  )}

                  {/* Top 3 Metric Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-white/80 backdrop-blur-md border-0 shadow-sm rounded-2xl overflow-hidden">
                      <div className="bg-blue-500 h-1 w-full" />
                      <CardContent className="p-4">
                        <Droplets className="w-6 h-6 text-blue-500 mb-2" />
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Tổng Lưu Lượng</p>
                        <p className="text-2xl font-bold text-slate-800 font-display">{Math.ceil(results.totalFlowM3h)} <span className="text-sm text-slate-500">m³/h</span></p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-md border-0 shadow-sm rounded-2xl overflow-hidden">
                      <div className="bg-[#2D5A27] h-1 w-full" />
                      <CardContent className="p-4">
                        <Zap className="w-6 h-6 text-[#2D5A27] mb-2" />
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Công Suất Bơm</p>
                        <p className="text-2xl font-bold text-slate-800 font-display">{Math.ceil(results.pumpHp)} <span className="text-sm text-slate-500">HP</span></p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-md border-0 shadow-sm rounded-2xl overflow-hidden">
                      <div className="bg-orange-500 h-1 w-full" />
                      <CardContent className="p-4">
                        <Gauge className="w-6 h-6 text-orange-500 mb-2" />
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Áp Suất Yêu Cầu</p>
                        <p className="text-2xl font-bold text-slate-800 font-display">{results.operatingPressure.toFixed(1)} <span className="text-sm text-slate-500">Bar</span></p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* BOM Table */}
                  <Card className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-sm overflow-hidden">
                    <div className="bg-slate-800 p-4">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        Bảng Vật Tư Dự Kiến (BOM)
                      </h3>
                      <p className="text-slate-300 text-sm mt-1">Dành cho {results.treeCount} cây {CROP_DATA[cropKey as keyof typeof CROP_DATA].name}</p>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="py-3 px-5 font-semibold">Tên Vật Tư</th>
                            <th className="py-3 px-5 font-semibold text-right">Số Lượng</th>
                            <th className="py-3 px-5 font-semibold">Đơn Vị</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {results.bom.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-3 px-5 font-medium text-slate-800">{item.name}</td>
                              <td className="py-3 px-5 text-right font-bold text-[#F57C00]">{item.qty}</td>
                              <td className="py-3 px-5 text-slate-500">{item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full h-14 rounded-2xl bg-[#F57C00] hover:bg-[#E65100] text-white text-lg font-bold shadow-lg shadow-orange-500/25"
                  >
                    <MapPin className="w-5 h-5 mr-2" /> Gửi Dự Toán Cho Đại Lý Báo Giá
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* O2O Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0">
          <div className="bg-[#2D5A27] p-6 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)]"></div>
            <DialogTitle className="text-2xl font-bold font-display text-white relative z-10">Bản vẽ & Dự toán đã sẵn sàng!</DialogTitle>
          </div>
          
          <div className="p-6 pt-4">
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-6 text-center">
              <p className="text-orange-800 text-sm leading-relaxed">
                Đại lý <strong className="text-orange-900">{dealer.name}</strong> tại <strong>{dealer.district}, {dealer.province}</strong> sẽ tiếp nhận và lên báo giá chi tiết cho bạn.
              </p>
            </div>
            
            <div className="space-y-4">
              <Input 
                type="tel"
                placeholder="Nhập số điện thoại của bạn..." 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-14 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-[#2D5A27] text-lg text-center font-medium"
              />
              <Button 
                onClick={() => setIsModalOpen(false)}
                className="w-full h-14 rounded-xl bg-[#2D5A27] text-white font-bold text-base shadow-lg"
              >
                Gửi Yêu Cầu Chớp Nhoáng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
