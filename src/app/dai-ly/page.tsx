"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Navigation, 
  Search, 
  Filter, 
  Star, 
  CheckCircle2,
  Clock,
  ArrowLeft,
  Radar,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import SeoMeta from "@/components/SeoMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// --- Helper: Haversine Formula ---
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type Dealer = {
  id: string;
  name: string;
  province: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  rating: number;
  status: string;
  image?: string;
  stock_status?: any;
};

export default function DaiLyPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Effects ---
  useEffect(() => {
    async function fetchDealers() {
      const { data, error } = await supabase
        .from("dealers" as any)
        .select("*");
      
      if (data) setDealers(data as unknown as Dealer[]);
      setLoading(false);
    }
    fetchDealers();

    // Get User GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Location error:", err)
      );
    }
  }, []);

  // --- Logic ---
  const filteredDealers = useMemo(() => {
    let result = dealers.map(d => ({
      ...d,
      distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, d.lat, d.lng) : null
    }));

    if (searchQuery) {
      result = result.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.province.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by distance if available
    if (userLocation) {
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return result;
  }, [dealers, searchQuery, userLocation]);

  return (
    <div className="min-h-screen bg-[#050a05] text-white">
      <SeoMeta 
        title="Mạng lưới Đại lý AgriFlow - Geo Matching"
        description="Tìm kiếm đại lý Nhà Bè Agri gần bạn nhất bằng công nghệ GPS. Hỗ trợ lắp đặt và cung ứng vật tư nông nghiệp."
      />

      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        
        {/* Left Panel: List */}
        <div className="w-full lg:w-[450px] flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl z-20">
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 text-sm mb-6 hover:text-emerald-300 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
            </Link>
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Radar className="w-6 h-6 text-emerald-400" /> Hệ thống Đại lý
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Tìm tên tỉnh thành hoặc đại lý..." 
                className="bg-white/5 border-white/10 pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="py-10 text-center text-slate-500 animate-pulse">Đang quét tìm đại lý gần nhất...</div>
            ) : filteredDealers.length === 0 ? (
              <div className="py-10 text-center text-slate-500">Không tìm thấy đại lý phù hợp.</div>
            ) : (
              filteredDealers.map((dealer, idx) => (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-white/5 border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl bg-white/10 overflow-hidden flex-shrink-0 relative">
                          <img 
                            src={dealer.image || "/placeholder.svg"} 
                            alt={dealer.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {dealer.distance && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md text-[10px] text-center py-0.5 text-emerald-400 font-bold">
                              {dealer.distance.toFixed(1)} km
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-white truncate text-sm">{dealer.name}</h3>
                            <Badge variant="outline" className="text-[10px] h-4 border-emerald-500/30 text-emerald-400">
                              Active
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mb-2 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {dealer.province}
                          </p>
                          <div className="flex items-center gap-1 mb-3">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold">{dealer.rating}</span>
                          </div>
                          
                          <div className="flex gap-2">
                             <Button size="sm" className="h-8 flex-grow bg-emerald-500 hover:bg-emerald-600 text-xs">
                               <MessageCircle className="w-3 h-3 mr-1" /> Zalo
                             </Button>
                             <Button size="sm" variant="outline" className="h-8 flex-grow border-white/10 text-xs">
                               <Phone className="w-3 h-3 mr-1" /> Gọi
                             </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-grow h-full relative z-10 bg-slate-900">
          {/* Radar Overlay Effect */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-emerald-500/20 rounded-full animate-ping opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-emerald-500/10 rounded-full animate-pulse opacity-10" />
          </div>

          <MapContainer 
            center={userLocation ? [userLocation.lat, userLocation.lng] : [10.8231, 106.6297]} 
            zoom={userLocation ? 10 : 6} 
            className="w-full h-full grayscale-[0.8] invert-[0.9] hue-rotate-[160deg]"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>Vị trí của bạn</Popup>
              </Marker>
            )}

            {filteredDealers.map(d => (
              <Marker key={d.id} position={[d.lat, d.lng]}>
                <Popup>
                  <div className="p-2 text-slate-900">
                    <h4 className="font-bold">{d.name}</h4>
                    <p className="text-xs">{d.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
