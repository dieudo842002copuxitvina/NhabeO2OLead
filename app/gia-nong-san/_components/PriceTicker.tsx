"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { CommodityPrice } from "../_lib/queries";
import { cn } from "@/lib/utils";

type LiveTickerItem = Pick<
  CommodityPrice,
  "id" | "cropLabel" | "priceVnd" | "changePct" | "unit" | "province"
>;

type FeedMessage = {
  items: Array<
    Pick<CommodityPrice, "id" | "priceVnd" | "changePct"> & {
      recordedAt: string;
      previousPriceVnd: number | null;
      changeVnd: number | null;
      source: string | null;
    }
  >;
  lastUpdatedAt: string;
};

type Props = {
  initialItems: CommodityPrice[];
  feedUrl: string;
};

export function PriceTicker({ initialItems, feedUrl }: Props) {
  const [items, setItems] = useState<LiveTickerItem[]>(() =>
    initialItems.map((item) => ({
      id: item.id,
      cropLabel: item.cropLabel,
      priceVnd: item.priceVnd,
      changePct: item.changePct,
      unit: item.unit,
      province: item.province,
    }))
  );

  useEffect(() => {
    setItems(
      initialItems.map((item) => ({
        id: item.id,
        cropLabel: item.cropLabel,
        priceVnd: item.priceVnd,
        changePct: item.changePct,
        unit: item.unit,
        province: item.province,
      }))
    );
  }, [initialItems]);

  useEffect(() => {
    const source = new EventSource(feedUrl);

    const apply = (message: FeedMessage) => {
      setItems((current) =>
        current.map((item) => {
          const update = message.items.find((candidate) => candidate.id === item.id);
          return update ? { ...item, ...update } : item;
        })
      );
    };

    source.addEventListener("snapshot", (event) => apply(JSON.parse((event as MessageEvent<string>).data)));
    source.addEventListener("prices", (event) => apply(JSON.parse((event as MessageEvent<string>).data)));

    return () => source.close();
  }, [feedUrl]);

  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden rounded-full border border-white/10 bg-white/5">
      <div className="flex animate-ticker whitespace-nowrap py-3">
        {loop.map((item, index) => {
          const positive = (item.changePct ?? 0) >= 0;
          return (
            <div key={`${item.id}-${index}`} className="flex items-center gap-2 px-6 text-sm">
              <span className="font-semibold text-white">{item.cropLabel}</span>
              <span className="text-slate-500">{item.province}</span>
              <span className="font-mono text-slate-100">{item.priceVnd.toLocaleString("vi-VN")}đ/{item.unit}</span>
              {item.changePct !== null && (
                <span className={cn("inline-flex items-center gap-1 font-semibold", positive ? "text-emerald-300" : "text-rose-300")}>
                  {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {positive ? "+" : ""}
                  {item.changePct.toFixed(1)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
