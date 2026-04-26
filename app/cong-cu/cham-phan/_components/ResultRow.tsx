"use client";

import { cn } from "@/lib/utils";

type ResultRowProps = {
  label: string;
  value: string;
  emphasize?: boolean;
};

export default function ResultRow({ label, value, emphasize = false }: ResultRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3",
        emphasize ? "bg-green-50 border-green-100" : "bg-white",
      )}
    >
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={cn("text-base font-semibold text-gray-900", emphasize && "text-[#2F8E36]")}>{value}</span>
    </div>
  );
}
