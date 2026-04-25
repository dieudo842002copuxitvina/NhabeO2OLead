'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { MarketPrice } from './types';

interface MarketPricesProps {
  prices: MarketPrice[];
  aiInsight: string;
}

const Sparkline = ({ data, isUp }: { data: number[]; isUp: boolean }) => {
  const chartData = data.map((v, i) => ({ value: v, id: i }));
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={isUp ? '#4CAF50' : '#EF4444'} 
            strokeWidth={2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MarketPrices: React.FC<MarketPricesProps> = ({ prices, aiInsight }) => {
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-3 border-b border-slate-50">
        <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
          BẢNG GIÁ TỨC THỜI (Tây Nguyên)
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-none hover:bg-slate-50/50">
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase h-10">Sản phẩm</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase h-10">Khu vực</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase h-10 text-right">Giá</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase h-10">Biến động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.map((item, idx) => {
              const isUp = item.change >= 0;
              return (
                <TableRow key={idx} className="border-slate-50 hover:bg-slate-50/30">
                  <TableCell className="font-bold text-slate-700 py-3">{item.product}</TableCell>
                  <TableCell className="text-slate-500 text-xs py-3">{item.region}</TableCell>
                  <TableCell className="text-right py-3">
                    <div className="font-bold text-slate-900">{item.price.toLocaleString()}đ</div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Sparkline data={item.trend} isUp={isUp} />
                      <div className={`flex items-center gap-1 text-[10px] font-bold ${isUp ? 'text-[#4CAF50]' : 'text-red-500'}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(item.change)}%
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="p-4 bg-slate-50/80 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#2196F3] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-[#2196F3]">Dự báo AI:</span> {aiInsight}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
