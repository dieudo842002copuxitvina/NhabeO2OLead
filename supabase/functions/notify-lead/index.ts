// Forward new calculator lead → n8n webhook with structured channels
// (email admin list, zalo dealer, sms dealer) so n8n can fan-out to multiple flows.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadBody {
  lead_id: string;
  customer: { name: string; phone: string; province?: string };
  calculator: Record<string, unknown>;
  dealer?: { id: string; name: string; phone?: string; zalo?: string } | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as LeadBody;
    if (!body.lead_id || !body.customer?.phone) {
      return new Response(JSON.stringify({ error: 'lead_id + customer.phone required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. Webhook URL from app_settings
    const { data: setting } = await supabase
      .from('app_settings').select('value').eq('key', 'n8n_webhook_url').maybeSingle();
    const url = (setting?.value as { url?: string } | null)?.url;

    if (!url) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no_webhook_configured' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Resolve admin emails (RPC restricted to service_role)
    const { data: adminRows, error: adminErr } = await supabase
      .rpc('get_admin_notify_recipients');
    if (adminErr) console.error('admin_recipients_error', adminErr.message);
    const adminRecipients = (adminRows ?? []) as Array<{ email: string; display_name: string }>;

    // 3. Build structured payload — n8n routes by channel array
    const calc = body.calculator as Record<string, unknown>;
    const summary = `${calc.crop ?? '-'} · ${calc.area_m2 ?? '-'}m² · Bơm ${calc.pump_hp ?? '-'}HP · Tổng ${
      typeof calc.total_cost === 'number' ? calc.total_cost.toLocaleString('vi-VN') + 'đ' : '-'
    }`;
    const shortId = body.lead_id.slice(0, 8).toUpperCase();

    const channels: Array<Record<string, unknown>> = [];

    // Admin email channel — n8n loops `recipients`
    if (adminRecipients.length > 0) {
      channels.push({
        type: 'email',
        target: 'admin',
        recipients: adminRecipients,
        subject: `[Nhà Bè Agri] Lead mới #${shortId} — ${body.customer.name}`,
        body: [
          `Lead mới từ máy tính tưới:`,
          ``,
          `• Mã: ${shortId}`,
          `• Khách: ${body.customer.name} — ${body.customer.phone}${body.customer.province ? ' (' + body.customer.province + ')' : ''}`,
          `• Dự án: ${summary}`,
          `• Đại lý gán: ${body.dealer?.name ?? 'Chưa gán'}${body.dealer?.phone ? ' · ' + body.dealer.phone : ''}`,
          ``,
          `Mở admin: https://farm-supply-chain.lovable.app/admin/leads/calculator`,
        ].join('\n'),
      });
    }

    // Zalo dealer channel — n8n bắn qua Zalo OA API
    if (body.dealer?.zalo) {
      channels.push({
        type: 'zalo',
        target: 'dealer',
        zalo_phone: body.dealer.zalo.replace(/\D/g, ''),
        dealer: body.dealer,
        message: [
          `🌱 LEAD MỚI #${shortId}`,
          `Khách: ${body.customer.name} (${body.customer.phone})`,
          `Dự án: ${summary}`,
          body.customer.province ? `Khu vực: ${body.customer.province}` : '',
          ``,
          `Vui lòng liên hệ tư vấn trong 30 phút.`,
        ].filter(Boolean).join('\n'),
      });
    }

    // SMS fallback channel cho dealer (nếu n8n có Twilio)
    if (body.dealer?.phone) {
      channels.push({
        type: 'sms',
        target: 'dealer',
        phone: body.dealer.phone,
        message: `[NhaBeAgri] Lead moi #${shortId} - ${body.customer.name} ${body.customer.phone}. Vao app de xem chi tiet.`,
      });
    }

    // 4. Send to n8n
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'calculator_lead',
        timestamp: new Date().toISOString(),
        lead: {
          id: body.lead_id,
          short_id: shortId,
          ...body,
          summary,
        },
        channels,
        admin_url: `https://farm-supply-chain.lovable.app/admin/leads/calculator`,
      }),
    });

    return new Response(JSON.stringify({
      ok: res.ok,
      status: res.status,
      channels_sent: channels.map((c) => ({ type: c.type, target: c.target })),
      admin_count: adminRecipients.length,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('notify_lead_error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
