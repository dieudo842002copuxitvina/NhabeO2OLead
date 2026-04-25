"use client";

import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Settings, 
  Package, 
  Box, 
  Zap, 
  Droplets, 
  Leaf, 
  Bell,
  LogOut,
  ChevronRight,
  TrendingUp,
  Users
} from "lucide-react";
import SeoMeta from "@/components/SeoMeta";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Mock Dealer Data ---
const DEFAULT_STOCK = {
  irrigation: true,
  pumps: true,
  fertilizers: false,
  sensors: true,
};

export default function DealerAdminPage() {
  const [stock, setStock] = useState(DEFAULT_STOCK);
  const [activeTab, setActiveTab] = useState("stock");

  const toggleStock = (key: keyof typeof DEFAULT_STOCK) => {
    setStock(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1A1A1A] flex">
      <SeoMeta title="Dealer Admin - AgriFlow" description="Giao diện quản lý tồn kho và trạng thái đại lý Nhà Bè Agri." />

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 hidden md:flex flex-col bg-white/40 backdrop-blur-xl">
        <div className="p-8 border-b border-white/10 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">AgriFlow <span className="text-emerald-500 text-xs">Dealer</span></span>
        </div>
        
        <nav className="p-4 space-y-2 flex-grow">
          {[
            { id: "stock", name: "Quản lý Tồn kho", icon: Package },
            { id: "orders", name: "Đơn hàng mới", icon: Box },
            { id: "customers", name: "Khách hàng", icon: Users },
            { id: "analytics", name: "Thống kê", icon: TrendingUp },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Chào mừng, Đại lý Nông Phát</h1>
            <p className="text-slate-400 text-sm">Quản lý trạng thái cung ứng thiết bị tại khu vực Đồng Nai.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-white/10 bg-white/5 relative h-12 w-12 rounded-xl p-0">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/10 overflow-hidden">
               <img src="/placeholder.svg" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Stock Toggle Section */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white">Trạng thái Cung ứng (In-Stock Status)</CardTitle>
                <CardDescription className="text-slate-400">Gạt công tắc để cập nhật tình trạng hàng hóa. Hệ thống sẽ tự động điều chỉnh gợi ý cho nông dân.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "irrigation", name: "Thiết bị Tưới (Béc, Ống)", icon: Droplets, color: "text-blue-400" },
                  { id: "pumps", name: "Máy bơm & Động cơ", icon: Zap, color: "text-amber-400" },
                  { id: "fertilizers", name: "Phân bón & Dinh dưỡng", icon: Leaf, color: "text-emerald-400" },
                  { id: "sensors", name: "Cảm biến & IoT", icon: Box, color: "text-purple-400" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-xl bg-white/10", item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{item.name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">Cập nhật 2 giờ trước</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xs font-bold", stock[item.id as keyof typeof DEFAULT_STOCK] ? "text-emerald-400" : "text-slate-500")}>
                        {stock[item.id as keyof typeof DEFAULT_STOCK] ? "CÒN HÀNG" : "HẾT HÀNG"}
                      </span>
                      <Switch 
                        checked={stock[item.id as keyof typeof DEFAULT_STOCK]} 
                        onCheckedChange={() => toggleStock(item.id as keyof typeof DEFAULT_STOCK)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card className="bg-emerald-500/10 border-emerald-500/20">
                  <CardContent className="p-6">
                     <div className="text-sm text-emerald-400 font-bold mb-2 uppercase">Lượt xem trang đại lý</div>
                     <div className="text-4xl font-bold text-white mb-2">1,248</div>
                     <div className="text-xs text-emerald-500 flex items-center gap-1 font-bold">
                        +12% <TrendingUp className="w-3 h-3" /> so với tuần trước
                     </div>
                  </CardContent>
               </Card>
               <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-6">
                     <div className="text-sm text-blue-400 font-bold mb-2 uppercase">Yêu cầu báo giá mới</div>
                     <div className="text-4xl font-bold text-white mb-2">24</div>
                     <div className="text-xs text-blue-500 font-bold">8 yêu cầu chưa xử lý</div>
                  </CardContent>
               </Card>
            </div>
          </div>

          {/* Activity Logs / Notifications */}
          <div className="lg:col-span-4 space-y-6">
             <Card className="bg-white/5 border-white/10 backdrop-blur-xl h-full">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { user: "Bác Hùng", action: "vừa gửi dự toán tưới 2ha", time: "5 phút trước" },
                    { user: "Anh Nam", action: "cần tư vấn phân bón hồ tiêu", time: "20 phút trước" },
                    { user: "HTX Xanh", action: "đã xem bảng giá máy bơm", time: "1 giờ trước" },
                  ].map((log, i) => (
                    <div key={i} className="flex gap-4 items-start">
                       <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">
                         {log.user[0]}
                       </div>
                       <div>
                          <p className="text-sm text-white"><span className="font-bold">{log.user}</span> {log.action}</p>
                          <p className="text-[10px] text-slate-500">{log.time}</p>
                       </div>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-emerald-400 hover:text-emerald-300 text-xs mt-4">
                    Xem tất cả hoạt động <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
             </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
