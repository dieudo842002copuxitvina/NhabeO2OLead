import { useState, useEffect, useMemo } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { MapPin, PhoneCall, Send, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

import { dealers } from '@/data/mock';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import { useApp } from '@/contexts/AppContext';
import { haversineDistance } from '@/lib/geo';
import { submitGeneralLead } from '@/lib/supabaseQueries';

import GeoMap from '@/components/GeoMap';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function DealerDirectoryPage() {
  const { profile } = useFarmerProfile();
  const { userLocation } = useApp();
  
  const [activeProvince, setActiveProvince] = useState<string>(profile.provinceName || '');
  const [requestLocation, setRequestLocation] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false); // Mobile bottom sheet state

  // Modal State
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-Filter
  const filteredDealers = useMemo(() => {
    let result = (dealers || []).filter(d => d.status === 'active');
    
    if (activeProvince) {
      // Normalize province matching just in case
      const normalize = (s: string) => s.toLowerCase().replace(/tỉnh|thành phố|tp\./g, '').trim();
      const match = normalize(activeProvince);
      const exactMatches = result.filter(d => normalize(d.province).includes(match));
      if (exactMatches.length > 0) result = exactMatches;
    }

    // Sort by distance if userLocation exists
    if (userLocation) {
      result = (result || []).map(d => ({
        ...d,
        distance: Math.round(haversineDistance(userLocation, { lat: d.lat, lng: d.lng }))
      })).sort((a: any, b: any) => a.distance - b.distance);
    }

    return result;
  }, [activeProvince, userLocation]);

  const mapCenter: [number, number] | null = useMemo(() => {
    if ((filteredDealers || []).length > 0 && activeProvince) {
      // average lat lng of filtered dealers to center map
      const avgLat = (filteredDealers || []).reduce((sum, d) => sum + (d?.lat || 0), 0) / filteredDealers.length;
      const avgLng = (filteredDealers || []).reduce((sum, d) => sum + (d?.lng || 0), 0) / filteredDealers.length;
      return [avgLat, avgLng];
    }
    return null;
  }, [filteredDealers, activeProvince]);

  const handleLocateMe = () => {
    // Note: AppContext usually handles actual GPS. Here we simulate triggering a re-center to user location
    toast.success('Đang lấy vị trí của bạn...');
    if (userLocation) {
      setActiveProvince(''); // Clear province to show nearest nationwide
    }
  };

  const handleTransferBOM = async () => {
    if (!selectedDealer) return;
    try {
      await submitGeneralLead({
        customer_name: profile.name || 'Khách hàng',
        customer_phone: profile.phone || '0000000000',
        province: profile.provinceName || '',
        district: profile.districtName || '',
        crop_type: profile.cropKey || 'unknown',
        area_m2: profile.areHa ? profile.areHa * 10000 : null,
        message: `Yêu cầu chuyển dự toán vật tư đến đại lý ${selectedDealer.name}`,
        calculator_data: null, // would pass actual BOM here in real flow
        assigned_dealer_id: selectedDealer.id,
        source: 'dealer_directory',
      });
      toast.success(`Đã chuyển dự toán cho ${selectedDealer.name}! Đại lý sẽ liên hệ bạn ngay.`);
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  // Draggable constraints for Mobile Bottom Sheet
  const dragControls = useDragControls();

  return (
    <div className="relative w-full h-[calc(100vh-var(--topnav-h))] md:h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-background">
      
      {/* MAP LAYER (Mobile: Background, Desktop: Left 60%) */}
      <div className="absolute inset-0 md:relative md:w-[60%] lg:w-[65%] h-full z-0">
        <GeoMap 
          dealers={filteredDealers}
          center={mapCenter}
          userLocation={userLocation}
          onRequestLocation={handleLocateMe}
        />
      </div>

      {/* DESKTOP LIST (Right 40%) */}
      <div className="hidden md:flex md:w-[40%] lg:w-[35%] h-full flex-col bg-card border-l z-10 shadow-xl">
        <div className="p-5 border-b bg-background">
          <h1 className="text-2xl font-display font-bold">Danh bạ Đại lý</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredDealers.length} đại lý {activeProvince ? `tại ${activeProvince}` : 'trên toàn quốc'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(filteredDealers || []).map(d => (
            <DealerCard key={d.id} dealer={d} onTransfer={() => { setSelectedDealer(d); setIsModalOpen(true); }} />
          ))}
          {(filteredDealers || []).length === 0 && (
            <div className="text-center p-8 text-muted-foreground">Không tìm thấy đại lý phù hợp.</div>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET (z-40) */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, info) => {
          if (info.offset.y < -50) setSheetOpen(true);
          if (info.offset.y > 50) setSheetOpen(false);
        }}
        animate={{ y: sheetOpen ? 0 : 'calc(100% - 100px)' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="md:hidden absolute bottom-0 left-0 w-full h-[75vh] bg-background z-40 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col"
      >
        {/* Handle */}
        <div 
          className="w-full pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none"
          onClick={() => setSheetOpen(!sheetOpen)}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        <div className="px-5 pb-3 border-b flex justify-between items-center bg-background" onClick={() => setSheetOpen(!sheetOpen)}>
          <div>
            <h2 className="text-lg font-bold">Danh sách Đại lý</h2>
            <p className="text-xs text-muted-foreground">{filteredDealers.length} kết quả {activeProvince ? `tại ${activeProvince}` : ''}</p>
          </div>
          {!sheetOpen && <ChevronUp className="w-5 h-5 text-muted-foreground animate-bounce" />}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 pb-safe-offset-20">
          {(filteredDealers || []).map(d => (
            <DealerCard key={d.id} dealer={d} onTransfer={() => { setSelectedDealer(d); setIsModalOpen(true); }} />
          ))}
          {(filteredDealers || []).length === 0 && (
            <div className="text-center p-8 text-muted-foreground text-sm">Không tìm thấy đại lý phù hợp.</div>
          )}
        </div>
      </motion.div>

      {/* MODAL XÁC NHẬN CHUYỂN DỰ TOÁN */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[90%] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Chuyển Dự Toán</DialogTitle>
            <DialogDescription>
              Hệ thống sẽ gửi bản vẽ và danh sách vật tư (BOM) của bạn đến đại lý <strong className="text-foreground">{selectedDealer?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2">
            <p className="text-sm text-orange-800">Đại lý sẽ liên hệ báo giá qua Zalo trong vòng 30 phút.</p>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button className="bg-[#F57C00] hover:bg-[#E65100] text-white" onClick={handleTransferBOM}>
              <Send className="w-4 h-4 mr-2" /> Gửi Chuyển Dự Toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── DEALER CARD COMPONENT ──────────────────────────────────────────────────

function DealerCard({ dealer, onTransfer }: { dealer: any, onTransfer: () => void }) {
  if (!dealer) return null;
  const isOpen = Math.random() > 0.2; // Mock state

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-base text-gray-900">{dealer.name}</h3>
        {dealer.distance !== undefined && (
          <Badge variant="secondary" className="bg-[#2D5A27]/10 text-[#2D5A27] border-0 text-xs">
            Cách {dealer.distance} km
          </Badge>
        )}
      </div>
      
      <p className="text-[13px] text-muted-foreground flex items-start gap-1.5 mb-3">
        <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> {dealer.address}
      </p>

      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-yellow-400'}`} />
        <span className="text-xs font-medium text-gray-600">{isOpen ? 'Đang mở cửa' : 'Sẵn sàng phục vụ'}</span>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 rounded-xl h-10 border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5"
          asChild
        >
          <a href={`tel:${dealer.phone}`}>
            <PhoneCall className="w-4 h-4 mr-1.5" /> Gọi ngay
          </a>
        </Button>
        
        <Button 
          className="flex-1 rounded-xl h-10 bg-[#F57C00] text-white hover:bg-[#E65100]"
          onClick={onTransfer}
        >
          <Send className="w-4 h-4 mr-1.5" /> Chuyển Dự Toán
        </Button>
      </div>
    </div>
  );
}
