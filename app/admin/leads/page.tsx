/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LEADS PAGE - SERVER COMPONENT                                  ║
 * ║  CRM - Quản lý Khách hàng Tiềm năng                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { PrismaClient, Prisma } from "@prisma/client";
import AdminShell from "@/components/admin/AdminShell";
import LeadsTable from "@/components/admin/LeadsTable";
import type { LeadNormalized } from "@/app/actions/lead";
import type { DealerNormalized } from "@/app/actions/dealer";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * FETCH LEADS WITH DEALER RELATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getLeadsWithDealers(): Promise<LeadNormalized[]> {
  try {
    const leads = await prisma.leads.findMany({
      include: {
        dealers: {
          select: {
            id: true,
            name: true,
            phone: true,
            province: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Normalize leads from snake_case to camelCase for frontend
    const normalizedLeads: LeadNormalized[] = leads.map((lead) => ({
      id: lead.id,
      customerName: lead.customer_name,
      customerPhone: lead.customer_phone,
      province: lead.province,
      district: lead.district,
      cropType: lead.crop_type,
      areaM2: lead.area_m2 ? Number(lead.area_m2) : null,
      calculatorData: lead.calculator_data,
      assignedDealerId: lead.assigned_dealer_id,
      status: lead.status,
      createdAt: lead.created_at,
      assignedDealer: lead.dealers
        ? {
            id: lead.dealers.id,
            name: lead.dealers.name,
            phone: lead.dealers.phone,
            province: lead.dealers.province,
          }
        : null,
    }));

    return normalizedLeads;
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

async function getActiveDealers(): Promise<DealerNormalized[]> {
  try {
    const dealers = await prisma.dealer.findMany({
      where: { is_active: true },
      orderBy: { created_at: "desc" },
    });

    return dealers.map((dealer) => ({
      id: dealer.id,
      name: dealer.name,
      phone: dealer.phone,
      address: dealer.address,
      province: dealer.province,
      district: dealer.district,
      latitude: dealer.latitude,
      longitude: dealer.longitude,
      isActive: dealer.is_active,
      createdAt: dealer.created_at,
    }));
  } catch (error) {
    console.error("Error fetching dealers:", error);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const metadata = {
  title: "Quản lý Leads | AGRI-OS Admin",
  description: "Quản lý và phân bổ khách hàng tiềm năng cho đại lý ủy quyền",
};

export default async function LeadsPage() {
  const [leads, dealers] = await Promise.all([
    getLeadsWithDealers(),
    getActiveDealers(),
  ]);

  return (
    <AdminShell
      title="Quản lý Leads"
      subtitle="Danh sách khách hàng tiềm năng từ Supabase PostgreSQL"
    >
      <LeadsTable
        initialLeads={leads}
        totalCount={leads.length}
        activeDealers={dealers}
      />
    </AdminShell>
  );
}
