/**
 * Data masking helpers based on user role.
 * Sensitive fields (phone, revenue) are masked unless user is admin.
 */
import type { AppRole } from '@/contexts/AuthContext';

export function canViewSensitive(roles: AppRole[]): boolean {
  return roles.includes('admin');
}

/** Mask phone: 0901****67 */
export function maskPhone(phone: string | null | undefined, roles: AppRole[]): string {
  if (!phone) return '-';
  if (canViewSensitive(roles)) return phone;
  if (phone.length < 6) return '••••';
  return phone.slice(0, 4) + '****' + phone.slice(-2);
}

/** Mask currency: show only order of magnitude */
export function maskRevenue(amount: number, roles: AppRole[]): string {
  if (canViewSensitive(roles)) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  }
  // Show only magnitude bucket
  if (amount < 100_000_000) return '< 100M';
  if (amount < 500_000_000) return '100M – 500M';
  if (amount < 1_000_000_000) return '500M – 1B';
  if (amount < 5_000_000_000) return '1B – 5B';
  return '> 5B';
}
