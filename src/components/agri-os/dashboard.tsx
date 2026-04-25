'use client';

import React from 'react';
import { AgriSidebar } from './sidebar';
import { HydraulicSchematic } from './hydraulic-schematic';
import { MarketPrices } from './market-table';
import { WeatherWidget } from './weather-widget';
import { InstallerService } from './installer-service';
import { ContextualSelling } from './contextual-selling';
import { useAgriData } from './use-agri-data';
import { Bell, Search, Globe } from 'lucide-react';

export default function AgriOSDashboard() {
  const { 
    valves, 
    tanks, 
    flowRate, 
    isAuto, 
    setIsAuto, 
    prices, 
    weather, 
    alerts, 
    handleStartCycle 
  } = useAgriData();

  return (
    <div className="flex h-screen bg-[#F1F3F5] text-slate-900 font-sans">
      <AgriSidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tổng quan trang trại</h1>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm thiết bị, dữ liệu..." 
                className="bg-transparent text-xs border-none outline-none w-48 font-medium"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 relative text-slate-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4CAF50]/10 text-[#4CAF50] border border-[#4CAF50]/20">
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold">VN - EN</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Center Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 2A: Hydraulic Engine */}
              <HydraulicSchematic 
                valves={valves} 
                tanks={tanks} 
                flowRate={flowRate} 
                isAuto={isAuto}
                onToggleMode={setIsAuto}
                onStartCycle={handleStartCycle}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2D: Installer */}
                <InstallerService />
                {/* 2E: Contextual Selling */}
                <ContextualSelling />
              </div>
            </div>

            {/* Right Column (1/3 width) */}
            <div className="space-y-6">
              {/* 2B: Market Prices */}
              <MarketPrices prices={prices} aiInsight="Tăng nhẹ do cung hụt toàn cầu (Brazil ảnh hưởng sương muối)." />
              
              {/* 2C: Weather & Alerts */}
              <WeatherWidget weather={weather} alerts={alerts} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
