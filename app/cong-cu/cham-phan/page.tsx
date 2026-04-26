"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Calculator, CircleGauge, Droplets, FlaskConical, Sparkles } from "lucide-react";
import InputWithSuffix from "./_components/InputWithSuffix";
import ResultRow from "./_components/ResultRow";
import { useFarmerProfile } from "./_hooks/useFarmerProfile";

const RECOMMENDED_ITEMS = [
  "Venturi 2 inch",
  "Bon pha 200L co khuay",
  "Cam bien EC/pH SP-200",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export default function ChamPhanPage() {
  const { areaHa, setAreaHa } = useFarmerProfile(1.2);
  const [flowM3h, setFlowM3h] = useState(18);
  const [targetEc, setTargetEc] = useState(1.6);

  const results = useMemo(() => {
    const safeArea = Math.max(0, areaHa);
    const safeFlow = Math.max(0.1, flowM3h);
    const safeEc = clamp(targetEc, 0.5, 3.5);

    const irrigationDurationH = clamp((safeArea * 7.5) / safeFlow, 0.8, 8);
    const fertilizerKg = round2(safeArea * safeEc * 17.5);
    const motherL = round2(fertilizerKg / 0.24);
    const venturiLh = round2(motherL / irrigationDurationH);
    const ratio = round2((safeFlow * 1000) / Math.max(venturiLh, 0.01));

    return {
      fertilizerKg,
      motherL,
      venturiLh,
      ratio,
    };
  }, [areaHa, flowM3h, targetEc]);

  const recommendedItems = useMemo(() => {
    const items = [...RECOMMENDED_ITEMS];
    if (results.venturiLh > 200) {
      items.push("🔥 Bom dinh luong DDP-5 (Khuyen dung cho luu luong lon)");
    }
    return items;
  }, [results.venturiLh]);

  const zaloMessage = `Toi vua tinh fertigation cho ${areaHa.toFixed(2)} ha, can ${results.fertilizerKg.toFixed(
    1,
  )} kg phan, dung dich me ${results.motherL.toFixed(1)} L. Can tu van bo cham phan...`;
  const zaloHref = `https://zalo.me/share?text=${encodeURIComponent(zaloMessage)}`;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white text-gray-900">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4CAF50]">Fertigation SaaS Tool</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">May tinh Thuy luc & Cham phan</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
          Tinh nhanh luong phan, the tich dung dich me va luu luong hut Venturi theo dieu kien van hanh thuc te.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Calculator className="h-5 w-5 text-[#4CAF50]" />
              Thiet lap dau vao
            </h2>

            <div className="space-y-4">
              <InputWithSuffix
                id="area-ha"
                label="Dien tich vuon"
                value={areaHa}
                min={0}
                step={0.01}
                suffix="ha"
                onChange={setAreaHa}
              />

              <InputWithSuffix
                id="flow-m3h"
                label="Luu luong nuoc tuoi du kien"
                value={flowM3h}
                min={0}
                step={0.1}
                suffix="m3/h"
                onChange={setFlowM3h}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="target-ec" className="text-sm font-medium text-gray-700">
                    Muc EC muc tieu
                  </label>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700">
                    {targetEc.toFixed(1)}
                  </span>
                </div>
                <input
                  id="target-ec"
                  type="range"
                  min={0.5}
                  max={3.5}
                  step={0.1}
                  value={targetEc}
                  onChange={(event) => setTargetEc(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#4CAF50]"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.5</span>
                  <span>3.5</span>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Sparkles className="h-4 w-4 text-[#4CAF50]" />
              Vat tu khuyen dung
            </h3>
            <div className="flex flex-wrap gap-2">
              {recommendedItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-semibold text-green-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-5 lg:col-span-7">
          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <CircleGauge className="h-5 w-5 text-[#4CAF50]" />
              Ket qua tinh toan
            </h2>

            <div className="space-y-3">
              <ResultRow label="Khoi luong phan bon" value={`${results.fertilizerKg.toFixed(1)} kg`} emphasize />
              <ResultRow label="The tich dung dich me" value={`${results.motherL.toFixed(1)} L`} />
              <ResultRow label="Luu luong hut Venturi" value={`${results.venturiLh.toFixed(1)} L/h`} />
              <ResultRow label="Ty le pha" value={`1 : ${results.ratio.toFixed(1)}`} />
            </div>

            {targetEc > 2.5 ? (
              <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Canh bao: Muc EC cao, can theo doi ky de tranh ngo doc re.
                </p>
              </div>
            ) : null}
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Droplets className="h-4 w-4 text-[#4CAF50]" />
              Tat toan nhanh cho van hanh
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Area</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{areaHa.toFixed(2)} ha</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Flow</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{flowM3h.toFixed(1)} m3/h</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Target EC</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{targetEc.toFixed(1)}</p>
              </div>
            </div>
          </article>

          <Link
            href={zaloHref}
            target="_blank"
            rel="noreferrer"
            data-track="affiliate-last-click"
            data-track-channel="zalo"
            data-track-source="cham-phan-tool"
            data-track-message={zaloMessage}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-4 text-base font-semibold text-white transition-colors hover:bg-[#0056d6]"
          >
            <FlaskConical className="h-5 w-5" />
            NHAN BAO GIA QUA ZALO
          </Link>
        </div>
      </section>
    </div>
  );
}
