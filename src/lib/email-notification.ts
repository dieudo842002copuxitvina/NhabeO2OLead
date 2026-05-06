/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  EMAIL NOTIFICATION SERVICE                                     ║
 * ║  Functions for sending email notifications to dealers                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { render } from "@react-email/components";
import { sendEmail, EMAIL_CONFIG } from "@/lib/mail";
import { NewLeadEmail } from "@/emails/NewLeadEmail";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface LeadEmailData {
  leadId: string;
  dealerId: string;
  dealerName: string;
  dealerEmail?: string | null;
  customerName?: string;
  customerPhone: string;
  province?: string;
  district?: string;
  cropType?: string;
  areaHa?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SEND NEW LEAD EMAIL
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Send new lead notification email to dealer
 * This function is non-blocking and errors are caught silently
 */
export async function sendNewLeadNotificationEmail(data: LeadEmailData): Promise<void> {
  // Skip if no dealer email provided
  if (!data.dealerEmail) {
    console.log(`[Email] Skipping email - no dealer email for "${data.dealerName}"`);
    return;
  }

  try {
    // Render email template
    const emailHtml = await render(
      NewLeadEmail({
        dealerName: data.dealerName,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        province: data.province,
        district: data.district,
        cropType: data.cropType,
        areaHa: data.areaHa,
        leadId: data.leadId,
        dashboardUrl: EMAIL_CONFIG.dashboardUrl,
      }),
      { pretty: true }
    );

    // Generate plain text version
    const textVersion = `
Xin chào ${data.dealerName},

Bạn vừa nhận được một Lead mới từ hệ thống Nhà Bè Agri.

THÔNG TIN KHÁCH HÀNG:
- Tên: ${data.customerName || "Khách hàng ẩn danh"}
- Số điện thoại: ${data.customerPhone}
- Khu vực: ${[data.district, data.province].filter(Boolean).join(", ") || "Chưa cung cấp"}
- Loại cây trồng: ${data.cropType || "Chưa cung cấp"}
- Diện tích: ${data.areaHa ? `${data.areaHa.toLocaleString("vi-VN")} ha` : "Chưa cung cấp"}

Truy cập Dashboard để xem chi tiết: ${EMAIL_CONFIG.dashboardUrl}

---
Nhà Bè Agri - Hệ thống tưới tiêu thông minh
Hotline: 1900 1234
    `.trim();

    // Send email
    const result = await sendEmail({
      to: data.dealerEmail,
      subject: `🔔 Lead mới: ${data.customerName || "Khách hàng"} cần tư vấn - ${data.cropType || ""}`,
      html: emailHtml,
      text: textVersion,
    });

    if (result.success) {
      console.log(
        `[Email] New lead notification sent to "${data.dealerName}" (${data.dealerEmail})`
      );
    } else {
      console.warn(`[Email] Failed to send to "${data.dealerName}": ${result.error}`);
    }
  } catch (error) {
    // Non-blocking: log error but don't throw
    console.error(`[Email] Exception sending email to "${data.dealerName}":`, error);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SEND WELCOME EMAIL TO DEALER
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Send welcome email when dealer account is created
 */
export async function sendDealerWelcomeEmail(
  dealerEmail: string,
  dealerName: string,
  tempPassword?: string
): Promise<boolean> {
  try {
    const loginUrl = `${EMAIL_CONFIG.dashboardUrl.replace("/dealer/dashboard", "/auth/login")}`;

    const emailHtml = await render({
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 8px 8px 0 0; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">🎉 Chào mừng đại lý mới!</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 32px; border-radius: 0 0 8px 8px;">
            <p>Xin chào <strong>${dealerName}</strong>,</p>
            <p>Tài khoản đại lý của bạn đã được kích hoạt. Giờ đây bạn có thể:</p>
            <ul>
              <li>Xem danh sách Lead được phân bổ</li>
              <li>Xem chi tiết dự toán vật tư (BOM)</li>
              <li>Cập nhật trạng thái Lead</li>
              <li>Theo dõi hiệu quả kinh doanh</li>
            </ul>
            <p style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="background-color: #059669; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Đăng nhập Dashboard
              </a>
            </p>
            ${tempPassword ? `<p style="background: #fef3c7; padding: 12px; border-radius: 4px; font-size: 14px;"><strong>Mật khẩu tạm:</strong> ${tempPassword}</p>` : ""}
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #64748b; font-size: 12px; text-align: center;">
              Nhà Bè Agri - Hệ thống tưới tiêu thông minh<br>
              Hotline: 1900 1234 | www.nhabe-agri.com
            </p>
          </div>
        </div>
      `,
      text: `Xin chào ${dealerName},\n\nTài khoản đại lý của bạn đã được kích hoạt.\n\nĐăng nhập tại: ${loginUrl}\n\nNhà Bè Agri - Hotline: 1900 1234`,
    } as any);

    const result = await sendEmail({
      to: dealerEmail,
      subject: `🎉 Chào mừng đại lý ${dealerName} - Nhà Bè Agri`,
      html: emailHtml,
    });

    return result.success;
  } catch (error) {
    console.error(`[Email] Failed to send welcome email to "${dealerEmail}":`, error);
    return false;
  }
}
