"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Wrench, 
  Droplets, 
  TrendingUp, 
  Search, 
  Clock, 
  ChevronRight, 
  Filter,
  BarChart3,
  FileText,
  Zap,
  Leaf,
  Share2,
  Bookmark,
  PlayCircle,
  ArrowRight,
  MapPin,
  Calculator,
  ChevronLeft,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SeoMeta from '@/components/SeoMeta';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Types & Data ---
interface Article {
  id: string;
  category: string;
  title: string;
  desc: string;
  date: string;
  readTime: string;
  image: string;
  icon: any;
  cta?: { text: string; link: string; icon: any };
}

const CATEGORIES = [
  'Tất cả', 
  'Kỹ thuật Tưới', 
  'Thị trường Nông sản', 
  'Dinh dưỡng Cây trồng', 
  'Dự án Thực tế', 
  'Sổ tay Nông học'
];

const FEATURED_ARTICLE: Article = {
  id: 'math-irrigation',
  category: 'Kỹ thuật Tưới',
  title: "Toán học trong thủy lợi: Cách tính độ đồng đều của béc tưới trên đất dốc Tây Nguyên.",
  desc: "Nghiên cứu chi tiết về phân bổ áp suất và lưu lượng trên địa hình chênh lệch độ cao lớn. Giúp nông dân tối ưu hóa 100% diện tích tưới.",
  date: "24/04/2026",
  readTime: "8 phút đọc",
  image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0a0913?auto=format&fit=crop&q=80",
  icon: Wrench,
  cta: { text: "Tìm thợ vãng lai gần nhất", link: "/dai-ly", icon: MapPin }
};

const LATEST_SIDEBAR: Article[] = [
  {
    id: 'roi-analysis',
    category: 'Thị trường Nông sản',
    title: "Phân tích biên lợi nhuận: Tại sao tưới tự động giúp hoàn vốn sau 1.5 năm?",
    desc: "Báo cáo số liệu thực tế từ 500 hộ dân trồng sầu riêng.",
    date: "23/04/2026",
    readTime: "5 phút đọc",
    image: "https://images.unsplash.com/photo-1586771107445-d3afeb0a382c?auto=format&fit=crop&q=80",
    icon: TrendingUp
  },
  {
    id: 'durian-nutrition',
    category: 'Dinh dưỡng Cây trồng',
    title: "Chu kỳ dinh dưỡng sầu riêng: Công thức N-P-K tối ưu cho giai đoạn nuôi trái.",
    desc: "Mẹo bón phân hòa tan qua hệ thống tưới để đạt năng suất cao nhất.",
    date: "22/04/2026",
    readTime: "6 phút đọc",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80",
    icon: Leaf
  },
  {
    id: 'pump-maintenance',
    category: 'Kỹ thuật Tưới',
    title: "SOP: Quy trình 7 bước bảo trì máy bơm ly tâm để kéo dài tuổi thọ trên 10 năm.",
    desc: "Hướng dẫn thực chiến từ đội ngũ kỹ sư Nhà Bè Agri.",
    date: "21/04/2026",
    readTime: "7 phút đọc",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80",
    icon: Zap
  }
];

const MARKET_NEWS: Article[] = [
  {
    id: 'export-trends',
    category: 'Thị trường Nông sản',
    title: "Xu hướng xuất khẩu chính ngạch: Tiêu chuẩn GAP và vai trò của hệ thống tưới thông minh.",
    desc: "Thị trường Trung Quốc đang khắt khe hơn với mã vùng trồng và nhật ký canh tác điện tử.",
    date: "20/04/2026",
    readTime: "10 phút đọc",
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0a0913?auto=format&fit=crop&q=80",
    icon: BarChart3,
    cta: { text: "Dự toán vật tư cho vườn", link: "/cong-cu", icon: Calculator }
  }
];

const AGRONOMY_HANDBOOK: Article[] = [
  {
    id: 'pest-control',
    category: 'Sổ tay Nông học',
    title: "Dịch tễ học: Nhận diện và phòng trừ rệp sáp bằng phương pháp sinh học kết hợp hệ thống tưới.",
    desc: "Cách ứng dụng hệ thống phun thuốc tự động để kiểm soát dịch bệnh diện rộng.",
    date: "19/04/2026",
    readTime: "5 phút đọc",
    image: "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?w=600&q=80",
    icon: Droplets
  }
];

// --- Sub-components ---

const SafeImage = ({ src, alt, className, fill = false, width, height }: { src: string; alt: string; className?: string; fill?: boolean; width?: number; height?: number }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`bg-slate-200 flex flex-col items-center justify-center gap-2 ${className}`}>
        <ImageIcon className="w-8 h-8 text-slate-400" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Image Unavailable</span>
      </div>
    );
  }

  return (
    <Image 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setError(true)}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
    />
  );
};

const ArticleCard = ({ article, horizontal = false }: { article: Article; horizontal?: boolean }) => {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-[20px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 active:scale-95 ${horizontal ? 'flex flex-col md:flex-row gap-6' : 'flex flex-col'}`}
    >
      <div className={`relative overflow-hidden ${horizontal ? 'md:w-1/3 aspect-video md:aspect-square' : 'aspect-[16/10]'}`}>
        <SafeImage 
          src={article.image} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          fill
        />
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-[#2D5A27] text-white border-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            {article.category}
          </Badge>
        </div>
      </div>
      
      <div className={`p-6 flex flex-col flex-1`}>
        <div className="flex items-center gap-3 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{article.date}</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
        </div>
        
        <h3 className={`font-bold text-slate-900 leading-tight mb-3 group-hover:text-[#2D5A27] transition-colors ${horizontal ? 'text-xl md:text-2xl' : 'text-lg'}`}>
          {article.title}
        </h3>
        
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6">
          {article.desc}
        </p>

        {article.cta && (
          <Link href={article.cta.link}>
            <div className="mb-6 p-4 bg-[#2D5A27]/5 border border-[#2D5A27]/10 rounded-2xl flex items-center justify-between group/cta cursor-pointer hover:bg-[#2D5A27]/10 transition-colors">
              <div className="flex items-center gap-3">
                <article.cta.icon className="w-5 h-5 text-[#2D5A27]" />
                <span className="text-sm font-bold text-[#2D5A27]">{article.cta.text}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#2D5A27] group-hover/cta:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-[#FF6B00]">
              <Bookmark className="w-4 h-4 mr-1" /> <span className="text-[10px] font-bold uppercase">Lưu sổ tay</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-blue-500">
              <Share2 className="w-4 h-4 mr-1" /> <span className="text-[10px] font-bold uppercase">Zalo</span>
            </Button>
          </div>
          <Button variant="link" className="p-0 h-auto text-[#2D5A27] font-black text-xs uppercase tracking-wider flex items-center gap-1 group/btn">
            Đọc tiếp <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page ---

export default function KnowledgeHubPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const router = useRouter();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Trung Tâm Tri Thức Nhà Bè Agri',
    description: 'Kho kiến thức chuyên sâu về kỹ thuật tưới và thị trường nông sản.',
    publisher: {
      '@type': 'Organization',
      name: 'Nhà Bè Agri',
      logo: 'https://webnba.vercel.app/logo.png'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SeoMeta 
        title="Trung Tâm Tri Thức | Digital Journal Nhà Bè Agri"
        description="Kỹ thuật tưới, Giá nông sản, Nhà Bè Agri - Tạp chí điện tử dành cho nông dân hiện đại."
        jsonLd={jsonLd}
      />

      {/* ─── STICKY SUB-NAV ──────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="container flex items-center h-14 gap-8 px-4 md:px-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap text-sm font-bold uppercase tracking-widest transition-all relative h-full flex items-center active:scale-95 ${
                activeCategory === cat ? 'text-[#2D5A27]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div 
                  layoutId="activeSubNav"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5A27]" 
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-8 md:py-12 px-4 md:px-6">
        
        <section className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-16 md:mb-20">
          {/* Featured Post */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.98 }}
              className="relative aspect-[4/3] md:aspect-[16/9] rounded-[24px] md:rounded-[30px] overflow-hidden group cursor-pointer shadow-2xl active:scale-[0.98] transition-transform"
            >
              <SafeImage 
                src={FEATURED_ARTICLE.image} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Featured" 
                fill
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full z-20">
                <Badge className="bg-[#FF6B00] text-white border-0 mb-3 md:mb-4 px-3 md:px-4 py-1 font-black text-[10px] md:text-xs">TIÊU ĐIỂM</Badge>
                <h2 className="text-2xl md:text-5xl font-black text-white leading-tight mb-3 md:mb-4 drop-shadow-lg">
                  {FEATURED_ARTICLE.title}
                </h2>
                <p className="text-slate-200 text-sm md:text-xl max-w-2xl line-clamp-2 mb-4 md:mb-6">
                  {FEATURED_ARTICLE.desc}
                </p>
                <div className="flex items-center gap-4 md:gap-6 text-white/80 text-[10px] md:text-sm font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2"><Clock className="w-3 h-3 md:w-4 h-4" /> {FEATURED_ARTICLE.readTime}</span>
                  <span className="flex items-center gap-2"><UserIcon className="w-3 h-3 md:w-4 h-4" /> Chuyên gia NB</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse" /> Mới nhất
              </h3>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Xem tất cả</Button>
            </div>
            <div className="space-y-4 md:space-y-6 flex-1">
              {LATEST_SIDEBAR.map(article => (
                <div key={article.id} className="flex gap-4 group cursor-pointer active:scale-95 transition-transform" onClick={() => router.push(`/tri-thuc/${article.id}`)}>
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
                    <SafeImage src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Latest" fill />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] md:text-[10px] font-black text-[#2D5A27] uppercase tracking-tighter mb-1">{article.category}</span>
                    <h4 className="text-xs md:text-sm font-bold text-slate-800 leading-tight group-hover:text-[#2D5A27] transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <span className="text-[9px] md:text-[10px] text-slate-400 mt-1">{article.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BODY SECTIONS ─────────────────────────────────────────────── */}
        
        {/* KHỐI 1: KỸ THUẬT & LẮP ĐẶT (Grid 3-col) */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2D5A27]/10 rounded-2xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-[#2D5A27]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider">Kỹ Thuật & Thủy Lực</h2>
                <p className="text-sm text-slate-400">Cách tiếp cận khoa học cho hệ thống tưới</p>
              </div>
            </div>
            <div className="h-px bg-slate-200 flex-1 mx-8 hidden md:block" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[FEATURED_ARTICLE, ...LATEST_SIDEBAR.slice(2)].map(art => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>

        {/* KHỐI 2: THỊ TRƯỜNG & KINH TẾ (Horizontal) */}
        <section className="mb-24">
           <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider">Thị Trường & Kinh Tế</h2>
                <p className="text-sm text-slate-400">Phân tích biên lợi nhuận và xu hướng xuất khẩu</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {MARKET_NEWS.map(art => (
              <ArticleCard key={art.id} article={art} horizontal />
            ))}
          </div>
        </section>

        {/* KHỐI 3: THƯ VIỆN VIDEO & SỔ TAY NÔNG HỌC (Carousel/Grid) */}
        <section className="mb-24">
           <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider">Thư Viện Video & Sổ Tay</h2>
                <p className="text-sm text-slate-400">Hướng dẫn trực quan và cẩm nang nông học</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="relative aspect-video rounded-[24px] md:rounded-[30px] overflow-hidden group cursor-pointer shadow-xl active:scale-[0.98] transition-transform">
                <SafeImage src="https://images.unsplash.com/photo-1592861343717-3bf79ab44621?w=800&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Video" fill />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                   <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-8 h-8 md:w-10 md:h-10 text-white fill-white" />
                   </div>
                </div>
                <div className="absolute bottom-6 left-6 text-white pr-6 z-20">
                   <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#FF6B00]">Video Hướng dẫn</span>
                   <h4 className="text-lg md:text-xl font-bold line-clamp-2">5 Bước châm phân Venturi chuẩn kỹ thuật</h4>
                </div>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
                {AGRONOMY_HANDBOOK.map(art => (
                  <ArticleCard key={art.id} article={art} />
                ))}
             </div>
          </div>
        </section>

        {/* ─── TAGGING & BOTTOM NAV ────────────────────────────────────────── */}
        <section className="pt-20 border-t border-slate-200">
           <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Thẻ Tag phổ biến</h4>
           <div className="flex flex-wrap gap-3">
             {['#KỹThuậtTưới', '#SầuRiêngXuấtKhẩu', '#BécBùÁp', '#NôngNghiệp4.0', '#DinhDưỡngCâyTrồng', '#ĐắkLắk', '#LâmĐồng', '#GiáCàPhê'].map(tag => (
               <Badge key={tag} variant="outline" className="px-4 py-2 rounded-xl text-slate-500 border-slate-200 hover:border-[#2D5A27] hover:text-[#2D5A27] cursor-pointer transition-colors">
                 {tag}
               </Badge>
             ))}
           </div>
        </section>

      </div>

      {/* Pagination Footer */}
      <div className="container py-12 flex items-center justify-between">
         <Button variant="outline" className="rounded-xl px-6 gap-2 text-slate-500">
            <ChevronLeft className="w-4 h-4" /> TRƯỚC
         </Button>
         <div className="flex gap-2">
            {[1, 2, 3, '...', 12].map((p, i) => (
              <button key={i} className={`w-10 h-10 rounded-xl font-bold text-sm ${p === 1 ? 'bg-[#2D5A27] text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                {p}
              </button>
            ))}
         </div>
         <Button variant="outline" className="rounded-xl px-6 gap-2 text-slate-500">
            SAU <ChevronRight className="w-4 h-4" />
         </Button>
      </div>

    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
