"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { TrendingUp } from "lucide-react";

export default function PriceChartClient({
  cropSlug,
  cropName,
  historyData,
  currentPrice,
}: {
  cropSlug: string;
  cropName: string;
  historyData: any[];
  currentPrice: number;
}) {
  const chartData = useMemo(() => {
    // Nếu có dữ liệu DB thực thì dùng, không thì tự sinh dummy data dựa trên currentPrice (cho mục đích demo/phát triển)
    if (historyData && historyData.length > 0) {
      return historyData.map((h) => ({
        date: new Date(h.recordedAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' }),
        priceAvg: Number(h.priceAvg),
        priceMin: Number(h.priceMin),
        priceMax: Number(h.priceMax),
      }));
    }

    // Dummy data generation
    const dummy = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const fluctuation = (Math.random() - 0.5) * 0.1;
      const pAvg = Math.round(currentPrice * (1 + fluctuation));
      dummy.push({
        date: d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' }),
        priceAvg: pAvg,
        priceMin: Math.round(pAvg * 0.95),
        priceMax: Math.round(pAvg * 1.05),
      });
    }
    return dummy;
  }, [historyData, currentPrice]);

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="relative w-full">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Giá Trung Bình
        </span>
        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <span className="h-0 w-4 border-t-2 border-dashed border-emerald-300" />
          Thấp nhất
        </span>
        <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <span className="h-0 w-4 border-t-2 border-dashed border-orange-400" />
          Cao nhất
        </span>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPriceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              minTickGap={20}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                fontSize: "13px",
              }}
              labelStyle={{ fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  priceAvg: "Giá Trung Bình",
                  priceMin: "Thấp nhất",
                  priceMax: "Cao nhất",
                };
                return [formatPrice(value), labels[name] || name];
              }}
            />
            <Area
              type="monotone"
              dataKey="priceAvg"
              fill="url(#colorPriceGradient)"
              stroke="transparent"
            />
            <Line
              type="monotone"
              dataKey="priceAvg"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="priceMin"
              stroke="#6ee7b7"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="priceMax"
              stroke="#fb923c"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
