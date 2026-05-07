import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | Nhà Bè Agri",
  description: "Chính sách bảo mật thông tin cá nhân của Nhà Bè Agri - Storefront nông nghiệp O2O.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Chính sách bảo mật
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Cập nhật lần cuối: Tháng 5/2024
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Mục đích thu thập thông tin</h2>
              <p className="text-slate-600 mb-4">
                Nhà Bè Agri ("chúng tôi") cam kết bảo vệ quyền riêng tư của khách hàng. Chúng tôi thu thập thông tin cá nhân với các mục đích sau:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Xử lý đơn hàng và cung cấp dịch vụ khách hàng</li>
                <li>Tư vấn sản phẩm và giải pháp nông nghiệp phù hợp</li>
                <li>Kết nối với hệ thống đại lý trên toàn quốc</li>
                <li>Gửi thông tin khuyến mãi và cập nhật sản phẩm mới (khi được đồng ý)</li>
                <li>Cải thiện chất lượng dịch vụ và trải nghiệm người dùng</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Thông tin cá nhân được thu thập</h2>
              <p className="text-slate-600 mb-4">
                Chúng tôi có thể thu thập các thông tin sau:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Họ và tên</strong> - để xử lý đơn hàng và liên hệ</li>
                <li><strong>Số điện thoại</strong> - để tư vấn và xác nhận đơn hàng</li>
                <li><strong>Email</strong> - để gửi thông tin và hỗ trợ</li>
                <li><strong>Địa chỉ giao hàng</strong> - để vận chuyển sản phẩm</li>
                <li><strong>Thông tin trang trại/nông hộ</strong> - để tư vấn giải pháp phù hợp</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Bảo mật thông tin</h2>
              <p className="text-slate-600 mb-4">
                Chúng tôi áp dụng các biện pháp bảo mật sau:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Mã hóa dữ liệu khi truyền tải (SSL/TLS)</li>
                <li>Lưu trữ trên hệ thống cloud có firewall và bảo mật cao</li>
                <li>Hạn chế quyền truy cập chỉ cho nhân viên được ủy quyền</li>
                <li>Không chia sẻ thông tin cá nhân với bên thứ ba không liên quan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Quyền của người dùng</h2>
              <p className="text-slate-600 mb-4">
                Bạn có quyền:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình</li>
                <li>Từ chối nhận email marketing bất kỳ lúc nào</li>
                <li>Liên hệ để được giải đáp về cách chúng tôi sử dụng dữ liệu</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Cookies</h2>
              <p className="text-slate-600 mb-4">
                Website sử dụng cookies để:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Ghi nhớ đăng nhập và tùy chọn người dùng</li>
                <li>Phân tích lưu lượng truy cập để cải thiện dịch vụ</li>
                <li>Hiển thị quảng cáo phù hợp (nếu có)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">6. Liên hệ</h2>
              <p className="text-slate-600 mb-4">
                Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <strong>Hotline:</strong> 0983 230 879
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  <strong>Email:</strong> contact@nhabeagri.vn
                </p>
                <p className="text-slate-500 text-sm">
                  Địa chỉ: Ấp 3, Xã Nhà Bè, Huyện Nhà Bè, TP. Hồ Chí Minh
                </p>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-8">
              <p className="text-slate-500 text-sm">
                Nhà Bè Agri có quyền cập nhật chính sách này bất kỳ lúc nào. Mọi thay đổi sẽ được thông báo trên website.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="bg-slate-900 text-slate-300 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Công Ty Cổ Phần Nhà Bè Agri</p>
        </div>
      </div>
    </div>
  );
}
