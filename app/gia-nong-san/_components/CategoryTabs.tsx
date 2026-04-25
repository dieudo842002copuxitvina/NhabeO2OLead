"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PriceCategoryOption } from "../_lib/queries";
import { cn } from "@/lib/utils";

type Props = {
  current: string;
  categories: PriceCategoryOption[];
};

export function CategoryTabs({ current, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateCategory(nextCategory: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategory === "all") params.delete("cat");
    else params.set("cat", nextCategory);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category.key}
          type="button"
          onClick={() => updateCategory(category.key)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold transition",
            current === category.key
              ? "border-emerald-400 bg-emerald-400 text-slate-950"
              : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
          )}
        >
          {category.label} <span className="text-xs opacity-75">({category.count})</span>
        </button>
      ))}
    </div>
  );
}
