/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LEADS PAGE - SERVER COMPONENT                                  ║
 * ║  CRM - Quản lý Khách hàng Tiềm năng                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { PrismaClient, Prisma } from "@prisma/client";
import AdminShell from "@/components/admin/AdminShell";
import LeadsTable from "@/components/admin/LeadsTable";
import { getActiveDealers } from "@/app/actions/lead";
import type { LeadNormalized, DealerBasic } from "@/types/lead";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface NormalizedLead {
  id: string;
  customerName: string | null;
  customerPhone: string;
  province: string | null;
  district: string | null;
  cropType: string | null;
  areaM2: number | null;
  assignedDealerId: string | null;
  status: string;
  createdAt: Date;
  assignedDealer: {
    id: string;
    name: string;
    phone: string | null;
    province: string | null;
  } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * FETCH LEADS WITH DEALER RELATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getLeadsWithDealers(): Promise<NormalizedLead[]> {
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
    const normalizedLeads: NormalizedLead[] = leads.map((lead) => ({
      id: lead.id,
      customerName: lead.customer_name,
      customerPhone: lead.customer_phone,
      province: lead.province,
      district: lead.district,
      cropType: lead.crop_type,
      areaM2: lead.area_m2 ? Number(lead.area_m2) : null,
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
