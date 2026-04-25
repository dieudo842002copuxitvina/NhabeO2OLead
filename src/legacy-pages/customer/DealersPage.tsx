import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, CheckCircle2, ShieldCheck, Building2, Store, Search, Navigation, Droplets, Mountain, Smartphone, Plane, Zap } from 'lucide-react';
import { dealersData, Dealer } from '@/data/dealersData';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Default Icon issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom markers
const customMarkerHtml = (color: string) => `
  <div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
  </div>
`;

const createIcon = (color: string) => L.divIcon({
  className: 'custom-leaflet-marker',
  html: customMarkerHtml(color),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const hqIcon = createIcon('#F59E0B'); // amber-500
const branchIcon = createIcon('#3B82F6'); // blue-500
const dealerIcon = createIcon('#10B981'); // emerald-500

function MapCenter({ position }: { position: [number, number] }) {
  const map = useMap();
  map.setView(position, map.getZoom());
  return null;
}

function DealerCard({ dealer }: { dealer: Dealer }) {
  if (!dealer) return null;
  const typeConfig = {
    'head-office': { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: ShieldCheck, label: 'Tổng Kho Trung Tâm', border: 'border-amber-400' },
    'branch': { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Building2, label: 'Văn Phòng Đại Diện', border: 'border-blue-300' },
    'dealer': { color: 'text-[#2D5A27] bg-[#2D5A27]/5 border-[#2D5A27]/20', icon: Store, label: 'Đại Lý Ủy Quyền', border: 'border-slate-200' },
  };
  
  const config = typeConfig[dealer.type] || typeConfig['dealer'];
  const Icon = config.icon;

  const getRegionalServices = (dealer: Dealer) => {
    if (dealer.type === 'head-office') return [
      { label: "Phân phối sỉ toàn quốc", icon: ShieldCheck },
      { label: "Hỗ trợ dự án lớn", icon: Building2 },
      { label: "Đào tạo kỹ thuật", icon: CheckCircle2 }
    ];
    if (dealer.type === 'branch') return [
      { label: "Trạm bảo hành ủy quyền", icon: ShieldCheck },
      { label: "Thiết kế bản vẽ 2D/3D", icon: CheckCircle2 }
    ];

    const province = dealer.province;
    if (["Gia Lai", "Đắk Lắk", "Lâm Đồng", "Đắk Nông"].includes(province)) return [
      { label: "Chuyên tưới địa hình dốc", icon: Mountain },
      { label: "Giải pháp Cà phê & Tiêu", icon: Droplets },
      { label: "Lắp đặt béc bù áp", icon: CheckCircle2 }
    ];
    if (["Đồng Nai", "Bình Phước", "Tây Ninh"].includes(province)) return [
      { label: "Tự động hóa nhà màng", icon: Smartphone },
      { label: "Tưới Cao su & Điều", icon: Droplets },
      { label: "Trạm bơm công suất lớn", icon: Zap }
    ];
    if (["Đồng Tháp", "Bến Tre", "Tiền Giang", "Long An"].includes(province)) return [
      { label: "Tưới tiết kiệm ngăn mặn", icon: Droplets },
      { label: "Tưới cây ăn trái", icon: CheckCircle2 },
      { label: "Điều khiển Smartphone", icon: Smartphone }
    ];
    if (["Bình Thuận", "Ninh Thuận", "Phú Yên", "Khánh Hòa"].includes(province)) return [
      { label: "Tưới vùng khô hạn", icon: Droplets },
      { label: "Thiết bị tưới Thanh Long", icon: CheckCircle2 },
      { label: "Phun thuốc bằng Drone", icon: Plane }
    ];
    return (dealer.services || []).map(s => ({ label: s, icon: CheckCircle2 }));
  };

  const services = getRegionalServices(dealer);

  return (
    <Card className={`mb-4 overflow-hidden border-2 transition-all hover:shadow-lg ${config.border} bg-white/80 backdrop-blur-md`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={`font-semibold flex items-center gap-1 ${config.color}`}>
                <Icon className="w-3.5 h-3.5" /> {config.label}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-[#2D5A27] font-medium bg-[#2D5A27]/10 px-2.5 py-0.5 rounded-full border border-[#2D5A27]/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                </span>
                Sẵn sàng tư vấn
              </div>
            </div>
            <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{dealer?.name || 'Đại lý'}</h3>
            <p className="text-sm text-slate-500 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{(dealer?.address || '')}, {(dealer?.district || '')}, {(dealer?.province || '')}</span>
            </p>
          </div>
        </div>

        {/* Services Chips */}
        {(services || []).length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {(services || []).map((service, idx) => (
              <span key={idx} className="flex items-center gap-1.5 bg-green-50 text-green-700 text-[10px] px-2 py-1 rounded-md border border-green-100 font-bold uppercase tracking-wider">
                <service.icon className="w-3 h-3" /> {service.label}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button className="flex-1 bg-[#2D5A27] hover:bg-[#1f421b] text-white rounded-xl h-11 font-semibold shadow-md">
            <Phone className="w-4 h-4 mr-2" /> Gọi ngay
          </Button>
          <Button variant="outline" className="flex-1 border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5 rounded-xl h-11 font-semibold">
            <Navigation className="w-4 h-4 mr-2" /> Chỉ đường
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DealersPage() {
  const { profile, isLoaded } = useFarmerProfile();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Logic Auto-Routing
  const sortedDealers = useMemo(() => {
    let filtered = dealersData;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = (filtered || []).filter(d => 
        (d.name || '').toLowerCase().includes(q) || 
        (d.province || '').toLowerCase().includes(q) ||
        (d.district || '').toLowerCase().includes(q)
      );
    }

    const userProvince = profile.provinceName || ''; // Empty defaults to HQ logic later
    
    // Sort logic
    return [...filtered].sort((a, b) => {
      // 1. Same province matches go to top
      const aProvMatch = a.province === userProvince ? 1 : 0;
      const bProvMatch = b.province === userProvince ? 1 : 0;
      if (aProvMatch !== bProvMatch) return bProvMatch - aProvMatch;

      // 2. HQ always floats if no province match (handled below visually, but keep sorted)
      return 0;
    });
  }, [profile.provinceName, searchQuery]);

  if (!isLoaded) return null;

  if (!dealersData || dealersData.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5A27] mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu mạng lưới...</p>
        </div>
      </div>
    );
  }

  const hasLocalDealer = (dealersData || []).some(d => d.province === profile.provinceName && !d.isHeadOffice);
  const showFallback = !hasLocalDealer && profile.provinceName && !searchQuery;

  // Map center
  let mapCenter: [number, number] = [10.762622, 106.660172]; // Default HCM
  if ((sortedDealers || []).length > 0 && sortedDealers[0]?.lat && sortedDealers[0]?.lng) {
    mapCenter = [sortedDealers[0].lat, sortedDealers[0].lng];
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-slate-50 relative">
      
      {/* MAP LAYER (Background on mobile, Left pane on desktop) */}
      <div className="absolute inset-0 z-0 md:relative md:w-[60%] md:h-full bg-slate-200">
        <MapContainer 
          center={mapCenter} 
          zoom={6} 
          className="w-full h-full min-h-[500px] lg:h-screen"
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapCenter position={mapCenter} />
          
          {(dealersData || []).map((dealer) => {
            if (!dealer?.lat || !dealer?.lng) return null;
            let icon = dealerIcon;
            if (dealer.type === 'head-office') icon = hqIcon;
            if (dealer.type === 'branch') icon = branchIcon;

            return (
              <Marker 
                key={dealer.id} 
                position={[dealer.lat, dealer.lng]}
                icon={icon}
              >
                <Popup className="rounded-xl">
                  <div className="p-1">
                    <p className="font-bold text-slate-800 mb-1">{dealer.name}</p>
                    <p className="text-xs text-slate-500">{dealer.address}, {dealer.province}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Header Glassmorphism */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 pointer-events-none md:max-w-md">
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-lg rounded-2xl p-4 pointer-events-auto">
            <h1 className="text-2xl font-bold text-slate-800 font-display">Mạng lưới Đại lý</h1>
            <p className="text-sm text-slate-500 mt-1">Tìm nhà phân phối gần bạn nhất</p>
          </div>
        </div>
      </div>

      {/* LIST LAYER (BottomSheet on mobile, Right pane on desktop) */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-40 h-[60vh] bg-slate-50/95 backdrop-blur-xl rounded-t-[2rem] border-t border-white/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:relative md:w-[40%] md:h-full md:rounded-none md:border-l md:shadow-[-10px_0_40px_rgba(0,0,0,0.05)] flex flex-col"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* Mobile Handle */}
        <div className="w-full flex justify-center py-4 md:hidden shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-16 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        <div className="px-5 pb-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Tìm đại lý theo tỉnh thành..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-white rounded-xl border-slate-200 focus-visible:ring-[#2D5A27] text-base"
            />
          </div>

          {showFallback && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 shadow-sm">
              <ShieldCheck className="w-6 h-6 shrink-0 text-amber-500" />
              <p className="text-sm text-amber-800 leading-relaxed">
                Khu vực <strong>{profile.provinceName}</strong> chưa có đại lý ủy quyền. <strong>Tổng kho Hồ Chí Minh</strong> sẽ trực tiếp hỗ trợ và giao hàng tận rẫy cho bạn!
              </p>
            </div>
          )}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar">
          {showFallback && !searchQuery && (
            <div className="mb-6 relative">
              <div className="absolute -left-5 -right-5 top-1/2 -translate-y-1/2 h-px bg-slate-200 -z-10" />
              <span className="bg-slate-50 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn vị xử lý mặc định</span>
              <div className="mt-4">
                {(dealersData || []).filter(d => d.isHeadOffice).map(dealer => (
                  <DealerCard key={dealer.id} dealer={dealer} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {(sortedDealers || [])
              .filter(d => showFallback && !searchQuery ? !d.isHeadOffice : true) // Hide HQ if already shown in fallback
              .map((dealer) => (
                <DealerCard key={dealer.id} dealer={dealer} />
            ))}
            
            {sortedDealers.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                Không tìm thấy đại lý nào phù hợp.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
