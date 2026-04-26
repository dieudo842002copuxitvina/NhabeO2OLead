"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ProductDetailTabsProps = {
  description: string;
  specs: Record<string, unknown>;
};

type TabKey = "description" | "specs";

function formatSpecKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSpecValue(value: unknown) {
  if (typeof value === "boolean") return value ? "Co" : "Khong";
  if (typeof value === "number") return value.toLocaleString("vi-VN");
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "-";
  return JSON.stringify(value);
}

export default function ProductDetailTabs({ description, specs }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const descriptionBlocks = useMemo(
    () => description.split("\n\n").filter((item) => item.trim().length > 0),
    [description],
  );
  const specEntries = useMemo(() => Object.entries(specs), [specs]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              activeTab === "description" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
            )}
          >
            Mo ta chi tiet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              activeTab === "specs" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
            )}
          >
            Thong so ky thuat
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {activeTab === "description" ? (
          <div className="space-y-3 text-sm leading-7 text-gray-700">
            {descriptionBlocks.length > 0 ? (
              descriptionBlocks.map((block) => <p key={block}>{block}</p>)
            ) : (
              <p>Thong tin mo ta dang duoc cap nhat.</p>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-gray-200 bg-white">
                {specEntries.map(([key, value]) => (
                  <tr key={key}>
                    <th className="w-1/3 bg-gray-50 px-4 py-3 font-medium text-gray-600">{formatSpecKey(key)}</th>
                    <td className="px-4 py-3 text-gray-900">{formatSpecValue(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
