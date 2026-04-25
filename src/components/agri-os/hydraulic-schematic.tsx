'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Activity, AlertCircle } from 'lucide-react';
import { TankLevel, ValveState } from './types';

interface HydraulicSchematicProps {
  valves: ValveState[];
  tanks: TankLevel[];
  flowRate: number;
  isAuto: boolean;
  onToggleMode: (val: boolean) => void;
  onStartCycle: () => void;
}

export const HydraulicSchematic: React.FC<HydraulicSchematicProps> = ({
  valves,
  tanks,
  flowRate,
  isAuto,
  onToggleMode,
  onStartCycle,
}) => {
  return (
    <Card className="col-span-full lg:col-span-2 border-slate-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-sm font-medium text-slate-600 uppercase tracking-wider">
          SƠ ĐỒ HỆ THỐNG THỦY LỰC (HYDRAULIC ENGINE)
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">CHẾ ĐỘ TỰ ĐỘNG</span>
            <Switch checked={isAuto} onCheckedChange={onToggleMode} />
          </div>
          <Button 
            size="sm" 
            className="bg-[#4CAF50] hover:bg-[#43A047] text-white gap-2 px-4 shadow-sm"
            onClick={onStartCycle}
          >
            <Play className="w-4 h-4 fill-current" />
            BẮT ĐẦU CHU KỲ
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Schematic SVG Container */}
          <div className="md:col-span-3 relative bg-slate-50 rounded-xl border border-slate-100 p-4 min-h-[300px] flex items-center justify-center">
            <svg viewBox="0 0 600 300" className="w-full h-full max-w-2xl">
              {/* Main Pipe */}
              <rect x="50" y="145" width="500" height="10" rx="5" fill="#E2E8F0" />
              {/* Active Flow Animation */}
              {flowRate > 0 && (
                <motion.rect
                  x="50" y="147" width="500" height="6" rx="3"
                  fill="#4CAF50"
                  initial={{ width: 0 }}
                  animate={{ width: 500 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}

              {/* Valves */}
              {valves.map((valve, idx) => {
                const x = 100 + idx * 150;
                const statusColor = valve.status === 'ON' ? '#2196F3' : valve.status === 'WARNING' ? '#FF9800' : '#94A3B8';
                
                return (
                  <g key={valve.id} transform={`translate(${x}, 120)`}>
                    <circle cx="0" cy="30" r="15" fill="white" stroke="#E2E8F0" strokeWidth="2" />
                    <motion.circle 
                      cx="0" cy="30" r="6" 
                      fill={statusColor}
                      animate={valve.status === 'ON' ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <text y="-10" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 uppercase">
                      {valve.name}
                    </text>
                  </g>
                );
              })}

              {/* Flow Meter */}
              <g transform="translate(500, 80)">
                <circle cx="0" cy="0" r="40" fill="white" stroke="#E2E8F0" strokeWidth="2" />
                <path d="M -30 0 A 30 30 0 0 1 30 0" fill="none" stroke="#F1F3F5" strokeWidth="8" strokeLinecap="round" />
                <motion.path 
                  d="M -30 0 A 30 30 0 0 1 30 0" 
                  fill="none" 
                  stroke="#2196F3" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: flowRate / 100 }}
                />
                <text y="20" textAnchor="middle" className="text-xs font-bold fill-slate-700">{flowRate} m³/h</text>
                <text y="-5" textAnchor="middle" className="text-[8px] fill-slate-400 font-bold uppercase">FLOW RATE</text>
              </g>
            </svg>
            
            {/* Legend/Status */}
            <div className="absolute bottom-4 left-4 flex gap-3">
              <Badge variant="outline" className="bg-white gap-1.5 text-[10px] py-1 border-slate-200">
                <div className="w-2 h-2 rounded-full bg-[#2196F3]" /> ĐANG MỞ
              </Badge>
              <Badge variant="outline" className="bg-white gap-1.5 text-[10px] py-1 border-slate-200">
                <div className="w-2 h-2 rounded-full bg-[#FF9800]" /> CẢNH BÁO
              </Badge>
              <Badge variant="outline" className="bg-white gap-1.5 text-[10px] py-1 border-slate-200">
                <div className="w-2 h-2 rounded-full bg-[#94A3B8]" /> ĐANG ĐÓNG
              </Badge>
            </div>
          </div>

          {/* Tank Levels */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">NỒNG ĐỘ DINH DƯỠNG</h4>
            {tanks.map((tank) => (
              <div key={tank.id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-700">Bể {tank.id}</span>
                  <span className="text-xs font-medium text-slate-500">{tank.level}%</span>
                </div>
                <Progress value={tank.level} className="h-2 bg-slate-100" indicatorClassName={tank.id === 'N' ? 'bg-[#4CAF50]' : tank.id === 'P' ? 'bg-[#2196F3]' : 'bg-[#FF9800]'} />
              </div>
            ))}
            
            <div className="pt-4 mt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[#FF9800] bg-orange-50 p-3 rounded-lg border border-orange-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-[10px] font-medium leading-tight">
                  Lưu ý: Bể K đang ở mức thấp. Vui lòng kiểm tra nạp liệu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
