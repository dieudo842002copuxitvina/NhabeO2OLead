import { Card, CardContent } from '@/components/ui/card';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';
import SeoMeta from '@/components/SeoMeta';
import LeadCaptureForm from '@/components/LeadCaptureForm';

const CONTACT_ITEMS = [
  {
    icon: Phone,
    color: 'bg-[#2D5A27]/10 text-[#2D5A27]',
    title: 'Hotline miễn phí',
    main: '1900 636 899',
    sub: 'Miễn phí cuộc gọi',
    href: 'tel:1900636899',
  },
  {
    icon: Mail,
    color: 'bg-blue-50 text-blue-600',
    title: 'Email',
    main: 'info@nhabeagri.vn',
    sub: 'Phản hồi trong 24h',
    href: 'mailto:info@nhabeagri.vn',
  },
  {
    icon: MapPin,
    color: 'bg-[#FF6B00]/10 text-[#FF6B00]',
    title: 'Văn phòng',
    main: '123 Nguyễn Văn Linh, Q.7, TP.HCM',
    sub: 'Thứ 2 – Thứ 7: 8:00 – 17:30',
    href: undefined,
  },
  {
    icon: Clock,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Zalo OA',
    main: '@NhaBèAgri',
    sub: 'Chat trực tiếp, hỗ trợ nhanh',
    href: 'https://zalo.me/nhabeagri',
  },
];

export default function ContactPage() {
  return (
    <div className="container py-8 md:py-12 max-w-5xl">
      <SeoMeta
        title="Liên hệ Nhà Bè Agri — Tư vấn hệ thống tưới & phân bón"
        description="Liên hệ đội kỹ thuật Nhà Bè Agri để được tư vấn giải pháp tưới nhỏ giọt, phân bón và hệ thống nước thông minh cho vườn cây ăn trái."
        canonical="/lien-he"
      />

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] uppercase font-bold tracking-wider text-[#2D5A27] mb-1">Liên hệ</p>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold" style={{ color: '#2D5A27' }}>
          Nhận tư vấn <span style={{ color: '#5D4037' }}>miễn phí</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Đội kỹ thuật Nhà Bè Agri sẽ liên hệ lại trong 30 phút để tư vấn giải pháp phù hợp với vườn cây của bạn.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6 md:gap-8">
        {/* Left: Contact info */}
        <div className="md:col-span-2 space-y-3">
          {CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border border-border/60 hover:border-[#2D5A27]/30 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{item.title}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="font-semibold text-sm text-[#2D5A27] hover:underline truncate block mt-0.5"
                      >
                        {item.main}
                      </a>
                    ) : (
                      <p className="font-semibold text-sm mt-0.5">{item.main}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Response time badge */}
          <div className="rounded-xl bg-[#FF6B00]/8 border border-[#FF6B00]/20 p-4">
            <p className="text-sm font-bold text-[#FF6B00]">⚡ Cam kết phản hồi</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Gửi yêu cầu → Đại lý gần bạn nhất liên hệ lại trong <strong>30 phút</strong> (giờ hành chính).
            </p>
          </div>
        </div>

        {/* Right: Lead Capture Form */}
        <div className="md:col-span-3">
          <Card className="border-2 border-[#2D5A27]/15 shadow-lg">
            <CardContent className="p-5 md:p-7">
              <h2 className="font-display text-xl font-bold mb-1" style={{ color: '#2D5A27' }}>
                Gửi yêu cầu tư vấn
              </h2>
              <p className="text-xs text-muted-foreground mb-5">
                Điền thông tin — đội kỹ thuật sẽ gọi lại cho bạn.
              </p>
              <LeadCaptureForm source="contact_page" compact={false} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
