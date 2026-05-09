"use client";

import Link from "next/link";
import { Package, ArrowRight, RefreshCw, CheckCircle2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ─────────────────────────────────────────────
 * Mock Data - Tái sử dụng từ trang chủ
 * ───────────────────────────────────────────── */

interface Product {
  id: number;
  name: string;
  categoryName: string;
  price: number;
  unit: string;
  slug: string;
  image: string;
  badge: string | null;
}

const PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: "Bộ Điều Khiển Tưới Smart", 
    categoryName: "Hệ thống điều khiển",
    price: 12500000, 
    unit: "đ/bộ",
    slug: "bo-dieu-khien-tuoi-smart",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80",
    badge: "hot",
  },
  { 
    id: 2, 
    name: "Béc Tưới Nhỏ Giọt", 
    categoryName: "Béc tưới",
    price: 45000, 
    unit: "đ/cái",
    slug: "bec-tuoi-nho-giot",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&q=80",
    badge: "sale",
  },
  { 
    id: 3, 
    name: "Tủ Điện Timer 8 Zone", 
    categoryName: "Thiết bị điện",
    price: 3200000, 
    unit: "đ/tủ",
    slug: "tu-dien-timer-8-zone",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&q=80",
    badge: null,
  },
  { 
    id: 4, 
    name: "Máy Bơm Tưới 2HP", 
    categoryName: "Máy bơm",
    price: 4200000, 
    unit: "đ/máy",
    slug: "may-bom-tuoi-2hp",
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c41?w=400&h=400&fit=crop&q=80",
    badge: "seasonal",
  },
  { 
    id: 5, 
    name: "Phân Humic Acid 25kg", 
    categoryName: "Phân bón",
    price: 1250000, 
    unit: "đ/bao",
    slug: "phan-humic-acid",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&q=80",
    badge: null,
  },
  { 
    id: 6, 
    name: "Ống LDPE Φ20mm", 
    categoryName: "Ống dẫn",
    price: 85000, 
    unit: "đ/m",
    slug: "ong-ldpe-phi20",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&q=80",
    badge: "bestseller",
  },
  { 
    id: 7, 
    name: "Bộ Lọc Đĩa 2 inch", 
    categoryName: "Hệ thống lọc",
    price: 1850000, 
    unit: "đ/bộ",
    slug: "bo-loc-dia-2inch",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&q=80",
    badge: null,
  },
  { 
    id: 8, 
    name: "Van Điện Từ 1 inch", 
    categoryName: "Van các loại",
    price: 650000, 
    unit: "đ/cái",
    slug: "van-dien-tu-1inch",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&q=80",
    badge: null,
  },
];

/* ─────────────────────────────────────────────
 * Product Card Component
 * ───────────────────────────────────────────── */

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group block"
    >
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-emerald-200 hover:shadow-xl transition-all duration-300">
        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Badge - Top Right */}
          {product.badge && (
            <div className="absolute top-3 right-3">
              {product.badge === 'hot' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                  🔥 Bán chạy
                </span>
              )}
              {product.badge === 'sale' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                  ⚡ Giảm giá
                </span>
              )}
              {product.badge === 'seasonal' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                  💧 Mùa hạn
                </span>
              )}
              {product.badge === 'bestseller' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                  ⭐ Yêu thích
                </span>
              )}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category Tag */}
          <span className="inline-block px-2 py-1 mb-2 text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-gray-100 rounded-md">
            {product.categoryName}
          </span>
          
          {/* Product Name */}
          <h3 className="font-semibold text-sm text-slate-900 mb-1.5 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Price */}
          <p className="text-base font-bold text-emerald-600">
            {new Intl.NumberFormat("vi-VN").format(product.price)}
            <span className="text-xs font-normal text-muted-foreground ml-1">{product.unit}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
 * Main Page Component
 * ───────────────────────────────────────────── */

export default function SanPhamPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* ── Page Header ── */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-500 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-emerald-200" />
              <span className="text-emerald-100 text-sm font-medium">Cửa hàng</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Danh Mục Vật Tư & Thiết Bị Nông Nghiệp
            </h1>
            <p className="text-emerald-100 text-base md:text-lg">
              Hệ thống thiết bị tưới tiêu, vật tư nông nghiệp chất lượng cao từ các nhà cung cấp uy tín. Hỗ trợ tư vấn và lắp đặt tại site.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sync Banner ── */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-sm text-amber-800">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Hệ thống đang đồng bộ tồn kho từ các Đại lý...</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-10 h-11"
            />
          </div>
          <Button variant="outline" className="h-11 gap-2">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </Button>
        </div>

        {/* Product Stats */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{PRODUCTS.length}</span> sản phẩm
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" className="gap-2">
            Xem thêm sản phẩm
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
