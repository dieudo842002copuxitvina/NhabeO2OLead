import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, CheckCircle2, Leaf } from 'lucide-react';
import { cropsData } from '@/data/cropData';
import { Input } from '@/components/ui/input';

interface CropSelectProps {
  value: string;
  onChange: (id: string) => void;
}

export default function CropSelect({ value, onChange }: CropSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCrop = cropsData.find((c) => c.id === value);

  // Grouped and filtered crops
  const groupedCrops = useMemo(() => {
    const filtered = cropsData.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    const groups: Record<string, typeof cropsData> = {};
    filtered.forEach((c) => {
      if (!groups[c.region]) groups[c.region] = [];
      groups[c.region].push(c);
    });
    return groups;
  }, [search]);

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
          selectedCrop 
            ? 'border-[#2D5A27] bg-[#2D5A27]/5' 
            : 'border-slate-200 bg-white hover:border-[#2D5A27]/50'
        }`}
      >
        <div className="flex items-center gap-3">
          {selectedCrop ? (
            <>
              <span className="text-2xl">{selectedCrop.icon}</span>
              <span className="font-semibold text-slate-800 text-base">{selectedCrop.name}</span>
              <CheckCircle2 className="w-5 h-5 text-[#2D5A27]" />
            </>
          ) : (
            <>
              <Search className="w-5 h-5 text-slate-400" />
              <span className="text-slate-500 text-sm md:text-base">Chọn loại cây trồng (Ví dụ: Sầu riêng...)</span>
            </>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Mobile Backdrop & Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:absolute md:bottom-auto md:top-full md:mt-2 md:left-0 md:right-0 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh] md:max-h-[400px]"
            >
              {/* Sticky Search Bar */}
              <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm cây trồng..."
                    className="pl-9 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-[#2D5A27]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Crop Grid */}
              <div className="overflow-y-auto p-4 space-y-6">
                {Object.keys(groupedCrops).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                    <Leaf className="w-8 h-8 text-slate-300 mb-2" />
                    Không tìm thấy cây trồng nào
                  </div>
                ) : (
                  Object.entries(groupedCrops).map(([region, crops]) => (
                    <div key={region}>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        {region.includes('Tây Nguyên') ? '🌿' : '☀️'} {region}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {crops.map((crop) => (
                          <button
                            key={crop.id}
                            onClick={() => {
                              onChange(crop.id);
                              setIsOpen(false);
                            }}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                              value === crop.id
                                ? 'bg-[#2D5A27]/10 border-[#2D5A27] text-[#2D5A27]'
                                : 'bg-gray-50 border-transparent hover:bg-[#2D5A27]/5 hover:border-[#2D5A27]/30 text-slate-700'
                            }`}
                          >
                            <span className="text-2xl mb-1">{crop.icon}</span>
                            <span className="text-sm font-medium text-center leading-tight">
                              {crop.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
