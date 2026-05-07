import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính sách bảo hành & Đổi trả | Nhà Bè Agri",
  description: "Chính sách bảo hành sản phẩm và đổi trả hàng hóa của Nhà Bè Agri.",
};

export default function WarrantyPage() {
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
              <RefreshCw className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Chính sách bảo hành & Đổi trả
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Cập nhật lần cuốy: Tháng 5/2024
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Chính sách bảo hành</h2>
              <p className="text-slate-600 mb-4">
                Nhà Bè Agri cam kết cung cấp sản phẩm chất lượng và hỗ trợ bảo hành theo các điều kiện sau:
              </p>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">1.1 Thời gian bảo hành</h3>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-slate-200 text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 p-3 text-left font-semibold">Danh mục sản phẩm</th>
                      <th className="border border-slate-200 p-3 text-left font-semibold">Thời gian bảo hành</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-200 p-3">Thiết bị điện (máy bơm, bộ điều khiển)</td>
                      <td className="border border-slate-200 p-3">12 tháng</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 p-3">Thiết bị tưới (ống, van, béc)</td>
                      <td className="border border-slate-200 p-3">6 tháng</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 p-3">Dụng cụ cầm tay</td>
                      <td className="border border-slate-200 p-3">3 tháng</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 p-3">Phân bón, thuốc bảo vệ thực vật</td>
                      <td className="border border-slate-200 p-3">Theo hạn sử dụng trên bao bì</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">1.2 Điều kiện bảo hành</h3>
              <p className="text-slate-600 mb-4">Sản phẩm được bảo hành khi đáp ứng các điều kiện:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Còn trong thời gian bảo hành</li>
                <li>Có hóa đơn mua hàng hoặc phiếu giao hàng</li>
                <li>Sản phẩm bị lỗi từ nhà sản xuất (không phải do sử dụng sai cách)</li>
                <li>Tem bảo hành còn nguyên vẹn</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">1.3 Trường hợp không được bảo hành</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Sản phẩm bị hư hỏng do sử dụng không đúng hướng dẫn</li>
                <li>Sản phẩm bị biến dạng, cháy nổ do điện áp không phù hợp</li>
                <li>Sản phẩm bị rơi vỡ, va đập mạnh</li>
                <li>Sản phẩm đã được tự ý sửa chữa hoặc thay đổi cấu trúc</li>
                <li>Sản phẩm bị ảnh hưởng bởi thiên tai, lũ lụt, hỏa hoạn</li>
              </ul>
            </section>

            <section id="doi-tra" className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Chính sách đổi trả</h2>
              <p className="text-slate-600 mb-4">
                Nhà Bè Agri hỗ trợ đổi trả sản phẩm trong các trường hợp sau:
              </p>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">2.1 Đổi trả do lỗi từ nhà cung cấp</h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
                <li>Sản phẩm giao sai so với đơn đặt hàng</li>
                <li>Sản phẩm bị lỗi kỹ thuật nghiêm trọng từ nhà sản xuất</li>
              </ul>
              <p className="text-slate-600 mb-4">
                <strong>Thời hạn:</strong> Yêu cầu đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng.
              </p>

              <h3 className="text-lg font-semibold text-slate-800 mb-3">2.2 Đổi trả do thay đổi nhu cầu</h3>
              <p className="text-slate-600 mb-4">
                Với sản phẩm không bị lỗi, chúng tôi hỗ trợ đổi trả với điều kiện:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Sản phẩm còn mới, chưa qua sử dụng</li>
                <li>Đầy đủ phụ kiện, quà tặng kèm (nếu có)</li>
                <li>Còn nguyên vẹn seal, nhãn mác của nhà sản xuất</li>
                <li>Yêu cầu đổi trả trong vòng <strong>3 ngày</strong> kể từ ngày nhận hàng</li>
              </ul>
              <p className="text-slate-600 mb-4">
                <strong>Lưu ý:</strong> Khách hàng chịu phí vận chuyển khi đổi trả không do lỗi từ nhà cung cấp.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Quy trình bảo hành & đổi trả</h2>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm flex-shrink-0">1</span>
                  <div>
                    <p className="font-medium text-slate-900">Liên hệ hotline</p>
                    <p className="text-slate-600 text-sm">Gọi 0983 230 879 hoặc gửi email để thông báo yêu cầu</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm flex-shrink-0">2</span>
                  <div>
                    <p className="font-medium text-slate-900">Cung cấp thông tin</p>
                    <p className="text-slate-600 text-sm">Mã đơn hàng, hình ảnh sản phẩm lỗi, mô tả tình trạng</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm flex-shrink-0">3</span>
                  <div>
                    <p className="font-medium text-slate-900">Gửi sản phẩm</p>
                    <p className="text-slate-600 text-sm">Gửi sản phẩm về địa chỉ được hướng dẫn kèm hóa đơn</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm flex-shrink-0">4</span>
                  <div>
                    <p className="font-medium text-slate-900">Xử lý & hoàn tất</p>
                    <p className="text-slate-600 text-sm">Nhà Bè Agri kiểm tra và xử lý trong 5-7 ngày làm việc</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Hoàn tiền</h2>
              <p className="text-slate-600 mb-4">
                Sau khi xác nhận yêu cầu đổi trả hợp lệ, Nhà Bè Agri sẽ hoàn tiền theo phương thức thanh toán ban đầu trong vòng <strong>7-15 ngày làm việc</strong>.
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Thanh toán chuyển khoản: Hoàn tiền vào tài khoản ngân hàng của quý khách</li>
                <li>Thanh toán COD: Quý khách cung cấp thông tin tài khoản để nhận hoàn tiền</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Liên hệ bảo hành</h2>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <strong>Hotline bảo hành:</strong> 0983 230 879 (8:00 - 17:00, Thứ 2 - Thứ 7)
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  <strong>Email:</strong> warranty@nhabeagri.vn
                </p>
                <p className="text-slate-500 text-sm">
                  Địa chỉ tiếp nhận bảo hành: Ấp 3, Xã Nhà Bè, Huyện Nhà Bè, TP. Hồ Chí Minh
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
