import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Search, 
  Activity, 
  CloudRain, 
  Sun, 
  Wind, 
  Stethoscope, 
  ShieldCheck, 
  Leaf, 
  Microscope,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import { dealersData } from '@/data/dealersData';
import SeoMeta from '@/components/SeoMeta';

// --- DATA LAYER ---
const CROPS = [
  { id: 'durian', name: 'Sầu riêng' },
  { id: 'coffee', name: 'Cà phê' },
  { id: 'pepper', name: 'Hồ tiêu' },
  { id: 'cashew', name: 'Điều' },
];

const WEATHER_OPTIONS = [
  { id: 'rain', name: 'Mưa dầm', icon: CloudRain, color: 'text-blue-500' },
  { id: 'sunny', name: 'Nắng gắt', icon: Sun, color: 'text-orange-500' },
  { id: 'frost', name: 'Sương muối', icon: Wind, color: 'text-slate-400' },
];

const STAGES = [
  { id: 'seedling', name: 'Cây con' },
  { id: 'fruiting', name: 'Đang nuôi trái' },
  { id: 'harvested', name: 'Sau thu hoạch' },
];

export default function AiDoctorExpert() {
  const { profile } = useFarmerProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE ---
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [crop, setCrop] = useState('durian');
  const [weather, setWeather] = useState('rain');
  const [stage, setStage] = useState('fruiting');
  const [diagnosis, setDiagnosis] = useState<any>(null);

  // --- LOGIC ---
  const analyzePathology = () => {
    setIsScanning(true);
    setDiagnosis(null);

    // Simulate AI processing
    setTimeout(() => {
      let result = {
        disease: 'Thối rễ do Phytophthora',
        confidence: 92,
        reason: 'Dựa trên hình ảnh đốm đen sũng nước và bối cảnh mưa dầm kéo dài gây độ ẩm cao tại vùng rễ.',
        treatment: {
          chemical: 'Hoạt chất Metalaxyl hoặc Mancozeb (Tưới gốc)',
          biological: 'Chế phẩm Trichoderma kết hợp Humic để phục hồi rễ',
          technical: 'Kiểm tra hệ thống thoát nước vườn, tỉa cành thông thoáng chân gốc.'
        }
      };

      if (crop === 'coffee') {
        result = {
          disease: 'Tuyến trùng rễ & Nấm hồng',
          confidence: 88,
          reason: 'Hình ảnh vàng lá cục bộ và giai đoạn đang nuôi trái cho thấy sự suy giảm sức đề kháng do tuyến trùng tấn công.',
          treatment: {
            chemical: 'Hoạt chất Ethoprophos hoặc Abamectin',
            biological: 'Bổ sung vi sinh vật đối kháng Paecilomyces',
            technical: 'Kiểm tra độ pH đất, bổ sung vôi bột nếu đất quá chua.'
          }
        };
      }

      setDiagnosis(result);
      setIsScanning(false);
      toast.success('Đã có kết quả chẩn đoán!');
    }, 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const dealer = useMemo(() => {
    const userProv = profile.provinceName || 'Đồng Nai';
    const matched = dealersData.filter(d => d.province === userProv && !d.isHeadOffice);
    return matched[0] || dealersData.find(d => d.isHeadOffice) || dealersData[0];
  }, [profile.provinceName]);

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-24 relative overflow-hidden">
      <SeoMeta 
        title="Bác Sĩ Cây Trồng AI & Dự Báo Dịch Tễ | Nhà Bè Agri"
        description="Chẩn đoán bệnh cây trồng bằng AI kết hợp dữ liệu thời tiết và bối cảnh lâm sàng để đưa ra phác đồ điều trị 3 tầng chuyên sâu."
      />

      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 mb-2">Expert System v4.0</Badge>
            <h1 className="text-3xl font-bold text-slate-900 font-display flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-blue-600" />
              Bác Sĩ Cây Trồng AI
            </h1>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 shadow-sm">
            <Activity className="w-4 h-4 text-green-500 animate-pulse" />
            <span>Hệ thống trực tuyến: 98% Độ chính xác</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: INPUTS */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Visual Data */}
            <Card className="bg-white/80 backdrop-blur-md rounded-3xl border-white/40 shadow-sm overflow-hidden group">
              <CardContent className="p-0">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-video bg-slate-100 flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
                >
                  {image ? (
                    <>
                      <img src={image} alt="Upload" className="w-full h-full object-cover" />
                      {isScanning && (
                        <motion.div 
                          initial={{ top: '-10%' }}
                          animate={{ top: '110%' }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_#3b82f6] z-10"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <p className="text-white font-bold flex items-center gap-2">
                          <Search className="w-5 h-5" /> Thay đổi ảnh
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="font-bold text-slate-700">Chụp hoặc tải ảnh lá bệnh</p>
                      <p className="text-xs text-slate-400 mt-1">Ảnh cận cảnh đốm bệnh sẽ cho kết quả tốt nhất</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Context Data */}
            <Card className="bg-white/80 backdrop-blur-md rounded-3xl border-white/40 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-blue-500" /> Chẩn đoán lâm sàng
                </h3>
                
                <div className="space-y-6">
                  {/* Crop & Stage */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-600">Loại cây trồng</Label>
                      <Select value={crop} onValueChange={setCrop}>
                        <SelectTrigger className="rounded-xl h-12 bg-white/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CROPS.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-600">Giai đoạn cây</Label>
                      <Select value={stage} onValueChange={setStage}>
                        <SelectTrigger className="rounded-xl h-12 bg-white/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Weather */}
                  <div className="space-y-3">
                    <Label className="text-slate-600">Thời tiết 7 ngày qua</Label>
                    <RadioGroup value={weather} onValueChange={setWeather} className="grid grid-cols-3 gap-3">
                      {WEATHER_OPTIONS.map(opt => (
                        <Label
                          key={opt.id}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all ${
                            weather === opt.id ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white/50 border-slate-100 hover:border-blue-200'
                          }`}
                        >
                          <RadioGroupItem value={opt.id} className="sr-only" />
                          <opt.icon className={`w-6 h-6 ${opt.color}`} />
                          <span className="text-xs font-bold text-slate-700">{opt.name}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button 
                    onClick={analyzePathology}
                    disabled={!image || isScanning}
                    className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/20"
                  >
                    {isScanning ? (
                      <>
                        <Activity className="w-5 h-5 mr-2 animate-spin" />
                        Đang phân tích dữ liệu...
                      </>
                    ) : (
                      'Bắt Đầu Chẩn Đoán AI'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {!diagnosis ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Microscope className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium">Tải ảnh và cung cấp bối cảnh để AI thực hiện chẩn đoán lâm sàng</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/90 backdrop-blur-md rounded-[2.5rem] border-white shadow-2xl overflow-hidden">
                    <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-blue-200 uppercase mb-1 tracking-widest">KẾT QUẢ CHẨN ĐOÁN</p>
                        <h2 className="text-2xl font-bold font-display">{diagnosis.disease}</h2>
                      </div>
                      <Badge className="bg-white/20 text-white border-0 py-1 px-3">
                        Độ tin cậy: {diagnosis.confidence}%
                      </Badge>
                    </div>

                    <CardContent className="p-6 space-y-6">
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <p className="text-sm text-blue-900 leading-relaxed italic">
                          "{diagnosis.reason}"
                        </p>
                      </div>

                      {/* 3-Tier Prescription */}
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                            <FlaskConical className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Hóa học</p>
                            <p className="text-sm font-bold text-slate-800">{diagnosis.treatment.chemical}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                            <Leaf className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Sinh học</p>
                            <p className="text-sm font-bold text-slate-800">{diagnosis.treatment.biological}</p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Kỹ thuật</p>
                            <p className="text-sm font-bold text-slate-800">{diagnosis.treatment.technical}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 space-y-3">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-slate-700">Đại lý gần nhất có hàng</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-bold text-[#2D5A27]">{dealer.name}</p>
                            <div className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                              <CheckCircle2 className="w-3 h-3" /> Sẵn có
                            </div>
                          </div>
                        </div>

                        <Button className="w-full h-14 rounded-2xl bg-[#F57C00] hover:bg-[#E65100] text-white font-bold text-base shadow-lg shadow-orange-500/20">
                          📍 Gửi Toa Thuốc & Nhận Báo Giá
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#2D5A27] rounded-3xl p-6 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold">Cần kỹ thuật viên hỗ trợ?</h4>
                        <p className="text-sm text-white/70 mt-1">Kết nối trực tiếp với chuyên gia Nhà Bè Agri để được tư vấn miễn phí.</p>
                        <Button variant="link" className="text-white p-0 h-auto font-bold mt-2 text-xs flex items-center group/btn">
                          Gọi Tổng Đài <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
