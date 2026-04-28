'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Phone, Building2, Plus, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

type ColumnStatus = 'new' | 'gps_pending' | 'setup' | 'active';

interface KanbanColumn {
  id: ColumnStatus;
  title: string;
  color: string;
}

interface DealerCard {
  id: string;
  name: string;
  province: string;
  phone: string;
  status: ColumnStatus;
  tier: 'Gold' | 'Silver' | 'Bronze';
  date: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'new', title: 'Đăng ký mới', color: 'border-blue-500' },
  { id: 'gps_pending', title: 'Chờ duyệt GPS', color: 'border-amber-500' },
  { id: 'setup', title: 'Đang setup kho', color: 'border-purple-500' },
  { id: 'active', title: 'Hoạt động', color: 'border-emerald-500' },
];

const INITIAL_DEALERS: DealerCard[] = [
  { id: 'dl-1', name: 'Đại lý Nông Phát', province: 'Đồng Nai', phone: '0912.345.678', status: 'new', tier: 'Bronze', date: '28/04' },
  { id: 'dl-2', name: 'HTX Miền Đông', province: 'Tây Ninh', phone: '0988.112.233', status: 'new', tier: 'Silver', date: '27/04' },
  { id: 'dl-3', name: 'Cửa hàng Xanh Việt', province: 'Bình Dương', phone: '0909.888.777', status: 'gps_pending', tier: 'Gold', date: '25/04' },
  { id: 'dl-4', name: 'Đại lý Phú Lộc', province: 'Đắk Lắk', phone: '0977.665.544', status: 'setup', tier: 'Silver', date: '20/04' },
  { id: 'dl-5', name: 'Nhà Bè Agri - CN1', province: 'TP.HCM', phone: '0933.221.100', status: 'active', tier: 'Gold', date: '10/01' },
  { id: 'dl-6', name: 'Đại lý Cao Nguyên', province: 'Lâm Đồng', phone: '0944.555.666', status: 'active', tier: 'Gold', date: '15/02' },
];

export default function PartnerHubPage() {
  const [dealers, setDealers] = useState<DealerCard[]>(INITIAL_DEALERS);
  const [searchTerm, setSearchTerm] = useState('');
  
  const dragItem = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragItem.current = id;
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the ghost image to render before adding styling if needed
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    dragItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: ColumnStatus) => {
    e.preventDefault();
    if (!dragItem.current) return;
    
    const id = dragItem.current;
    
    setDealers(prev => {
      const dealer = prev.find(d => d.id === id);
      if (!dealer || dealer.status === status) return prev;
      
      const newDealers = prev.map(d => 
        d.id === id ? { ...d, status } : d
      );
      
      return newDealers;
    });
    
    // In a real app, we would make a Supabase call here to update the status
    toast({
      title: '✅ Đã cập nhật trạng thái',
      description: 'Tiến độ onboarding của đại lý đã được lưu.',
    });
  };

  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminShell title="B2B Partner Hub" subtitle="Quản lý tiến độ Onboarding và Danh sách Đại lý phân phối">
      <div className="flex flex-col h-[calc(100vh-140px)]">
        
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm theo tên hoặc tỉnh thành..." 
              className="pl-9 rounded-xl border-border/50 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="rounded-xl bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Thêm đại lý mới
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
          {COLUMNS.map(column => {
            const columnDealers = filteredDealers.filter(d => d.status === column.id);
            
            return (
              <div 
                key={column.id} 
                className="flex-shrink-0 w-[320px] flex flex-col bg-muted/30 rounded-2xl border border-border/50 overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className={cn("p-4 border-b bg-white border-t-4", column.color)}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">{column.title}</h3>
                    <Badge variant="secondary" className="font-mono text-xs rounded-full">
                      {columnDealers.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {columnDealers.map(dealer => (
                    <div 
                      key={dealer.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, dealer.id)}
                      onDragEnd={handleDragEnd}
                      className="cursor-move"
                    >
                      <Link href={`/admin/partners/${dealer.id}`}>
                        <Card className="hover:border-[#2E7D32]/50 hover:shadow-md transition-all">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-sm line-clamp-1">{dealer.name}</h4>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[9px] px-1.5 py-0",
                                  dealer.tier === 'Gold' ? 'border-amber-400 text-amber-600 bg-amber-50' :
                                  dealer.tier === 'Silver' ? 'border-slate-400 text-slate-600 bg-slate-50' :
                                  'border-orange-900/30 text-orange-900/70 bg-orange-900/5'
                                )}
                              >
                                {dealer.tier}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1.5 mt-3">
                              <div className="flex items-center text-[11px] text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1.5 shrink-0" />
                                <span className="truncate">{dealer.province}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1.5 shrink-0" />
                                  <span>{dealer.phone}</span>
                                </div>
                                <div className="flex items-center text-slate-400">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{dealer.date}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))}
                  
                  {columnDealers.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                      Kéo thả vào đây
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </AdminShell>
  );
}
