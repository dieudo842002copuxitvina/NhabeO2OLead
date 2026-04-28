'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Network,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import react-force-graph-2d to prevent SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center text-muted-foreground">
        <Network className="h-8 w-8 mb-2 animate-pulse text-slate-300" />
        <p className="text-sm">Đang tải biểu đồ tri thức...</p>
        <p className="text-xs mt-1 text-slate-400">Yêu cầu cài đặt react-force-graph-2d</p>
      </div>
    </div>
  )
});

// ─── Mock Graph Data ──────────────────────────────────────────────────
const MOCK_DATA = {
  nodes: [
    { id: 'geo-matching', name: 'Thuật toán Geo-matching', group: 'technical', val: 25 },
    { id: 'api-submit-lead', name: 'API Route: submitLeadO2O', group: 'technical', val: 15 },
    { id: 'system-arch', name: 'System Architecture', group: 'technical', val: 30 },
    { id: 'postgis-distance', name: 'PostGIS ST_DistanceSphere', group: 'technical', val: 10 },
    { id: 'o2o-strategy', name: 'Chiến lược O2O', group: 'business', val: 20 },
    { id: 'partner-tier', name: 'Cấp bậc đối tác (Partner Tier)', group: 'business', val: 15 },
    { id: 'onboarding', name: 'Quy trình Onboarding', group: 'business', val: 10 },
    { id: 'supabase-rls', name: 'Supabase RLS Policies', group: 'technical', val: 18 },
  ],
  links: [
    { source: 'geo-matching', target: 'api-submit-lead' },
    { source: 'geo-matching', target: 'system-arch' },
    { source: 'geo-matching', target: 'postgis-distance' },
    { source: 'o2o-strategy', target: 'geo-matching' },
    { source: 'partner-tier', target: 'o2o-strategy' },
    { source: 'partner-tier', target: 'geo-matching' },
    { source: 'onboarding', target: 'partner-tier' },
    { source: 'system-arch', target: 'supabase-rls' },
    { source: 'api-submit-lead', target: 'supabase-rls' },
  ]
};

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    // Initial update with a small delay to ensure container is rendered
    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleNodeClick = (node: any) => {
    // Navigate to article detail
    router.push(`/admin/wiki/${node.id}`);
  };

  const getGroupColor = (group: string) => {
    if (group === 'technical') return '#2563EB'; // Blue
    if (group === 'business') return '#D97706'; // Brown/Amber
    return '#94A3B8'; // Slate
  };

  return (
    <AdminShell title="Knowledge Graph" subtitle="Bản đồ tri thức và mối quan hệ tài liệu">
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/wiki">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border/50 bg-white">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-600" />
            Bản đồ liên kết
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">#technical</Badge>
            <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">#business</Badge>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-lg">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Bộ lọc
          </Button>
        </div>
      </div>

      <Card className="border-border/50 overflow-hidden shadow-sm flex-1 h-[calc(100vh-180px)]">
        <div ref={containerRef} className="w-full h-full relative bg-[#F8FAFC]">
          
          {/* Overlay Search/Info */}
          <div className="absolute top-4 left-4 z-10 w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Tìm Node..." 
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border/50 bg-white/90 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 ml-1 bg-white/60 inline-block px-2 py-0.5 rounded backdrop-blur-sm">
              Cuộn để Zoom • Kéo để di chuyển • Click Node để xem bài
            </p>
          </div>

          {isMounted && (
            <ForceGraph2D
              ref={graphRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={MOCK_DATA}
              nodeLabel="name"
              nodeColor={(node: any) => getGroupColor(node.group)}
              nodeRelSize={6}
              linkColor={() => '#CBD5E1'}
              linkWidth={1.5}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              onNodeClick={handleNodeClick}
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 12/globalScale;
                ctx.font = `${fontSize}px Inter, sans-serif`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = getGroupColor(node.group);
                ctx.fillText(label, node.x, node.y);

                node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
              }}
              nodePointerAreaPaint={(node: any, color, ctx) => {
                ctx.fillStyle = color;
                const bckgDimensions = node.__bckgDimensions;
                bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
              }}
            />
          )}
        </div>
      </Card>

    </AdminShell>
  );
}
