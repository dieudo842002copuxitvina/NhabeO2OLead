import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, CloudRain, Calculator, FlaskConical, 
  RefreshCw, PieChart, Bot, CalendarClock, Phone
} from 'lucide-react';
import { toast } from 'sonner';

import SeoMeta from '@/components/SeoMeta';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitGeneralLead } from '@/lib/supabaseQueries';

// --- MOCK DATA ---
const SECTIONS = [
  {
    title: 'Thói quen hàng ngày',
    items: [
      {
        id: 'gia-nong-san',
        title: 'Bảng Giá Nông Sản',
        desc: 'Cập nhật biến động giá thị trường mỗi ngày theo khu vực.',
        icon: TrendingUp,
        badge: 'Đang hoạt động',
        badgeColor: 'bg-green-100 text-green-700',
        path: '/thi-truong',
      },
      {
        id: 'radar-thoi-tiet',
        title: 'Radar Thời Tiết',
        desc: 'Cảnh báo mưa bão, nắng hạn siêu địa phương cho rẫy của bạn.',
        icon: CloudRain,
        badge: 'Sắp ra mắt',
        badgeColor: 'bg-gray-100 text-gray-600',
        path: '#',
      }
    ]
  },
  {
    title: 'Kỹ thuật & Thực thi',
    items: [
      {
        id: 'du-toan-tuoi',
        title: 'Dự Toán Vật Tư Tưới',
        desc: 'Tính chính xác số lượng béc, ống và chi phí cho diện tích rẫy.',
        icon: Calculator,
        badge: '🔥 Hot',
        badgeColor: 'bg-red-100 text-red-600',
        path: '/cong-cu/du-toan-thuy-luc',
      },
      {
        id: 'ky-su-dinh-duong',
        title: 'Kỹ Sư Dinh Dưỡng',
        desc: 'Tính toán tỷ lệ pha phân bón chuẩn xác cho hệ thống châm phân.',
        icon: FlaskConical,
        badge: 'Mới',
        badgeColor: 'bg-blue-100 text-blue-600',
        path: '/cong-cu/chuyen-gia-dinh-duong',
      }
    ]
  },
  {
    title: 'Hỗ trợ Ra quyết định',
    items: [
      {
        id: 'chuyen-doi-cay',
        title: 'Dự Toán Chuyển Đổi',
        desc: 'Tính toán chi phí khi chuyển đổi từ cây công nghiệp sang cây ăn trái.',
        icon: RefreshCw,
        badge: 'Sắp ra mắt',
        badgeColor: 'bg-gray-100 text-gray-600',
        path: '#',
      },
      {
        id: 'roi',
        title: 'Máy Tính Hoàn Vốn (ROI)',
        desc: 'So sánh chi phí thuê nhân công tưới tay và lắp hệ thống tự động.',
        icon: PieChart,
        badge: 'Đang hoạt động',
        badgeColor: 'bg-green-100 text-green-700',
        path: '/cong-cu/roi',
      },
      {
        id: 'ai-doctor',
        title: 'Bác Sĩ Cây Trồng AI',
        desc: 'Chụp ảnh để nhận diện ngay sâu bệnh và nhận toa thuốc đặc trị.',
        icon: Bot,
        badge: '✨ AI',
        badgeColor: 'bg-purple-100 text-purple-700',
        path: '/cong-cu/bac-si-ai-expert',
      },
      {
        id: 'lich-tuoi',
        title: 'Lịch Tưới Sinh Trưởng',
        desc: 'Lên lịch tưới và lượng nước chuẩn theo từng độ tuổi của cây.',
        icon: CalendarClock,
        badge: 'Sắp ra mắt',
        badgeColor: 'bg-gray-100 text-gray-600',
        path: '#',
      }
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function CalculatorHubPage() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCardClick = (tool: any) => {
    if (tool.badge === 'Sắp ra mắt') {
      setSelectedTool(tool.title);
      setModalOpen(true);
    } else {
      navigate(tool.path);
    }
  };

  const handleSubscribeBeta = async () => {
    if (!phone || phone.length < 9) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitGeneralLead({
        customer_name: 'Khách hàng Beta',
        customer_phone: phone,
        message: `Đăng ký Beta sớm cho tính năng: ${selectedTool}`,
        source: 'beta_waitlist',
      });
      toast.success('Đăng ký thành công! Chúng tôi sẽ liên hệ khi có bản Beta.');
      setModalOpen(false);
      setPhone('');
    } catch (err) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SeoMeta
        title="Tiện Ích Nhà Nông - App Store Nông Nghiệp"
        description="Tất cả công cụ kỹ thuật bạn cần để tối ưu năng suất: dự toán vật tư, châm phân, bác sĩ AI, thị trường."
        canonical="/cong-cu"
      />

      {/* HEADER */}
      <header className="bg-white border-b pt-8 pb-6 px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-gray-900 mb-2">
          Tiện Ích Nhà Nông
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
          Tất cả công cụ kỹ thuật bạn cần để tối ưu năng suất và chi phí đầu tư.
        </p>
      </header>

      {/* SECTIONS */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10">
          
          {SECTIONS.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-lg md:text-xl font-bold text-[#2D5A27] mb-4 pb-2 border-b border-[#2D5A27]/20 flex items-center">
                {section.title}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <motion.div
                      variants={itemVariants}
                      key={tool.id}
                      onClick={() => handleCardClick(tool)}
                      className="group cursor-pointer bg-white border border-gray-200 rounded-2xl p-5 hover:border-[#2D5A27]/50 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#2D5A27]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-[#2D5A27]" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-1">{tool.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {tool.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

        </motion.div>
      </main>

      {/* WAITLIST MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[90%] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-gray-900">
              {selectedTool}
            </DialogTitle>
            <DialogDescription className="text-sm mt-2 text-gray-600">
              Tính năng đang được phát triển. Để lại số điện thoại để nhận thông báo dùng thử bản Beta sớm nhất!
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 relative group">
            <Input 
              id="beta-phone"
              type="tel"
              placeholder=" "
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-14 pt-4 peer focus-visible:ring-[#2D5A27] focus-visible:border-[#2D5A27] rounded-xl bg-gray-50 border-gray-200"
            />
            <Label 
              htmlFor="beta-phone"
              className="absolute text-[13px] text-gray-500 duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:text-[#2D5A27] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none"
            >
              Số điện thoại của bạn
            </Label>
          </div>

          <DialogFooter className="mt-6 flex-row gap-2">
            <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setModalOpen(false)}>
              Bỏ qua
            </Button>
            <Button 
              disabled={isSubmitting}
              className="flex-1 rounded-xl h-12 bg-[#2D5A27] text-white hover:bg-[#1A3A18] font-bold" 
              onClick={handleSubscribeBeta}
            >
              {isSubmitting ? 'Đang gửi...' : 'Đăng Ký Nhận Beta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
