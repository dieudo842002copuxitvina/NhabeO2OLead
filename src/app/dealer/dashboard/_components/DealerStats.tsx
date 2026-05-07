/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER STATS CARD - Compact Dashboard Stats                        ║
 * ║  Displays key dealer performance metrics                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  Users,
  TrendingUp,
  Target,
  Percent,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface DealerStatsProps {
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONVERSION RATE BADGE
 * ═══════════════════════════════════════════════════════════════════════════════ */

function ConversionBadge({ rate }: { rate: number }) {
  let color = "bg-slate-100 text-slate-600";
  let label = "Chưa có dữ liệu";

  if (rate >= 50) {
    color = "bg-emerald-100 text-emerald-700";
    label = "Xuất sắc";
  } else if (rate >= 30) {
    color = "bg-blue-100 text-blue-700";
    label = "Tốt";
  } else if (rate >= 15) {
    color = "bg-amber-100 text-amber-700";
    label = "Trung bình";
  } else if (rate > 0) {
    color = "bg-orange-100 text-orange-700";
    label = "Cần cải thiện";
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      <Percent className="h-3 w-3" />
      {rate}% — {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * STAT ITEM
 * ═══════════════════════════════════════════════════════════════════════════════ */

function StatItem({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {subValue && (
          <p className="text-xs text-slate-500 mt-0.5">{subValue}</p>
        )}
      </div>
      {trend && (
        <div className={`text-xs font-medium ${
          trend === "up" ? "text-emerald-600" :
          trend === "down" ? "text-red-600" : "text-slate-500"
        }`}>
          {trend === "up" && "↑"}
          {trend === "down" && "↓"}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function DealerStats({ totalLeads, wonLeads, conversionRate }: DealerStatsProps) {
  return (
    <div className="space-y-3">
      {/* Main stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Total Leads */}
        <StatItem
          icon={Users}
          label="Tổng khách hàng"
          value={formatNumber(totalLeads)}
          subValue={`${totalLeads} lead${totalLeads !== 1 ? "s" : ""}`}
          colorClass="bg-blue-50 text-blue-600"
        />

        {/* Won Leads */}
        <StatItem
          icon={Target}
          label="Chốt thành công"
          value={formatNumber(wonLeads)}
          subValue={`${wonLeads} đơn đã chốt`}
          colorClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Conversion Rate */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Tỷ lệ chốt đơn</p>
              <p className="text-2xl font-bold text-emerald-900 mt-0.5">
                {conversionRate}%
              </p>
            </div>
          </div>
          <ConversionBadge rate={conversionRate} />
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700"
              style={{ width: `${Math.min(conversionRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-emerald-600 mt-1.5">
            {wonLeads} / {totalLeads} leads đã chốt thành công
          </p>
        </div>
      </div>
    </div>
  );
}
