'use client';

import { useState, useEffect } from 'react';
import { MarketPrice, TankLevel, ValveState, WeatherData, PriceAlert } from './types';

export const useAgriData = () => {
  const [isAuto, setIsAuto] = useState(true);
  const [flowRate, setFlowRate] = useState(45);
  
  const valves: ValveState[] = [
    { id: 'v1', name: 'Valve 01 - Khu A', status: 'ON' },
    { id: 'v2', name: 'Valve 02 - Khu B', status: 'OFF' },
    { id: 'v3', name: 'Valve 03 - Khu C', status: 'WARNING' },
  ];

  const tanks: TankLevel[] = [
    { id: 'N', level: 85 },
    { id: 'P', level: 60 },
    { id: 'K', level: 12 }, // Low level triggers warning in UI
  ];

  const prices: MarketPrice[] = [
    { product: 'Cà phê (Robusta)', region: 'Đắk Lắk', price: 112500, change: 1.2, trend: [40, 45, 42, 48, 52, 50, 55] },
    { product: 'Hồ tiêu', region: 'Chư Sê', price: 95000, change: -0.5, trend: [60, 58, 59, 57, 55, 56, 54] },
    { product: 'Sầu riêng Ri6', region: 'Cần Thơ', price: 120000, change: 2.1, trend: [30, 35, 45, 40, 50, 60, 65] },
  ];

  const weather: WeatherData = {
    temp: 28,
    condition: 'Trời ít mây, nắng nhẹ',
    forecast: [
      { day: 'T2', temp: 28 },
      { day: 'T3', temp: 30 },
      { day: 'T4', temp: 31 },
      { day: 'T5', temp: 29 },
    ]
  };

  const alerts: PriceAlert[] = [
    { id: 'a1', crop: 'Coffee', threshold: 115, active: true },
    { id: 'a2', crop: 'Pepper', threshold: 100, active: false },
  ];

  const handleStartCycle = () => {
    console.log('N8n Workflow Triggered: start_irrigation_cycle');
    // Mock logic for flow rate change
    setFlowRate(85);
    setTimeout(() => setFlowRate(45), 3000);
  };

  return {
    valves,
    tanks,
    flowRate,
    isAuto,
    setIsAuto,
    prices,
    weather,
    alerts,
    handleStartCycle
  };
};
