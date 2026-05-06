/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ADMIN DASHBOARD - SERVER COMPONENT                               ║
 * ║  Thống kê tổng quan và Lead mới nhất                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Suspense } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calculator,
  Clock,
  ArrowRight,
  DollarSign,
  Activity,
  AlertCircle,
} from "lucide-react";
import { PrismaClient } from "@prisma/client";
import AdminShell from "@/components/admin/AdminShell";
import SeoMeta from "@/components/SeoMeta";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface DashboardStats {
  totalLeads: number;
  newLeadsThisWeek: number;
  newLeadsToday: number;
  totalCalculatorLeads: number;
  totalEstimateValue: number;
  recentLeads: Array<{
    id: string;
    customerName: string | null;
    customerPhone: string;
    cropType: string | null;
    status: string | null;
    createdAt: Date;
  }>;
  recentCalculatorLeads: Array<{
    id: string;
    customerName: string | null;
    customerPhone: string;
    cropType: string | null;
    areaHa: number | null;
    createdAt: Date;
  }>;
  statusBreakdown: Record<string, number>;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DATA FETCHING
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  try {
    // Get lead counts
    const [totalLeads, leadsThisWeek, leadsToday] = await Promise.all([
      prisma.leads.count(),
      prisma.leads.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.leads.count({ where: { createdAt: { gte: startOfToday } } }),
    ]);

    // Get calculator leads with aggregate
    const [calculatorLeads, calculatorAggregate] = await Promise.all([
      prisma.calculatorLeads.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.calculatorLeads.aggregate({
        _count: true,
      }),
    ]);

    // Get recent leads
    const recentLeads = await prisma.leads.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        cropType: true,
        status: true,
        createdAt: true,
      },
    });

    // Status breakdown
    const allLeads = await prisma.leads.findMany({
      select: { status: true },
    });
    const statusBreakdown = allLeads.reduce((acc, lead) => {
      const status = lead.status || "Chưa xử lý";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total estimate value from calculator results
    let totalEstimateValue = 0;
    for (const calc of calculatorLeads) {
      if (calc.results && typeof calc.results === "object") {
        const results = calc.results as { totalCost?: number; estimatedTotal?: number };
        totalEstimateValue += results.totalCost || results.estimatedTotal || 0;
      }
    }

    return {
      totalLeads,
      newLeadsThisWeek: leadsThisWeek,
      newLeadsToday: leadsToday,
      totalCalculatorLeads: calculatorAggregate._count,
      totalEstimateValue,
      recentLeads,
      recentCalculatorLeads: calculatorLeads,
      statusBreakdown,
    };
  } catch (error) {
    console.error("[Dashboard] Error fetching stats:", error);
    return {
      totalLeads: 0,
      newLeadsThisWeek: 0,
      newLeadsToday: 0,
      totalCalculatorLeads: 0,
      totalEstimateValue: 0,
      recentLeads: [],
      recentCalculatorLeads: [],
      statusBreakdown: {},
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UTILITY FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return new Date(date).toLocaleDateString("vi-VN");
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
  trendValue?: string;
  variant?: "default" | "success" | "warning";
}) {
  const variantStyles = {
    default: "bg-white border-[#E9ECEF]",
    success: "bg-[#F3FAF3] border-[#BEE6C1]",
    warning: "bg-[#FFFBEB] border-[#FDE68A]",
  };

  const iconStyles = {
    default: "text-[#4CAF50] bg-[#F3FAF3]",
    success: "text-[#2F8E36] bg-[#E8F5E9]",
    warning: "text-[#F59E0B] bg-[#FEF3C7]",
  };

  return (
    <div className={`rounded-2xl border p-5 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#7B8794]">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[#1A1A1A]">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-[#9CA3AF]">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              trend === "up" ? "text-[#2F8E36]" : "text-[#DC2626]"
            }`}>
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`rounded-xl p-3 ${iconStyles[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function LeadRow({
  lead,
}: {
  lead: {
    id: string;
    customerName: string | null;
    customerPhone: string;
    cropType: string | null;
    status: string | null;
    createdAt: Date;
  };
}) {
  const statusColors: Record<string, string> = {
    "Đã xử lý": "bg-[#F3FAF3] text-[#2F8E36] border-[#BEE6C1]",
    "Đang xử lý": "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
    "Chưa xử lý": "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
  };

  return (
    <div className="flex items-center justify-between border-b border-[#F1F5F9] py-3 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3FAF3] text-sm font-semibold text-[#4CAF50]">
          {(lead.customerName || lead.customerPhone).charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-[#1A1A1A]">
            {lead.customerName || "Khách hàng mới"}
          </p>
          <p className="text-xs text-[#7B8794]">
            {lead.customerPhone} • {lead.cropType || "Chưa chọn"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
          statusColors[lead.status || "Chưa xử lý"]
        }`}>
          {lead.status || "Chưa xử lý"}
        </span>
        <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(lead.createdAt)}
        </span>
      </div>
    </div>
  );
}

function CalculatorLeadRow({
  lead,
}: {
  lead: {
    id: string;
    customerName: string | null;
    customerPhone: string;
    cropType: string | null;
    areaHa: number | null;
    createdAt: Date;
  };
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#F1F5F9] py-3 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF3C7]">
          <Calculator className="h-5 w-5 text-[#F59E0B]" />
        </div>
        <div>
          <p className="font-medium text-[#1A1A1A]">
            {lead.customerName || "Khách hàng ẩn danh"}
          </p>
          <p className="text-xs text-[#7B8794]">
            {lead.customerPhone} • {lead.cropType || "Tưới tiêu"} • {lead.areaHa || "?"} ha
          </p>
        </div>
      </div>
      <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
        <Clock className="h-3 w-3" />
        {formatRelativeTime(lead.createdAt)}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * LOADING SKELETON
 * ═══════════════════════════════════════════════════════════════════════════════ */

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#E9ECEF]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl bg-[#E9ECEF]" />
        <div className="h-80 animate-pulse rounded-2xl bg-[#E9ECEF]" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN PAGE
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const metadata = {
  title: "Dashboard | Admin Nhà Bè Agri",
  description: "Tổng quan thống kê: Leads, Calculator, Doanh thu dự toán",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <SeoMeta
        title="Dashboard | Admin Nhà Bè Agri"
        description="Tổng quan thống kê: Leads, Calculator, Doanh thu dự toán"
      />
      <AdminShell title="Dashboard" subtitle="Tổng quan hệ thống">
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Tổng Leads"
              value={stats.totalLeads.toLocaleString("vi-VN")}
              subtitle={`${stats.newLeadsThisWeek} tuần này`}
              icon={Users}
              variant="success"
              trend="up"
              trendValue={`+${stats.newLeadsToday} hôm nay`}
            />
            <StatCard
              title="Calculator Leads"
              value={stats.totalCalculatorLeads.toLocaleString("vi-VN")}
              subtitle="Tính toán dự toán"
              icon={Calculator}
              variant="default"
            />
            <StatCard
              title="Giá trị Dự toán"
              value={formatCurrency(stats.totalEstimateValue)}
              subtitle="Từ calculator"
              icon={DollarSign}
              variant="warning"
            />
            <StatCard
              title="Trạng thái Leads"
              value={Object.keys(stats.statusBreakdown).length}
              subtitle="Phân loại"
              icon={Activity}
              variant="default"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Leads */}
            <div className="rounded-2xl border border-[#E9ECEF] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Leads mới nhất
                </h2>
                <Link
                  href="/admin/leads"
                  className="flex items-center gap-1 text-sm font-medium text-[#4CAF50] hover:text-[#2F8E36]"
                >
                  Xem tất cả
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {stats.recentLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-3 h-12 w-12 text-[#E9ECEF]" />
                  <p className="text-sm text-[#7B8794]">Chưa có leads nào</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {stats.recentLeads.slice(0, 5).map((lead) => (
                    <LeadRow key={lead.id} lead={lead} />
                  ))}
                </div>
              )}
            </div>

            {/* Calculator Leads */}
            <div className="rounded-2xl border border-[#E9ECEF] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Calculator mới nhất
                </h2>
                <Link
                  href="/admin/leads?tab=calculator"
                  className="flex items-center gap-1 text-sm font-medium text-[#4CAF50] hover:text-[#2F8E36]"
                >
                  Xem tất cả
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {stats.recentCalculatorLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calculator className="mb-3 h-12 w-12 text-[#E9ECEF]" />
                  <p className="text-sm text-[#7B8794]">Chưa có calculation nào</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {stats.recentCalculatorLeads.slice(0, 5).map((lead) => (
                    <CalculatorLeadRow key={lead.id} lead={lead} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-[#E9ECEF] bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">
              Thao tác nhanh
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/leads"
                className="inline-flex items-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E36]"
              >
                <Users className="h-4 w-4" />
                Quản lý Leads
              </Link>
              <Link
                href="/admin/dealers"
                className="inline-flex items-center gap-2 rounded-lg border border-[#E9ECEF] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#F8FAFC]"
              >
                Quản lý Đại lý
              </Link>
              <Link
                href="/gia-nong-san"
                className="inline-flex items-center gap-2 rounded-lg border border-[#E9ECEF] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#F8FAFC]"
              >
                Xem Giá Nông sản
              </Link>
              <Link
                href="/tinh-toan"
                className="inline-flex items-center gap-2 rounded-lg border border-[#E9ECEF] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#F8FAFC]"
              >
                <Calculator className="h-4 w-4" />
                Calculator
              </Link>
            </div>
          </div>
        </div>
      </AdminShell>
    </>
  );
}
