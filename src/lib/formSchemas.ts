/**
 * formSchemas.ts
 * Zod validation schemas & shared utilities for all forms.
 * "Steel Validation" — tuân thủ chuẩn mạng Việt Nam.
 */
import { z } from 'zod';

// ─── Phone Validator (Vietnam) ────────────────────────────────────────────────
// Quy tắc: 10 số, bắt đầu 0, hoặc +84 + 9 số
// Cho phép khoảng trắng format: "090 123 4567"
const VN_PHONE_RE = /^(?:\+84|0)(3[2-9]|5[2689]|7[06-9]|8[0-9]|9[0-9])\d{7}$/;

export function normalizePhone(raw: string): string {
  // Strip spaces, dashes
  return raw.replace(/[\s\-]/g, '');
}

export function isValidVnPhone(raw: string): boolean {
  return VN_PHONE_RE.test(normalizePhone(raw));
}

/**
 * Auto-format: chèn khoảng trắng theo chuẩn 090 123 4567
 * Gọi trong onChange handler của input[type=tel]
 */
export function formatPhoneInput(value: string): string {
  // Strip all non-digits and + 
  const digits = value.replace(/[^\d+]/g, '');

  // Handle +84 prefix
  if (digits.startsWith('+84')) {
    const rest = digits.slice(3);
    if (rest.length <= 3) return `+84 ${rest}`;
    if (rest.length <= 6) return `+84 ${rest.slice(0, 3)} ${rest.slice(3)}`;
    return `+84 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 9)}`;
  }

  // Handle 0 prefix (most common)
  if (digits.startsWith('0')) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  }

  return digits;
}

// ─── Shared Field Schemas ─────────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .min(1, 'Vui lòng nhập số điện thoại')
  .refine(
    (v) => isValidVnPhone(v),
    'Số điện thoại không hợp lệ (VD: 0901 234 567)'
  );

export const nameSchema = z
  .string()
  .min(2, 'Họ tên ít nhất 2 ký tự')
  .max(60, 'Họ tên không được quá 60 ký tự');

export const areaHaSchema = z
  .number({ invalid_type_error: 'Vui lòng nhập diện tích' })
  .positive('Diện tích phải lớn hơn 0')
  .max(10000, 'Diện tích tối đa 10.000 ha');

export const provinceSchema = z.string().min(1, 'Vui lòng chọn tỉnh/thành');
export const districtSchema = z.string().min(1, 'Vui lòng chọn quận/huyện');

// ─── Contact / Lead Capture Schema ───────────────────────────────────────────
export const leadCaptureSchema = z.object({
  name:         nameSchema,
  phone:        phoneSchema,
  cropKey:      z.string().min(1, 'Vui lòng chọn loại cây trồng'),
  areHa:        areaHaSchema,
  provinceCode: provinceSchema,
  districtCode: districtSchema,
  message:      z.string().max(500, 'Nội dung tối đa 500 ký tự').optional(),
});

export type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>;

// ─── Quick Inquiry (compact — no location) ───────────────────────────────────
export const quickInquirySchema = z.object({
  name:  nameSchema,
  phone: phoneSchema,
});

export type QuickInquiryFormData = z.infer<typeof quickInquirySchema>;

// ─── ROI Calculator Input Schema ─────────────────────────────────────────────
export const roiInputSchema = z.object({
  cropKey:      z.string().min(1, 'Vui lòng chọn loại cây trồng'),
  areHa:        areaHaSchema,
  provinceCode: provinceSchema,
  phone:        phoneSchema,
});

export type RoiInputFormData = z.infer<typeof roiInputSchema>;
