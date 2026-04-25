"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { CommodityPrice } from "../_lib/queries";
import { cn } from "@/lib/utils";

type LiveCommodityUpdate = Pick<
  CommodityPrice,
  "id" | "priceVnd" | "previousPriceVnd" | "changeVnd" | "changePct" | "recordedAt" | "source"
>;

type FeedMessage = {
  items: LiveCommodityUpdate[];
  lastUpdatedAt: string;
};

type FeedChannel = {
  source: EventSource;
  listeners: Set<(message: FeedMessage) => void>;
};

const channels = new Map<string, FeedChannel>();

type Props = {
  initial: CommodityPrice;
  feedUrl: string;
};

export function PriceRow({ initial, feedUrl }: Props) {
  const [price, setPrice] = useState(initial);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    setPrice(initial);
  }, [initial]);

  useEffect(() => {
    const unsubscribe = subscribeFeed(feedUrl, (message) => {
      const next = message.items.find((item) => item.id === initial.id);
      if (!next) return;

      setPrice((current) => {
        if (current.priceVnd === next.priceVnd) return current;
        setFlash(next.priceVnd > current.priceVnd ? "up" : "down");
        return { ...current, ...next };
      });
    });

    return unsubscribe;
  }, [feedUrl, initial.id]);

  useEffect(() => {
    if (!flash) return undefined;
    const handle = window.setTimeout(() => setFlash(null), 600);
    return () => window.clearTimeout(handle);
  }, [flash]);

  const sparklinePoints = useMemo(() => {
    const values = price.history.map((point) => point.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const height = 32;
    const width = 96;

    return price.history
      .map((point, index) => {
        const x = price.history.length === 1 ? width / 2 : (index / (price.history.length - 1)) * width;
        const y = max === min ? height / 2 : height - ((point.price - min) / (max - min)) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(" ");
  }, [price.history]);

  return (
    <tr
      className={cn(
        "border-t border-white/5 align-top transition-colors",
        flash === "up" && "bg-emerald-400/10",
        flash === "down" && "bg-rose-400/10"
      )}
    >
      <td className="px-4 py-4">
        <div className="font-semibold text-white">{price.cropLabel}</div>
        <div className="mt-1 text-xs text-slate-400">
          {price.province} • {price.regionLabel}
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-slate-300">{price.qualityLabel}</td>
      <td className="px-4 py-4 text-right font-semibold text-white">
        {price.priceVnd.toLocaleString("vi-VN")}đ/{price.unit}
      </td>
      <td className="px-4 py-4">
        <ChangeBadge changeVnd={price.changeVnd} changePct={price.changePct} />
      </td>
      <td className="px-4 py-4">
        <svg viewBox="0 0 96 32" className="h-8 w-24 overflow-visible">
          <polyline
            fill="none"
            stroke={price.changePct !== null && price.changePct < 0 ? "#fb7185" : "#34d399"}
            strokeWidth="2.5"
            points={sparklinePoints}
          />
        </svg>
      </td>
      <td className="px-4 py-4 text-xs text-slate-400">
        <div>{new Date(price.recordedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
        <div className="mt-1 truncate">{price.source ?? "Feed tổng hợp"}</div>
      </td>
    </tr>
  );
}

function ChangeBadge({
  changeVnd,
  changePct,
}: {
  changeVnd: number | null;
  changePct: number | null;
}) {
  if (changeVnd === null || changePct === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
        <Minus className="h-3.5 w-3.5" />
        Chưa đủ dữ liệu
      </span>
    );
  }

  const positive = changePct >= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
        positive ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"
      )}
    >
      {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {positive ? "+" : ""}
      {changePct.toFixed(1)}% ({changeVnd.toLocaleString("vi-VN")}đ)
    </span>
  );
}

function subscribeFeed(feedUrl: string, listener: (message: FeedMessage) => void) {
  let channel = channels.get(feedUrl);

  if (!channel) {
    const source = new EventSource(feedUrl);
    channel = { source, listeners: new Set() };

    source.addEventListener("snapshot", (event) => {
      const data = JSON.parse((event as MessageEvent<string>).data) as FeedMessage;
      channel?.listeners.forEach((callback) => callback(data));
    });

    source.addEventListener("prices", (event) => {
      const data = JSON.parse((event as MessageEvent<string>).data) as FeedMessage;
      channel?.listeners.forEach((callback) => callback(data));
    });

    channels.set(feedUrl, channel);
  }

  channel.listeners.add(listener);

  return () => {
    const active = channels.get(feedUrl);
    if (!active) return;
    active.listeners.delete(listener);
    if (active.listeners.size === 0) {
      active.source.close();
      channels.delete(feedUrl);
    }
  };
}
