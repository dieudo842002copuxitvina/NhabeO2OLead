/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER PROFILE EDIT PAGE                                        ║
 * ║  Allows dealers to edit their public profile information               ║
 * ║  Route: /dealer/dashboard/profile                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
import { getDealerProfile } from "@/app/actions/dealer";
import DealerProfileForm from "./_components/DealerProfileForm";

/* ═══════════════════════════════════════════════════════════════════════════════
 * METADATA
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "Sửa thông tin cửa hàng | Dealer Dashboard",
  description: "Cập nhật thông tin hồ sơ đại lý trên Nhà Bè Agri",
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default async function DealerProfilePage() {
  const { success, data: profile, error } = await getDealerProfile();

  if (!success || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Không thể tải thông tin
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            {error || "Đã xảy ra lỗi khi tải thông tin đại lý."}
          </p>
          <Link
            href="/dealer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dealer/dashboard"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Sprout className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900">Sửa thông tin cửa hàng</h1>
                  <p className="text-xs text-slate-500">{profile.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Thông tin công khai:</strong> Các thông tin bạn cập nhật sẽ được hiển thị
            trên trang công khai của đại lý tại{" "}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">
              /dai-ly/{profile.slug || profile.id}
            </code>
            . Giúp khách hàng dễ dàng tìm thấy và liên hệ với bạn.
          </p>
        </div>

        {/* Profile Form */}
        <DealerProfileForm profile={profile} />

        {/* SEO Tips */}
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">💡 Mẹo SEO</h3>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• <strong>Slug:</strong> Nên sử dụng tên không dấu, ví dụ: <code> dai-ly-minh-phuong-daklak</code></li>
            <li>• <strong>Meta Title:</strong> Tiêu đề hiển thị trên Google, nên chứa tên đại lý và khu vực (tối đa 70 ký tự)</li>
            <li>• <strong>Meta Description:</strong> Mô tả ngắn về đại lý, sẽ hiển thị dưới tiêu đề trên Google (tối đa 160 ký tự)</li>
            <li>• <strong>Giới thiệu (About Us):</strong> Viết ngắn gọn về thế mạnh, kinh nghiệm và dịch vụ của bạn</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
