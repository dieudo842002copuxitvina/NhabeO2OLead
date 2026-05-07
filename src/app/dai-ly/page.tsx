"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Phone,
  Search,
  CheckCircle2,
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

// --- Type: Dealer from real DB columns ---
type Dealer = {
  id: string;
  name: string;
  province: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  slug: string | null;
  cover_image: string | null;
  is_active: boolean;
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
        .from("dealers")
        .select("id, name, province, district, address, phone, email, latitude, longitude, slug, cover_image, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });
      
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
      distance: userLocation && d.latitude && d.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, d.latitude, d.longitude)
        : null
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
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A]">
      <SeoMeta 
        title="Mạng lưới Đại lý AgriFlow - Geo Matching"
        description="Tìm kiếm đại lý Nhà Bè Agri gần bạn nhất bằng công nghệ GPS. Hỗ trợ lắp đặt và cung ứng vật tư nông nghiệp."
      />

      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        
        {/* Left Panel: List */}
        <div className="w-full lg:w-[450px] flex flex-col border-r border-white/10 bg-white/40 backdrop-blur-xl z-20">
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
                  <Link href={`/dai-ly/${dealer.slug || dealer.id}`} className="block group">
                    <Card className="bg-white/5 border-white/5 hover:border-emerald-500/30 transition-all overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-xl bg-emerald-900/50 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                            {dealer.cover_image ? (
                              <img 
                                src={dealer.cover_image}
                                alt={dealer.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="text-2xl">🌾</div>
                            )}
                            {dealer.distance != null && (
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
                              <MapPin className="w-3 h-3" /> {dealer.province || "Việt Nam"}
                            </p>
                            
                            <div className="flex gap-2">
                              {dealer.phone && (
                                <a href={`tel:${dealer.phone}`} onClick={e => e.stopPropagation()}>
                                  <Button size="sm" variant="outline" className="h-8 flex-grow border-white/10 text-xs hover:bg-white/10">
                                    <Phone className="w-3 h-3 mr-1" /> Gọi
                                  </Button>
                                </a>
                              )}
                              <Button size="sm" className="h-8 flex-grow bg-emerald-500 hover:bg-emerald-600 text-xs">
                                <ChevronRight className="w-3 h-3 mr-1" /> Xem
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
              d.latitude && d.longitude ? (
              <Marker key={d.id} position={[d.latitude, d.longitude]}>
                <Popup>
                  <div className="p-2 text-slate-900">
                    <h4 className="font-bold">{d.name}</h4>
                    <p className="text-xs">{d.address || d.province}</p>
                  </div>
                </Popup>
              </Marker>
              ) : null
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
