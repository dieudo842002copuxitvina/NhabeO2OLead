import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Beaker, 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  ShoppingCart, 
  Download, 
  Info,
  ChevronRight,
  Target,
  Zap,
  Droplets
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import SeoMeta from '@/components/SeoMeta';

// --- DATA LAYER ---
const FERTILIZERS = [
  { id: 'urea', name: 'Urê', icon: '🧪', solubility: 1000, tags: ['N'], desc: 'Đạm 46%' },
  { id: 'dap', name: 'DAP', icon: '💎', solubility: 500, tags: ['N', 'P', 'PO4'], desc: '18-46-0' },
  { id: 'kali', name: 'Kali trắng', icon: '❄️', solubility: 340, tags: ['K', 'Cl'], desc: 'K2O 60%' },
  { id: 'calcium', name: 'Canxi Nitrat', icon: '🥛', solubility: 1200, tags: ['Ca', 'N'], desc: 'Ca 19%, N 15.5%' },
  { id: 'humic', name: 'Humic', icon: '🌑', solubility: 100, tags: ['Organic'], desc: 'Kích rễ, cải tạo đất' },
  { id: 'mkp', name: 'MKP', icon: '⚡', solubility: 200, tags: ['P', 'K', 'PO4'], desc: '0-52-34' },
  { id: 'magnesium', name: 'Magnesium Sulfate', icon: '🧂', solubility: 700, tags: ['Mg', 'SO4'], desc: 'Magie & Lưu huỳnh' },
];

const STAGES = {
  'kienthiet': { name: 'Kiến thiết (Cây con)', factor: 0.5, ec: '0.8 - 1.2', ph: '5.5 - 6.0' },
  'kinhdoanh': { name: 'Kinh doanh (Phục hồi)', factor: 1.0, ec: '1.2 - 1.8', ph: '6.0 - 6.5' },
  'nuoitrai': { name: 'Nuôi trái / Thu hoạch', factor: 1.5, ec: '2.0 - 2.5', ph: '6.5 - 7.0' },
};

export default function NutrientExpert() {
  // --- STATE ---
  const [areaHa, setAreaHa] = useState<string>('1');
  const [treeCount, setTreeCount] = useState<string>('200');
  const [stage, setStage] = useState<keyof typeof STAGES>('kinhdoanh');
  const [selectedFerts, setSelectedFerts] = useState<string[]>([]);
  const [irrigationTime, setIrrigationTime] = useState<string>('60'); // minutes

  // --- LOGIC ---
  const compatibility = useMemo(() => {
    const alerts: { type: 'red' | 'yellow'; msg: string }[] = [];
    const hasCa = selectedFerts.some(id => FERTILIZERS.find(f => f.id === id)?.tags.includes('Ca'));
    const hasSO4 = selectedFerts.some(id => FERTILIZERS.find(f => f.id === id)?.tags.includes('SO4'));
    const hasPO4 = selectedFerts.some(id => FERTILIZERS.find(f => f.id === id)?.tags.includes('PO4'));

    if (hasCa && (hasSO4 || hasPO4)) {
      alerts.push({
        type: 'red',
        msg: '⚠️ Nguy cơ kết tủa thạch cao/lắng cặn, gây tắc béc tưới. Hãy chia làm 2 lần tưới riêng biệt!'
      });
    }

    if (selectedFerts.length > 3) {
      alerts.push({
        type: 'yellow',
        msg: '⚠️ Pha trộn quá nhiều loại phân cùng lúc có thể làm thay đổi pH nước đột ngột.'
      });
    }

    return alerts;
  }, [selectedFerts]);

  const results = useMemo(() => {
    const area = parseFloat(areaHa) || 0;
    const trees = parseFloat(treeCount) || 0;
    const time = parseFloat(irrigationTime) || 60;
    
    if (area <= 0 || selectedFerts.length === 0) return null;

    const stageData = STAGES[stage];
    
    const fertDetails = selectedFerts.map(id => {
      const f = FERTILIZERS.find(item => item.id === id)!;
      // Mock dosage logic: 5kg/ha * factor
      const weight = 5 * area * stageData.factor;
      const minWater = weight / (f.solubility / 1000); // Lít
      return { ...f, weight, minWater };
    });

    const totalWeight = fertDetails.reduce((sum, f) => sum + f.weight, 0);
    const totalMinWater = fertDetails.reduce((sum, f) => sum + f.minWater, 0);
    const injectionRate = (totalMinWater / time) * 60; // L/h

    return {
      fertDetails,
      totalWeight,
      totalMinWater,
      injectionRate,
      ec: stageData.ec,
      ph: stageData.ph
    };
  }, [areaHa, treeCount, stage, selectedFerts, irrigationTime]);

  // --- ACTIONS ---
  const toggleFert = (id: string) => {
    setSelectedFerts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSopDownload = () => {
    toast.success('Đang chuẩn bị quy trình SOP...', {
      description: 'Tài liệu hướng dẫn vận hành hệ thống châm phân tự động.'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-24 relative overflow-hidden">
      <SeoMeta 
        title="Kỹ Sư Dinh Dưỡng & Điều Tiết Phân Bón | Nhà Bè Agri"
        description="Công cụ tính toán liều lượng phân bón hòa tan, kiểm tra tương hợp hóa học và tối ưu tốc độ châm phân Venturi."
      />

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-green-100/40 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 -z-10" />

      <div className="max-w-5xl mx-auto px-4">
        {/* HEADER DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-slate-900 font-display flex items-center gap-3">
              <FlaskConical className="w-8 h-8 text-[#2D5A27]" />
              Kỹ Sư Dinh Dưỡng AI
            </h1>
            <p className="text-slate-500 mt-2">Tính toán toa thuốc dinh dưỡng & Điều tiết châm phân tự động</p>
          </div>
          <div className="flex gap-3 items-center justify-end">
            <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-sm rounded-2xl px-4 py-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">EC Mục Tiêu</p>
                <p className="font-bold text-slate-800">{results?.ec || '---'}</p>
              </div>
            </Card>
            <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-sm rounded-2xl px-4 py-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">pH Mục Tiêu</p>
                <p className="font-bold text-slate-800">{results?.ph || '---'}</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: INPUTS & SELECTION */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-white/80 backdrop-blur-md rounded-3xl border-white/40 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" /> Cấu hình canh tác
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-600">Diện tích vườn (Ha)</Label>
                    <Input 
                      type="number" 
                      value={areaHa} 
                      onChange={e => setAreaHa(e.target.value)}
                      className="rounded-xl h-12 bg-white/50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600">Giai đoạn sinh trưởng</Label>
                    <Select value={stage} onValueChange={(val: any) => setStage(val)}>
                      <SelectTrigger className="rounded-xl h-12 bg-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STAGES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600">Số gốc cây</Label>
                    <Input 
                      type="number" 
                      value={treeCount} 
                      onChange={e => setTreeCount(e.target.value)}
                      className="rounded-xl h-12 bg-white/50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-600">Thời gian tưới (Phút)</Label>
                    <Input 
                      type="number" 
                      value={irrigationTime} 
                      onChange={e => setIrrigationTime(e.target.value)}
                      className="rounded-xl h-12 bg-white/50 border-slate-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 px-2">
                <Beaker className="w-5 h-5 text-blue-500" /> Danh mục phân bón hòa tan
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {FERTILIZERS.map(f => (
                  <motion.div
                    key={f.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleFert(f.id)}
                    className={`cursor-pointer group relative p-4 rounded-2xl border transition-all duration-300 ${
                      selectedFerts.includes(f.id)
                        ? 'bg-[#2D5A27] border-[#2D5A27] shadow-lg shadow-[#2D5A27]/20'
                        : 'bg-white/80 border-white/60 hover:border-[#2D5A27]/40 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                        selectedFerts.includes(f.id) ? 'bg-white/20' : 'bg-slate-50'
                      }`}>
                        {f.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${selectedFerts.includes(f.id) ? 'text-white' : 'text-slate-800'}`}>
                          {f.name}
                        </p>
                        <p className={`text-xs ${selectedFerts.includes(f.id) ? 'text-white/70' : 'text-slate-500'}`}>
                          {f.desc}
                        </p>
                      </div>
                      {selectedFerts.includes(f.id) && (
                        <CheckCircle2 className="w-5 h-5 text-white animate-in zoom-in" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Compatibility Alerts */}
            <AnimatePresence>
              {compatibility.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {compatibility.map((alert, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex gap-3 ${
                      alert.type === 'red' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-amber-50 border-amber-100 text-amber-800'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 shrink-0 ${alert.type === 'red' ? 'text-red-500' : 'text-amber-500'}`} />
                      <p className="text-sm leading-relaxed">{alert.msg}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: RESULTS / PRESCRIPTION */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <Card className="bg-slate-900 text-white rounded-3xl border-0 shadow-2xl overflow-hidden relative">
                {/* Visual Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D5A27] rounded-full blur-3xl opacity-20 -mr-16 -mt-16" />
                
                <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    Toa Thuốc Dinh Dưỡng
                  </h3>
                  <Badge variant="outline" className="text-white border-white/20">
                    SOP Ver 1.0
                  </Badge>
                </div>

                <CardContent className="p-6 relative z-10">
                  {!results ? (
                    <div className="py-12 text-center">
                      <p className="text-slate-500 italic">Chọn phân bón để xem toa thuốc</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nước hòa tan (Min)</p>
                          <p className="text-2xl font-bold">{results.totalMinWater.toFixed(1)} <span className="text-sm font-normal opacity-60">Lít</span></p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tốc độ châm phân</p>
                          <p className="text-2xl font-bold text-orange-400">{results.injectionRate.toFixed(1)} <span className="text-sm font-normal text-white opacity-60">L/h</span></p>
                        </div>
                      </div>

                      {/* Fert Breakdown */}
                      <div className="space-y-3">
                        {results.fertDetails.map(f => (
                          <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{f.icon}</span>
                              <span className="font-medium text-slate-200">{f.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#F57C00]">{f.weight.toFixed(2)} Kg</p>
                              <p className="text-[10px] text-slate-400">Pha loãng với {f.minWater.toFixed(1)}L nước</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 space-y-3">
                        <Button 
                          onClick={handleSopDownload}
                          variant="outline" 
                          className="w-full h-12 rounded-xl border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all font-bold"
                        >
                          <Download className="w-4 h-4 mr-2" /> Tải Quy Trình Vận Hành SOP
                        </Button>
                        <Link to="/dai-ly">
                          <Button className="w-full h-12 rounded-xl bg-[#F57C00] hover:bg-[#E65100] text-white font-bold shadow-lg shadow-orange-500/20">
                            📍 Kiểm tra hàng tại Đại lý
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upsell Card */}
              <Card className="bg-blue-50 border-blue-100 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex gap-4 items-start relative z-10">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <Droplets className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Bảo vệ hệ thống tưới</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Sử dụng <strong>bộ lọc đĩa Azud</strong> để loại bỏ hoàn toàn cặn phân chưa tan, bảo vệ béc tưới bù áp khỏi bị tắc nghẽn.
                    </p>
                    <Link to="/san-pham/loc-azud" className="text-blue-600 font-bold text-xs mt-3 inline-flex items-center group">
                      Xem giải pháp lọc <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
