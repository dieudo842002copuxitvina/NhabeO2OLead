"use client";

import { useMemo, useState } from "react";

type CropKey = "sau-rieng" | "ca-phe" | "mac-ca";
type PackageKey = "silver" | "gold" | "diamond";

const CROP_OPTIONS: { value: CropKey; label: string }[] = [
  { value: "sau-rieng", label: "Sau Rieng" },
  { value: "ca-phe", label: "Ca Phe" },
  { value: "mac-ca", label: "Mac Ca" },
];

const PACKAGE_OPTIONS: { value: PackageKey; label: string }[] = [
  { value: "silver", label: "Khoi Tao" },
  { value: "gold", label: "Ban Tu Dong" },
  { value: "diamond", label: "Thong Minh" },
];

const CROP_FACTORS: Record<CropKey, { setupPerHa: number; opsPerHaYear: number; revenuePerHaFromYear4: number }> = {
  "sau-rieng": { setupPerHa: 205_000_000, opsPerHaYear: 35_000_000, revenuePerHaFromYear4: 250_000_000 },
  "ca-phe": { setupPerHa: 145_000_000, opsPerHaYear: 28_000_000, revenuePerHaFromYear4: 170_000_000 },
  "mac-ca": { setupPerHa: 185_000_000, opsPerHaYear: 32_000_000, revenuePerHaFromYear4: 220_000_000 },
};

const PACKAGE_FACTORS: Record<PackageKey, { setupMultiplier: number; opsMultiplier: number; revenueBoost: number }> = {
  silver: { setupMultiplier: 1, opsMultiplier: 1, revenueBoost: 1 },
  gold: { setupMultiplier: 1.18, opsMultiplier: 0.9, revenueBoost: 1.12 },
  diamond: { setupMultiplier: 1.42, opsMultiplier: 0.82, revenueBoost: 1.2 },
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(value));

export default function ROICalculator() {
  const [crop, setCrop] = useState<CropKey>("sau-rieng");
  const [areaHa, setAreaHa] = useState<number>(1);
  const [pkg, setPkg] = useState<PackageKey>("gold");

  const projection = useMemo(() => {
    const area = Math.max(0.1, areaHa || 0.1);
    const cropBase = CROP_FACTORS[crop];
    const packageBase = PACKAGE_FACTORS[pkg];

    const setupCostYear1 = area * cropBase.setupPerHa * packageBase.setupMultiplier;
    const operationCostYear2to3 = area * cropBase.opsPerHaYear * packageBase.opsMultiplier;
    const projectedRevenueFromYear4 = area * cropBase.revenuePerHaFromYear4 * packageBase.revenueBoost;

    const netYearlyFromYear4 = projectedRevenueFromYear4 - operationCostYear2to3;
    const breakEvenYears =
      netYearlyFromYear4 > 0 ? Math.max(1, Number((setupCostYear1 / netYearlyFromYear4).toFixed(1))) : 0;

    return {
      setupCostYear1,
      operationCostYear2to3,
      projectedRevenueFromYear4,
      breakEvenYears,
    };
  }, [areaHa, crop, pkg]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold text-emerald-950">May Tinh Du Phong Dau Tu Nong Trai</h3>

            <div className="space-y-1.5">
              <label htmlFor="roi-crop" className="text-sm font-semibold text-emerald-900">
                Loai cay trong
              </label>
              <select
                id="roi-crop"
                value={crop}
                onChange={(event) => setCrop(event.target.value as CropKey)}
                className="h-11 w-full rounded-xl border border-emerald-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {CROP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="roi-area" className="text-sm font-semibold text-emerald-900">
                Dien tich (Hecta)
              </label>
              <input
                id="roi-area"
                type="number"
                min={0.1}
                step={0.1}
                value={areaHa}
                onChange={(event) => setAreaHa(Number(event.target.value))}
                className="h-11 w-full rounded-xl border border-emerald-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="roi-package" className="text-sm font-semibold text-emerald-900">
                Goi dich vu
              </label>
              <select
                id="roi-package"
                value={pkg}
                onChange={(event) => setPkg(event.target.value as PackageKey)}
                className="h-11 w-full rounded-xl border border-emerald-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {PACKAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100 sm:p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
                <span className="text-sm font-medium text-gray-600">Chi phi kien thiet (Nam 1)</span>
                <span className="text-right text-xl font-extrabold text-emerald-900">{formatVnd(projection.setupCostYear1)}</span>
              </div>
              <p className="-mt-1 border-b border-gray-100 pb-3 text-xs italic text-gray-500">
                Bao gom: Vat tu he thong tuoi, giong cay trong, nhan cong dao ho va phan bon lot nam dau.
              </p>
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
                <span className="text-sm font-medium text-gray-600">Phi duy tri van hanh (Nam 2 - 3)</span>
                <span className="text-right text-xl font-extrabold text-emerald-900">
                  {formatVnd(projection.operationCostYear2to3)}/nam
                </span>
              </div>
              <p className="-mt-1 border-b border-gray-100 pb-3 text-xs italic text-gray-500">
                Bao gom: Chi phi dien/nuoc, phan bon dinh ky, dich vu drone xit thuoc va nhan cong phat co, tia canh.
              </p>
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
                <span className="text-sm font-medium text-gray-600">Du phong Doanh thu (Tu Nam 4)</span>
                <span className="text-right text-xl font-extrabold text-emerald-900">
                  {formatVnd(projection.projectedRevenueFromYear4)}/nam
                </span>
              </div>
              <p className="-mt-1 border-b border-gray-100 pb-3 text-xs italic text-gray-500">
                Tinh toan dua tren nang suat trung binh 15-20kg/cay (nam 4) va gia thi truong trung binh cua 5 nam gan nhat.
              </p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-600">Diem hoa von du kien</span>
                <span className="text-right text-2xl font-extrabold text-emerald-900">
                  {projection.breakEvenYears > 0 ? `${projection.breakEvenYears} nam` : "Dang cap nhat"}
                </span>
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              Day la bang du toan tham khao. De co ban ve boc tach BOM chinh xac den tung met ong, vui long lien he
              doi ngu ky su.
            </p>

            <a
              href="https://zalo.me/YOUR_ZALO_OA"
              target="_blank"
              rel="noopener noreferrer"
              data-tracking="last-click"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#0068FF] px-4 text-sm font-extrabold text-white transition hover:bg-[#0058e6]"
            >
              XUAT BAO CAO CHI TIET TOI ZALO
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
