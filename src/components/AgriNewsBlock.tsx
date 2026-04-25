"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, BookOpen, TrendingUp, Camera } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/tracking';

// ─── Mock Data ───────────────────────────────────────────────────────────────
type TabKey = 'kyThuat' | 'thiTruong' | 'thucDia';

interface NewsItem {
  id: string;
  slug: string;
  tab: TabKey;
  tag: string;
  tagColor: string;
  title: string;
  summary: string;
  readTime: string;
  date: string;
  emoji: string;
  gradient: string;
}

const NEWS_DATA: NewsItem[] = [
  // Kỹ thuật
  {
    id: 'kt1',
    slug: 'cach-lap-he-thong-tuoi-1ha',
    tab: 'kyThuat',
    tag: '#KyThuat',
    tagColor: 'text-[#2D5A27] bg-[#2D5A27]/10',
    title: 'Cách tự lắp hệ thống tưới tiết kiệm cho rẫy 1ha — Chi phí dưới 25 triệu',
    summary: 'Hướng dẫn chọn bơm, đường ống, béc tưới và sơ đồ đi đường từ A–Z cho cây cà phê và sầu riêng.',
    readTime: '5 phút',
    date: '20/04/2026',
    emoji: '🛠️',
    gradient: 'from-emerald-500/30 via-primary/15 to-teal-400/10',
  },
  {
    id: 'kt2',
    slug: 'tuoi-nho-giot-sau-rieng-ket-qua',
    tab: 'kyThuat',
    tag: '#KyThuat',
    tagColor: 'text-[#2D5A27] bg-[#2D5A27]/10',
    title: 'Kết quả thực tế: Tưới nhỏ giọt cho sầu riêng tăng năng suất 22% sau 1 mùa',
    summary: 'So sánh số liệu trước và sau khi chuyển đổi từ tưới phun sang tưới nhỏ giọt tại Đắk Lắk.',
    readTime: '4 phút',
    date: '18/04/2026',
    emoji: '💧',
    gradient: 'from-blue-500/30 via-cyan-400/15 to-sky-300/10',
  },
  {
    id: 'kt3',
    slug: 'chon-may-bom-phu-hop',
    tab: 'kyThuat',
    tag: '#KyThuat',
    tagColor: 'text-[#2D5A27] bg-[#2D5A27]/10',
    title: 'Chọn máy bơm phù hợp theo áp suất đầu nguồn và chiều cao cột nước',
    summary: 'Công thức tính đơn giản giúp nông dân chọn đúng máy bơm mà không cần kỹ sư tư vấn.',
    readTime: '3 phút',
    date: '15/04/2026',
    emoji: '⚡',
    gradient: 'from-yellow-500/30 via-amber-400/15 to-orange-300/10',
  },
  // Thị trường
  {
    id: 'tt1',
    slug: 'gia-sau-rieng-thang-5',
    tab: 'thiTruong',
    tag: '#ThiTruong',
    tagColor: 'text-[#5D4037] bg-[#5D4037]/10',
    title: 'Dự báo giá sầu riêng tháng 5/2026: Tín hiệu tăng từ thị trường Trung Quốc',
    summary: 'Phân tích tác động của mùa vụ Thái Lan đến giá xuất khẩu và nhu cầu từ phía người mua Trung Quốc.',
    readTime: '3 phút',
    date: '22/04/2026',
    emoji: '📈',
    gradient: 'from-orange-500/30 via-amber-400/15 to-yellow-300/10',
  },
  {
    id: 'tt2',
    slug: 'gia-phe-robusta-q2',
    tab: 'thiTruong',
    tag: '#ThiTruong',
    tagColor: 'text-[#5D4037] bg-[#5D4037]/10',
    title: 'Cà phê Robusta Q2/2026: Giá kỳ hạn tăng mạnh do hạn hán Tây Nguyên',
    summary: 'London ICE ghi nhận mức giá Robusta cao nhất 18 tháng. Nông dân nên trữ hay bán ngay?',
    readTime: '4 phút',
    date: '21/04/2026',
    emoji: '☕',
    gradient: 'from-amber-700/30 via-orange-500/15 to-primary/10',
  },
  {
    id: 'tt3',
    slug: 'xuat-khau-tieu-nam-2026',
    tab: 'thiTruong',
    tag: '#ThiTruong',
    tagColor: 'text-[#5D4037] bg-[#5D4037]/10',
    title: 'Xuất khẩu tiêu Việt Nam năm 2026: Mục tiêu 1.2 tỷ USD — Cơ hội cho vùng Tây Nguyên',
    summary: 'Báo cáo từ VPA: Nhu cầu toàn cầu tăng 8%, Việt Nam giữ thị phần 34% thị trường hồ tiêu thế giới.',
    readTime: '5 phút',
    date: '19/04/2026',
    emoji: '🌶️',
    gradient: 'from-red-500/30 via-orange-400/15 to-primary/10',
  },
  // Thực địa
  {
    id: 'td1',
    slug: 'du-an-sau-rieng-cu-mgar',
    tab: 'thucDia',
    tag: '#ThucDia',
    tagColor: 'text-blue-700 bg-blue-50',
    title: 'Thực địa: Nghiệm thu hệ thống tưới 3.5ha sầu riêng tại Cư M\'gar, Đắk Lắk',
    summary: 'Đội kỹ thuật hoàn thành lắp đặt 420 béc tưới nhỏ giọt, 2 trạm bơm Inverter sau 7 ngày thi công.',
    readTime: '2 phút',
    date: '23/04/2026',
    emoji: '🌳',
    gradient: 'from-emerald-600/30 via-primary/15 to-teal-300/10',
  },
  {
    id: 'td2',
    slug: 'du-an-ca-phe-bao-loc',
    tab: 'thucDia',
    tag: '#ThucDia',
    tagColor: 'text-blue-700 bg-blue-50',
    title: 'Trước & Sau: Chuyển đổi tưới phun mưa sang nhỏ giọt cho 2ha cà phê Bảo Lộc',
    summary: 'Chi phí nước giảm 38%, năng suất thu hoạch tăng dự kiến 15% nhờ tưới đúng giờ và đúng lượng.',
    readTime: '3 phút',
    date: '20/04/2026',
    emoji: '☕',
    gradient: 'from-amber-600/30 via-orange-400/15 to-yellow-200/10',
  },
  {
    id: 'td3',
    slug: 'du-an-xoai-cao-lanh',
    tab: 'thucDia',
    tag: '#ThucDia',
    tagColor: 'text-blue-700 bg-blue-50',
    title: 'Hệ thống AC-8 kiểm soát 8 vùng tưới tự động cho vườn xoài 4ha tại Cao Lãnh',
    summary: 'Chủ vườn chỉ cần dùng điện thoại để theo dõi và điều chỉnh lịch tưới từ xa, tiết kiệm 2 nhân công/ngày.',
    readTime: '3 phút',
    date: '17/04/2026',
    emoji: '🥭',
    gradient: 'from-yellow-400/30 via-orange-400/15 to-primary/10',
  },
];

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'kyThuat',   label: 'Kỹ thuật',  icon: BookOpen   },
  { key: 'thiTruong', label: 'Thị trường', icon: TrendingUp },
  { key: 'thucDia',   label: 'Thực địa',  icon: Camera     },
];

// ─── NewsCard ─────────────────────────────────────────────────────────────────
function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/thu-vien/${item.slug}`}
        onClick={() => trackEvent('news_click', { articleId: item.id, tab: item.tab })}
        className="group block bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-[#2D5A27]/40 hover:shadow-xl transition-all duration-300 h-full"
      >
        {/* Cover image area */}
        <div className={`aspect-[16/9] bg-gradient-to-br ${item.gradient} relative flex items-center justify-center overflow-hidden`}>
          <span className="text-6xl drop-shadow select-none group-hover:scale-110 transition-transform duration-500">
            {item.emoji}
          </span>
          {/* Category tag */}
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm ${item.tagColor}`}>
            {item.tag}
          </span>
          {/* Read time */}
          <span className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            {item.readTime}
          </span>
        </div>

        {/* Text content */}
        <div className="p-4">
          <p className="text-[11px] text-muted-foreground mb-2">{item.date}</p>
          <h3 className="font-display font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#2D5A27] transition-colors">
            {item.title}
          </h3>
          <p className="text-[12px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}

// ─── Main Block ───────────────────────────────────────────────────────────────
export default function AgriNewsBlock() {
  const [activeTab, setActiveTab] = useState<TabKey>('kyThuat');
  const filtered = NEWS_DATA.filter(n => n.tab === activeTab);

  return (
    <section aria-labelledby="agri-news-heading" className="bg-muted/30 py-12 md:py-16">
      <div className="container">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-[#5D4037] flex items-center gap-1.5 mb-1">
              <span className="w-4 h-0.5 bg-[#5D4037] rounded-full inline-block" />
              Trung tâm Tri thức
            </p>
            <h2
              id="agri-news-heading"
              className="font-display text-2xl md:text-3xl font-extrabold leading-tight"
              style={{ color: '#2D5A27' }}
            >
              Kiến thức &amp; <span style={{ color: '#5D4037' }}>Thị trường</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Thông tin chuyên sâu từ kỹ thuật đồng ruộng đến giá cả thị trường.
            </p>
          </div>

          <Button variant="outline" size="sm" asChild className="hidden md:inline-flex shrink-0 border-[#2D5A27]/40 text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white">
            <Link href="/tin-tuc">
              Xem tất cả bài viết <ArrowRight className="ml-1 w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-background rounded-xl border border-border/60 mb-6 w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
                  ${isActive
                    ? 'bg-[#2D5A27] text-white shadow-md'
                    : 'text-muted-foreground hover:text-[#2D5A27] hover:bg-muted/60'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* News grid — 1 col mobile / 3 cols desktop */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
          >
            {filtered.map((item, i) => (
              <NewsCard key={item.id} item={item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View all — mobile */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            asChild
            className="w-full md:w-auto border-[#2D5A27]/40 text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white"
          >
            <Link href="/tin-tuc">
              Xem tất cả bài viết <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
