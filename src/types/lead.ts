/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LEAD TYPES                                                     ║
 * ║  Shared types for Lead management                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import type { Prisma } from "@prisma/client";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES - Matching database schema (snake_case)
 * ═══════════════════════════════════════════════════════════════════════════════ */

// Lead type from database (snake_case)
export interface Lead {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  province: string | null;
  district: string | null;
  crop_type: string | null;
  area_m2: Prisma.Decimal | null;
  calculator_data: Prisma.JsonValue;
  assigned_dealer_id: string | null;
  status: string;
  created_at: Date;
  dealers: {
    id: string;
    name: string;
    phone: string | null;
    province: string | null;
  } | null;
}

// Normalized Lead for frontend (camelCase)
export interface LeadNormalized {
  id: string;
  customerName: string | null;
  customerPhone: string;
  province: string | null;
  district: string | null;
  cropType: string | null;
  areaM2: number | null;
  calculatorData: Prisma.JsonValue;
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

export interface LeadsResult {
  success: boolean;
  data?: LeadNormalized[];
  error?: string;
  count?: number;
}

export interface LeadResult {
  success: boolean;
  data?: LeadNormalized;
  error?: string;
}

// Basic dealer info for dropdown
export interface DealerBasic {
  id: string;
  name: string;
  province: string | null;
  district: string | null;
  phone: string | null;
}
