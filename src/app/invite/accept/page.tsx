/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  INVITE ACCEPT PAGE - Server Component                           ║
 * ║  Accept invitation and create account                             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Suspense } from "react";
import { getInvitationByToken } from "@/app/actions/invite";
import AcceptInvitationForm from "./_components/AcceptInvitationForm";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface AcceptPageProps {
  searchParams: Promise<{ token?: string }>;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * FETCH DATA
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function fetchInvitation(token: string) {
  return await getInvitationByToken(token);
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * INVALID TOKEN STATE
 * ═══════════════════════════════════════════════════════════════════════════════ */

function InvalidToken({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <AlertCircle className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white">Link không hợp lệ</h1>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 text-center">
                {message || "Link lời mời không hợp lệ hoặc đã hết hạn."}
              </p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Link này có thể đã:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Hết hạn (sau 7 ngày)</li>
                <li>Bị hủy bởi người gửi</li>
                <li>Đã được sử dụng trước đó</li>
                <li>Bị sửa đổi hoặc sai</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/login">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại đăng nhập
                </button>
              </Link>
              <Link href="/signup">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  Tạo tài khoản mới
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * LOADING STATE
 * ═══════════════════════════════════════════════════════════════════════════════ */

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground">Đang xác minh lời mời...</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SUCCESS STATE (Invitation found, show form)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function InvitationFound({
  token,
  invitation,
}: {
  token: string;
  invitation: {
    email: string;
    role: string;
    status: string;
    expires_at: Date | null;
  };
}) {
  const roleLabels: Record<string, string> = {
    dealer: "Đại lý",
    supplier: "Nhà cung cấp",
    admin: "Quản trị viên",
    customer: "Khách hàng",
  };
  const roleLabel = roleLabels[invitation.role] || invitation.role;

  const expiresDate = invitation.expires_at
    ? new Date(invitation.expires_at).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white">Bạn được mời tham gia</h1>
            <p className="mt-1 text-sm text-emerald-100">
              Nhà Bè Agri
            </p>
          </div>

          {/* Invitation Info */}
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Shield className="h-4 w-4" />
                <span className="font-medium">
                  Vai trò: {roleLabel}
                </span>
              </div>
              {expiresDate && (
                <>
                  <span className="text-emerald-300">•</span>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <Clock className="h-4 w-4" />
                    <span>Hết hạn: {expiresDate}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="px-6 pt-4">
            <p className="text-sm text-muted-foreground mb-1">
              Lời mời được gửi đến:
            </p>
            <p className="font-medium text-foreground">{invitation.email}</p>
          </div>

          {/* Form */}
          <div className="px-6 pt-4 pb-6">
            <AcceptInvitationForm
              token={token}
              email={invitation.email}
              role={invitation.role}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default async function AcceptInvitePage({ searchParams }: AcceptPageProps) {
  const params = await searchParams;
  const token = params.token;

  // No token provided
  if (!token) {
    return <InvalidToken message="Không tìm thấy link lời mời. Vui lòng kiểm tra email."} />;
  }

  // Fetch invitation
  const { success, data, error } = await fetchInvitation(token);

  // Error or not found
  if (!success || !data) {
    return <InvalidToken message={error || "Lời mời không tồn tại"} />;
  }

  // Invitation found
  return <InvitationFound token={token} invitation={data} />;
}
