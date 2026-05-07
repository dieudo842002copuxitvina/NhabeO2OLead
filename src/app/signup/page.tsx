"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SIGNUP PAGE - Nhà Bè Agri                                   ║
 * ║  User registration form with Nhà Bè Agri branding            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupAction, signInWithGoogleAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Leaf, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, Loader2, TrendingUp } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signupAction(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        if (result.error) {
          setError(result.error);
        }
        if (result.needsEmailConfirmation) {
          setSuccessMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.");
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Đã xảy ra lỗi khi đăng ký");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogleAction("/tinh-toan");
      if (result.error) {
        setError(result.error);
        setIsGoogleLoading(false);
      }
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Đã xảy ra lỗi khi đăng ký với Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-green-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute bottom-1/4 -left-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-green-400/10 animate-pulse" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/20">
              <Leaf className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Nhà Bè Agri</h1>
              <p className="text-green-200 text-sm font-medium">Nền tảng Nông nghiệp Thông minh</p>
            </div>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Kết nối chuyên gia,<br />
            <span className="text-green-300">nâng tầm nông nghiệp</span>
          </h2>

          <p className="text-green-100/80 text-lg mb-10 max-w-md leading-relaxed">
            Tham gia cùng hàng nghìn nông dân và chuyên gia nông nghiệp Việt Nam để sử dụng công cụ tính toán tưới tiêu thông minh.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span>Tăng năng suất cây trồng lên đến 40%</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Tiết kiệm đến 60% chi phí nước</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Hỗ trợ từ đội ngũ kỹ thuật chuyên nghiệp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 bg-slate-50/50 overflow-y-auto py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nhà Bè Agri</h1>
              <p className="text-sm text-muted-foreground">Đăng ký tài khoản mới</p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Tạo tài khoản mới
            </h2>
            <p className="text-muted-foreground">
              Đăng ký để bắt đầu sử dụng công cụ tính toán
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  className={`pl-11 h-12 ${fieldErrors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  disabled={isLoading}
                  required
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  autoComplete="email"
                  className={`pl-11 h-12 ${fieldErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  disabled={isLoading}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Số điện thoại <span className="text-slate-400">(tùy chọn)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0901 234 567"
                  autoComplete="tel"
                  className="pl-11 h-12"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Ít nhất 8 ký tự"
                  autoComplete="new-password"
                  className={`pl-11 h-12 ${fieldErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  disabled={isLoading}
                  required
                  minLength={8}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  className={`pl-11 h-12 ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                  disabled={isLoading}
                  required
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                required
                className="mt-1 w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="text-green-600 hover:text-green-700 font-medium">
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-green-600 hover:text-green-700 font-medium">
                  Chính sách bảo mật
                </Link>{" "}
                của Nhà Bè Agri
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/25 text-white font-medium transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang đăng ký...
                </>
              ) : (
                <>
                  Đăng ký
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 px-3 text-muted-foreground">Hoặc đăng ký với</span>
            </div>
          </div>

          {/* Google Signup Button */}
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleSignup}
            className="w-full h-12 border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-500" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span className="font-medium">Đăng ký với Google</span>
          </Button>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-muted-foreground">
            <p>
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
