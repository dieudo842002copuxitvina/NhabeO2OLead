'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CloudSun, Thermometer, Wind, Bell } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { WeatherData, PriceAlert } from './types';

interface WeatherWidgetProps {
  weather: WeatherData;
  alerts: PriceAlert[];
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, alerts }) => {
  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-[#2196F3] p-6 text-white flex justify-between items-center">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">THỜI TIẾT HIỆN TẠI</p>
              <h3 className="text-4xl font-bold mt-1">{weather.temp}°C</h3>
              <p className="text-sm font-medium mt-1 flex items-center gap-2">
                <CloudSun className="w-4 h-4" /> {weather.condition}
              </p>
            </div>
            <CloudSun className="w-16 h-16 opacity-20" />
          </div>
          <div className="p-4 bg-white">
            <div className="flex justify-around mb-6 text-slate-500">
              <div className="text-center">
                <Wind className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                <p className="text-[10px] font-bold">GIÓ</p>
                <p className="text-xs font-bold text-slate-700">12 km/h</p>
              </div>
              <div className="text-center">
                <Thermometer className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                <p className="text-[10px] font-bold">ĐỘ ẨM</p>
                <p className="text-xs font-bold text-slate-700">65%</p>
              </div>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weather.forecast}>
                  <Line type="monotone" dataKey="temp" stroke="#2196F3" strokeWidth={2} dot={{ r: 3, fill: '#2196F3' }} />
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 px-1">
              {weather.forecast.map((f, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-[10px] font-bold text-slate-400">{f.day}</p>
                  <p className="text-[10px] font-bold text-slate-700">{f.temp}°C</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" /> AI PRICE ALERTS
          </h4>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-700">{alert.crop} &gt; {alert.threshold}k</span>
                <div className={`w-2 h-2 rounded-full ${alert.active ? 'bg-[#4CAF50]' : 'bg-slate-300'}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
