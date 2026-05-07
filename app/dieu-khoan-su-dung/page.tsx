import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | Nhà Bè Agri",
  description: "Điều khoản và điều kiện sử dụng website Nhà Bè Agri.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0">
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
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Điều khoản sử dụng
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Cập nhật lần cuối: Tháng 5/2024
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Chấp nhận điều khoản</h2>
              <p className="text-slate-600 mb-4">
                Khi truy cập và sử dụng website Nhà Bè Agri (nhabeagri.vn), bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng website của chúng tôi.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Giới thiệu về Nhà Bè Agri</h2>
              <p className="text-slate-600 mb-4">
                Nhà Bè Agri là nền tảng thương mại điện tử chuyên cung cấp:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Phân bón và dinh dưỡng cây trồng</li>
                <li>Thiết bị tưới và hệ thống nông nghiệp</li>
                <li>Máy móc và dụng cụ nông nghiệp</li>
                <li>Kết nối mạng lưới đại lý trên toàn quốc</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Tài khoản người dùng</h2>
              <p className="text-slate-600 mb-4">
                Khi đăng ký tài khoản, bạn cam kết:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Cung cấp thông tin chính xác và đầy đủ</li>
                <li>Bảo mật thông tin đăng nhập của mình</li>
                <li>Chịu trách nhiệm về mọi hoạt động dưới tài khoản của bạn</li>
                <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Đặt hàng và thanh toán</h2>
              <p className="text-slate-600 mb-4">
                <strong>4.1 Đặt hàng:</strong> Khi đặt hàng trên website, bạn đồng ý cung cấp thông tin đơn hàng chính xác.
              </p>
              <p className="text-slate-600 mb-4">
                <strong>4.2 Giá cả:</strong> Giá sản phẩm được hiển thị bằng VND và có thể thay đổi mà không cần thông báo trước.
              </p>
              <p className="text-slate-600 mb-4">
                <strong>4.3 Thanh toán:</strong> Chúng tôi hỗ trợ các phương thức:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Chuyển khoản ngân hàng</li>
                <li>Thanh toán khi nhận hàng (COD)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Giao hàng và vận chuyển</h2>
              <p className="text-slate-600 mb-4">
                Thời gian giao hàng dao động từ 2-7 ngày làm việc tùy theo khu vực. Phí vận chuyển được tính dựa trên trọng lượng và khoảng cách. Đơn hàng từ 2 triệu VNĐ trở lên được miễn phí vận chuyển trong nội thành TP.HCM.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">6. Quyền sở hữu trí tuệ</h2>
              <p className="text-slate-600 mb-4">
                Toàn bộ nội dung trên website, bao gồm nhưng không giới hạn: văn bản, hình ảnh, logo, đồ họa, âm thanh, video, và phần mềm đều thuộc quyền sở hữu của Nhà Bè Agri hoặc được cấp phép hợp lệ. Nghiêm cấm sao chép, phân phối, hoặc sử dụng cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">7. Giới hạn trách nhiệm</h2>
              <p className="text-slate-600 mb-4">
                Nhà Bè Agri không chịu trách nhiệm về:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Thiệt hại gián tiếp hoặc do hậu quả từ việc sử dụng sản phẩm</li>
                <li>Sự chậm trễ trong giao hàng do các yếu tố khách quan (thời tiết, thiên tai...)</li>
                <li>Lỗi phát sinh từ việc sử dụng không đúng cách theo hướng dẫn</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">8. Sửa đổi điều khoản</h2>
              <p className="text-slate-600 mb-4">
                Chúng tôi có quyền cập nhật, sửa đổi các điều khoản này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website. Việc bạn tiếp tục sử dụng website sau khi có thay đổi đồng nghĩa với việc chấp nhận các điều khoản mới.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">9. Luật áp dụng</h2>
              <p className="text-slate-600 mb-4">
                Các điều khoản này được điều chỉnh theo pháp luật Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết tại cơ quan có thẩm quyền tại TP. Hồ Chí Minh.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">10. Liên hệ</h2>
              <p className="text-slate-600 mb-4">
                Nếu bạn có câu hỏi về Điều khoản sử dụng, vui lòng liên hệ:
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
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="bg-slate-900 text-slate-300 py-8 flex-shrink-0">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Công Ty Cổ Phần Nhà Bè Agri</p>
        </div>
      </div>
    </div>
  );
}
