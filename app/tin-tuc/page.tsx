'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TechArticleCard from '@/components/TechArticleCard';
import {
  TrendingUp,
  TrendingDown,
  Cloud,
  Sun,
  Droplets,
  Wind,
  ThermometerSun,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  Newspaper,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SeoMeta from '@/components/SeoMeta';

// ─── Mock Data ───────────────────────────────────────────────────────
const FEATURED_MAIN = {
  title: 'Xu hướng tưới nhỏ giọt thông minh 2026: Từ IoT đến AI tự động hóa hoàn toàn',
  description:
    'Phân tích chuyên sâu về các công nghệ tưới tiêu mới nhất đang thay đổi ngành nông nghiệp Việt Nam. Từ cảm biến IoT giám sát độ ẩm real-time đến hệ thống AI tự điều chỉnh lượng nước theo thời tiết.',
  image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80',
  category: 'Công nghệ',
  date: '28/04/2026',
  views: 2840,
  slug: 'xu-huong-tuoi-nho-giot-2026',
};

const FEATURED_SIDE = [
  {
    title: 'Cách chọn máy bơm phù hợp cho rẫy Sầu riêng Tây Nguyên',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&q=80',
    category: 'Hướng dẫn',
    date: '27/04/2026',
    slug: 'chon-may-bom-sau-rieng',
  },
  {
    title: 'Nhà Bè Agri ra mắt dòng van điện từ thế hệ mới, tiết kiệm điện 40%',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',
    category: 'Sản phẩm',
    date: '26/04/2026',
    slug: 'van-dien-tu-the-he-moi',
  },
];

const TECH_ARTICLES = [
  {
    title: 'So sánh ống HDPE và PVC: Khi nào dùng loại nào?',
    description: 'Phân tích ưu nhược điểm chi tiết từng loại ống, bảng so sánh thông số kỹ thuật và khuyến nghị theo loại đất.',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80',
    specs: [{ label: 'HDPE', value: '10', unit: 'bar' }, { label: 'PVC', value: '6', unit: 'bar' }, { label: 'Tuổi thọ', value: '50', unit: 'năm' }],
    date: '25/04/2026',
  },
  {
    title: 'Cảm biến độ ẩm đất IoT: Hướng dẫn lắp đặt chuẩn',
    description: 'Bước-by-bước lắp đặt cảm biến ST-100 trong vườn cây ăn trái, tối ưu vị trí đặt sensor.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80',
    specs: [{ label: 'Độ sâu', value: '30', unit: 'cm' }, { label: 'Phạm vi', value: '0-100', unit: '%RH' }, { label: 'Pin', value: '24', unit: 'tháng' }],
    date: '24/04/2026',
  },
  {
    title: 'Thiết kế hệ thống tưới phun mưa cho vườn Bưởi 5ha',
    description: 'Case study thực tế tại Long An, chi phí đầu tư và ROI sau 2 mùa thu hoạch.',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80',
    specs: [{ label: 'Diện tích', value: '5', unit: 'ha' }, { label: 'Chi phí', value: '180', unit: 'triệu' }, { label: 'ROI', value: '18', unit: 'tháng' }],
    date: '23/04/2026',
  },
  {
    title: 'Bộ lọc đĩa vs lọc lưới: Ưu tiên loại nào cho nước giếng?',
    description: 'So sánh hiệu quả lọc, chi phí bảo trì và tuổi thọ từng loại bộ lọc.',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&q=80',
    specs: [{ label: 'Lọc đĩa', value: '120', unit: 'mesh' }, { label: 'Lọc lưới', value: '200', unit: 'mesh' }, { label: 'Bảo trì', value: '6', unit: 'tháng' }],
    date: '22/04/2026',
  },
];

const MARKET_PRICES = [
  { crop: 'Sầu riêng Ri6', price: '85,000', unit: '₫/kg', change: +2.5, region: 'Đắk Lắk' },
  { crop: 'Cà phê Robusta', price: '128,000', unit: '₫/kg', change: -1.2, region: 'Lâm Đồng' },
  { crop: 'Hồ tiêu đen', price: '95,000', unit: '₫/kg', change: +3.8, region: 'Gia Lai' },
  { crop: 'Bưởi da xanh', price: '32,000', unit: '₫/kg', change: -0.5, region: 'Bến Tre' },
  { crop: 'Xoài cát Hòa Lộc', price: '45,000', unit: '₫/kg', change: +1.1, region: 'Đồng Tháp' },
  { crop: 'Mít Thái', price: '18,000', unit: '₫/kg', change: -2.3, region: 'Tiền Giang' },
  { crop: 'Chanh dây', price: '25,000', unit: '₫/kg', change: +5.2, region: 'Lâm Đồng' },
];

const WEATHER_FORECAST = [
  { day: 'Hôm nay', icon: Sun, temp: '34°C', rain: '10%', note: 'Nắng nóng' },
  { day: 'T3', icon: Cloud, temp: '32°C', rain: '40%', note: 'Nhiều mây' },
  { day: 'T4', icon: Droplets, temp: '29°C', rain: '80%', note: 'Mưa rào' },
  { day: 'T5', icon: Sun, temp: '33°C', rain: '15%', note: 'Nắng nhẹ' },
];

const SIDEBAR_PRICES = [
  { crop: 'Sầu riêng', price: '85K', change: +2.5 },
  { crop: 'Cà phê', price: '128K', change: -1.2 },
  { crop: 'Hồ tiêu', price: '95K', change: +3.8 },
  { crop: 'Bưởi', price: '32K', change: -0.5 },
];

// ─── Page Component ──────────────────────────────────────────────────
export default function NewsPortalPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <SeoMeta
        title="Tin tức Nông nghiệp | Nhà Bè Agri"
        description="Tin tức công nghệ nông nghiệp, giá cả thị trường, kỹ thuật tưới tiêu và hướng dẫn canh tác."
      />

      <div className="container mx-auto max-w-[1360px] px-4 py-6">
        {/* Page Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-green-700" />
            <h1 className="text-xl font-bold text-slate-900">Tin tức Nông nghiệp</h1>
          </div>
          <div className="flex items-center gap-4">
            {['Tất cả', 'Công nghệ', 'Kỹ thuật', 'Thị trường', 'Sản phẩm'].map((tab) => (
              <button
                key={tab}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  tab === 'Tất cả'
                    ? 'bg-green-700 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: 3 columns (content + content + sidebar) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* ═══ Main Content Area (cols 1-9) ═══ */}
          <div className="space-y-5 lg:col-span-9">
            {/* ─── Section: Tin nổi bật ─── */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
                <span className="h-4 w-1 rounded-full bg-green-700" />
                Tin nổi bật
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                {/* Large featured — left */}
                <a
                  href={`/blog/${FEATURED_MAIN.slug}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md md:col-span-7"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={FEATURED_MAIN.image}
                      alt={FEATURED_MAIN.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Badge className="absolute left-3 top-3 border-0 bg-green-700 text-[10px]">
                      {FEATURED_MAIN.category}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-tight text-slate-900">
                      {FEATURED_MAIN.title}
                    </h3>
                    <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {FEATURED_MAIN.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {FEATURED_MAIN.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {FEATURED_MAIN.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </a>

                {/* 2 smaller articles — right */}
                <div className="flex flex-col gap-4 md:col-span-5">
                  {FEATURED_SIDE.map((article) => (
                    <a
                      key={article.slug}
                      href={`/blog/${article.slug}`}
                      className="group flex flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
                    >
                      <div className="relative w-[38%] flex-shrink-0 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col justify-center p-3">
                        <Badge variant="outline" className="mb-1.5 w-fit text-[9px] border-green-200 text-green-700">
                          {article.category}
                        </Badge>
                        <h4 className="line-clamp-2 text-sm font-bold leading-tight text-slate-900">
                          {article.title}
                        </h4>
                        <p className="mt-1 text-[10px] text-slate-400">{article.date}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* ─── Section: Kỹ thuật Tưới ─── */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
                  <span className="h-4 w-1 rounded-full bg-blue-600" />
                  Kỹ thuật Tưới
                </h2>
                <a href="/blog?category=ky-thuat" className="flex items-center gap-1 text-xs font-medium text-green-700 hover:underline">
                  Xem tất cả <ChevronRight className="h-3 w-3" />
                </a>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {TECH_ARTICLES.map((article, i) => (
                  <TechArticleCard
                    key={i}
                    title={article.title}
                    description={article.description}
                    imageUrl={article.image}
                    specs={article.specs}
                    date={article.date}
                    category="Kỹ thuật"
                  />
                ))}
              </div>
            </section>

            {/* ─── Section: Giá cả Thị trường ─── */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
                <span className="h-4 w-1 rounded-full bg-amber-500" />
                Giá cả Thị trường
              </h2>
              <Card className="border-slate-200 bg-white shadow-none">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {MARKET_PRICES.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-lg text-xs',
                              item.change >= 0
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-500'
                            )}
                          >
                            {item.change >= 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{item.crop}</p>
                            <p className="text-[10px] text-slate-400">{item.region}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            {item.price} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                          </p>
                          <p
                            className={cn(
                              'text-[10px] font-bold',
                              item.change >= 0 ? 'text-green-600' : 'text-red-500'
                            )}
                          >
                            {item.change >= 0 ? '+' : ''}
                            {item.change}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* ═══ Sticky Sidebar (col 10-12) ═══ */}
          <aside className="lg:col-span-3">
            <div className="sticky top-4 space-y-4">
              {/* Widget: Thời tiết Nông vụ */}
              <Card className="border-slate-200 bg-white shadow-none">
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <ThermometerSun className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Thời tiết nông vụ
                    </h3>
                  </div>
                  <p className="mb-2 text-[10px] text-slate-400">Khu vực Đông Nam Bộ</p>
                  <div className="space-y-1.5">
                    {WEATHER_FORECAST.map((w, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-between rounded-lg px-2 py-1.5',
                          i === 0 ? 'bg-amber-50' : 'hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <w.icon
                            className={cn(
                              'h-4 w-4',
                              w.icon === Sun ? 'text-amber-500' : w.icon === Droplets ? 'text-blue-500' : 'text-slate-400'
                            )}
                          />
                          <span className="text-xs font-medium text-slate-700">{w.day}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{w.temp}</span>
                          <span className="text-[10px] text-blue-500">{w.rain}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 rounded-lg bg-blue-50 p-2">
                    <p className="text-[10px] leading-relaxed text-blue-700">
                      <strong>Khuyến nghị:</strong> Giảm tần suất tưới T4 do mưa rào. Kiểm tra hệ thống thoát nước.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Widget: Bảng giá hôm nay */}
              <Card className="border-slate-200 bg-white shadow-none">
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Giá hôm nay
                      </h3>
                    </div>
                    <span className="text-[9px] text-slate-400">
                      <Clock className="mr-0.5 inline h-3 w-3" />
                      08:30
                    </span>
                  </div>
                  <div className="space-y-1">
                    {SIDEBAR_PRICES.map((p, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50">
                        <span className="text-xs text-slate-700">{p.crop}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{p.price}</span>
                          <span
                            className={cn(
                              'text-[10px] font-bold',
                              p.change >= 0 ? 'text-green-600' : 'text-red-500'
                            )}
                          >
                            {p.change >= 0 ? '↑' : '↓'}
                            {Math.abs(p.change)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <a
                    href="/gia-nong-san"
                    className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-slate-50 py-1.5 text-[10px] font-medium text-green-700 hover:bg-slate-100"
                  >
                    Xem đầy đủ <ChevronRight className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>

              {/* Widget: Ad/CTA */}
              <div className="overflow-hidden rounded-xl bg-gradient-to-br from-green-700 to-green-800 p-4">
                <h4 className="mb-1 text-sm font-bold text-white">Dự toán hệ thống tưới</h4>
                <p className="mb-3 text-[11px] leading-relaxed text-green-200">
                  Nhập diện tích & loại cây trồng, nhận báo giá chi tiết trong 30 giây.
                </p>
                <a
                  href="/cong-cu/du-toan-tuoi"
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm transition-shadow hover:shadow-md"
                >
                  Dự toán ngay <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
