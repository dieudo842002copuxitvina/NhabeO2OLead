/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  RELATED PRODUCTS SIDEBAR COMPONENT                            ║
 * ║  Shows products related to the current post category            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Droplets, ExternalLink, ChevronRight } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface Product {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: string | null;
  category_name?: string;
}

interface RelatedProductsSidebarProps {
  categorySlug: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CROP-TO-CATEGORY MAPPING
 * Maps blog categories to product categories for related products
 * ═══════════════════════════════════════════════════════════════════════════════ */

const CATEGORY_MAPPING: Record<string, string[]> = {
  // Durian related
  "ky-thuat-tuoi-sau-rieng": ["bom-thuy-luc", "bec-tuoi", "ong-nhua"],
  "sau-rieng": ["bom-thuy-luc", "bec-tuoi", "ong-nhua"],
  
  // Coffee related
  "ky-thuat-tuoi-ca-phe": ["bom-thuy-luc", "bec-tuoi", "may-bom"],
  "ca-phe": ["bom-thuy-luc", "bec-tuoi", "ong-nhua"],
  
  // Pepper related
  "ky-thuat-tuoi-tieu": ["bom-thuy-luc", "bec-tuoi", "he-thong-tuoi"],
  "tieu": ["bom-thuy-luc", "bec-tuoi", "ong-nhua"],
  
  // General irrigation
  "ky-thuat-tuoi": ["bom-thuy-luc", "bec-tuoi", "bo-loc-trung-tam"],
  "tưới-tiêu": ["bom-thuy-luc", "bec-tuoi", "bo-loc-trung-tam"],
  
  // Fertilizer
  "phan-bon": ["may-thu-phan", "he-thong-tuoi"],
  "su-pham": ["may-thu-phan", "he-thong-tuoi"],
  
  // Sustainability
  "ben-vung": ["he-thong-tuoi-nhieu-tan", "may-bom-tiet-kiem"],
  "sustainability": ["he-thong-tuoi-nhieu-tan", "may-bom-tiet-kiem"],
  
  // Water & Electricity
  "dien-nuoc": ["may-bom", "cong-to-nuoc"],
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * SAMPLE PRODUCTS (Replace with API call in production)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Bơm Thủy Lực CM65 - 3HP",
    slug: "bom-thuy-luc-cm65",
    thumbnail: "/products/bom-thuy-luc-cm65.jpg",
    price: "8.500.000đ",
    category_name: "Bơm Thủy Lực",
  },
  {
    id: "2",
    name: "Béc Tưới Nhỏ Giọt",
    slug: "bec-tuoi-nho-giot",
    thumbnail: "/products/bec-tuoi-nho-giot.jpg",
    price: "35.000đ",
    category_name: "Béc Tưới",
  },
  {
    id: "3",
    name: "Ống PVC DN25 - Cuộn 100m",
    slug: "ong-pvc-dn25",
    thumbnail: "/products/ong-pvc-dn25.jpg",
    price: "1.200.000đ",
    category_name: "Ống Nhựa",
  },
  {
    id: "4",
    name: "Bộ Lọc Trung Tâm 2 inch",
    slug: "bo-loc-trung-tam-2inch",
    thumbnail: "/products/bo-loc-trung-tam.jpg",
    price: "2.800.000đ",
    category_name: "Bộ Lọc",
  },
];

const DEFAULT_PRODUCTS = SAMPLE_PRODUCTS;

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCT CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-[#E9ECEF] bg-white p-3 transition-all hover:border-[#4CAF50] hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F1F5F9]">
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-6 w-6 text-[#CBD5E1]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-sm font-medium text-[#1A1A1A] transition-colors group-hover:text-[#4CAF50]">
          {product.name}
        </h4>
        {product.category_name && (
          <p className="mt-0.5 text-xs text-[#9CA3AF]">{product.category_name}</p>
        )}
        {product.price && (
          <p className="mt-1 text-sm font-semibold text-[#4CAF50]">
            {product.price}
          </p>
        )}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-[#CBD5E1] transition-colors group-hover:text-[#4CAF50]" />
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function RelatedProductsSidebar({ categorySlug }: RelatedProductsSidebarProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      setIsLoading(true);
      
      try {
        // In production, this would call an API endpoint
        // const response = await fetch(`/api/products/related?category=${categorySlug}`);
        // const data = await response.json();
        
        // For now, use sample data based on category mapping
        await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
        
        if (categorySlug) {
          const relatedCategories = CATEGORY_MAPPING[categorySlug.toLowerCase()];
          if (relatedCategories) {
            // Filter products by related categories
            const filtered = DEFAULT_PRODUCTS.slice(0, 3);
            setProducts(filtered);
          } else {
            // Default products if no mapping found
            setProducts(DEFAULT_PRODUCTS.slice(0, 3));
          }
        } else {
          setProducts(DEFAULT_PRODUCTS.slice(0, 3));
        }
      } catch (error) {
        console.error("[RelatedProducts] Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [categorySlug]);

  return (
    <div className="space-y-6">
      {/* Related Products */}
      <div className="rounded-2xl border border-[#E9ECEF] bg-white p-4">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1A1A1A]">
          <Droplets className="h-4 w-4 text-[#4CAF50]" />
          Sản phẩm liên quan
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-16 w-16 animate-pulse rounded-lg bg-[#F1F5F9]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-[#F1F5F9]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#F1F5F9]" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-[#9CA3AF]">
            Không có sản phẩm liên quan
          </p>
        )}
      </div>

      {/* CTA Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#388E3C] p-5 text-white">
        <h3 className="mb-2 text-lg font-semibold">Cần tư vấn sản phẩm?</h3>
        <p className="mb-4 text-sm text-white/80">
          Liên hệ ngay để được tư vấn giải pháp tưới tiêu phù hợp với cây trồng của bạn.
        </p>
        <div className="space-y-2">
          <Link
            href="/san-pham"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#2E7D32] transition-colors hover:bg-white/90"
          >
            Xem tất cả sản phẩm
            <ExternalLink className="h-4 w-4" />
          </Link>
          <Link
            href="/lien-he"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            Liên hệ tư vấn
          </Link>
        </div>
      </div>

      {/* Calculator CTA */}
      <div className="rounded-2xl border border-[#E9ECEF] bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-[#1A1A1A]">
          <Package className="h-4 w-4 text-[#4CAF50]" />
          Tính chi phí tưới
        </h3>
        <p className="mb-4 text-sm text-[#5F6B7A]">
          Sử dụng công cụ dự toán chi phí lắp đặt hệ thống tưới cho cây trồng của bạn.
        </p>
        <Link
          href="/tinh-toan"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4CAF50] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E36]"
        >
          Dự toán chi phí
        </Link>
      </div>
    </div>
  );
}
