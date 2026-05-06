/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  RESEND EMAIL CLIENT                                            ║
 * ║  Configuration for sending transactional emails                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Resend } from "resend";

/* ═══════════════════════════════════════════════════════════════════════════════
 * RESEND CLIENT (singleton pattern)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForResend = globalThis as unknown as { resend: Resend | undefined };

export const resend = globalForResend.resend ?? new Resend(process.env.RESEND_API_KEY);

if (process.env.NODE_ENV !== "production") {
  globalForResend.resend = resend;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || "Nhà Bè Agri <noreply@nhabe-agri.com>",
  companyName: "Nhà Bè Agri",
  companyPhone: "1900 1234",
  companyWebsite: "https://nhabe-agri.com",
  dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dealer/dashboard`,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Send email with error handling
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface SendEmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<SendEmailResult> {
  // Skip if no API key configured
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email send");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error("[Email] Failed to send:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent successfully: ${data?.id}`);
    return { success: true, emailId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception:", message);
    return { success: false, error: message };
  }
}
