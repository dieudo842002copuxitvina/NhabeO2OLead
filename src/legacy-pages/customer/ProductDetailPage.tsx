import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  ShieldAlert, 
  FileText, 
  Download, 
  CheckCircle2, 
  Truck, 
  ChevronRight,
  BadgeCheck,
  Zap,
  Info,
  ArrowLeft
} from 'lucide-react';
import { products } from '@/data/mock';
import { dealersData } from '@/data/dealersData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useFarmerProfile } from '@/hooks/useFarmerProfile';
import SeoMeta from '@/components/SeoMeta';

// Mock technical knowledge articles related to products
const RELATED_ARTICLES = [
  { id: '1', title: 'Quy trình lắp đặt béc tưới Rivulis S2000 cho vườn sầu riêng', tag: 'Kỹ thuật', readTime: '5 phút' },
  { id: '2', title: 'Mẹo xử lý tắc nghẽn hệ thống tưới nhỏ giọt', tag: 'Bảo trì', readTime: '4 phút' },
  { id: '3', title: 'SOP: 5 bước vận hành trạm bơm không gây kết tủa', tag: 'Vận hành', readTime: '6 phút' },
];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { profile } = useFarmerProfile();

  // Find product
  const product = useMemo(() => {
    return products.find(p => p.slug === slug) || products[0];
  }, [slug]);

  // Geo-Matching Logic: Find top 3 dealers within 50km
  // Mocking distance calculation
  const nearestDealers = useMemo(() => {
    // In real app, use profile.lat/lng and calculate Haversine distance
    // For mock, we'll just sort by province or take random nearby ones
    const provinceMatch = dealersData.filter(d => d.province === profile.provinceName);
    const others = dealersData.filter(d => d.province !== profile.provinceName);
    
    return [...provinceMatch, ...others].slice(0, 3).map(d => ({
      ...d,
      distance: (Math.random() * 15 + 2).toFixed(1), // Mock distance 2-17km
      stockStatus: Math.random() > 0.3 ? 'in_stock' : 'pre_order'
    }));
  }, [profile.provinceName]);

  const hasNearbyDealers = nearestDealers.length > 0;

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image],
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Nhà Bè Agri"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "VND",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Nhà Bè Agri Network"
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <SeoMeta 
        title={`${product.name} | Chi tiết kỹ thuật & Đại lý | Nhà Bè Agri`}
        description={product.description}
        jsonLd={jsonLd}
      />

      {/* TOP NAVIGATION / BREADCRUMB */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30">
        <div className="container h-14 flex items-center justify-between">
          <Link to="/san-pham" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#2D5A27]">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{product.category}</Badge>
          </div>
        </div>
      </div>

      <div className="container pt-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: VISUALS & SPECS (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* HERO VISUALS */}
            <section>
              <div className="aspect-video rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm relative group">
                <img 
                  src={product.image || 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80'} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                <button className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-orange-500" /> Xem video thực tế tại rẫy
                </button>
              </div>
              
              {/* Thumbnail strip */}
              <div className="flex gap-4 mt-4 overflow-x-auto no-scrollbar pb-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0 cursor-pointer hover:border-[#2D5A27] transition-all">
                    <img src={product.image} className="w-full h-full object-cover opacity-60 hover:opacity-100" alt="thumb" />
                  </div>
                ))}
              </div>
            </section>

            {/* PRODUCT TITLE & PRICE */}
            <section className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#2D5A27]/10 text-[#2D5A27] border-0">CHÍNH HÃNG</Badge>
                {product.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="border-slate-200 text-slate-400 font-normal">#{tag}</Badge>
                ))}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight font-display">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#2D5A27]">
                  {product.price.toLocaleString()}đ
                </span>
                <span className="text-sm text-slate-400 font-medium line-through">
                  {(product.price * 1.1).toLocaleString()}đ
                </span>
                <Badge className="bg-orange-100 text-orange-600 border-0">Đã gồm VAT</Badge>
              </div>
            </section>

            {/* TECHNICAL WARNING BOX - Creating Trust */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="p-6 rounded-[2rem] border-2 border-red-100 bg-red-50/30 flex items-start gap-4"
            >
              <ShieldAlert className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h4 className="font-bold text-red-700 text-sm uppercase tracking-wider mb-1">Lưu ý kỹ thuật quan trọng</h4>
                <p className="text-red-600/80 text-sm leading-relaxed">
                  Để thiết bị đạt hiệu suất tối ưu và độ bền cao nhất, yêu cầu áp suất nguồn nước tối thiểu đạt <strong>2.5 Bar</strong>. 
                  Tránh sử dụng nguồn nước nhiễm phèn nặng mà không qua bộ lọc đĩa Azud.
                </p>
              </div>
            </motion.div>

            {/* MASTER SPECS TABLE */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#2D5A27]" /> Thông số kỹ thuật khoa học
              </h3>
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-50">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-500 w-1/3">{key}</td>
                        <td className="px-6 py-4 text-slate-900 font-medium">{value}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="px-6 py-4 font-bold text-slate-500 w-1/3">Tiêu chuẩn độ bền</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">IP67, Chống tia UV 15 năm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button variant="outline" className="h-14 rounded-2xl border-slate-200 gap-2 hover:bg-slate-100">
                  <FileText className="w-4 h-4" /> Tải Catalogue PDF
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl border-slate-200 gap-2 hover:bg-slate-100">
                  <Download className="w-4 h-4" /> Sơ đồ lắp đặt kỹ thuật
                </Button>
              </div>
            </section>

            {/* USE CASE SCENARIOS */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Ứng dụng thực tế</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Địa hình', val: 'Đất dốc / Đồi núi', icon: '⛰️' },
                  { label: 'Cây trồng', val: 'Sầu riêng, Cà phê', icon: '🌳' },
                  { label: 'Tính năng', val: 'Chống côn trùng', icon: '🐜' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                      <p className="text-xs font-bold text-slate-800">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: DEALER ROUTING (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              
              {/* DEALER MODULE - THE CONVERSION HEART */}
              <Card className="rounded-[2.5rem] border-0 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
                <div className="p-8 pb-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Đại lý phân phối gần bạn</h2>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full text-[10px] font-bold text-[#2D5A27]">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> ĐANG TRỰC
                    </div>
                  </div>

                  {hasNearbyDealers ? (
                    <div className="space-y-4">
                      {nearestDealers.map((dealer, i) => (
                        <motion.div 
                          key={dealer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-5 rounded-3xl border border-slate-100 hover:border-[#2D5A27] transition-all group bg-slate-50/30 hover:bg-white"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
                                {dealer.name} <BadgeCheck className="w-4 h-4 text-blue-500" />
                              </h4>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {dealer.district}, {dealer.province}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-black text-[#2D5A27] uppercase">{dealer.distance} km</span>
                              <div className={`mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                                dealer.stockStatus === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {dealer.stockStatus === 'in_stock' ? 'CÓ SẴN HÀNG' : 'ĐẶT HÀNG 2-3 NGÀY'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 h-11 rounded-xl bg-[#2D5A27] hover:bg-[#1a3a18] text-white font-bold text-xs"
                              asChild
                            >
                              <a href={`tel:${dealer.phone}`}>
                                <Phone className="w-3.5 h-3.5 mr-1.5" /> Gọi điện
                              </a>
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1 h-11 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs"
                              asChild
                            >
                              <a 
                                href={`https://zalo.me/${dealer.phone}?text=${encodeURIComponent(`Chào đại lý, tôi đang tìm hiểu sản phẩm ${product.name} trên Nhà Bè Agri, cửa hàng tư vấn giúp tôi nhé`)}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Chat Zalo
                              </a>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* FALLBACK: NBA DIRECT */
                    <div className="p-8 rounded-3xl border-2 border-dashed border-[#2D5A27]/20 bg-green-50/20 text-center">
                      <div className="w-16 h-16 bg-[#2D5A27]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck className="w-8 h-8 text-[#2D5A27]" />
                      </div>
                      <h4 className="font-bold text-slate-900 mb-2">NBA Direct - Tổng Kho Phân Phối Trực Tiếp</h4>
                      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        Hiện chưa có đại lý ủy quyền trong bán kính 50km từ vị trí của bạn. Nhà Bè Agri sẽ hỗ trợ giao hàng trực tiếp từ tổng kho.
                      </p>
                      <Button className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold">
                        <Phone className="w-5 h-5 mr-2" /> Kết nối Hotline Tổng Đài 24/7
                      </Button>
                      <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cam kết hỗ trợ Video Call 24/7</p>
                    </div>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sản phẩm chính hãng bởi</p>
                    <img src="https://nhabeagri.com/wp-content/uploads/2021/04/logo-nhabeagri-dark.png" className="h-6 opacity-30 grayscale" alt="logo" />
                  </div>
                </div>
              </Card>

              {/* KNOWLEDGE INTEGRATION */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Kiến thức liên quan</h3>
                <div className="space-y-3">
                  {RELATED_ARTICLES.map(article => (
                    <Link key={article.id} to="/tri-thuc" className="block group">
                      <Card className="rounded-2xl border-slate-100 group-hover:border-[#2D5A27]/30 transition-all shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-[#2D5A27]/5 transition-colors">
                              <FileText className="w-5 h-5 text-slate-400 group-hover:text-[#2D5A27]" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-[#2D5A27] uppercase mb-0.5">{article.tag}</p>
                              <h5 className="text-xs font-bold text-slate-800 leading-snug">{article.title}</h5>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#2D5A27] transition-all" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      
      {/* MOBILE FLOATING CTA - For Mobile-First excellence */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50 lg:hidden">
        <div className="bg-white/80 backdrop-blur-xl border border-white p-3 rounded-[2rem] shadow-2xl flex gap-2">
          <Button className="flex-1 h-14 rounded-[1.5rem] bg-[#2D5A27] text-white font-bold shadow-lg">
            <Phone className="w-5 h-5 mr-2" /> Gọi Chuyên Gia
          </Button>
          <Button variant="outline" className="flex-1 h-14 rounded-[1.5rem] border-blue-200 text-blue-600 font-bold bg-white/50">
            <MessageCircle className="w-5 h-5 mr-2" /> Chat Zalo
          </Button>
        </div>
      </div>

    </div>
  );
}
