import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, MapPin, LineChart as LineChartIcon, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SeoMeta from '@/components/SeoMeta';

// --- MOCK DATA ---
const tickerData = [
  { name: 'Cà phê Robusta', price: '120.000đ', change: '+2.5%', isUp: true },
  { name: 'Cà phê Arabica', price: '155.000đ', change: '+1.8%', isUp: true },
  { name: 'Hồ Tiêu', price: '150.000đ', change: '-1.2%', isUp: false },
  { name: 'Sầu riêng Ri6', price: '130.000đ', change: '+5.0%', isUp: true },
  { name: 'Lúa gạo ST25', price: '8.500đ', change: '0.0%', isUp: null }
];

const tableData = [
  { id: 1, name: 'Cà phê Robusta xô', region: 'Tây Nguyên', price: '120,500 đ/kg', change: '+2.5%', isUp: true, status: 'Đang tăng mạnh' },
  { id: 2, name: 'Hồ Tiêu đen', region: 'Chư Sê, Gia Lai', price: '150,000 đ/kg', change: '-1.2%', isUp: false, status: 'Giảm nhẹ' },
  { id: 3, name: 'Sầu riêng Ri6 (Loại 1)', region: 'Tiền Giang', price: '130,000 đ/kg', change: '+5.0%', isUp: true, status: 'Cầu vượt cung' },
  { id: 4, name: 'Sầu riêng Dona', region: 'Đắk Lắk', price: '95,000 đ/kg', change: '+1.5%', isUp: true, status: 'Ổn định' },
  { id: 5, name: 'Lúa khô ST25', region: 'ĐBSCL', price: '8,500 đ/kg', change: '0.0%', isUp: null, status: 'Đứng giá' }
];

const chartData = [
  { day: 'T2', price: 115 },
  { day: 'T3', price: 116 },
  { day: 'T4', price: 115.5 },
  { day: 'T5', price: 118 },
  { day: 'T6', price: 119 },
  { day: 'T7', price: 120.5 },
  { day: 'CN', price: 120.5 }
];

const seoSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Dataset",
      "name": "Bảng giá nông sản Đắk Lắk, Gia Lai hôm nay",
      "description": "Cập nhật giá cà phê, sầu riêng, hồ tiêu mới nhất từ các đại lý Nhà Bè Agri.",
      "variableMeasured": ["Giá Cà Phê", "Giá Sầu Riêng", "Giá Hồ Tiêu"]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Giá cà phê hôm nay tại Đắk Lắk là bao nhiêu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Giá cà phê Robusta hôm nay tại Đắk Lắk dao động quanh mức 120,500 đ/kg. Truy cập Nhà Bè Agri để xem biểu đồ chi tiết."
          }
        },
        {
          "@type": "Question",
          "name": "Đại lý thu mua sầu riêng gần nhất ở đâu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nhà Bè Agri cung cấp danh sách hơn 25+ đại lý trên toàn quốc hỗ trợ kỹ thuật và liên kết thu mua sầu riêng. Vui lòng xem tại mục Mạng lưới đại lý."
          }
        },
        {
          "@type": "Question",
          "name": "Cách theo dõi giá tiêu trực tuyến?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bà con nông dân có thể theo dõi giá tiêu (Hồ tiêu đen, tiêu sọ) cập nhật liên tục mỗi 8h sáng tại Trung Tâm Giá Nông Sản Nhà Bè Agri."
          }
        }
      ]
    }
  ]
};

export default function MarketPage() {
  return (
    <div 
      className="min-h-screen pb-24"
      style={{
        backgroundColor: '#F8FAFC', // slate-50
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232d5a27' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seoSchema) }} />
      <SeoMeta
        title="Trung Tâm Giá & Phân Tích Thị Trường Nông Sản"
        description="Cập nhật giá cà phê hôm nay tại Đắk Lắk, Gia Lai chính xác nhất từ hệ thống đại lý Nhà Bè Agri. Xem biểu đồ xu hướng thị trường sầu riêng, hồ tiêu."
        canonical="/thi-truong"
      />

      {/* 1. Daily Price Ticker (Marquee) */}
      <div className="bg-[#2D5A27] text-white py-3 overflow-hidden border-b-4 border-[#F57C00] shadow-md">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused]">
          {[...tickerData, ...tickerData].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 mx-8 text-sm font-semibold tracking-wider">
              <span className="text-white/80">{item.name}:</span>
              <span>{item.price}</span>
              {item.isUp === true && <TrendingUp className="w-4 h-4 text-green-300 ml-1" />}
              {item.isUp === false && <TrendingDown className="w-4 h-4 text-red-400 ml-1" />}
              {item.isUp !== null && (
                <span className={item.isUp ? 'text-green-300' : 'text-red-400'}>
                  {item.change}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="text-center mb-10">
          <Badge className="bg-[#F57C00]/10 text-[#F57C00] hover:bg-[#F57C00]/20 border-0 mb-3 px-3 py-1">Cập nhật lúc 08:00 AM</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-display mb-3">Trung Tâm Giá Nông Sản</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">Dữ liệu tham khảo trực tiếp từ chuỗi thu mua và đối tác chiến lược của Nhà Bè Agri.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Table & SEO (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 2. Main Market Table */}
            <Card className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm md:text-base">
                  <thead className="bg-slate-100/50 text-slate-600">
                    <tr>
                      <th className="py-4 px-5 font-semibold">Tên Nông Sản</th>
                      <th className="py-4 px-5 font-semibold">Vùng Miền</th>
                      <th className="py-4 px-5 font-semibold text-right">Giá Hôm Nay</th>
                      <th className="py-4 px-5 font-semibold text-center">Biến Động</th>
                      <th className="py-4 px-5 font-semibold">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50">
                    {tableData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-5 font-bold text-slate-800">{row.name}</td>
                        <td className="py-4 px-5 text-slate-500">{row.region}</td>
                        <td className="py-4 px-5 text-right font-semibold text-[#F57C00]">{row.price}</td>
                        <td className="py-4 px-5">
                          <div className={`flex items-center justify-center gap-1 font-semibold ${row.isUp === true ? 'text-[#2D5A27]' : row.isUp === false ? 'text-red-600' : 'text-slate-500'}`}>
                            {row.isUp === true && <TrendingUp className="w-4 h-4" />}
                            {row.isUp === false && <TrendingDown className="w-4 h-4" />}
                            {row.change}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <Badge variant="outline" className="border-slate-200 text-slate-600 bg-white">
                            {row.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* SEO Text */}
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-start">
              <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Thông tin thị trường:</strong> Cập nhật giá cà phê hôm nay tại Đắk Lắk, Gia Lai chính xác nhất từ hệ thống đại lý Nhà Bè Agri. Giá sầu riêng và hồ tiêu mang tính chất tham khảo tại vườn, vui lòng liên hệ trực tiếp thương lái địa phương để có giá chốt thực tế.
              </p>
            </div>
          </div>

          {/* Right Column: Chart & CTA */}
          <div className="space-y-6">
            
            {/* 3. Market Trends Chart */}
            <Card className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
                  <LineChartIcon className="w-5 h-5 text-[#2D5A27]" /> 
                  Biểu đồ xu hướng Cà Phê (7 ngày)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value}.000 đ`, 'Giá']}
                        labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2D5A27" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#2D5A27', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#F57C00', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 4. O2O Banner (Call to Action) */}
            <Card className="bg-[#2D5A27] text-white rounded-3xl border-0 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <CardContent className="p-8 relative z-10 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 leading-tight">Bạn muốn chốt giá tốt?</h3>
                <p className="text-green-100 text-sm mb-6 leading-relaxed">
                  Trang bị hệ thống tưới tự động ngay hôm nay để tăng năng suất vụ tới. Đại lý của chúng tôi đã sẵn sàng tư vấn.
                </p>
                <Link to="/dai-ly">
                  <Button className="w-full h-12 bg-[#F57C00] hover:bg-[#E65100] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20">
                    Liên hệ Đại lý gần nhất
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* 5. Market Insights (Phân Tích & Dự Báo) */}
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-display mb-8">Nhận Định Thị Trường Nông Sản</h2>
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <Card className="bg-white/80 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-3xl flex flex-col h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <Badge className="bg-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#2D5A27]/20 border-0 mb-4 w-fit">Thị trường Thế Giới</Badge>
                <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug">Cập nhật sàn London & New York: Cà phê bước vào chu kỳ giá mới</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                  Phân tích biến động kho dự trữ và dự báo sản lượng Robusta từ các đối thủ cạnh tranh trực tiếp. Mức giá neo cao tạo cơ hội chốt lời lớn.
                </p>
                <Link to="/cong-cu/tinh-toan" className="mt-auto">
                  <Button variant="outline" className="w-full border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5 rounded-xl font-semibold">
                    🧮 Tính toán vật tư tưới tiết kiệm
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="bg-white/80 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-3xl flex flex-col h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 mb-4 w-fit">Xuất khẩu</Badge>
                <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug">Thông tin cửa khẩu: Sầu riêng và cơ hội mở rộng thị trường 2026</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                  Cập nhật các quy định mới về đóng gói, mã số vùng trồng và tiêu chuẩn chất lượng khắt khe để xuất khẩu chính ngạch sang thị trường tỷ dân.
                </p>
                <Link to="/dai-ly" className="mt-auto">
                  <Button variant="outline" className="w-full border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5 rounded-xl font-semibold">
                    📍 Tìm đại lý hỗ trợ mã số vùng trồng
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="bg-white/80 backdrop-blur-md border border-white/50 shadow-sm hover:shadow-md transition-shadow rounded-3xl flex flex-col h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 mb-4 w-fit">Kỹ thuật & Lợi nhuận</Badge>
                <h3 className="font-bold text-lg text-slate-800 mb-3 leading-snug">Tối ưu chi phí đầu tư hệ thống tưới khi giá nông sản biến động</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                  Cách tính toán điểm hòa vốn khi lắp đặt thiết bị tưới công nghệ cao trong giai đoạn giá vật tư đầu vào tăng. Chiến lược phân bổ ngân sách.
                </p>
                <Link to="/dai-ly" className="mt-auto">
                  <Button className="w-full bg-[#F57C00] hover:bg-[#E65100] text-white rounded-xl font-bold shadow-md shadow-orange-500/20">
                    📞 Tư vấn từ Đại lý gần nhất
                  </Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}
