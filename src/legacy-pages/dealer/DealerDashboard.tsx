import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Users, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  Settings2, 
  Navigation,
  Wrench,
  Droplets,
  Sprout
} from 'lucide-react';

// Giả lập dữ liệu sản phẩm
const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Ống LDPE 16mm Dekko', stock: true },
  { id: 'p2', name: 'Béc tưới Rivulis S2000', stock: true },
  { id: 'p3', name: 'Bộ lọc đĩa Azud AGL', stock: false },
  { id: 'p4', name: 'Thiết bị châm phân Ez Flo', stock: true },
];

// Giả lập danh sách dịch vụ vùng miền (Tây Nguyên)
const REGIONAL_SERVICES = [
  { id: 's1', label: 'Tư vấn thi công tưới nhỏ giọt', icon: Droplets },
  { id: 's2', label: 'Lắp đặt châm phân tự động', icon: Settings2 },
  { id: 's3', label: 'Bảo trì hệ thống định kỳ', icon: Wrench },
  { id: 's4', label: 'Tưới tự động sầu riêng/cà phê', icon: Sprout },
];

export default function DealerDashboard() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [activeServices, setActiveServices] = useState<string[]>(['s1', 's2']);
  const [isDealerActive, setIsDealerActive] = useState(true);

  // Xử lý Gạt công tắc Tồn kho
  const handleInventoryToggle = (id: string, name: string, currentVal: boolean) => {
    const newVal = !currentVal;
    setProducts(products.map(p => p.id === id ? { ...p, stock: newVal } : p));
    
    // Gửi Toast xác nhận
    if (newVal) {
      toast.success(`Đã cập nhật: ${name} hiện CÓ SẴN`, { 
        description: 'Đã đồng bộ trạng thái lên bản đồ vệ tinh.',
      });
    } else {
      toast('Tạm ngưng nhận Lead', { 
        description: `${name} hiện ĐÃ HẾT HÀNG.`,
        icon: <Activity className="w-4 h-4 text-slate-400" />
      });
    }
  };

  // Xử lý Bật/Tắt Dịch vụ
  const handleServiceToggle = (id: string, label: string) => {
    if (activeServices.includes(id)) {
      setActiveServices(activeServices.filter(s => s !== id));
      toast.info(`Đã tắt dịch vụ: ${label}`);
    } else {
      setActiveServices([...activeServices, id]);
      toast.success(`Đã bật dịch vụ: ${label}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      {/* Header gọn gàng, nhiều white space */}
      <div className="bg-[#FFFFFF] border-b border-slate-100 mb-8 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Trạm Điều Phối</h1>
            <p className="text-slate-500 mt-1">Đại lý Nông Phát — Khu vực Tây Nguyên</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-2 pr-4 rounded-full border border-slate-100">
            <Switch 
              checked={isDealerActive} 
              onCheckedChange={(v) => {
                setIsDealerActive(v);
                toast(v ? "Đại lý đã Online" : "Đại lý đang Offline");
              }}
              className="data-[state=checked]:bg-[#10B981] ml-1"
            />
            <span className={`text-sm font-semibold ${isDealerActive ? 'text-[#10B981]' : 'text-slate-400'}`}>
              {isDealerActive ? 'Sẵn sàng nhận Lead' : 'Tạm ngưng'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CỘT TRÁI: Thống kê & Master Switch */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Status Cards (Soft Shadows, No Glassmorphism) */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] bg-[#FFFFFF]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Lead mới tuần này</p>
                    <p className="text-4xl font-bold text-slate-800">24</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-[#10B981]">
                  <Activity className="w-4 h-4 mr-1" />
                  <span>+12% so với tuần trước</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] bg-[#FFFFFF]">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Tỷ lệ chuyển đổi</p>
                    <p className="text-4xl font-bold text-slate-800">68%</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">
                  Top 15% đại lý hiệu quả
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Master Switch Inventory */}
          <Card className="border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] bg-[#FFFFFF]">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                Bộ quản lý tồn kho <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Binary Switch</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {products.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-800">{product.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Trạng thái: {product.stock ? 'Có hàng' : 'Hết hàng'}
                      </p>
                    </div>
                    {/* Nút Toggle kích thước lớn cho Mobile */}
                    <Switch
                      checked={product.stock}
                      onCheckedChange={() => handleInventoryToggle(product.id, product.name, product.stock)}
                      className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-slate-200 scale-125 origin-right"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI: Radar Map & Services */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Light Map Radar */}
          <Card className="border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] bg-[#FFFFFF] overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-800 flex items-center justify-between">
                Radar Không Gian
                <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30 bg-[#10B981]/5">
                  50km Radius
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative min-h-[250px] bg-[#E8F0F2]">
              {/* Giả lập Bản đồ dạng Streets/Light Mode */}
              <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              {/* Vòng Radar 50km màu xanh mỏng */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-[#10B981] bg-[#10B981]/5 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 flex items-center justify-center">
                  {/* Điểm Đại lý (Tâm) */}
                  <div className="w-4 h-4 rounded-full bg-[#10B981] border-2 border-white shadow-md z-10 relative">
                     <div className="absolute w-full h-full bg-[#10B981] rounded-full animate-ping opacity-50"></div>
                  </div>
                </div>
              </div>

              {/* Các điểm Lead (Icons nổi bật) */}
              <div className="absolute top-[20%] left-[30%]">
                <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-sm flex items-center justify-center">
                  <MapPin className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="absolute top-[70%] left-[65%]">
                <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow-sm flex items-center justify-center">
                  <MapPin className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              {/* Phủ sáng nhẹ gradient để nhìn clean hơn */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none"></div>
            </CardContent>
          </Card>

          {/* Module Dịch Vụ Vùng Miền */}
          <Card className="border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] bg-[#FFFFFF]">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-lg text-slate-800">Dịch vụ cung cấp</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500 mb-4">
                Chọn các dịch vụ thi công bạn có thể đảm nhận tại khu vực này.
              </p>
              <div className="flex flex-wrap gap-2">
                {REGIONAL_SERVICES.map(service => {
                  const isActive = activeServices.includes(service.id);
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleServiceToggle(service.id, service.label)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        isActive 
                          ? 'border-[#10B981] bg-[#10B981]/5 text-[#059669] shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#10B981]' : 'text-slate-400'}`} />
                      {service.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
