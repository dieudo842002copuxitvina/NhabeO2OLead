'use server';

import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase Admin Client (để insert lead an toàn từ server)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export interface SubmitLeadParams {
  phone: string;
  regionId: string;
  bomData: any; // Bill of Materials JSON
  totalEstimatedCost?: number;
}

export async function submitLeadO2O(params: SubmitLeadParams) {
  try {
    // 1. Insert dữ liệu vào bảng leads của Supabase
    const { data: leadData, error: dbError } = await supabase
      .from('leads')
      .insert({
        phone: params.phone,
        region: params.regionId,
        bom_json: params.bomData,
        estimated_cost: params.totalEstimatedCost || 0,
        status: 'new', // Trạng thái ban đầu
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Error inserting lead to Supabase:', dbError);
      return { success: false, error: 'Database insertion failed' };
    }

    const leadId = leadData.id;

    // 2. Phát Webhook an toàn tới n8n (Không await để tránh block luồng phản hồi cho User, hoặc try/catch độc lập)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (n8nWebhookUrl) {
      // Đẩy vào background execution bằng cách không await hoặc xử lý try/catch bên trong
      // Ở đây ta dùng try/catch riêng rẽ và sử dụng AbortController để đảm bảo không dính timeout lâu
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const webhookPayload = {
          lead_id: leadId,
          customer_phone: params.phone,
          region_id: params.regionId,
          total_estimated_cost: params.totalEstimatedCost || 0,
          timestamp: new Date().toISOString()
        };

        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
          signal: controller.signal
        }).then(res => {
          clearTimeout(timeoutId);
          if (!res.ok) {
            console.warn(`n8n webhook returned status: ${res.status}`);
          } else {
            console.log(`Successfully triggered n8n workflow for lead ${leadId}`);
          }
        }).catch(err => {
          clearTimeout(timeoutId);
          console.error('n8n Webhook network error (non-fatal):', err);
        });
        
      } catch (webhookError) {
        // Đảm bảo lỗi webhook (nếu có) không văng ra ngoài làm crash server action
        console.error('Failed to trigger n8n Webhook (non-fatal):', webhookError);
      }
    } else {
      console.warn('N8N_WEBHOOK_URL is not defined in environment variables.');
    }

    // 3. Phản hồi thành công ngay lập tức cho Frontend
    return { 
      success: true, 
      leadId: leadId,
      message: 'Lead submitted successfully'
    };

  } catch (error: any) {
    console.error('Fatal error in submitLeadO2O Server Action:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}
