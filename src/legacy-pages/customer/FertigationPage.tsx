import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, FlaskConical, Beaker, Gauge, ShoppingCart, Info, Activity, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

function useFertigation() {
  const [tankVolume, setTankVolume] = useState('');
  const [fertilizerWeight, setFertilizerWeight] = useState('');
  const [venturiFlow, setVenturiFlow] = useState('');
  
  const [isCalculated, setIsCalculated] = useState(false);
  const [injectionTime, setInjectionTime] = useState(0);
  const [warningMessage, setWarningMessage] = useState('');

  const calculate = () => {
    const vol = parseFloat(tankVolume);
    const weight = parseFloat(fertilizerWeight);
    const flow = parseFloat(venturiFlow);

    if (!vol || !weight || !flow) return;

    if (vol < weight * 3) {
      setWarningMessage('Cảnh báo: Pha quá đặc (Cần tối thiểu 3L nước cho 1kg phân). Phân có thể không tan hết gây nghẹt béc. Hãy chia làm 2 mẻ hoặc dùng bồn lớn hơn.');
      setIsCalculated(true);
      return;
    }

    setWarningMessage('');
    setInjectionTime(Math.ceil((vol / flow) * 60));
    setIsCalculated(true);
  };

  const reset = () => setIsCalculated(false);

  return {
    tankVolume, setTankVolume,
    fertilizerWeight, setFertilizerWeight,
    venturiFlow, setVenturiFlow,
    isCalculated, injectionTime, warningMessage,
    calculate, reset
  };
}

export default function FertigationPage() {
  const fert = useFertigation();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-xl mx-auto z-10 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white shadow-xl shadow-orange-500/10 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-orange-100">
            <FlaskConical className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-800 tracking-tight">Kỹ Sư Dinh Dưỡng</h1>
          <p className="text-slate-500 mt-2 text-lg">Smart Fertigation Mixer</p>
        </div>

        <AnimatePresence mode="wait">
          {!fert.isCalculated ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-white"
            >
              <form onSubmit={(e) => { e.preventDefault(); fert.calculate(); }} className="space-y-6">
                
                <div className="relative">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Dung tích bồn phân (Lít)</label>
                  <div className="relative">
                    <Beaker className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="number" 
                      placeholder="Gợi ý: 100, 200, 500..." 
                      value={fert.tankVolume}
                      onChange={(e) => fert.setTankVolume(e.target.value)}
                      className="pl-12 h-14 bg-white/60 border-slate-200 focus-visible:ring-orange-500 text-lg rounded-xl shadow-inner"
                      required min="1"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Lượng phân định bón (Kg)</label>
                  <div className="relative">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="number" 
                      placeholder="Ví dụ: 25" 
                      value={fert.fertilizerWeight}
                      onChange={(e) => fert.setFertilizerWeight(e.target.value)}
                      className="pl-12 h-14 bg-white/60 border-slate-200 focus-visible:ring-orange-500 text-lg rounded-xl shadow-inner"
                      required min="0.1" step="0.1"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Lưu lượng hút Venturi (Lít/Giờ)</label>
                  <div className="relative">
                    <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="number" 
                      placeholder="Ví dụ: 250" 
                      value={fert.venturiFlow}
                      onChange={(e) => fert.setVenturiFlow(e.target.value)}
                      className="pl-12 h-14 bg-white/60 border-slate-200 focus-visible:ring-orange-500 text-lg rounded-xl shadow-inner"
                      required min="1"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold bg-[#F57C00] hover:bg-[#E65100] text-white rounded-xl shadow-lg shadow-orange-500/25 transition-all mt-4"
                >
                  <FlaskConical className="w-5 h-5 mr-2" /> Phân Tích Công Thức
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="receipt"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              {fert.warningMessage ? (
                <Card className="border-red-200 bg-red-50/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-700 mb-2 font-display">Cảnh báo hòa tan</h2>
                    <p className="text-red-600 leading-relaxed mb-6">{fert.warningMessage}</p>
                    <Button onClick={fert.reset} variant="outline" className="border-red-200 text-red-600 hover:bg-red-100 rounded-xl px-8 h-12">
                      Điều chỉnh lại
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-white bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-center text-white">
                    <h2 className="text-2xl font-bold font-display">Toa Thuốc Dinh Dưỡng</h2>
                    <p className="text-orange-50 mt-1 font-medium">Quy trình châm phân tự động</p>
                  </div>
                  
                  <CardContent className="p-6 md:p-8">
                    {/* Timeline */}
                    <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      <div className="relative flex items-start gap-4">
                        <div className="absolute left-[-2rem] w-8 h-8 rounded-full bg-blue-100 border-4 border-white shadow-sm flex items-center justify-center z-10">
                          <Droplets className="w-3 h-3 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">Bước 1: Tưới nước trong</h3>
                          <p className="text-sm font-semibold text-blue-600 mb-1">Thời gian: 10 - 15 phút</p>
                          <p className="text-sm text-slate-500">Làm ẩm vùng rễ, giãn nở lỗ mao dẫn đất giúp rễ sẵn sàng hấp thụ.</p>
                        </div>
                      </div>

                      <div className="relative flex items-start gap-4">
                        <div className="absolute left-[-2rem] w-8 h-8 rounded-full bg-orange-100 border-4 border-white shadow-sm flex items-center justify-center z-10">
                          <FlaskConical className="w-3 h-3 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">Bước 2: Mở van châm phân</h3>
                          <p className="text-sm font-semibold text-orange-600 mb-1">Thời gian: {fert.injectionTime} phút</p>
                          <p className="text-sm text-slate-500">Châm liên tục qua Venturi cho đến khi cạn bồn phân {fert.tankVolume}L.</p>
                        </div>
                      </div>

                      <div className="relative flex items-start gap-4">
                        <div className="absolute left-[-2rem] w-8 h-8 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center z-10">
                          <Activity className="w-3 h-3 text-slate-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">Bước 3: Xả đường ống</h3>
                          <p className="text-sm font-semibold text-slate-600 mb-1">Thời gian: 10 - 15 phút</p>
                          <p className="text-sm text-slate-500">Tưới nước trong để súc rửa toàn bộ phân trong đường ống, tránh rong rêu và nghẹt béc.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                      <Button onClick={fert.reset} variant="ghost" className="text-slate-500">
                        Tính toán lại
                      </Button>
                    </div>
                  </CardContent>

                  {/* O2O Hook */}
                  <div className="bg-orange-50 p-6 border-t border-orange-100 text-center">
                    <p className="font-semibold text-slate-800 mb-3 flex items-center justify-center gap-2">
                      <Info className="w-4 h-4 text-orange-500" />
                      Hệ thống nhà rẫy đang thiếu phân bón hòa tan?
                    </p>
                    <Link to="/san-pham">
                      <Button className="w-full bg-[#2D5A27] hover:bg-[#1f421b] text-white rounded-xl h-12 shadow-md">
                        <ShoppingCart className="w-4 h-4 mr-2" /> Mua Phân Bón Nhỏ Giọt
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
