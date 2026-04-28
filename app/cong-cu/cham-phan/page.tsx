"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { PRODUCTS_DATA } from "@/data/products";
import ProductCard from "../../store/ProductCard";
import FertigationCalculator from "./_components/FertigationCalculator";
import { useFarmerProfile } from "./_hooks/useFarmerProfile";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function shuffleBySeed(products: Product[], seed: number) {
  return [...products].sort((left, right) => {
    const leftScore = hashText(`${left.slug}-${seed}`);
    const rightScore = hashText(`${right.slug}-${seed}`);
    return leftScore - rightScore;
  });
}

function hasKeywords(product: Product, keywords: string[]) {
  const haystack = normalizeText(
    `${product.name} ${product.brand} ${product.slug} ${product.description}`,
  );
  return keywords.some((keyword) => haystack.includes(normalizeText(keyword)));
}

function pickByKeywords(
  products: Product[],
  usedSlugs: Set<string>,
  category: Product["category"] | "ANY",
  keywords: string[],
) {
  return products.find((product) => {
    if (usedSlugs.has(product.slug)) return false;
    if (category !== "ANY" && product.category !== category) return false;
    return hasKeywords(product, keywords);
  });
}

function pickFirstByCategory(
  products: Product[],
  usedSlugs: Set<string>,
  category: Product["category"],
) {
  return products.find((product) => product.category === category && !usedSlugs.has(product.slug));
}

function pickCrossSellingProducts(products: Product[], venturiLh: number) {
  const pool = products.filter((product) =>
    product.category === "HARDWARE" || product.category === "FERTILIZER");
  const picks: Product[] = [];
  const usedSlugs = new Set<string>();

  const addPick = (product?: Product) => {
    if (!product) return;
    if (usedSlugs.has(product.slug)) return;
    picks.push(product);
    usedSlugs.add(product.slug);
  };

  const fertilizer =
    pickByKeywords(pool, usedSlugs, "FERTILIZER", ["haifa", "poly-feed", "hoa tan", "npk"]) ??
    pickFirstByCategory(pool, usedSlugs, "FERTILIZER");
  addPick(fertilizer);

  const sprinklerOrPipe =
    pickByKeywords(pool, usedSlugs, "HARDWARE", ["bec tuoi", "sprinkler", "ong", "hdpe", "drip"]) ??
    pickFirstByCategory(pool, usedSlugs, "HARDWARE");
  addPick(sprinklerOrPipe);

  const dynamicCandidate =
    venturiLh > 200
      ? pickByKeywords(pool, usedSlugs, "HARDWARE", ["bom dinh luong", "dosing pump", "may bom", "pump"])
      : pickByKeywords(pool, usedSlugs, "HARDWARE", ["venturi", "cham phan"]);
  addPick(dynamicCandidate);

  if (picks.length < 4) {
    const fallback = pool.filter((product) => !usedSlugs.has(product.slug));
    const stableFallback = shuffleBySeed(fallback, Math.round(venturiLh * 10));
    stableFallback.forEach((product) => {
      if (picks.length < 4) addPick(product);
    });
  }

  return picks.slice(0, 4);
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

  const crossSellingProducts = useMemo(
    () => pickCrossSellingProducts(PRODUCTS_DATA, results.venturiLh),
    [results.venturiLh],
  );

  const zaloMessage = `Tôi vừa tính fertigation cho ${areaHa.toFixed(2)} ha, cần ${results.fertilizerKg.toFixed(
    1,
  )} kg phân, dung dịch mẹ ${results.motherL.toFixed(1)} L. Cần tư vấn bộ châm phân...`;
  const zaloHref = `https://zalo.me/share?text=${encodeURIComponent(zaloMessage)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white text-gray-900">
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4CAF50]">Fertigation SaaS Tool</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Máy tính Thủy lực & Châm phân</h1>
          <p className="max-w-3xl text-sm leading-6 text-gray-600">
            Tính nhanh lượng phân, thể tích dung dịch mẹ và lưu lượng hút Venturi để chốt cấu hình vật tư tối ưu.
          </p>
        </header>

        <FertigationCalculator
          areaHa={areaHa}
          flowM3h={flowM3h}
          targetEc={targetEc}
          fertilizerKg={results.fertilizerKg}
          motherL={results.motherL}
          venturiLh={results.venturiLh}
          ratio={results.ratio}
          onAreaHaChange={setAreaHa}
          onFlowM3hChange={setFlowM3h}
          onTargetEcChange={setTargetEc}
          zaloHref={zaloHref}
          zaloMessage={zaloMessage}
        />

        <section className="rounded-3xl border border-gray-200 bg-white p-6 lg:p-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Thiết bị & Vật tư khuyên dùng cho hệ thống của bạn
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-600">
            Đề xuất được cập nhật theo kết quả lưu lượng Venturi trong thời gian thực.
          </p>

          <div className="mt-6 w-full overflow-x-auto whitespace-nowrap shadow-sm pb-4 rounded-xl">
            <p className="text-xs text-gray-500 mb-3 md:hidden italic text-center">Vuốt để xem thêm &rarr;</p>
            <div className="flex md:grid md:grid-cols-4 gap-4 w-max md:w-auto px-1">
              {crossSellingProducts.map((product) => (
                <div key={product.id} className="w-[260px] md:w-auto whitespace-normal">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
