import { supabase } from '@/integrations/supabase/client';

export interface LeadData {
  customer_phone: string;
  province: string;
  district: string;
  crop_type: string;
  lead_type: 'BOM' | 'FERTIGATION' | 'AI_DOCTOR';
  calculator_data: any;
  assigned_dealer_id: string;
}

export async function submitLeadToSupabase(data: LeadData) {
  // In a real scenario, this inserts into the 'leads' table
  const { data: result, error } = await supabase
    .from('leads' as any)
    .insert([data])
    .select();

  if (error) {
    console.error('Supabase Error:', error);
    // Even if the table doesn't exist yet, we throw to handle it in the UI
    throw new Error(error.message);
  }

  return result;
}

/**
 * Fallback Mock submit for Development without Supabase table
 * Use this to avoid breaking the UI if 'leads' table is not created yet
 */
export async function mockSubmitLead(data: LeadData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 5% error rate
      if (Math.random() < 0.05) {
        reject(new Error('Network error'));
      } else {
        resolve({ success: true, id: 'lead-' + Date.now(), ...data });
      }
    }, 1500);
  });
}
