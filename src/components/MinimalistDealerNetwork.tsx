"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, MapPin, Navigation, ArrowRight, ShieldCheck, Building2, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import { dealersData, Dealer } from '@/data/dealersData';
import Link from 'next/link';

// --- Dynamic Imports for Leaflet ---
// We use a local state to ensure these are only used on the client
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, useMap: any, L: any;

if (typeof window !== 'undefined') {
  const RL = require('react-leaflet');
  MapContainer = RL.MapContainer;
  TileLayer = RL.TileLayer;
  Marker = RL.Marker;
  Popup = RL.Popup;
  useMap = RL.useMap;
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
}

// --- Map Logic ---
const CARTO_VOYAGER = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setView(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MinimalistDealerNetwork() {
  const { profile } = useFarmerProfile();
  const [hoveredDealerId, setHoveredDealerId] = useState<string | null>(null);
  const [mapConfig, setMapConfig] = useState({ center: [10.8231, 106.6297] as [number, number], zoom: 11 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Geo-routing: Closest dealers first
  const sortedDealers = useMemo(() => {
    const userLat = 10.8231; // Mock or from profile if available
    const userLng = 106.6297;

    return [...dealersData].sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.lat - userLat, 2) + Math.pow(a.lng - userLng, 2));
      const distB = Math.sqrt(Math.pow(b.lat - userLat, 2) + Math.pow(b.lng - userLng, 2));
      return distA - distB;
    }).slice(0, 5);
  }, []);

  const icons = useMemo(() => {
    if (!isClient || !L) return {};
    const createIcon = (color: string) => L.divIcon({
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
      className: '',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
    return {
      'head-office': createIcon('#F59E0B'),
      'branch': createIcon('#3B82F6'),
      'dealer': createIcon('#2D5A27'),
    };
  }, [isClient]);

  const handleCardHover = (dealer: Dealer) => {
    setHoveredDealerId(dealer.id);
    setMapConfig({ center: [dealer.lat, dealer.lng], zoom: 13 });
  };

  const getPrimaryService = (dealer: Dealer) => {
    if (dealer.type === 'head-office') return "Tổng kho Miền Nam";
    if (dealer.province.includes('Gia Lai') || dealer.province.includes('Lâm Đồng')) return "Tưới đồi dốc";
    if (dealer.province.includes('Đồng Nai')) return "Tưới Cao su & Điều";
    return "Tư vấn Kỹ thuật";
  };

  if (!isClient) return <div className="h-[600px] bg-slate-100 animate-pulse rounded-[2.5rem]" />;

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-10 h-[600px]">
        
        {/* LEFT: MAP (60%) */}
        <div className="hidden lg:block lg:col-span-6 relative border-r border-slate-100">
          <MapContainer 
            center={mapConfig.center} 
            zoom={mapConfig.zoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer url={CARTO_VOYAGER} />
            <MapController center={mapConfig.center} zoom={mapConfig.zoom} />
            {dealersData.map(d => (
              <Marker 
                key={d.id} 
                position={[d.lat, d.lng]} 
                icon={icons[d.type] || icons.dealer}
                eventHandlers={{
                  mouseover: () => setHoveredDealerId(d.id),
                  mouseout: () => setHoveredDealerId(null),
                }}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-slate-800 text-xs">{d.name}</p>
                    <p className="text-[10px] text-slate-500">{d.district}, {d.province}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* RIGHT: LIST (40%) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col bg-slate-50/30">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#2D5A27]" /> 
              Đại lý gần rẫy của bạn
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-100/50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LIVE
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {sortedDealers.map(dealer => {
              const isHovered = hoveredDealerId === dealer.id;
              const primaryService = getPrimaryService(dealer);
              
              return (
                <motion.div
                  key={dealer.id}
                  onMouseEnter={() => handleCardHover(dealer)}
                  onMouseLeave={() => setHoveredDealerId(null)}
                  className={`p-4 rounded-3xl border transition-all duration-300 cursor-pointer ${
                    isHovered 
                      ? 'bg-white border-[#2D5A27] shadow-lg -translate-y-1' 
                      : 'bg-white/60 border-transparent hover:bg-white/80'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{dealer.name}</h4>
                        <Badge variant="outline" className="text-[9px] py-0 h-4 border-slate-200 text-slate-400 font-normal">
                          {dealer.type === 'head-office' ? 'Tổng kho' : 'Đại lý'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {dealer.district}, {dealer.province}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#2D5A27] uppercase">{Math.floor(Math.random() * 20 + 5)}km</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-50 text-[#2D5A27] text-[9px] px-2 py-0.5 rounded-full border border-green-100 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> {primaryService}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" /> Sẵn sàng tư vấn
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      className="h-9 bg-[#2D5A27] hover:bg-[#1f421b] text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1.5" /> Gọi ngay
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-9 border-blue-200 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Chat Zalo
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white/50">
            <Link href="/dai-ly">
              <Button variant="ghost" className="w-full text-slate-500 hover:text-[#2D5A27] text-xs font-bold group">
                Xem tất cả 25+ đại lý toàn quốc
                <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
