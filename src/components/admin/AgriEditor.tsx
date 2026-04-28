'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Link as LinkIcon, Loader2 } from 'lucide-react';

// ─── Regex & Parser Helpers ──────────────────────────────────────────
const PARSE_REGEX = /(\[\[.*?\]\]|\/sku:[A-Za-z0-9_-]+|\n)/g;

interface ProductPreviewData {
  id: string;
  sku: string;
  name: string;
  price: number;
  image_url: string;
}

// ─── Inline Product Card Component ───────────────────────────────────
function InlineProductCard({ sku, product, loading }: { sku: string; product?: ProductPreviewData; loading: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground border border-border/50 align-middle mx-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Đang tải thông tin {sku}...
      </span>
    );
  }

  if (!product) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs border border-red-200 align-middle mx-1">
        <Package className="h-3 w-3" />
        SKU {sku} không tồn tại
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-border/60 align-middle mx-1 hover:border-[#2E7D32]/50 transition-colors cursor-pointer group">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="h-6 w-6 rounded object-cover" />
      ) : (
        <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center">
          <Package className="h-3 w-3 text-slate-400" />
        </div>
      )}
      <span className="flex flex-col">
        <span className="text-[11px] font-bold text-slate-900 leading-none group-hover:text-[#2E7D32] transition-colors line-clamp-1 max-w-[150px]">
          {product.name}
        </span>
        <span className="text-[9px] text-muted-foreground leading-none mt-1 uppercase font-mono">
          {sku} • {product.price ? new Intl.NumberFormat('vi-VN').format(product.price) + 'đ' : 'Liên hệ'}
        </span>
      </span>
    </span>
  );
}

// ─── AgriEditor Component ────────────────────────────────────────────
export default function AgriEditor({ initialValue = '' }: { initialValue?: string }) {
  const [content, setContent] = useState(initialValue);
  const [productsCache, setProductsCache] = useState<Record<string, ProductPreviewData>>({});
  const [loadingSkus, setLoadingSkus] = useState<Set<string>>(new Set());

  // Lọc ra các SKU cần fetch từ nội dung
  useEffect(() => {
    const matches = content.match(/\/sku:([A-Za-z0-9_-]+)/g);
    if (!matches) return;

    const uniqueSkus = Array.from(new Set(matches.map(m => m.replace('/sku:', ''))));
    const skusToFetch = uniqueSkus.filter(sku => !productsCache[sku] && !loadingSkus.has(sku));

    if (skusToFetch.length > 0) {
      fetchProducts(skusToFetch);
    }
  }, [content, productsCache, loadingSkus]);

  const fetchProducts = async (skus: string[]) => {
    // Add to loading state
    setLoadingSkus(prev => {
      const next = new Set(prev);
      skus.forEach(s => next.add(s));
      return next;
    });

    try {
      // Mock Data cho nhanh nếu Supabase chưa có bảng 'products' chứa cột 'sku'
      // Trong thực tế sẽ gọi:
      // const { data } = await supabase.from('products').select('id, sku, name, base_price, image_url').in('sku', skus);
      
      const { data, error } = await supabase
        .from('products')
        .select('id, sku, name, base_price, image_url')
        .in('sku', skus);

      if (error) throw error;

      const newCache: Record<string, ProductPreviewData> = {};
      
      if (data) {
        data.forEach((p: any) => {
          if (p.sku) {
            newCache[p.sku] = {
              id: p.id,
              sku: p.sku,
              name: p.name || 'Sản phẩm chưa có tên',
              price: p.base_price || 0,
              image_url: p.image_url || ''
            };
          }
        });
      }

      // Mock fallback cho SKU test nếu DB trống
      skus.forEach(sku => {
        if (!newCache[sku] && sku.startsWith('DEMO')) {
          newCache[sku] = {
            id: 'mock-'+sku,
            sku: sku,
            name: `Bộ châm phân tự động ${sku}`,
            price: 1500000,
            image_url: ''
          };
        }
      });

      setProductsCache(prev => ({ ...prev, ...newCache }));
    } catch (err) {
      console.error('Lỗi khi fetch SKU:', err);
    } finally {
      // Remove from loading
      setLoadingSkus(prev => {
        const next = new Set(prev);
        skus.forEach(s => next.delete(s));
        return next;
      });
    }
  };

  // ─── Render Preview ───
  const renderPreview = useCallback(() => {
    if (!content.trim()) {
      return <div className="text-muted-foreground text-sm italic">Bản xem trước sẽ hiển thị tại đây...</div>;
    }

    const parts = content.split(PARSE_REGEX);

    return parts.map((part, index) => {
      if (!part) return null;

      // 1. Render Line Break
      if (part === '\n') {
        return <br key={index} />;
      }

      // 2. Render Internal Link [[Bài viết]]
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const title = part.slice(2, -2);
        return (
          <span 
            key={index} 
            className="inline-flex items-center text-[#2E7D32] hover:text-[#1B5E20] font-semibold cursor-pointer underline decoration-[#2E7D32]/30 underline-offset-2 mx-0.5 transition-colors"
          >
            <LinkIcon className="h-3 w-3 mr-1 inline" />
            {title}
          </span>
        );
      }

      // 3. Render Product Card /sku:XYZ
      if (part.startsWith('/sku:')) {
        const sku = part.replace('/sku:', '');
        return (
          <InlineProductCard 
            key={index} 
            sku={sku} 
            product={productsCache[sku]} 
            loading={loadingSkus.has(sku)} 
          />
        );
      }

      // 4. Render normal text
      return <span key={index} className="text-slate-800 leading-relaxed">{part}</span>;
    });
  }, [content, productsCache, loadingSkus]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
      
      {/* Cột 1: Soạn thảo Markdown/Raw Text (Giả lập CodeMirror) */}
      <Card className="flex flex-col border-border/50 shadow-none h-full overflow-hidden">
        <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs font-mono border-b border-slate-800 flex justify-between items-center">
          <span>AgriEditor (Markdown)</span>
          <span className="text-slate-500 text-[10px]">Cú pháp: [[Link]] hoặc /sku:MA_SP</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 w-full p-4 bg-slate-950 text-emerald-400 font-mono text-sm leading-relaxed outline-none resize-none placeholder:text-slate-700"
          spellCheck={false}
          placeholder="Nhập nội dung tài liệu ở đây...
Thử gõ: Xem chi tiết tại [[Kiến trúc hệ thống]] hoặc nhúng sản phẩm /sku:DEMO123"
        />
      </Card>

      {/* Cột 2: Bản xem trước (Live Preview) */}
      <Card className="flex flex-col border-border/50 shadow-none h-full bg-slate-50 overflow-hidden">
        <div className="bg-white text-slate-700 px-4 py-2 text-xs font-semibold border-b border-border/50 flex items-center">
          Live Preview
        </div>
        <CardContent className="flex-1 overflow-y-auto p-6 bg-white prose prose-sm max-w-none">
          <div>
            {renderPreview()}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
