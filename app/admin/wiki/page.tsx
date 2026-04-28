'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Hash,
  Link as LinkIcon,
  GitMerge,
  Clock,
  User,
  Terminal,
  FileText,
  ChevronRight,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Mock Data ─────────────────────────────────────────────────────────
const WIKI_PAGES = [
  { id: '1', title: 'Kiến trúc Next.js App Router', snippet: 'Tổng quan về cấu trúc thư mục và server components...' },
  { id: '2', title: 'Thuật toán Geo-matching', snippet: 'Cách tính điểm phân phối Lead dựa trên 4 trọng số...' },
  { id: '3', title: 'Supabase RLS Policies', snippet: 'Bảo mật dữ liệu bảng leads và dealers...' },
  { id: '4', title: 'Hướng dẫn deploy Vercel', snippet: 'Cấu hình biến môi trường và build cache...' },
];

const BACKLINKS = [
  { title: 'API Route: submitLeadO2O', context: '...tính điểm dựa trên [[Thuật toán Geo-matching]] trước khi insert...' },
  { title: 'Tài liệu: System Architecture', context: '...phần điều phối sử dụng core logic từ [[Thuật toán Geo-matching]]...' },
];

export default function InternalWikiPage() {
  const [cmdKOpen, setCmdKOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdKOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredPages = WIKI_PAGES.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminShell title="Internal Wiki" subtitle="Cơ sở tri thức và Tài liệu kỹ thuật hệ thống">
      
      {/* Top action bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Docs</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Thuật toán Geo-matching</span>
        </div>
        
        <button 
          onClick={() => setCmdKOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted border border-border/50 rounded-lg text-xs text-muted-foreground transition-colors"
        >
          <Search className="h-3 w-3" />
          <span>Tìm kiếm nhanh...</span>
          <kbd className="ml-2 pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Markdown Content (Mocked) */}
        <div className="lg:col-span-8 space-y-8 pb-12">
          
          <article className="prose prose-slate max-w-none">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Thuật toán Geo-matching</h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 border-b border-border/30 pb-4">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Cập nhật 2 ngày trước</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> bởi @techlead</span>
            </div>

            <p className="leading-relaxed text-slate-700 mb-6">
              Hệ thống <strong>Geo-matching O2O</strong> (Online-to-Offline) chịu trách nhiệm phân phối Lead tự động từ nền tảng Web đến các đại lý ủy quyền dựa trên một thuật toán chấm điểm đa biến.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-border/30 pb-2">1. Công thức tính điểm (Scoring Formula)</h2>
            <p className="leading-relaxed text-slate-700 mb-4">
              Điểm tổng (Total Score) của mỗi đại lý được tính toán dựa trên 4 trọng số được cấu hình tại <code>/admin/o2o-strategy</code>.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 overflow-x-auto">
              <pre className="text-[13px] text-slate-800 font-mono leading-loose">
<code>{`function calculateDealerScore(dealer, weights) {
  const distScore = Math.max(0, 100 - dealer.distanceKm * 0.6);
  const stockScore = dealer.inStock ? 100 : 0;
  const repScore = (dealer.rating / 5) * 100;
  
  let tierScore = 30; // Bronze
  if (dealer.partnerTier === 'Gold') tierScore = 100;
  if (dealer.partnerTier === 'Silver') tierScore = 60;

  return (
    (distScore * weights.distance) +
    (stockScore * weights.stock) +
    (repScore * weights.reputation) +
    (tierScore * weights.partner_level)
  ) / 100;
}`}</code>
              </pre>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b border-border/30 pb-2">2. Xử lý địa lý (PostGIS)</h2>
            <p className="leading-relaxed text-slate-700 mb-4">
              Khoảng cách được tính toán trực tiếp tại Database layer sử dụng <strong>PostGIS</strong> <code>ST_DistanceSphere</code> để đảm bảo hiệu năng khi có hàng nghìn đại lý.
            </p>

            <div className="bg-slate-900 rounded-lg p-4 mb-6 overflow-x-auto">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
                <Terminal className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-mono text-slate-400">rpc/smart_geo_routing.sql</span>
              </div>
              <pre className="text-[13px] text-emerald-400 font-mono leading-loose">
<code>{`CREATE OR REPLACE FUNCTION smart_geo_routing(user_lat float, user_lng float)
RETURNS TABLE (dealer_id uuid, distance_km float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT id, 
         ST_DistanceSphere(location, ST_MakePoint(user_lng, user_lat)) / 1000 AS distance_km
  FROM dealers
  WHERE status = 'active'
  ORDER BY distance_km ASC
  LIMIT 50;
END;
$$;`}</code>
              </pre>
            </div>

            <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-lg mt-8 text-sm text-amber-900">
              <strong>Lưu ý quan trọng:</strong> Nếu không tìm thấy đại lý nào trong bán kính 50km, Lead sẽ tự động được chuyển về trạng thái <code>unassigned</code> để Admin xử lý thủ công.
            </div>

          </article>
        </div>

        {/* Right Column: Local Graph & Backlinks */}
        <div className="lg:col-span-4 space-y-6">
          
          <Card className="border-border/50 bg-slate-50/50 shadow-none">
            <CardContent className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <GitMerge className="h-3.5 w-3.5" />
                Local Graph
              </h3>
              
              <div className="relative h-[180px] w-full border border-border/50 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                {/* SVG Mock of a node graph */}
                <svg width="100%" height="100%" viewBox="0 0 200 150" className="absolute inset-0">
                  <line x1="100" y1="75" x2="40" y2="40" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="100" y1="75" x2="160" y2="30" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="100" y1="75" x2="150" y2="120" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="100" y1="75" x2="50" y2="110" stroke="#CBD5E1" strokeWidth="1.5" />
                  
                  {/* Central Node */}
                  <circle cx="100" cy="75" r="8" fill="#2E7D32" />
                  <text x="100" y="92" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#0F172A">Geo-matching</text>
                  
                  {/* Surrounding Nodes */}
                  <circle cx="40" cy="40" r="5" fill="#94A3B8" />
                  <text x="40" y="30" fontSize="7" textAnchor="middle" fill="#64748B">RPC API</text>
                  
                  <circle cx="160" cy="30" r="5" fill="#94A3B8" />
                  <text x="160" y="20" fontSize="7" textAnchor="middle" fill="#64748B">O2O Strategy</text>
                  
                  <circle cx="150" cy="120" r="5" fill="#94A3B8" />
                  <text x="150" y="132" fontSize="7" textAnchor="middle" fill="#64748B">System Settings</text>
                  
                  <circle cx="50" cy="110" r="5" fill="#94A3B8" />
                  <text x="50" y="122" fontSize="7" textAnchor="middle" fill="#64748B">PostGIS</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-none">
            <CardContent className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <LinkIcon className="h-3.5 w-3.5" />
                Backlinks
              </h3>
              
              <div className="space-y-3">
                {BACKLINKS.map((link, i) => (
                  <div key={i} className="group p-3 rounded-xl border border-border/50 hover:border-[#2E7D32]/30 hover:bg-[#2E7D32]/5 transition-colors cursor-pointer">
                    <h4 className="text-xs font-bold text-[#2E7D32] mb-1">{link.title}</h4>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      {link.context.split('[[Thuật toán Geo-matching]]').map((part, j, arr) => (
                        <React.Fragment key={j}>
                          {part}
                          {j < arr.length - 1 && (
                            <span className="font-semibold text-foreground bg-muted px-1 py-0.5 rounded mx-0.5">
                              Thuật toán Geo-matching
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>

      {/* Command Palette Modal */}
      <Dialog open={cmdKOpen} onOpenChange={setCmdKOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-border/50 shadow-2xl">
          <div className="flex items-center border-b border-border/50 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
            <input 
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Tìm kiếm tài liệu, mã nguồn, API..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredPages.length > 0 ? (
              <div className="space-y-1">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Wiki Pages
                </p>
                {filteredPages.map((page) => (
                  <button 
                    key={page.id}
                    className="w-full flex flex-col items-start px-3 py-2 hover:bg-muted rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <FileText className="h-3.5 w-3.5 text-[#2E7D32]" />
                      <span className="text-sm font-medium">{page.title}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground line-clamp-1 pl-5">
                      {page.snippet}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                <Command className="h-8 w-8 text-muted-foreground/30 mb-2" />
                Không tìm thấy kết quả cho "{searchQuery}"
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
