'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export const InstallerService: React.FC = () => {
  return (
    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-50">
        <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
          DỊCH VỤ LẮP ĐẶT (INSTALLER)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-32 bg-slate-100 relative group cursor-pointer">
          {/* Simplified Map Background */}
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/108.2,13.0,10,0/400x200?access_token=placeholder')] bg-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#2196F3]/20 rounded-full animate-ping" />
              <MapPin className="w-8 h-8 text-[#2196F3] relative z-10" />
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#4CAF50]/30 transition-colors cursor-pointer group">
            <LogIn className="w-5 h-5 text-slate-400 group-hover:text-[#4CAF50] mb-1" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">CHECK-IN</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-red-200 transition-colors cursor-pointer group">
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 mb-1" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">CHECK-OUT</span>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 text-[#4CAF50] border border-green-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Kỹ thuật viên: Nguyễn Văn A (Đang tại vườn)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
