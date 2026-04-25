"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import { Activity, Droplets, Ruler, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { products as mockProducts } from "@/data/mock";

type PumpProduct = {
  id: string;
  name: string;
  hp: number;
  price?: number | null;
};

function AnimatedNumber({ value, decimals = 2, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const controls = animate(previousValueRef.current, value, {
      duration: 0.45,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest),
      onComplete: () => {
        previousValueRef.current = value;
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <motion.span className="tabular-nums">
      {displayValue.toFixed(decimals)}
      {suffix}
    </motion.span>
  );
}

function parseHp(input: string): number | null {
  const match = input.toLowerCase().match(/(\d+([.,]\d+)?)\s*hp/);
  if (!match) return null;
  return Number(match[1].replace(",", "."));
}

export default function SmartCalculator() {
  const [areaM2, setAreaM2] = useState(3000);
  const [spacingM, setSpacingM] = useState(3);
  const [nozzleFlowLh, setNozzleFlowLh] = useState(50);
  const [heightDiffM, setHeightDiffM] = useState(20);
  const [pumpProducts, setPumpProducts] = useState<PumpProduct[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadPumps() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, attributes, price, active")
        .eq("active", true);

      if (!mounted) return;

      if (error || !data) {
        const fallback = mockProducts
          .map((item) => {
            const hp = parseHp(`${item.name} ${Object.values(item.specs ?? {}).join(" ")}`);
            if (!hp) return null;
            if (!`${item.name} ${item.category_id}`.toLowerCase().match(/bơm|bom|pump/)) return null;
            return {
              id: item.id,
              name: item.name,
              hp,
              price: item.price,
            } as PumpProduct;
          })
          .filter(Boolean) as PumpProduct[];
        setPumpProducts(fallback);
        return;
      }

      const dbPumps = data
        .map((item) => {
          const source = `${item.name ?? ""} ${item.category ?? ""} ${JSON.stringify(item.attributes ?? {})}`;
          if (!source.toLowerCase().match(/bơm|bom|pump/)) return null;
          const hp = parseHp(source);
          if (!hp) return null;
          return {
            id: item.id as string,
            name: item.name as string,
            hp,
            price: (item.price as number | null) ?? null,
          } as PumpProduct;
        })
        .filter(Boolean) as PumpProduct[];

      setPumpProducts(dbPumps);
    }

    void loadPumps();
    return () => {
      mounted = false;
    };
  }, []);

  const treeCount = useMemo(() => {
    const areaPerTree = Math.max(spacingM * spacingM, 0.1);
    return Math.max(areaM2 / areaPerTree, 1);
  }, [areaM2, spacingM]);

  const totalFlowM3h = useMemo(() => (treeCount * nozzleFlowLh) / 1000, [treeCount, nozzleFlowLh]);

  const pumpPowerHp = useMemo(() => {
    const q = totalFlowM3h;
    const h = Math.max(heightDiffM, 1);
    return (q * h) / (367 * 0.75);
  }, [heightDiffM, totalFlowM3h]);

  const suggestedPump = useMemo(() => {
    if (pumpProducts.length === 0) return null;
    return [...pumpProducts].sort((a, b) => Math.abs(a.hp - pumpPowerHp) - Math.abs(b.hp - pumpPowerHp))[0];
  }, [pumpPowerHp, pumpProducts]);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      <Card className="border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">SmartCalculator - Dữ liệu đầu vào</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="mb-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2"><Ruler className="h-4 w-4 text-cyan-300" />Diện tích (m2)</span>
              <span className="font-semibold">{areaM2.toLocaleString("vi-VN")}</span>
            </label>
            <div className="flex gap-3">
              <Slider value={[areaM2]} min={100} max={50000} step={100} onValueChange={(v) => setAreaM2(v[0] ?? 100)} />
              <Input type="number" value={areaM2} onChange={(e) => setAreaM2(Number(e.target.value) || 0)} className="w-28 bg-white/85 text-slate-900" />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-300" />Khoảng cách cây (m)</span>
              <span className="font-semibold">{spacingM.toFixed(1)}</span>
            </label>
            <div className="flex gap-3">
              <Slider value={[spacingM]} min={1} max={10} step={0.1} onValueChange={(v) => setSpacingM(v[0] ?? 1)} />
              <Input type="number" value={spacingM} step={0.1} onChange={(e) => setSpacingM(Number(e.target.value) || 0)} className="w-28 bg-white/85 text-slate-900" />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2"><Droplets className="h-4 w-4 text-blue-300" />Lưu lượng béc (L/H)</span>
              <span className="font-semibold">{nozzleFlowLh.toFixed(0)}</span>
            </label>
            <div className="flex gap-3">
              <Slider value={[nozzleFlowLh]} min={10} max={300} step={1} onValueChange={(v) => setNozzleFlowLh(v[0] ?? 10)} />
              <Input type="number" value={nozzleFlowLh} onChange={(e) => setNozzleFlowLh(Number(e.target.value) || 0)} className="w-28 bg-white/85 text-slate-900" />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-amber-300" />Chênh lệch cao độ (m)</span>
              <span className="font-semibold">{heightDiffM.toFixed(1)}</span>
            </label>
            <div className="flex gap-3">
              <Slider value={[heightDiffM]} min={1} max={120} step={1} onValueChange={(v) => setHeightDiffM(v[0] ?? 1)} />
              <Input type="number" value={heightDiffM} onChange={(e) => setHeightDiffM(Number(e.target.value) || 0)} className="w-28 bg-white/85 text-slate-900" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-cyan-200/40 bg-white/15 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg text-white">Kết quả tính toán</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-white/20 bg-slate-900/55 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-300">Tổng lưu lượng hệ thống</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">
              <AnimatedNumber value={totalFlowM3h} decimals={2} suffix=" m3/h" />
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-slate-900/55 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-300">Công suất bơm đề xuất</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">
              <AnimatedNumber value={pumpPowerHp} decimals={2} suffix=" HP" />
            </p>
            <p className="mt-1 text-xs text-slate-400">P = (Q * H) / (367 * 0.75)</p>
          </div>

          <div className="rounded-xl border border-emerald-200/30 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-200">Thiết bị gợi ý từ products</p>
            {suggestedPump ? (
              <>
                <p className="mt-1 font-medium text-white">{suggestedPump.name}</p>
                <p className="text-sm text-emerald-100">Công suất gần nhất: {suggestedPump.hp.toFixed(1)} HP</p>
                {suggestedPump.price ? (
                  <p className="text-xs text-emerald-100/90">Giá tham khảo: {suggestedPump.price.toLocaleString("vi-VN")} VND</p>
                ) : null}
              </>
            ) : (
              <p className="mt-1 text-sm text-emerald-100">Chưa có máy bơm phù hợp trong danh mục.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
