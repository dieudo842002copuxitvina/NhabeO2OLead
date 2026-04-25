"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/data/types';
import { dealerProducts } from '@/data/mock';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { trackEvent } from '@/lib/tracking';

interface ProductCardProps {
  product: Product;
}

export function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function getPriceRange(productId: string) {
  const offers = dealerProducts.filter(dp => dp.productId === productId);
  if (offers.length === 0) return null;
  const prices = offers.map(o => o.price);
  return { min: Math.min(...prices), max: Math.max(...prices), count: offers.length };
}

export default function ProductCard({ product }: ProductCardProps) {
  const priceRange = getPriceRange(product.id);
  const isBestSeller = product.tags.includes('best seller');

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      onClick={() => trackEvent('product_view', { productId: product.id, productName: product.name, category_id: product.category_id })}
    >
      <Card className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up h-full">
        <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden relative">
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center">
            <span className="text-4xl opacity-40">🌱</span>
          </div>
          {isBestSeller && (
            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] border-0">
              🔥 Bán chạy
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {product.tags.filter(t => t !== 'best seller').slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{product.category_id}</p>
          <h3 className="font-display font-semibold text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-3">
            {priceRange ? (
              <div>
                <p className="font-display font-bold text-base text-primary">
                  {priceRange.min === priceRange.max
                    ? formatVND(priceRange.min)
                    : `${formatVND(priceRange.min)} – ${formatVND(priceRange.max)}`
                  }
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3 inline mr-0.5" />{priceRange.count} đại lý có hàng
                </p>
              </div>
            ) : (
              <p className="font-display font-bold text-base">{formatVND(product.price)}</p>
            )}
            <p className="text-[10px] text-muted-foreground">/{product.unit}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
