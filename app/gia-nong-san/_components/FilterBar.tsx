"use client";

import { useEffect, useState, startTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PriceRegionOption } from "../_lib/queries";
import { cn } from "@/lib/utils";

type Props = {
  currentRegion?: string;
  currentSort: string;
  initialQuery?: string;
  regions: PriceRegionOption[];
};

export function FilterBar({ currentRegion, currentSort, initialQuery, regions }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery ?? "");

  useEffect(() => {
    setQuery(initialQuery ?? "");
  }, [initialQuery]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = query.trim();

      if (!trimmed) params.delete("q");
      else params.set("q", trimmed);

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [pathname, query, router, searchParams]);

  function updateSelect(name: "region" | "sort", value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (name === "region") {
      if (!value) params.delete("region");
      else params.set("region", value);
    }

    if (name === "sort") {
      if (value === "change") params.delete("sort");
      else params.set("sort", value);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 backdrop-blur xl:grid-cols-[1.3fr_0.8fr_0.8fr]">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm cà phê, hồ tiêu, tỉnh..."
          className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50"
        />
      </label>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Vùng
        </span>
        <select
          value={currentRegion ?? ""}
          onChange={(event) => updateSelect("region", event.target.value)}
          className={cn(
            "h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition",
            "focus:border-emerald-400/50"
          )}
        >
          <option value="">Toàn quốc</option>
          {regions.map((region) => (
            <option key={region.key} value={region.key}>
              {region.label} ({region.count})
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Sắp xếp</span>
        <select
          value={currentSort}
          onChange={(event) => updateSelect("sort", event.target.value)}
          className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-emerald-400/50"
        >
          <option value="change">Biến động mạnh</option>
          <option value="price">Giá cao nhất</option>
          <option value="name">Tên mặt hàng</option>
        </select>
      </label>
    </div>
  );
}
