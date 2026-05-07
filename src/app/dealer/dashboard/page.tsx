/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER DASHBOARD - Customer Leads Management                         ║
 * ║  Server Component: Fetch leads assigned to the logged-in dealer         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Features:
 * - Data Table showing customer leads
 * - View BOM (Bill of Materials) for each lead
 * - Status management
 */

import { Suspense } from "react";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  MapPin,
  Sprout,
  Calendar,
  Eye,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Settings,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getServerClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import DealerLeadsTable from "./_components/DealerLeadsTable";
import DealerStats from "./_components/DealerStats";
import type { DealerLeadsWithBOM } from "./_components/DealerLeadsTable";

/* ═══════════════════════════════════════════════════════════════════════════════
 * METADATA
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "Dashboard Đại Lý | Nhà Bè Agri",
  description: "Quản lý khách hàng tiềm năng và dự toán BOM",
};

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

interface DealerInfo {
  id: string;
  name: string;
  province: string | null;
  phone: string | null;
  zalo_number: string | null;
  address: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getDealerInfo(supabaseUserId: string): Promise<DealerInfo | null> {
  try {
    // Get dealer_id from profile
    const profile = await prisma.profile.findFirst({
      where: { id: supabaseUserId },
      select: { dealer_id: true },
    });

    if (!profile?.dealer_id) return null;

    const dealer = await prisma.dealer.findUnique({
      where: { id: profile.dealer_id },
      select: { id: true, name: true, province: true, phone: true, zalo_number: true, address: true },
    });

    return dealer;
  } catch (error) {
    console.error("[Dealer Dashboard] Error getting dealer info:", error);
    return null;
  }
}

async function getDealerLeads(dealerId: string): Promise<DealerLeadsWithBOM[]> {
  try {
    const leads = await prisma.calculator_leads.findMany({
      where: { assigned_dealer_id: dealerId },
      select: {
        id: true,
        customer_name: true,
        customer_phone: true,
        province: true,
        district: true,
        crop_type: true,
        area_ha: true,
        calculator_data: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    return leads.map((lead) => ({
      ...lead,
      area_ha: lead.area_ha ? Number(lead.area_ha) : null,
    }));
  } catch (error) {
    console.error("[Dealer Dashboard] Error fetching leads:", error);
    return [];
  }
}

async function getDealerStats(dealerId: string) {
  try {
    const [total, contacted, won] = await Promise.all([
      prisma.calculator_leads.count({ where: { assigned_dealer_id: dealerId } }),
      prisma.calculator_leads.count({ where: { assigned_dealer_id: dealerId, status: "contacted" } }),
      prisma.calculator_leads.count({ where: { assigned_dealer_id: dealerId, status: "won" } }),
    ]);

    return {
      total,
      contacted,
      won,
      conversionRate: total > 0 ? Math.round((won / total) * 100) : 0,
    };
  } catch (error) {
    console.error("[Dealer Dashboard] Error getting stats:", error);
    return { total: 0, contacted: 0, won: 0, conversionRate: 0 };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default async function DealerDashboardPage() {
  // Get current user from Supabase
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Đăng nhập để tiếp tục</h2>
            <p className="text-slate-500 mb-4">Vui lòng đăng nhập để xem dashboard đại lý.</p>
            <Button asChild className="w-full">
              <a href="/login">Đăng nhập</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dealer = await getDealerInfo(user.id);

  if (!dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Badge variant="outline" className="mb-4">Không tìm thấy đại lý</Badge>
            <h2 className="text-xl font-semibold mb-2">Tài khoản chưa được liên kết</h2>
            <p className="text-slate-500">Tài khoản của bạn chưa được liên kết với đại lý nào.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [leads, stats] = await Promise.all([
    getDealerLeads(dealer.id),
    getDealerStats(dealer.id),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900">Dashboard Đại Lý</h1>
                <p className="text-xs text-slate-500">{dealer.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {dealer.address && (
                <span className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{dealer.address}</span>
                </span>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href="/dealer/dashboard/inventory">
                  <Package className="w-4 h-4 mr-1.5" />
                  Quản lý tồn kho
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/dealer/dashboard/profile">
                  <Settings className="w-4 h-4 mr-1.5" />
                  Sửa thông tin cửa hàng
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
            Thống kê hiệu suất
          </h2>
          <DealerStats
            totalLeads={stats.total}
            wonLeads={stats.won}
            conversionRate={stats.conversionRate}
          />
        </div>

        {/* Leads Table */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Danh sách khách hàng tiềm năng
              </CardTitle>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {leads.length} lead{leads.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Suspense fallback={<LoadingSkeleton />}>
              <DealerLeadsTable leads={leads} />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * LOADING SKELETON
 * ═══════════════════════════════════════════════════════════════════════════════ */

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-32 h-4 bg-slate-200 rounded" />
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="w-32 h-4 bg-slate-200 rounded" />
          <div className="w-20 h-4 bg-slate-200 rounded" />
          <div className="w-16 h-4 bg-slate-200 rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}
