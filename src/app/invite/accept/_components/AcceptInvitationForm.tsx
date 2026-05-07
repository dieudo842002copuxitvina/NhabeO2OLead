"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ACCEPT INVITATION FORM - Client Component                        ║
 * ║  Password form for accepting invitation and creating account          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Package,
  Shield,
} from "lucide-react";
import { acceptInvitation } from "@/app/actions/invite";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface AcceptInvitationFormProps {
  token: string;
  email: string;
  role: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Building2; dashboard: string }> = {
  dealer: {
    label: "Đại lý",
    icon: Building2,
    dashboard: "/dealer/dashboard",
  },
  supplier: {
    label: "Nhà cung cấp",
    icon: Package,
    dashboard: "/admin/products",
  },
  admin: {
    label: "Quản trị viên",
    icon: Shield,
    dashboard: "/admin/dashboard",
  },
  customer: {
    label: "Khách hàng",
    icon: Shield,
    dashboard: "/tinh-toan",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * PASSWORD STRENGTH
 * ═══════════════════════════════════════════════════════════════════════════════ */

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Yếu", color: "text-red-500" };
  if (score <= 4) return { score, label: "Trung bình", color: "text-amber-500" };
  return { score, label: "Mạnh", color: "text-emerald-500" };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function AcceptInvitationForm({
  token,
  email,
  role,
}: AcceptInvitationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength
  const strength = getPasswordStrength(password);
  const strengthPercent = Math.min((strength.score / 6) * 100, 100);

  // Role config
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.customer;
  const RoleIcon = roleConfig.icon;

  /* ─────────────────────────────────────────────────────────────────────────
   * SUBMIT HANDLER
   * ───────────────────────────────────────────────────────────────────────── */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validate
    if (!password) {
      setLocalError("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 8) {
      setLocalError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Mật khẩu xác nhận không khớp");
      return;
    }

    // Submit
    startTransition(async () => {
      const result = await acceptInvitation(token, password);

      if (!result.success) {
        setLocalError(result.error || "Đã xảy ra lỗi");
        toast({
          title: "Lỗi",
          description: result.error || "Không thể chấp nhận lời mời",
          variant: "destructive",
        });
        return;
      }

      setSuccess(true);
      toast({
        title: "Thành công",
        description: "Tài khoản đã được tạo. Đang chuyển hướng...",
      });

      // Redirect to appropriate dashboard
      setTimeout(() => {
        router.push(roleConfig.dashboard);
      }, 1500);
    });
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * RENDER
   * ───────────────────────────────────────────────────────────────────────── */

  // Success state
  if (success) {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-medium text-emerald-900">Tài khoản đã được tạo!</p>
          <p className="text-sm text-emerald-700 mt-1">
            Đang chuyển hướng đến Dashboard...
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <RoleIcon className="h-4 w-4" />
          <span>Dashboard {roleConfig.label}</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role Badge */}
      <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
        <RoleIcon className="h-5 w-5 text-emerald-600" />
        <div className="text-left">
          <p className="text-xs text-emerald-600 font-medium">Vai trò được mời</p>
          <p className="text-sm font-semibold text-emerald-900">{roleConfig.label}</p>
        </div>
      </div>

      {/* Error */}
      {localError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      )}

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Mật khẩu <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Ít nhất 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password Strength */}
        {password && (
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  strength.score <= 2
                    ? "bg-red-500"
                    : strength.score <= 4
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${strengthPercent}%` }}
              />
            </div>
            <p className={`text-xs ${strength.color}`}>
              Độ mạnh: {strength.label}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Xác nhận mật khẩu <span className="text-red-500">*</span>
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isPending}
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Mật khẩu xác nhận không khớp
          </p>
        )}
        {confirmPassword && password === confirmPassword && (
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Mật khẩu khớp
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={
          !password ||
          !confirmPassword ||
          password !== confirmPassword ||
          password.length < 8 ||
          isPending
        }
        className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tạo tài khoản...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Chấp nhận lời mời &amp; Tạo tài khoản
          </>
        )}
      </Button>

      {/* Terms */}
      <p className="text-xs text-muted-foreground text-center">
        Bằng việc tạo tài khoản, bạn đồng ý với{" "}
        <a href="/terms" className="text-emerald-600 hover:underline">
          Điều khoản sử dụng
        </a>{" "}
        và{" "}
        <a href="/privacy" className="text-emerald-600 hover:underline">
          Chính sách bảo mật
        </a>{" "}
        của Nhà Bè Agri.
      </p>
    </form>
  );
}
