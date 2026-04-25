import React, { useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Sprout, 
  Wrench, 
  ShieldCheck, 
  Leaf, 
  ArrowRight,
  ChevronDown,
  MessageCircle,
  TrendingUp,
  Users,
  Clock,
  Zap,
  CheckCircle2,
  Phone,
  Layout,
  Calculator,
  Image as ImageIcon,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SeoMeta from '@/components/SeoMeta';
import { trackEvent } from '@/lib/tracking';

const CROPS = [
  { value: 'sau-rieng', label: 'Sầu riêng' },
  { value: 'ca-phe', label: 'Cà phê' },
  { value: 'tieu', label: 'Hồ tiêu' },
  { value: 'cay-an-trai', label: 'Cây ăn trái khác' },
];

const PROVINCES = [
  { value: 'dak-lak', label: 'Đắk Lắk' },
  { value: 'lam-dong', label: 'Lâm Đồng' },
  { value: 'gia-lai', label: 'Gia Lai' },
  { value: 'dong-nai', label: 'Đồng Nai' },
  { value: 'binh-phuoc', label: 'Bình Phước' },
];

const TIMELINE_STAGES = [
  {
    id: 1,
    title: "GĐ 1: Khởi đầu",
    desc: "Chọn giống, Quy hoạch mặt bằng, Bản vẽ thiết kế hệ thống tưới chuẩn khoa học.",
    icon: Layout,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "GĐ 2: Kiến thiết",
    desc: "Thợ vãng lai trực tiếp thi công, lắp đặt trọn gói hệ thống tự động hóa.",
    icon: Wrench,
    color: "bg-[#FF6B00]",
  },
  {
    id: 3,
    title: "GĐ 3: Dinh dưỡng",
    desc: "Cung cấp phân bón hòa tan, Lịch châm phân định kỳ 12 tháng qua App.",
    icon: Leaf,
    color: "bg-[#2D5A27]",
  },
  {
    id: 4,
    title: "GĐ 4: Thu hoạch & Bảo trì",
    desc: "Chăm sóc sau thu hoạch, thợ địa phương bảo trì hệ thống 24/7.",
    icon: TrendingUp,
    color: "bg-purple-500",
  },
];

const PROJECTS = [
  {
    title: "Vườn Sầu riêng 5ha - Đắk Lắk",
    contractor: "Đội thợ Hữu Thiện",
    result: "Tự động hóa 100%",
    image: "file:///C:/Users/DO/.gemini/antigravity/brain/508e4aba-8540-46e7-8d58-fe6add255ba9/agri_drone_coffee_plantation_1776957559599.png"
  },
  {
    title: "Trang trại Cà phê 10ha - Lâm Đồng",
    contractor: "Đội thợ Driptec",
    result: "Tiết kiệm 40% nước",
    image: "file:///C:/Users/DO/.gemini/antigravity/brain/508e4aba-8540-46e7-8d58-fe6add255ba9/sprinkler_nozzle_macro_1776957535480.png"
  },
  {
    title: "Vườn Hồ tiêu 3ha - Gia Lai",
    contractor: "Thợ vãng lai NBA",
    result: "Năng suất +25%",
    image: "file:///C:/Users/DO/.gemini/antigravity/brain/508e4aba-8540-46e7-8d58-fe6add255ba9/fertilizer_sack_filter_setup_1776957578496.png"
  }
];

export default function SolutionsPage() {
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    trackEvent('solutions_search', { crop: selectedCrop, province: selectedProvince });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden">
      <SeoMeta 
        title="Giải Pháp Nông Nghiệp Thông Minh & Trọn Gói | Nhà Bè Agri"
        description="Giải pháp tưới và dinh dưỡng trọn gói cho sầu riêng, cà phê. Thiết kế bởi kỹ sư, thi công bởi thợ vãng lai địa phương."
      />

      {/* ─── 1. HERO SECTION WITH VIDEO LOOP ───────────────────────────────── */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/40 z-10" /> {/* Dark overlay */}
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-coffee-plantation-seen-from-above-in-the-mountains-34281-large.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="container relative z-20">
          <div className="max-w-4xl mx-auto text-center text-white mb-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold font-display leading-tight mb-6">
                Bạn trồng cây gì? Ở đâu? <br />
                <span className="text-[#FF6B00]">Chúng tôi có giải pháp trọn gói cho bạn.</span>
              </h1>
            </motion.div>
          </div>

          {/* GLASSMORPHISM SEARCH BOX */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-4 md:p-6 rounded-[3rem] shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select onValueChange={setSelectedCrop}>
                    <SelectTrigger className="h-16 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/60 text-lg font-medium px-6 focus:ring-[#FF6B00]">
                      <div className="flex items-center gap-3">
                        <Sprout className="w-6 h-6 text-[#FF6B00]" />
                        <SelectValue placeholder="Chọn loại cây trồng" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      {CROPS.map(crop => (
                        <SelectItem key={crop.value} value={crop.value} className="py-4 rounded-xl focus:bg-green-50 focus:text-[#2D5A27]">
                          {crop.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={setSelectedProvince}>
                    <SelectTrigger className="h-16 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/60 text-lg font-medium px-6 focus:ring-[#FF6B00]">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-[#FF6B00]" />
                        <SelectValue placeholder="Chọn tỉnh thành" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      {PROVINCES.map(p => (
                        <SelectItem key={p.value} value={p.value} className="py-4 rounded-xl focus:bg-blue-50 focus:text-blue-600">
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSearch}
                  className="w-full md:w-auto h-16 px-10 rounded-2xl bg-[#FF6B00] hover:bg-[#E65A00] text-white font-black text-lg shadow-xl shadow-orange-500/30 transition-all active:scale-95 group shrink-0"
                >
                  🚀 XEM NGAY GIẢI PHÁP TỐI ƯU
                </Button>
              </div>

              {/* BADGES */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {[
                  { icon: CheckCircle2, text: "Thiết bị chính hãng" },
                  { icon: Zap, text: "Phân bón chuẩn chuyên gia" },
                  { icon: Users, text: "Thợ vãng lai hỗ trợ tại vườn" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/90 text-sm font-bold bg-black/20 px-4 py-2 rounded-full border border-white/10">
                    <badge.icon className="w-4 h-4 text-[#FF6B00]" /> {badge.text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* ─── 2. TIMELINE: HÀNH TRÌNH ĐỒNG HÀNH 365 NGÀY ─────────────────────── */}
      <section ref={resultsRef} className="container py-24 relative">
        <div className="text-center mb-16">
          <Badge className="bg-[#2D5A27]/10 text-[#2D5A27] border-0 mb-3 px-4 py-1 text-sm font-bold uppercase tracking-widest">
            Hành Trình Đồng Hành Trọn Đời
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-display">
            Giải Pháp <span className="text-[#2D5A27]">Phát Triển Bền Vững</span>
          </h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            Chúng tôi không chỉ bán vật tư, chúng tôi cùng bạn xây dựng một quy trình canh tác hiện đại từ những bước đầu tiên.
          </p>
        </div>

        <div className="relative">
          {/* Progress Bar (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
          
          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            {TIMELINE_STAGES.map((stage, idx) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                <div className={`w-20 h-20 ${stage.color} text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500 relative`}>
                  <stage.icon className="w-10 h-10" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold text-sm border-2 border-slate-100 shadow-md">
                    {stage.id}
                  </div>
                </div>
                <h4 className="font-bold text-xl text-slate-900 mb-3">{stage.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed px-4">
                  {stage.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. THỢ VÃNG LAI SECTION ───────────────────────────────────────── */}
      <section className="bg-[#2D5A27]/5 py-24">
        <div className="container">
          <div className="bg-white rounded-[3.5rem] p-8 md:p-16 shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-60" />
            
            <div className="md:w-1/2 relative z-10">
              <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-0 mb-4 px-3 py-1 font-bold uppercase">
                Dịch vụ thi công tận rẫy
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 font-display mb-6 leading-tight">
                Bạn chỉ cần ra quyết định, <br />
                <span className="text-[#2D5A27]">mọi việc đã có Thợ vãng lai lo</span>
              </h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Đội ngũ thợ vãng lai địa phương được Nhà Bè Agri đào tạo và xác thực, sẵn sàng có mặt tại rẫy để thi công trọn gói và bảo hành tại chỗ 24/7.
              </p>
              <ul className="space-y-4 mb-10">
                {["Khảo sát địa hình thực tế", "Lắp đặt hệ thống tưới tự động", "Bảo trì, sửa chữa 24/7", "Bảo hành thiết bị chính hãng"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-semibold text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-[#2D5A27]" /> {item}
                  </li>
                ))}
              </ul>
              <Button 
                asChild
                className="h-16 px-10 rounded-2xl bg-[#2D5A27] hover:bg-[#1f421b] text-white font-black text-lg shadow-xl shadow-green-500/20 group"
              >
                <Link to="/dai-ly">
                  <MapPin className="w-6 h-6 mr-3" /> KẾT NỐI THỢ VÃNG LAI GẦN NHẤT
                </Link>
              </Button>
            </div>

            <div className="md:w-1/2 relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative">
                <img 
                  src="file:///C:/Users/DO/.gemini/antigravity/brain/508e4aba-8540-46e7-8d58-fe6add255ba9/technician_farmer_app_consultation_1776957599270.png" 
                  alt="Thợ kỹ thuật tại vườn" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 bg-white/20 backdrop-blur-xl border border-white/30 p-6 rounded-3xl">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7 text-[#2D5A27]" />
                     </div>
                     <div className="text-white">
                        <p className="text-xs font-bold uppercase opacity-80">Chứng nhận bởi Nhà Bè Agri</p>
                        <p className="text-lg font-bold">Verified Installer</p>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. MINI ROI CALCULATOR ────────────────────────────────────────── */}
      <section className="container py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-display mb-4">
                Đầu tư thông minh, <br />
                <span className="text-[#2D5A27]">Lợi nhuận bền vững</span>
              </h2>
              <p className="text-slate-500 leading-relaxed">
                So sánh hiệu quả thực tế giữa phương pháp tưới truyền thống và giải pháp All-in-one của Nhà Bè Agri.
              </p>
            </div>

            <div className="space-y-4">
               {[
                 { label: "Tiền điện vận hành", traditional: "100%", smart: "-30%", color: "text-[#2D5A27]" },
                 { label: "Chi phí nhân công", traditional: "100%", smart: "-50%", color: "text-[#2D5A27]" },
                 { label: "Năng suất cây trồng", traditional: "100%", smart: "+25%", color: "text-blue-600" },
               ].map((item, i) => (
                 <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                   <span className="font-bold text-slate-700">{item.label}</span>
                   <div className="flex items-center gap-6">
                     <span className="text-sm text-slate-400 line-through">{item.traditional}</span>
                     <span className={`text-xl font-black ${item.color}`}>{item.smart}</span>
                   </div>
                 </div>
               ))}
            </div>

            <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 p-8 rounded-3xl">
               <div className="flex items-center gap-4 mb-2">
                 <Calculator className="w-8 h-8 text-[#FF6B00]" />
                 <h4 className="text-lg font-bold text-slate-900">Thời gian hoàn vốn dự kiến</h4>
               </div>
               <p className="text-3xl font-black text-[#FF6B00]">Chỉ từ 1.5 - 2 năm</p>
               <p className="text-sm text-slate-500 mt-2">Dựa trên dữ liệu thực tế từ 500+ vườn sầu riêng tại Tây Nguyên.</p>
            </div>
          </div>

          {/* PROJECT LIBRARY */}
          <div className="space-y-6">
             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <ImageIcon className="w-6 h-6 text-[#2D5A27]" /> Thư viện dự án thực tế
             </h3>
             <div className="grid grid-cols-1 gap-4">
               {PROJECTS.map((proj, i) => (
                 <Card key={i} className="overflow-hidden border-slate-100 group cursor-pointer hover:border-[#2D5A27]/30 transition-all">
                   <div className="flex h-32">
                     <div className="w-1/3 overflow-hidden">
                       <img src={proj.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={proj.title} />
                     </div>
                     <div className="w-2/3 p-4 flex flex-col justify-center">
                       <h5 className="font-bold text-sm text-slate-900 mb-1">{proj.title}</h5>
                       <p className="text-xs text-slate-500 mb-2">{proj.contractor} thi công trọn gói</p>
                       <div className="flex items-center justify-between">
                         <Badge variant="secondary" className="bg-green-50 text-[#2D5A27] border-0 text-[10px]">{proj.result}</Badge>
                         <button className="text-[10px] font-bold text-[#2D5A27] flex items-center gap-1 hover:underline">
                           Xem chi tiết bản vẽ <ChevronRight className="w-3 h-3" />
                         </button>
                       </div>
                     </div>
                   </div>
                 </Card>
               ))}
             </div>
             <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold">
               XEM TẤT CẢ 200+ DỰ ÁN KHÁC
             </Button>
          </div>
        </div>
      </section>

      {/* ─── 5. BOTTOM CTA & SEO ───────────────────────────────────────────── */}
      <section className="container py-24 border-t border-slate-100">
        <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-[#2D5A27]/20 z-0" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FF6B00]/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-8">
              Sẵn sàng tối ưu hóa <br className="hidden md:block" /> rẫy vườn của bạn?
            </h2>
            <div className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base mb-12 space-y-4">
              <p>
                Nhà Bè Agri cung cấp dịch vụ <strong>chăm sóc rẫy trọn gói</strong> chuyên nghiệp, từ khâu thiết kế bản vẽ thủy lực đến cung cấp <strong>vật tư tưới sầu riêng Đắk Lắk</strong>, cà phê Lâm Đồng và các tỉnh Tây Nguyên, Đông Nam Bộ.
              </p>
              <p>
                Với mạng lưới <strong>thợ vãng lai</strong> xác thực, chúng tôi cam kết mang đến giải pháp "All-in-one" giúp nông dân tiết kiệm chi phí vận hành và tối đa hóa năng suất bền vững.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button size="lg" className="h-20 px-12 rounded-3xl bg-[#FF6B00] hover:bg-[#E65A00] text-white font-black text-xl shadow-2xl shadow-orange-500/40">
                <Phone className="w-6 h-6 mr-3" /> NHẬN TƯ VẤN TRỰC TIẾP 1-1
              </Button>
              <Button size="lg" variant="outline" className="h-20 px-12 rounded-3xl border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold text-xl backdrop-blur-md">
                <MessageCircle className="w-6 h-6 mr-3" /> CHAT ZALO NGAY
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action for Mobile */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button className="w-16 h-16 rounded-full bg-[#FF6B00] shadow-2xl flex items-center justify-center p-0">
          <Phone className="w-8 h-8 text-white" />
        </Button>
      </div>

    </div>
  );
}
