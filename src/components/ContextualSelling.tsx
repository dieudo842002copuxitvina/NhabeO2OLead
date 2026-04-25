"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MessageCircle,
  Zap,
  X,
  Phone,
  ArrowRight,
  Heart,
  Star,
  Check,
  Droplets,
  Leaf,
  Cpu,
  Sprout,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Product data by crop type
const CONTEXTUAL_PRODUCTS: Record<string, any> = {
  coffee: {
    category: "Thiết bị tưới",
    description: "Combo thiết bị tưới bù áp cho cà phê",
    products: [
      {
        id: "combo-1",
        name: "Combo Tưới Bù Áp Cà Phê Premium",
        emoji: "💧",
        icon: Droplets,
        price: 15900000,
        originalPrice: 18500000,
        discount: 14,
        image: "🏭",
        specs: ["Van bù áp chính xác", "Ống nhỏ giọt 3D", "Bộ lọc 120 mesh"],
        memberBenefit: "Thành viên Nhà Bè Agri -15% thêm",
        rating: 4.8,
        reviews: 342,
        benefits: ["Tiết kiệm nước 40%", "Tăng năng suất 25%", "Bảo hành 3 năm"],
      },
      {
        id: "pump-1",
        name: "Máy Bơm Hỏa Tiễn 2.2kW",
        emoji: "⚡",
        icon: Zap,
        price: 8900000,
        originalPrice: 10200000,
        discount: 13,
        image: "🚀",
        specs: ["Công suất 2.2kW", "Lưu lượng 60m³/h", "Cột áp 32m"],
        memberBenefit: "Thành viên Nhà Bè Agri -12% thêm",
        rating: 4.9,
        reviews: 428,
        benefits: ["Hiệu suất cao 92%", "Tiếng ồn thấp", "Thợ lắp miễn phí"],
      },
    ],
  },
  pepper: {
    category: "Thiết bị tưới",
    description: "Hệ thống tưới tối ưu cho hồ tiêu",
    products: [
      {
        id: "combo-pepper",
        name: "Combo Tưới Tiêu Intensive",
        emoji: "💧",
        icon: Droplets,
        price: 12500000,
        originalPrice: 14800000,
        discount: 15,
        image: "🏭",
        specs: ["Hệ thống tưới nhỏ giọt", "Van điều áp tự động", "Cảm biến độ ẩm"],
        memberBenefit: "Thành viên Nhà Bè Agri -18% thêm",
        rating: 4.7,
        reviews: 245,
        benefits: ["Áp lực ổn định", "Điều chỉnh tự động", "IoT ready"],
      },
      {
        id: "pump-pepper",
        name: "Máy Bơm Nước 3HP Tăng Áp",
        emoji: "⚡",
        icon: Zap,
        price: 6800000,
        originalPrice: 8100000,
        discount: 16,
        image: "🚀",
        specs: ["Công suất 3HP", "Lưu lượng 80m³/h", "Bảo vệ quá tải"],
        memberBenefit: "Thành viên Nhà Bè Agri -14% thêm",
        rating: 4.6,
        reviews: 189,
        benefits: ["Bơm cao cấp Taiwan", "Tiết kiệm điện 28%", "Giao lắp miễn phí"],
      },
    ],
  },
  durian: {
    category: "Hệ thống chăm sóc",
    description: "Giải pháp chuyên biệt cho sầu riêng",
    products: [
      {
        id: "drip-durian",
        name: "Hệ thống Châm Phân Tự Động",
        emoji: "🌾",
        icon: Leaf,
        price: 28500000,
        originalPrice: 32800000,
        discount: 13,
        image: "🤖",
        specs: ["Bộ điều khiển thông minh", "Cảm biến EC/pH", "Tương thích Smart Farm"],
        memberBenefit: "Thành viên Nhà Bè Agri -18% thêm",
        rating: 4.9,
        reviews: 156,
        benefits: ["Tối ưu dinh dưỡng", "App điều khiển", "Hỗ trợ kỹ thuật 24/7"],
      },
      {
        id: "ai-nutritionist",
        name: "Kỹ sư Dinh dưỡng AI (1 năm)",
        emoji: "🧠",
        icon: Cpu,
        price: 4900000,
        originalPrice: 6500000,
        discount: 25,
        image: "🤖",
        specs: ["Tư vấn dinh dưỡng AI", "Phân tích đất hàng tháng", "Báo cáo năng suất"],
        memberBenefit: "Thành viên Nhà Bè Agri -30% thêm",
        rating: 5.0,
        reviews: 89,
        benefits: ["Tăng thu nhập 35%", "Giảm chi phí 22%", "Liên hệ chuyên gia"],
      },
    ],
  },
};

interface PriceAlertModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

const PriceAlertModal = ({ product, isOpen, onClose }: PriceAlertModalProps) => {
  const [phone, setPhone] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (phone && expectedPrice) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setPhone("");
        setExpectedPrice("");
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border-b border-white/10 p-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
                  {product.emoji} Chuông báo giá
                </h3>
                <p className="text-sm text-slate-400">Nhận thông báo khi giá đạt mục tiêu</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4 py-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl mx-auto w-fit"
                  >
                    ✓
                  </motion.div>
                  <h4 className="text-xl font-black text-emerald-400">Đã ghi nhận!</h4>
                  <p className="text-slate-400 text-sm">
                    Chúng tôi sẽ gửi thông báo khi giá {product.name} đạt {Number(expectedPrice).toLocaleString("vi-VN")} đ
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">
                      Sản phẩm
                    </p>
                    <p className="text-lg font-black text-white">{product.name}</p>
                    <p className="text-xl font-black text-emerald-400 mt-2">
                      {product.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        <Phone className="w-4 h-4 inline-block mr-2" /> Số điện thoại
                      </label>
                      <Input
                        type="tel"
                        placeholder="0901234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        <Bell className="w-4 h-4 inline-block mr-2" /> Giá kỳ vọng (VNĐ)
                      </label>
                      <Input
                        type="number"
                        placeholder="15000000"
                        value={expectedPrice}
                        onChange={(e) => setExpectedPrice(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                      {expectedPrice && (
                        <p className="text-xs text-slate-400 mt-1">
                          Tiết kiệm:{" "}
                          <span className="text-emerald-400 font-black">
                            {(
                              product.price - parseInt(expectedPrice)
                            ).toLocaleString("vi-VN")}
                            đ
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={!phone || !expectedPrice}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-black uppercase h-12 rounded-lg disabled:opacity-50"
                  >
                    <Bell className="w-4 h-4 mr-2" /> Kích hoạt chuông báo
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ContextualSellingProps {
  cropType: string;
  cropName: string;
  region?: string;
}

export const ContextualSelling = ({ cropType, cropName, region }: ContextualSellingProps) => {
  const data = CONTEXTUAL_PRODUCTS[cropType] || CONTEXTUAL_PRODUCTS.coffee;
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-3"
      >
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          Giải pháp để tăng <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">thu nhập</span>
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          {data.description} - Kết hợp giữa công nghệ hiện đại và hỗ trợ kỹ thuật chuyên sâu
        </p>
      </motion.div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.products.map((product: any, idx: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="h-full"
          >
            <Card className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border-white/10 hover:border-emerald-500/30 rounded-2xl overflow-hidden h-full flex flex-col transition-all group">
              {/* Top Section - Image Area */}
              <div className="relative bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-8 h-40 flex items-center justify-center overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 animate-pulse" />
                </div>

                {/* Product emoji/icon */}
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-7xl z-10"
                >
                  {product.emoji}
                </motion.div>

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="absolute top-4 right-4 bg-rose-500/90 text-white px-3 py-1 rounded-full text-sm font-black"
                >
                  -<span className="text-lg">{product.discount}%</span>
                </motion.div>

                {/* Wishlist Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 left-4 z-20 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full p-2 transition-all"
                >
                  <Heart
                    className={cn(
                      "w-5 h-5 transition-colors",
                      wishlist.includes(product.id) ? "fill-rose-500 text-rose-500" : "text-slate-300"
                    )}
                  />
                </motion.button>
              </div>

              {/* Content */}
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                {/* Title and Rating */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-tight text-white leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < Math.floor(product.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-600"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-amber-400">{product.rating}</span>
                    <span className="text-xs text-slate-500">({product.reviews} đánh giá)</span>
                  </div>
                </div>

                {/* Specs */}
                <div className="space-y-2">
                  {product.specs.map((spec: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      {spec}
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-1">
                  {product.benefits.map((benefit: string, i: number) => (
                    <div key={i} className="text-xs text-emerald-300 flex items-center gap-2">
                      <Zap className="w-3 h-3" /> {benefit}
                    </div>
                  ))}
                </div>

                {/* Price Section */}
                <div className="space-y-2 py-3 border-y border-white/10">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-emerald-400">
                      {product.price.toLocaleString("vi-VN")}
                    </span>
                    <span className="text-sm line-through text-slate-500">
                      {product.originalPrice.toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded w-fit">
                    {product.memberBenefit}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2 mt-auto">
                  <Button
                    onClick={() => setSelectedProduct(product)}
                    variant="outline"
                    className="w-full border-white/10 hover:bg-white/5 font-black uppercase h-10 rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" /> Chuông báo giá
                  </Button>

                  <Button
                    asChild
                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-black uppercase h-10 rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <Link href={`/cong-cu/tu-van?crop=${cropType}&region=${region || ""}`}>
                      <Zap className="w-4 h-4" /> Tư vấn kỹ thuật ngay
                    </Link>
                  </Button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const text = `${product.name} - ${product.price.toLocaleString("vi-VN")} đ. Giá ưu đãi thành viên Nhà Bè Agri. ${product.memberBenefit}. Xem thêm: ${window.location.href}`;
                      window.open(
                        `https://zalo.me/?text=${encodeURIComponent(text)}`,
                        "_blank"
                      );
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 font-black uppercase h-10 rounded-lg text-sm flex items-center justify-center gap-2 text-white transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Chia sẻ Zalo
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Member CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4"
      >
        <h3 className="text-2xl font-black uppercase tracking-tight text-white">
          Thành viên Nhà Bè Agri nhận thêm chiết khấu
        </h3>
        <p className="text-slate-300 max-w-lg mx-auto">
          Đăng ký thành viên ngay để nhận giảm giá 10-30% cho tất cả sản phẩm, hỗ trợ kỹ thuật 24/7 và tư vấn miễn phí từ chuyên gia.
        </p>
        <Button className="bg-emerald-600 hover:bg-emerald-700 font-black uppercase h-12 rounded-lg">
          Đăng ký thành viên <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>

      {/* Price Alert Modal */}
      {selectedProduct && (
        <PriceAlertModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* SEO Footer - JSON-LD AggregateOffer */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AggregateOffer",
            name: `${data.category} cho ${cropName}`,
            description: data.description,
            offers: data.products.map((product: any) => ({
              "@type": "Offer",
              name: product.name,
              description: product.specs.join(", "),
              price: product.price,
              priceCurrency: "VND",
              availability: "https://schema.org/InStock",
              url: typeof window !== "undefined" ? window.location.href : "",
              seller: {
                "@type": "Organization",
                name: "Nhà Bè Agri",
                url: "https://nhabepagri.com",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                ratingCount: product.reviews,
              },
            })),
            priceCurrency: "VND",
            seller: {
              "@type": "Organization",
              name: "Nhà Bè Agri",
              url: "https://nhabepagri.com",
            },
          }),
        }}
      />
    </section>
  );
};

export default ContextualSelling;

