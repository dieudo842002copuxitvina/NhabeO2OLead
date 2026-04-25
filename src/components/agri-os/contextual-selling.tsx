'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export const ContextualSelling: React.FC = () => {
  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-[#1a2e1b] to-[#2d4a2e] text-white overflow-hidden relative min-h-[220px]">
      <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center" />
      <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] text-[10px] font-bold border border-[#4CAF50]/30 mb-3">
            <TrendingUp className="w-3 h-3" /> CƠ HỘI NÂNG CẤP VƯỜN
          </div>
          <h3 className="text-xl font-bold leading-tight mb-2">
            Năm nay trúng mùa! <br />
            Đầu tư hệ thống tưới bù áp.
          </h3>
          <p className="text-sm text-slate-300 font-medium max-w-[200px]">
            Tăng năng suất 20% với công nghệ tự động hóa từ Nhà Bè Agri.
          </p>
        </div>
        
        <Button className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold gap-2 mt-6">
          LIÊN HỆ ĐẠI LÝ GẦN NHẤT
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
