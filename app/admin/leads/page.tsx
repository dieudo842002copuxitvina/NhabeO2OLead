import AdminShell from '@/components/admin/AdminShell';
import LeadsTable from '@/components/admin/LeadsTable';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const revalidate = 0;

async function getLeads() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('leads')
      .select(
        'id, customer_name, customer_phone, province, district, crop_type, area_m2, assigned_dealer_id, status, created_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch real leads:', error);
      return [];
    }

    return (data || []).map((lead) => ({
      id: String(lead.id),
      customerName: lead.customer_name || 'Khách chưa định danh',
      customerPhone: lead.customer_phone || '',
      province: lead.province || '',
      district: lead.district || '',
      cropType: lead.crop_type || '',
      areaM2: typeof lead.area_m2 === 'number' ? lead.area_m2 : null,
      assignedDealerId: lead.assigned_dealer_id ? String(lead.assigned_dealer_id) : null,
      status: lead.status || null,
      createdAt: lead.created_at || null,
    }));
  } catch (error) {
    console.error('Unexpected error while loading leads:', error);
    return [];
  }
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <AdminShell
      title="Lead Command Center"
      subtitle="Danh sách lead thật nạp trực tiếp từ Supabase, không còn mock dataset"
    >
      <LeadsTable data={leads} />
    </AdminShell>
  );
}
