'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  Link as LinkIcon, 
  Package, 
  Clock, 
  User, 
  Edit3,
  Network
} from 'lucide-react';
import AgriEditor from '@/components/admin/AgriEditor';

// ─── Mock Data ─────────────────────────────────────────────────────────
const MOCK_WIKI_CONTENT = `
Hệ thống **Geo-matching O2O** (Online-to-Offline) chịu trách nhiệm phân phối Lead tự động từ nền tảng Web đến các đại lý ủy quyền dựa trên một thuật toán chấm điểm đa biến.

## 1. Công thức tính điểm (Scoring Formula)
Điểm tổng (Total Score) của mỗi đại lý được tính toán dựa trên 4 trọng số được cấu hình tại mục quản trị. Yếu tố khoảng cách đóng vai trò lớn nhất.

## 2. Phần cứng tương thích
Hệ thống yêu cầu các bộ cảm biến và van điều khiển tương thích.
Thiết bị khuyên dùng: /sku:DEMO123
Van cấp nước: /sku:VALVE01

## 3. Liên kết liên quan
Vui lòng xem thêm tài liệu tại [[Cấu trúc Database]] hoặc [[API Route: submitLeadO2O]].
`;

const BACKLINKS = [
  { slug: 'api-submit-lead', title: 'API Route: submitLeadO2O', context: '...tính điểm dựa trên [[Thuật toán Geo-matching]] trước khi insert...' },
  { slug: 'system-architecture', title: 'System Architecture', context: '...phần điều phối sử dụng core logic từ [[Thuật toán Geo-matching]]...' },
];

const RELATED_PRODUCTS = [
  { sku: 'DEMO123', name: 'Bộ châm phân tự động DEMO123' },
  { sku: 'VALVE01', name: 'Van điện từ phi 60' },
];

export default function WikiDetailPage() {
  const params = useParams();
  const slug = params?.slug as string || 'thuat-toan-geo-matching';

  return (
    <AdminShell title="Wiki Article" subtitle="Chi tiết tài liệu kỹ thuật">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin/wiki" className="hover:text-foreground transition-colors">Wiki</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/admin/wiki/category/engineering" className="hover:text-foreground transition-colors">Engineering</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium text-slate-900 line-clamp-1 max-w-[300px]">
            {slug.split('-').join(' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/wiki/graph">
            <Button variant="outline" size="sm" className="h-8 rounded-lg border-border/50 text-xs">
              <Network className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
              Graph View
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="h-8 rounded-lg border-border/50 text-xs">
            <Edit3 className="h-3.5 w-3.5 mr-1.5 text-[#2E7D32]" />
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cột trái: Main Content */}
        <div className="lg:col-span-8">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="p-8 md:p-10">
              <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200">#technical</Badge>
              
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-4 capitalize">
                {slug.split('-').join(' ')}
              </h1>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 border-b border-border/30 pb-6">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> 
                  Cập nhật: 28/04/2026
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> 
                  Tác giả: @admin
                </span>
              </div>

              {/* Dùng AgriEditor chỉ để Render Preview (không hiện text area) */}
              <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900 prose-a:text-[#2E7D32]">
                <AgriEditor initialValue={MOCK_WIKI_CONTENT} />
              </div>
            </div>
          </Card>
        </div>

        {/* Cột phải: Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Backlinks */}
          <Card className="border-border/50 shadow-sm bg-slate-50/50">
            <CardContent className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
                <LinkIcon className="h-4 w-4" />
                Linked Mentions (Backlinks)
              </h3>
              
              <div className="space-y-3">
                {BACKLINKS.map((link, i) => (
                  <Link key={i} href={`/admin/wiki/${link.slug}`} className="block group">
                    <div className="p-3 rounded-xl border border-border/60 bg-white hover:border-[#2E7D32]/40 hover:shadow-sm transition-all">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#2E7D32] transition-colors mb-1">
                        {link.title}
                      </h4>
                      <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                        {link.context.split('[[Thuật toán Geo-matching]]').map((part, j, arr) => (
                          <React.Fragment key={j}>
                            {part}
                            {j < arr.length - 1 && (
                              <span className="font-semibold text-slate-700 bg-slate-100 px-1 py-0.5 rounded mx-0.5">
                                Thuật toán Geo-matching
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Products */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
                <Package className="h-4 w-4" />
                Sản phẩm nhắc đến
              </h3>
              
              <div className="flex flex-col gap-2">
                {RELATED_PRODUCTS.map((prod, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-border/50 cursor-pointer group">
                    <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-slate-400 group-hover:text-[#2E7D32] transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-[#2E7D32] transition-colors line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{prod.sku}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </AdminShell>
  );
}
