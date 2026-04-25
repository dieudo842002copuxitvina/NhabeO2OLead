"use client";

import { useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Loader2, Navigation, ArrowRight, Sprout, Shield, Zap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PersonalizedDashboardHero from '@/components/PersonalizedDashboardHero';
import NearbyDealers from '@/components/NearbyDealers';
import RoiCalculatorBlock from '@/components/RoiCalculatorBlock';
import FieldLog from '@/components/FieldLog';
import EmergencyBanner from '@/components/EmergencyBanner';
import AIRuleBanner from '@/components/AIRuleBanner';
import SeoMeta from '@/components/SeoMeta';
import ProductEcosystemBlock from '@/components/ProductEcosystemBlock';
import AgriNewsBlock from '@/components/AgriNewsBlock';
import FieldShortsBlock from '@/components/FieldShortsBlock';
import { useHomepageConfig } from '@/contexts/HomepageConfigContext';
import { trackEvent } from '@/lib/tracking';
import ogImage from '@/assets/og-nhabe-agri.jpg';

import dynamic from 'next/dynamic';

const MinimalistDealerNetwork = dynamic(
  () => import('@/components/MinimalistDealerNetwork'),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-2xl flex items-center justify-center">Đang tải bản đồ...</div>
  }
);

/**
 * CustomerHomePage — Spec V2 "Agri-Dashboard & Conversion Engine"
 */

const features = [
  { icon: Sprout, title: 'Phần cứng chính hãng', desc: 'Máy bơm, ống tưới, drone, cảm biến' },
  { icon: Shield, title: 'Đại lý ủy quyền', desc: '500+ điểm bán toàn quốc' },
  { icon: Navigation, title: 'Geo-Matching', desc: 'Tìm đại lý gần nhất 15-50km' },
  { icon: Zap, title: 'Zero Friction', desc: 'Gọi/Zalo ngay, không đăng ký' },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function MotionSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function HomePage() {
  const { config } = useHomepageConfig();

  useEffect(() => {
    trackEvent('page_view', { source: 'homepage_v2' });
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50 pb-32 md:pb-8">
      {/* Topographic Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M36 34v-2h2v2h-2zm0-31V1h2v2h-2zm0 29v-2h2v2h-2zm0-27V3h2v2h-2zm0 25v-2h2v2h-2zm0-23V5h2v2h-2zm0 21v-2h2v2h-2zm0-19V7h2v2h-2zm0 17v-2h2v2h-2zm0-15V9h2v2h-2zm0 13v-2h2v2h-2zm0-11v-2h2v2h-2zm0 9v-2h2v2h-2zm0-7v-2h2v2h-2zm0 5v-2h2v2h-2zm0-3v-2h2v2h-2zm0 1v-2h2v2h-2z' fill='%232D5A27'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}
      />
      <div className="relative z-10">
      <SeoMeta
        title={config.seo.title}
        description={config.seo.description}
        canonical="https://farm-supply-chain.lovable.app/"
        ogImage={ogImage.src}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Nhà Bè Agri',
          url: 'https://farm-supply-chain.lovable.app/',
          logo: 'https://farm-supply-chain.lovable.app/favicon.ico',
          description: config.seo.description,
        }}
      />

      <EmergencyBanner />

      <PersonalizedDashboardHero />

      <section className="container pt-4">
        <AIRuleBanner />
      </section>

      <MotionSection>
        <ProductEcosystemBlock />
      </MotionSection>

      <MotionSection>
        <AgriNewsBlock />
      </MotionSection>

      <MotionSection>
        <FieldShortsBlock />
      </MotionSection>

      <MotionSection className="container py-8 md:py-16">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Badge className="bg-[#2D5A27]/10 text-[#2D5A27] border-0 mb-3">Geo-Matching Engine</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Hệ thống đại lý ủy quyền <span className="text-[#2D5A27]">gần nhất</span>
            </h2>
            <p className="text-slate-500 mt-2">
              Chúng tôi kết nối bạn với chuyên gia kỹ thuật địa phương để hỗ trợ nhanh nhất.
            </p>
          </div>
        </header>

        <MinimalistDealerNetwork />
      </MotionSection>

      <MotionSection>
        <RoiCalculatorBlock />
      </MotionSection>

      <MotionSection>
        <FieldLog />
      </MotionSection>

      <MotionSection className="container pb-10">
        <Card className="p-4 md:p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm leading-tight">{f.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </MotionSection>

      <div className="fixed bottom-0 left-0 w-full bg-background border-t border-border/40 p-3 flex gap-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe-offset-3 md:hidden">
        <Button 
          variant="outline" 
          className="flex-1 h-12 bg-white text-[#2D5A27] border border-[#2D5A27] rounded-full shadow-lg hover:bg-[#2D5A27]/5"
          asChild
        >
          <Link href="/dai-ly">
            <MapPin className="w-4 h-4 mr-1.5" /> Tìm Đại lý
          </Link>
        </Button>
        <Button 
          className="flex-1 h-12 bg-[#F57C00] text-white hover:bg-[#E65100] rounded-full shadow-lg font-bold"
          asChild
        >
          <a href="tel:0901234567">
            <span className="flex items-center justify-center">📞 Chuyên viên Báo giá</span>
          </a>
        </Button>
      </div>
      </div>
    </div>
  );
}
