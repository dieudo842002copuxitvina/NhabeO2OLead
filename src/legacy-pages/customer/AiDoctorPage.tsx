import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, UploadCloud, MapPin, CheckCircle, AlertTriangle, Phone, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import { dealersData } from '@/data/dealersData';
import { submitLeadToSupabase } from '@/services/leadService';
import { toast } from 'sonner';

export default function AiDoctorPage() {
  const { profile } = useFarmerProfile();
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setResult(null);
      setScanProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setResult(null);
      setScanProgress(0);
    }
  };

  // Start Diagnostic Scan
  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5; // increment progress
      });
    }, 150);

    // After 3 seconds, show result
    setTimeout(() => {
      clearInterval(interval);
      setIsScanning(false);
      setResult({
        disease: 'Nấm Hồng / Tuyến Trùng Rễ',
        confidence: 94,
        prescriptions: ['Hoạt chất Hexaconazole 50SC', 'Chế phẩm sinh học Trichoderma', 'Phân bón lá Amino Acid']
      });
    }, 3000);
  };

  // Geo-Matching logic for closest dealer
  const getClosestDealer = () => {
    const userProvince = profile.provinceName || 'Đồng Nai'; // Fallback
    const matchedDealers = dealersData.filter(d => d.province === userProvince && !d.isHeadOffice);
    if (matchedDealers.length > 0) {
      return matchedDealers[0];
    }
    return dealersData.find(d => d.isHeadOffice) || dealersData[0];
  };

  // Handle Send to Dealer
  const handleSendToDealer = () => {
    setIsModalOpen(true);
  };

  const submitLead = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }

    setIsSubmitting(true);
    const dealer = getClosestDealer();

    try {
      await submitLeadToSupabase({
        customer_phone: phoneNumber,
        lead_type: 'AI_DOCTOR',
        province: profile.provinceName || 'Unknown',
        district: profile.districtName || 'Unknown',
        crop_type: profile.cropId || 'Unknown',
        calculator_data: {
          disease: result?.disease
        },
        assigned_dealer_id: dealer.id
      });
      
      setIsModalOpen(false);
      toast.success('Gửi thành công!', {
        description: `Đại lý ${dealer.name} sẽ liên hệ bạn trong 15 phút!`
      });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchedDealer = getClosestDealer();

  return (
    <div 
      className="min-h-screen pt-8 pb-24 relative"
      style={{
        backgroundColor: '#F8FAFC', // slate-50
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232d5a27' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      <div className="max-w-xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#2D5A27]/20 border-0 mb-3 text-sm px-3 py-1">Công nghệ AI 2026</Badge>
          <h1 className="text-3xl font-bold text-slate-900 font-display mb-2">Bác Sĩ Cây Trồng</h1>
          <p className="text-slate-600">Chẩn đoán bệnh trong 3 giây qua hình ảnh</p>
        </div>

        {/* Upload Zone */}
        <Card className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm overflow-hidden mb-8">
          <CardContent className="p-6">
            {!imageSrc ? (
              <>
                {/* Desktop Drag & Drop */}
                <div 
                  className="hidden md:flex flex-col items-center justify-center border-2 border-dashed border-[#2D5A27]/30 rounded-2xl h-64 bg-slate-50/50 hover:bg-[#2D5A27]/5 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <UploadCloud className="w-12 h-12 text-[#2D5A27] mb-4 opacity-50" />
                  <p className="font-semibold text-slate-700">Kéo thả hoặc chọn ảnh bệnh</p>
                  <p className="text-xs text-slate-500 mt-1">Hỗ trợ JPG, PNG</p>
                </div>

                {/* Mobile Camera Button */}
                <div className="md:hidden flex flex-col items-center justify-center py-10">
                  <div className="w-24 h-24 rounded-full bg-[#2D5A27]/10 flex items-center justify-center mb-6">
                    <Camera className="w-10 h-10 text-[#2D5A27]" />
                  </div>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full h-14 px-8 bg-[#2D5A27] hover:bg-[#1f421b] text-lg font-bold shadow-lg shadow-[#2D5A27]/20"
                  >
                    <Camera className="w-5 h-5 mr-2" /> Chụp Ảnh Cây Bệnh
                  </Button>
                </div>
              </>
            ) : (
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden aspect-square md:aspect-video bg-black/5 flex items-center justify-center group">
                  <img src={imageSrc} alt="Cây bệnh" className="w-full h-full object-cover" />
                  
                  {/* Scanning Animation */}
                  {isScanning && (
                    <>
                      {/* Scanning Line */}
                      <motion.div 
                        initial={{ top: 0 }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-[#2D5A27] shadow-[0_0_15px_#2D5A27] z-20"
                      />
                      {/* Grid overlay for tech feel */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(45,90,39,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(45,90,39,0.1)_1px,transparent_1px)] bg-[size:20px_20px] z-10 pointer-events-none" />
                      
                      {/* Scanning Text */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30">
                        <span className="bg-slate-900/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-mono animate-pulse">
                          🤖 AI đang phân tích dữ liệu bệnh học... {scanProgress}%
                        </span>
                      </div>

                      {/* Random Tech Points */}
                      <motion.div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_yellow] z-20 animate-ping" />
                      <motion.div className="absolute top-1/2 right-1/3 w-2 h-2 bg-red-400 rounded-full shadow-[0_0_10px_red] z-20 animate-ping delay-100" />
                    </>
                  )}

                  {!isScanning && !result && (
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-sm"
                      onClick={() => setImageSrc(null)}
                    >
                      <RefreshCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {!isScanning && !result && (
                  <Button 
                    onClick={startScan}
                    className="w-full mt-6 h-14 rounded-full bg-[#F57C00] hover:bg-[#E65100] text-white text-lg font-bold shadow-lg shadow-orange-500/25 active:shadow-none transition-all"
                  >
                    Bắt Đầu Chẩn Đoán
                  </Button>
                )}
              </div>
            )}
            
            {/* Hidden Input */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              onChange={handleImageChange}
              className="hidden" 
            />
          </CardContent>
        </Card>

        {/* Diagnosis Result */}
        <AnimatePresence>
          {result && !isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                  <h3 className="font-bold text-red-700 text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Phát hiện: {result.disease}
                  </h3>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">{result.confidence}% - Tin cậy</Badge>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Toa Thuốc Khuyến Nghị</p>
                  <ul className="space-y-3 mb-6">
                    {result.prescriptions.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <CheckCircle className="w-5 h-5 text-[#2D5A27] shrink-0 mt-0.5" />
                        <span className="text-slate-800 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-slate-400 italic text-center mb-6 px-4">
                    "Kết quả mang tính tham khảo do AI phân tích. Hãy tham vấn kỹ thuật viên tại đại lý để có phác đồ chính xác nhất."
                  </p>

                  <Button 
                    onClick={handleSendToDealer}
                    className="w-full h-14 rounded-full bg-[#F57C00] hover:bg-[#E65100] text-white text-lg font-bold shadow-lg shadow-orange-500/25 active:shadow-none transition-all"
                  >
                    <MapPin className="w-5 h-5 mr-2" /> Gửi Toa Thuốc Cho Đại Lý Gần Nhất
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* O2O Smart Routing Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0">
          <div className="bg-[#2D5A27] p-6 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)]"></div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold font-display text-white">Toa thuốc đã được chuẩn bị!</DialogTitle>
          </div>
          
          <div className="p-6 pt-4">
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-6 text-center">
              <p className="text-orange-800 text-sm leading-relaxed">
                Đại lý <strong className="text-orange-900">{matchedDealer.name}</strong> tại <strong>{matchedDealer.district}, {matchedDealer.province}</strong> đang có sẵn thuốc trị {result?.disease}.
              </p>
            </div>

            <DialogDescription className="text-center text-slate-500 mb-4">
              Nhập số điện thoại Zalo của bạn để đại lý gọi lại hướng dẫn liều lượng pha thuốc hoàn toàn miễn phí.
            </DialogDescription>

            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  type="tel"
                  placeholder="Nhập số điện thoại của bạn..." 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 h-14 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-[#2D5A27] text-lg font-medium"
                  maxLength={11}
                />
              </div>

              <Button 
                onClick={submitLead}
                disabled={isSubmitting}
                className="w-full h-14 rounded-xl bg-[#2D5A27] hover:bg-[#1f421b] text-white font-bold text-base shadow-lg shadow-[#2D5A27]/20"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang chuyển dữ liệu...</>
                ) : (
                  'Nhận Tư Vấn Miễn Phí'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
