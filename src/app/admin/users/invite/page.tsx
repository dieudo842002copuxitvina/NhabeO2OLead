"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  INVITE USER PAGE - Client Component                             ║
 * ║  Admin form to send invitations to dealers and suppliers            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Mail,
  Building2,
  Send,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Shield,
  Package,
  UserPlus,
} from "lucide-react";
import { createInvitation, type InviteRole } from "@/app/actions/invite";
import { useToast } from "@/components/ui/use-toast";

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const ROLE_OPTIONS: { value: InviteRole; label: string; description: string; icon: typeof Building2 }[] = [
  {
    value: "dealer",
    label: "Đại lý",
    description: "Nhận Lead từ khách hàng, quản lý hồ sơ và cập nhật trạng thái",
    icon: Building2,
  },
  {
    value: "supplier",
    label: "Nhà cung cấp",
    description: "Quản lý sản phẩm vật tư, BOM templates và báo cáo",
    icon: Package,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function InviteUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole | "">("");
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState("");
  const [error, setError] = useState("");

  /* ─────────────────────────────────────────────────────────────────────────
   * SUBMIT HANDLER
   * ───────────────────────────────────────────────────────────────────────── */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !role) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    startTransition(async () => {
      const result = await createInvitation(email, role as InviteRole);

      if (!result.success) {
        setError(result.error || "Đã xảy ra lỗi");
        toast({
          title: "Lỗi",
          description: result.error || "Không thể gửi lời mời",
          variant: "destructive",
        });
        return;
      }

      setSuccess(true);
      setEmailSent(email);
      toast({
        title: "Thành công",
        description: `Lời mời đã được gửi đến ${email}`,
      });
    });
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * RESET & NAVIGATE
   * ───────────────────────────────────────────────────────────────────────── */

  const handleSendAnother = () => {
    setSuccess(false);
    setEmailSent("");
    setEmail("");
    setRole("");
    setError("");
  };

  const handleBackToUsers = () => {
    router.push("/admin/users");
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * RENDER
   * ───────────────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToUsers}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mời người dùng
          </h1>
          <p className="text-sm text-muted-foreground">
            Gửi lời mời đến Đại lý hoặc Nhà cung cấp mới
          </p>
        </div>
      </div>

      {/* Success State */}
      {success ? (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-emerald-900">
                  Lời mời đã được gửi thành công!
                </h2>
                <p className="mt-1 text-sm text-emerald-700">
                  Email lời mời đã được gửi đến{" "}
                  <strong>{emailSent}</strong>
                </p>
              </div>
              <div className="space-y-2 text-sm text-emerald-700 bg-emerald-100 rounded-lg p-4 w-full">
                <p className="font-medium">📧 Kiểm tra hộp thư</p>
                <p>
                  Người được mời sẽ nhận được email với link chấp nhận lời mời.
                  Link có hiệu lực trong <strong>7 ngày</strong>.
                </p>
                <p className="text-emerald-600">
                  Sau khi chấp nhận, họ sẽ được điều hướng đến Dashboard tương ứng.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSendAnother}>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi lời mời khác
                </Button>
                <Button onClick={handleBackToUsers}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Quay lại danh sách
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Form State */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Tạo lời mời mới
            </CardTitle>
            <CardDescription>
              Điền thông tin bên dưới để gửi lời mời tham gia Nhà Bè Agri.
              Người được mời sẽ nhận email với hướng dẫn tạo tài khoản.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email người được mời <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email phải là email chưa có tài khoản trong hệ thống.
                </p>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Vai trò <span className="text-red-500">*</span>
                </label>

                <div className="grid gap-3">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = role === option.value;
                    return (
                      <div
                        key={option.value}
                        onClick={() => setRole(option.value)}
                        className={`
                          relative flex items-start gap-3 rounded-lg border p-4 cursor-pointer
                          transition-all duration-150
                          ${isSelected
                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500"
                            : "border-border hover:border-emerald-300 hover:bg-emerald-50/50"
                          }
                          ${isPending ? "opacity-50 pointer-events-none" : ""}
                        `}
                      >
                        <div className={`
                          flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
                          ${isSelected ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}
                        `}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{option.label}</span>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {option.description}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={isSelected}
                          onChange={() => setRole(option.value)}
                          className="sr-only"
                          disabled={isPending}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToUsers}
                  disabled={isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={!email || !role || isPending}
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isPending ? "Đang gửi..." : "Gửi lời mời"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Lưu ý</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Lời mời có hiệu lực trong <strong>7 ngày</strong> kể từ khi gửi.</li>
                <li>• Email người được mời không được trùng với tài khoản hiện có.</li>
                <li>• Người được mời sẽ tự tạo mật khẩu khi chấp nhận lời mời.</li>
                <li>• Chỉ Admin mới có quyền gửi lời mời.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
