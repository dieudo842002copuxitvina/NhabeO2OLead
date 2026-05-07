/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  RESEND EMAIL CLIENT                                              ║
 * ║  Configuration for sending emails via Resend API                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Resend } from "resend";

/* ═══════════════════════════════════════════════════════════════════════════════
 * RESEND CLIENT (singleton pattern)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForResend = globalThis as unknown as { resend: Resend | undefined };

// Create Resend client with API key
const resend = globalForResend.resend ?? new Resend({
  apiKey: process.env.RESEND_API_KEY,
});

// Save to global in development to prevent recreation on hot reload
if (process.env.NODE_ENV !== "production") {
  globalForResend.resend = resend;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

// Default sender email (configured in Resend dashboard)
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || "Nhà Bè Agri <noreply@nhaBeAgri.vn>";
const DEFAULT_REPLY_TO = process.env.EMAIL_REPLY_TO || "contact@nhaBeAgri.vn";

/* ═══════════════════════════════════════════════════════════════════════════════
 * EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

export { resend, DEFAULT_FROM_EMAIL, DEFAULT_REPLY_TO };

/* ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Send Email
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Send an email using Resend
 * Non-fatal: errors are logged but not thrown to prevent blocking main flows
 */
export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email send");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: options.from || DEFAULT_FROM_EMAIL,
      to: options.to,
      replyTo: options.replyTo || DEFAULT_REPLY_TO,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: options.cc,
      bcc: options.bcc,
    });

    if (error) {
      console.error("[Email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent successfully: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Email] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error"
    };
  }
}
