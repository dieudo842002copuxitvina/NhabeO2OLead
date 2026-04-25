'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  CloudSun, 
  Cpu, 
  Database, 
  Settings, 
  ChevronRight,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, title: 'Bảng điều khiển', active: true },
  { icon: BarChart3, title: 'Thị trường', active: false },
  { icon: CloudSun, title: 'Thời tiết', active: false },
  { icon: Cpu, title: 'Thiết bị', active: false },
  { icon: Database, title: 'Dữ liệu', active: false },
  { icon: Settings, title: 'Cài đặt', active: false },
];

export const AgriSidebar: React.FC = () => {
  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-400 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#4CAF50] flex items-center justify-center text-white">
          <Cpu className="w-5 h-5" />
        </div>
        <span className="font-black text-white tracking-tighter text-xl">AGRI-OS</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item, idx) => (
          <div 
            key={idx}
            className={cn(
              "flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
              item.active 
                ? "bg-white/10 text-white shadow-sm" 
                : "hover:bg-white/5 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("w-5 h-5", item.active ? "text-[#4CAF50]" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="text-sm font-semibold">{item.title}</span>
            </div>
            {item.active && <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Admin User</p>
            <p className="text-[10px] text-slate-500">Premium Plan</p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto text-slate-600" />
        </div>
      </div>
    </div>
  );
};
