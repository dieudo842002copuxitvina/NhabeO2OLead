"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import CropSelect from './CropSelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowLeft, Leaf, Droplets, Wrench, Settings2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// --- MOCK BOMReceipt Component ---
function BOMReceipt({ data, onReset }: { data: any, onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#2D5A27]/20"
    >
      <div className="bg-[#2D5A27] text-white p-6 text-center">
        <h2 className="text-2xl font-bold font-display">Phiếu Dự Toán Vật Tư</h2>
        <p className="text-[#2D5A27] bg-white/20 inline-block px-3 py-1 rounded-full text-sm mt-2 font-medium">
          {data.cropName} • {data.area} Ha • {data.spacingRow}m x {data.spacingPlant}m
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-50 border-none shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Droplets className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-slate-500">Tổng lưu lượng (m³/h)</p>
              <p className="text-xl font-bold text-slate-800">{Math.round(data.area * 10000 / (data.spacingRow * data.spacingPlant) * 0.05)}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50 border-none shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Leaf className="w-8 h-8 text-[#2D5A27] mb-2" />
              <p className="text-sm text-slate-500">Tổng số cây (Ước tính)</p>
              <p className="text-xl font-bold text-slate-800">{Math.round(data.area * 10000 / (data.spacingRow * data.spacingPlant))}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-400" /> Đề xuất thiết bị cốt lõi
          </h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-600">Bơm cấp nước</span>
              <span className="font-semibold">{Math.ceil(data.area * 2)} HP</span>
            </li>
            <li className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-slate-600">Ống chính PVC/HDPE</span>
              <span className="font-semibold">Phi {data.area > 2 ? 90 : 60}mm</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-slate-600">Ống nhánh LDPE</span>
              <span className="font-semibold">Phi 16mm hoặc 20mm</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
        <Button variant="outline" onClick={onReset} className="text-[#2D5A27] border-[#2D5A27] hover:bg-[#2D5A27]/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Tương tác lại Form
        </Button>
      </div>
    </motion.div>
  );
}

export default function SmartBOMForm() {
  const { profile, updateProfile, isLoaded } = useFarmerProfile();
  
  const [cropId, setCropId] = useState(profile.cropKey || '');
  const [area, setArea] = useState(profile.areHa ? profile.areHa.toString() : '');
  const [spacingRow, setSpacingRow] = useState('3');
  const [spacingPlant, setSpacingPlant] = useState('3');
  const [isCalculated, setIsCalculated] = useState(false);

  // Auto-Suggest Spacing
  useEffect(() => {
    if (!cropId) return;
    if (cropId === 'ho-tieu') {
      setSpacingRow('2'); setSpacingPlant('2');
    } else if (cropId === 'ca-phe') {
      setSpacingRow('3'); setSpacingPlant('3');
    } else if (['dieu', 'cao-su', 'mac-ca'].includes(cropId)) {
      setSpacingRow('8'); setSpacingPlant('8');
    } else if (['sau-rieng', 'mit', 'buoi', 'nhan', 'xoai', 'cam'].includes(cropId)) {
      setSpacingRow('6'); setSpacingPlant('6');
    }
  }, [cropId]);

  // Smart Memory: Save on change
  useEffect(() => {
    if (isLoaded) {
      updateProfile({
        cropKey: cropId,
        areHa: parseFloat(area) || null,
      });
    }
  }, [cropId, area, updateProfile, isLoaded]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropId || !area) return;
    setIsCalculated(true);
  };

  if (!isLoaded) return <div className="h-64 flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!isCalculated ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#2D5A27]/10 rounded-xl flex items-center justify-center">
                <Settings2 className="w-6 h-6 text-[#2D5A27]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Thông số Nông trại</h2>
                <p className="text-sm text-slate-500">Dữ liệu sẽ được tự động lưu lại (Smart Memory)</p>
              </div>
            </div>

            <form onSubmit={handleCalculate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Loại cây trồng</label>
                <CropSelect value={cropId} onChange={setCropId} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Diện tích canh tác (Ha)</label>
                <Input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  placeholder="Ví dụ: 1.5"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="bg-white/60 backdrop-blur-md border-slate-200 focus-visible:ring-[#2D5A27] h-12 text-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Khoảng cách Hàng (m)</label>
                  <Input 
                    type="number" 
                    step="0.1"
                    min="0.1"
                    value={spacingRow}
                    onChange={(e) => setSpacingRow(e.target.value)}
                    className="bg-white/60 backdrop-blur-md border-slate-200 focus-visible:ring-[#2D5A27] h-12 text-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Khoảng cách Cây (m)</label>
                  <Input 
                    type="number" 
                    step="0.1"
                    min="0.1"
                    value={spacingPlant}
                    onChange={(e) => setSpacingPlant(e.target.value)}
                    className="bg-white/60 backdrop-blur-md border-slate-200 focus-visible:ring-[#2D5A27] h-12 text-lg"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={!cropId || !area}
                className="w-full h-14 text-lg font-bold bg-[#2D5A27] hover:bg-[#1f421b] text-white rounded-xl shadow-lg shadow-[#2D5A27]/20 transition-all mt-4"
              >
                <Calculator className="w-5 h-5 mr-2" /> Tiến Hành Phân Tích Kỹ Thuật
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="receipt">
            <BOMReceipt 
              data={{ 
                cropId, 
                cropName: cropId.replace('-', ' ').toUpperCase(), // Basic formatting
                area: parseFloat(area), 
                spacingRow: parseFloat(spacingRow), 
                spacingPlant: parseFloat(spacingPlant) 
              }} 
              onReset={() => setIsCalculated(false)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
