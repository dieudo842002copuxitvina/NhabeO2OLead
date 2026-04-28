'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { Package } from 'lucide-react';

/**
 * Xóa dấu tiếng Việt và chuyển đổi thành slug URL
 */
function removeVietnameseTones(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Xử lý văn bản trước khi đưa vào ReactMarkdown
 */
export function preProcessText(text: string) {
  let processed = text;
  
  // 1. Chuyển đổi cú pháp [[Tên Bài]] thành markdown link thông thường
  // Vd: [[Thuật toán]] -> [Thuật toán](/admin/wiki/thuat-toan)
  processed = processed.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
    const slug = removeVietnameseTones(p1);
    return `[${p1}](/admin/wiki/${slug})`;
  });

  // 2. Chuyển đổi cú pháp /sku:XYZ thành thẻ HTML <sku id="XYZ"></sku>
  processed = processed.replace(/\/sku:([A-Za-z0-9_-]+)/g, '<sku id="$1"></sku>');

  return processed;
}

// ─── Component hiển thị Sản phẩm (Mock) ─────────────────────────────
const ProductSpecCard = ({ id }: { id: string }) => {
  return (
    <div className="my-6 p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-start gap-4 shadow-sm max-w-sm hover:border-[#2E7D32]/40 hover:shadow-md transition-all cursor-pointer">
      <div className="h-12 w-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
        <Package className="h-6 w-6 text-slate-400" />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm">Thiết bị Nông nghiệp</h4>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">SKU: {id}</span>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Sẵn hàng</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Renderer Component ─────────────────────────────────────────
interface WikiMarkdownRendererProps {
  content: string;
}

export default function WikiMarkdownRenderer({ content }: WikiMarkdownRendererProps) {
  // Pre-process nội dung để compile regex
  const processedContent = useMemo(() => preProcessText(content), [content]);

  return (
    <div className="prose prose-slate max-w-none prose-p:leading-relaxed text-slate-800">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          // Tùy chỉnh thẻ <a> để Link Wiki nổi bật
          a: ({ node, href, children, ...props }) => {
            const isInternalWikiLink = href?.startsWith('/admin/wiki/');
            
            if (isInternalWikiLink) {
              return (
                <Link 
                  href={href as string} 
                  className="inline-flex items-center text-[#2E7D32] bg-[#2E7D32]/5 px-1 rounded hover:bg-[#2E7D32]/10 font-bold no-underline transition-colors border border-[#2E7D32]/20 mx-0.5"
                  {...props}
                >
                  {children}
                </Link>
              );
            }
            
            // Link thông thường
            return <a href={href} className="text-blue-600 hover:underline" {...props}>{children}</a>;
          },
          
          // @ts-ignore - Map custom HTML tag <sku> to React Component
          sku: ({ node, ...props }) => {
            const id = props.id as string;
            if (!id) return null;
            return <ProductSpecCard id={id} />;
          },

          // Tùy chỉnh Blockquote
          blockquote: ({ node, children, ...props }) => (
            <blockquote className="border-l-4 border-amber-500 bg-amber-50 text-amber-900 py-1 px-4 not-italic rounded-r-lg text-sm" {...props}>
              {children}
            </blockquote>
          ),

          // Tùy chỉnh inline code
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className?.includes('language-');
            
            if (isInline) {
              return (
                <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[13px] font-mono border border-slate-200" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
