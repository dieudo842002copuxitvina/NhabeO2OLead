"use client";

import Link from "next/link";
import { AlertTriangle, CircleGauge, FlaskConical, SlidersHorizontal } from "lucide-react";
import InputWithSuffix from "./InputWithSuffix";
import ResultRow from "./ResultRow";

type FertigationCalculatorProps = {
  areaHa: number;
  flowM3h: number;
  targetEc: number;
  fertilizerKg: number;
  motherL: number;
  venturiLh: number;
  ratio: number;
  onAreaHaChange: (value: number) => void;
  onFlowM3hChange: (value: number) => void;
  onTargetEcChange: (value: number) => void;
  zaloHref: string;
  zaloMessage: string;
};

export default function FertigationCalculator({
  areaHa,
  flowM3h,
  targetEc,
  fertilizerKg,
  motherL,
  venturiLh,
  ratio,
  onAreaHaChange,
  onFlowM3hChange,
  onTargetEcChange,
  zaloHref,
  zaloMessage,
}: FertigationCalculatorProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <article className="h-full rounded-2xl border border-gray-200 bg-gray-50 p-6 lg:col-span-5">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
            <SlidersHorizontal className="h-5 w-5 text-[#4CAF50]" />
            Thiet lap dau vao
          </h2>

          <div className="space-y-5">
            <InputWithSuffix
              id="area-ha"
              label="Dien tich vuon"
              value={areaHa}
              min={0}
              step={0.01}
              suffix="ha"
              onChange={onAreaHaChange}
            />

            <InputWithSuffix
              id="flow-m3h"
              label="Luu luong nuoc tuoi du kien"
              value={flowM3h}
              min={0}
              step={0.1}
              suffix="m3/h"
              onChange={onFlowM3hChange}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="target-ec" className="text-sm font-medium text-gray-700">
                  Muc EC muc tieu
                </label>
                <span className="inline-flex w-14 justify-end rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold tabular-nums text-gray-700">
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
                onChange={(event) => onTargetEcChange(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#4CAF50]"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>0.5</span>
                <span>3.5</span>
              </div>
            </div>
          </div>
        </article>

        <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-7">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
            <CircleGauge className="h-5 w-5 text-[#4CAF50]" />
            Ket qua tinh toan
          </h2>

          <div className="space-y-3">
            <ResultRow label="Khoi luong phan bon" value={`${fertilizerKg.toFixed(1)} kg`} emphasize />
            <ResultRow label="The tich dung dich me" value={`${motherL.toFixed(1)} L`} />
            <ResultRow label="Luu luong hut Venturi" value={`${venturiLh.toFixed(1)} L/h`} />
            <ResultRow label="Ty le pha" value={`1 : ${ratio.toFixed(1)}`} />
          </div>

          <div className="mt-4 min-h-[58px]">
            {targetEc > 2.5 ? (
              <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                <p className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Canh bao: Muc EC cao, can theo doi ky de tranh ngo doc re.
                </p>
              </div>
            ) : (
              <div className="h-[58px]" aria-hidden />
            )}
          </div>

          <div className="mt-auto flex justify-end pt-2">
            <Link
              href={zaloHref}
              target="_blank"
              rel="noreferrer"
              data-track="affiliate-last-click"
              data-track-channel="zalo"
              data-track-source="cham-phan-tool"
              data-track-message={zaloMessage}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-8 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#0056d6]"
            >
              <FlaskConical className="h-5 w-5" />
              NHAN BAO GIA QUA ZALO
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
