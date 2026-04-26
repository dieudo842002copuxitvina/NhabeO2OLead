"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, CircleDollarSign, Timer } from "lucide-react";

type DroneRoiCalculatorProps = {
  dronePrice: number;
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));

export default function DroneRoiCalculator({ dronePrice }: DroneRoiCalculatorProps) {
  const [areaHa, setAreaHa] = useState(10);
  const [laborCostPerHa, setLaborCostPerHa] = useState(900000);
  const [spraysPerYear, setSpraysPerYear] = useState(8);

  const result = useMemo(() => {
    const safeArea = Math.max(0, areaHa);
    const safeLabor = Math.max(0, laborCostPerHa);
    const safeSprays = Math.max(0, spraysPerYear);

    const traditionalLaborPerYear = safeArea * safeLabor * safeSprays;
    const traditionalChemicalPerYear = traditionalLaborPerYear; // Gia dinh baseline de uoc tinh nhanh.
    const laborSavings = traditionalLaborPerYear * 0.9;
    const chemicalSavings = traditionalChemicalPerYear * 0.3;
    const totalSavingsPerYear = laborSavings + chemicalSavings;
    const paybackMonths = totalSavingsPerYear > 0 ? (dronePrice / totalSavingsPerYear) * 12 : 0;

    return {
      totalSavingsPerYear,
      paybackMonths,
    };
  }, [areaHa, laborCostPerHa, spraysPerYear, dronePrice]);

  return (
    <section className="rounded-2xl border border-green-100 bg-green-50 p-5">
      <header className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 text-[#2F8E36]">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Du toan hieu qua dau tu Drone</h2>
          <p className="text-sm text-gray-600">Uoc tinh theo tiet kiem thuoc 30% va nhan cong 90%.</p>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Dien tich canh tac (ha)</span>
          <input
            type="number"
            min={0}
            value={areaHa}
            onChange={(e) => setAreaHa(Number(e.target.value) || 0)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 outline-none focus:border-[#4CAF50]"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Chi phi nhan cong truyen thong (d/ha)</span>
          <input
            type="number"
            min={0}
            value={laborCostPerHa}
            onChange={(e) => setLaborCostPerHa(Number(e.target.value) || 0)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 outline-none focus:border-[#4CAF50]"
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-gray-700">So lan xit thuoc trung binh / nam</span>
          <input
            type="number"
            min={0}
            value={spraysPerYear}
            onChange={(e) => setSpraysPerYear(Number(e.target.value) || 0)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-gray-900 outline-none focus:border-[#4CAF50]"
          />
        </label>
      </div>

      <motion.div
        key={`${result.totalSavingsPerYear}-${result.paybackMonths}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-4 grid gap-3 md:grid-cols-2"
      >
        <article className="rounded-xl border border-green-100 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <CircleDollarSign className="h-4 w-4 text-[#4CAF50]" />
            Tiet kiem uoc tinh moi nam
          </p>
          <p className="mt-2 text-2xl font-bold text-[#2F8E36]">{formatVnd(result.totalSavingsPerYear)}</p>
        </article>

        <article className="rounded-xl border border-green-100 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <Timer className="h-4 w-4 text-[#4CAF50]" />
            Thoi gian hoan von du kien
          </p>
          <p className="mt-2 text-2xl font-bold text-[#2F8E36]">{result.paybackMonths.toFixed(1)} thang</p>
        </article>
      </motion.div>
    </section>
  );
}
