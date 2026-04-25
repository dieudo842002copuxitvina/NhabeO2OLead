"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageCircle, BadgeCheck, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface DealerInfo {
  id: string;
  name: string;
  province: string;
  district: string;
  phone: string;
}

interface InventoryItem {
  stock_quantity: number;
  dealers: DealerInfo | null;
}

interface Props {
  productId?: string;
}

export default function NearbyDealersModule({ productId }: Props) {
  const [showDealers, setShowDealers] = useState(false);
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showDealers && productId && dealers.length === 0) {
      fetchInventory();
    }
  }, [showDealers, productId]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Logic fetch dữ liệu từ bảng 'inventory' để chỉ hiển thị các đại lý có stock_quantity > 0
      // Giả định bảng inventory có quan hệ với bảng dealers
      const { data, error } = await supabase
        .from('inventory' as any)
        .select(`
          stock_quantity,
          dealers:dealer_id (
            id,
            name,
            province,
            district,
            phone
          )
        `)
        .eq('product_id', productId)
        .gt('stock_quantity', 0);

      if (error) throw error;

      if (data) {
        const formattedDealers = data.map((item: any) => ({
          id: item.dealers.id,
          name: item.dealers.name,
          distance: (Math.random() * 10 + 1).toFixed(1) + 'km', // Mock distance vì chưa có GPS
          status: item.stock_quantity > 5 ? 'in_stock' : 'low_stock',
          phone: item.dealers.phone || '0983230879',
          province: item.dealers.province,
          district: item.dealers.district
        }));
        setDealers(formattedDealers);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      // Fallback hoặc báo lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Button
        onClick={() => setShowDealers(!showDealers)}
        className="w-full h-16 rounded-2xl bg-[#2D5A27] hover:bg-[#1f3f1b] text-white font-bold text-lg shadow-lg shadow-green-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <MapPin className={`w-6 h-6 transition-transform duration-300 ${showDealers ? 'rotate-12' : ''}`} />
        <span>Hiển thị Đại lý có sẵn hàng gần bạn</span>
      </Button>

      <AnimatePresence>
        {showDealers && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden space-y-3"
          >
            {loading ? (
              <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium">Đang tìm đại lý gần nhất...</p>
              </div>
            ) : dealers.length > 0 ? (
              dealers.map((dealer) => (
                <motion.div
                  key={dealer.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative group p-5 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl ring-1 ring-black/5 overflow-hidden transition-all hover:border-[#2D5A27]/30"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
                        {dealer.name} <BadgeCheck className="w-4 h-4 text-blue-500" />
                      </h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {dealer.district}, {dealer.province} ({dealer.distance})
                      </p>
                    </div>
                    
                    <div className="text-right">
                      {dealer.status === 'in_stock' ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200/50 hover:bg-green-100 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                          Còn hàng
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200/50 hover:bg-orange-100 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 mr-1" /> Sắp hết hàng
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 relative z-10">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white hover:border-[#2D5A27] text-slate-700 font-bold text-xs transition-all active:scale-95"
                      asChild
                    >
                      <a href={`tel:${dealer.phone}`}>
                        <Phone className="w-3.5 h-3.5 mr-2 text-[#2D5A27]" /> Gọi điện
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-11 rounded-xl border-blue-100 bg-blue-50/50 backdrop-blur-sm hover:bg-blue-50 hover:border-blue-300 text-blue-600 font-bold text-xs transition-all active:scale-95"
                      asChild
                    >
                      <a
                        href={`https://zalo.me/${dealer.phone}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-2" /> Chat Zalo
                      </a>
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center bg-white/50">
                <p className="text-sm text-slate-500">Hiện không có đại lý nào có sẵn hàng này trong khu vực của bạn.</p>
                <Button variant="link" className="text-[#2D5A27] font-bold mt-2">Liên hệ Hotline hỗ trợ</Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
