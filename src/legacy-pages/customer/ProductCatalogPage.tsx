import React, { useState } from "react";
import { Search, ChevronRight, X, Phone, MapPin, Eye, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// --- Dữ liệu Mẫu ---
const MOCK_PRODUCTS = [
  {
    id: "p1",
    name: "Súng tưới Ducar Jet35T",
    category: "Tưới Phun Mưa",
    brand: "Ducar",
    specs: "Bán kính 20-35m, Lưu lượng 10-30m³/h",
    image: "https://placehold.co/400x300/f1f5f9/475569?text=Ducar+Jet35T",
    description: "Súng tưới phun mưa bán kính lớn, độ bền cao, phù hợp tưới cà phê, hồ tiêu, cây ăn trái và các cánh đồng lớn. Hoạt động tốt trong điều kiện áp suất trung bình đến cao."
  },
  {
    id: "p2",
    name: "Béc tưới Rivulis S2000 PC",
    category: "Tưới Phun Mưa",
    brand: "Rivulis",
    specs: "Bù áp, 24-95 l/h",
    image: "https://placehold.co/400x300/f1f5f9/475569?text=Rivulis+S2000",
    description: "Béc tưới phun mưa siêu nhỏ có chức năng bù áp, lý tưởng cho địa hình dốc và cây trồng cần lượng nước chính xác. Đảm bảo độ đồng đều cao."
  },
  {
    id: "p3",
    name: "Drone DJI Agras T50",
    category: "Máy Nông Nghiệp",
    brand: "DJI",
    specs: "Tải trọng 40kg, Phun 16ha/h",
    image: "https://placehold.co/400x300/f1f5f9/475569?text=DJI+Agras+T50",
    description: "Máy bay nông nghiệp không người lái, trang bị hệ thống radar mảng pha và camera kép. Hiệu suất phun thuốc cực cao, tự động hóa thông minh."
  },
  {
    id: "p4",
    name: "Phân bón hòa tan NPK 20-20-20",
    category: "Dinh Dưỡng",
    brand: "Cà Mau",
    specs: "Tan 100%, Nhập khẩu",
    image: "https://placehold.co/400x300/f1f5f9/475569?text=NPK+20-20-20",
    description: "Phân bón lá hòa tan hoàn toàn, bổ sung cân đối đa lượng NPK giúp cây phát triển toàn diện trong mọi giai đoạn sinh trưởng."
  },
  {
    id: "p5",
    name: "Thiết bị châm phân Ez Flo",
    category: "Bộ Trung Tâm",
    brand: "Ez Flo",
    specs: "Dung tích 10L-100L",
    image: "https://placehold.co/400x300/f1f5f9/475569?text=Ez+Flo",
    description: "Hệ thống châm phân tự động, dễ lắp đặt và sử dụng, tương thích với hầu hết các hệ thống tưới nhỏ giọt và phun mưa hiện có."
  },
  {
    id: "p6",
    name: "Lọc đĩa Azud AGL",
    category: "Bộ Trung Tâm",
    brand: "Azud",
    specs: "130 micron, Lưu lượng 20m³/h",
    image: "https://placehold.co/400x300/f1f5f9/475569?text=Azud+AGL",
    description: "Lọc đĩa chất lượng cao từ Tây Ban Nha, chống tắc nghẽn tốt, dễ vệ sinh, bảo vệ hệ thống tưới an toàn lâu dài."
  },
  {
    id: "p7",
    name: "Ống LDPE 16mm Dekko",
    category: "Ống Dẫn",
    brand: "Dekko",
    specs: "Dày 1.2mm, Chống UV",
    image: "https://placehold.co/400x300/f1f5f9/475569?text=LDPE+16mm",
    description: "Ống dẫn nước tưới PE nguyên sinh, kháng tia UV, độ bền vượt trội dưới thời tiết khắc nghiệt. Phù hợp dẫn nước ra béc/que cắm."
  }
];

const CATEGORIES = ["Tất cả", "Tưới Phun Mưa", "Máy Nông Nghiệp", "Dinh Dưỡng", "Bộ Trung Tâm", "Ống Dẫn"];

export default function ProductCatalogPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [selectedProductForSpecs, setSelectedProductForSpecs] = useState<any>(null);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Derived state
  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === "Tất cả" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePriceInquirySubmit = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }
    toast.success(`Đã ghi nhận yêu cầu. Đại lý gần nhất sẽ liên hệ Zalo ${phoneNumber} trong ít phút!`);
    setSelectedProductForPrice(null);
    setPhoneNumber("");
  };

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      {/* Header & Search */}
      <div className="bg-white/80 backdrop-blur-md sticky top-16 z-30 border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Danh Mục Sản Phẩm</h1>
              <p className="text-slate-500 text-sm">Khám phá thiết bị vật tư nông nghiệp chính hãng</p>
            </div>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input 
                placeholder="Tìm kiếm thiết bị, thương hiệu..." 
                className="pl-10 bg-white/90 border-slate-200 focus-visible:ring-primary h-11 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Navigation & Filters (Horizontal Scroll on Mobile) */}
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800">Không tìm thấy sản phẩm nào</h3>
            <p className="text-slate-500">Thử thay đổi từ khóa hoặc danh mục tìm kiếm</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge variant="secondary" className="bg-white/90 text-slate-700 hover:bg-white backdrop-blur shadow-sm font-semibold">
                      {product.brand}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-xs font-medium text-slate-500 mb-1">{product.category}</div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-blue-600 bg-blue-50/50 inline-block px-2 py-1 rounded border border-blue-100/50 mb-4 w-fit">
                    {product.specs}
                  </p>
                  
                  {/* Spacer to push buttons to bottom */}
                  <div className="mt-auto pt-4 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full border-primary/30 text-primary hover:bg-primary/5 font-medium bg-white"
                      onClick={() => setSelectedProductForSpecs(product)}
                    >
                      <Eye className="w-4 h-4 mr-2" /> Thông số kỹ thuật
                    </Button>
                    <Link to={`/san-pham/${product.name.toLowerCase().replace(/ /g, '-')}`} className="w-full">
                      <Button 
                        className="w-full bg-[#FF6B00] hover:bg-[#E65A00] text-white font-semibold shadow-md shadow-orange-500/20"
                      >
                        <Phone className="w-4 h-4 mr-2" /> Xem Chi Tiết & Đại Lý
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Specs Modal */}
      <Dialog open={!!selectedProductForSpecs} onOpenChange={(open) => !open && setSelectedProductForSpecs(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-800">{selectedProductForSpecs?.name}</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              Thông tin chi tiết về sản phẩm
            </DialogDescription>
          </DialogHeader>
          {selectedProductForSpecs && (
            <div className="space-y-4 py-4">
              <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden">
                 <img 
                    src={selectedProductForSpecs.image} 
                    alt={selectedProductForSpecs.name}
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-slate-500 mb-1">Thương hiệu</div>
                  <div className="font-semibold text-slate-800">{selectedProductForSpecs.brand}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-slate-500 mb-1">Danh mục</div>
                  <div className="font-semibold text-slate-800">{selectedProductForSpecs.category}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
                  <div className="text-slate-500 mb-1">Đặc tính kỹ thuật</div>
                  <div className="font-medium text-blue-700">{selectedProductForSpecs.specs}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Mô tả tổng quan</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedProductForSpecs.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Inquiry Modal */}
      <Dialog open={!!selectedProductForPrice} onOpenChange={(open) => !open && setSelectedProductForPrice(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FF6B00]" /> Nhận báo giá
            </DialogTitle>
          </DialogHeader>
          {selectedProductForPrice && (
            <div className="py-4 space-y-4">
              <div className="bg-orange-50 text-orange-800 p-4 rounded-xl border border-orange-100 text-sm leading-relaxed">
                Sản phẩm <strong>{selectedProductForPrice.name}</strong> hiện có sẵn tại các đại lý khu vực <strong>Đông Nam Bộ</strong>. Bạn có muốn chúng tôi gửi báo giá nhanh qua Zalo không?
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Số điện thoại Zalo của bạn</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="09xx xxx xxx" 
                    className="pl-9 bg-slate-50 border-slate-200"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    type="tel"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-start gap-2">
            <Button 
              className="w-full bg-[#FF6B00] hover:bg-[#E65A00] text-white" 
              onClick={handlePriceInquirySubmit}
            >
              Gửi yêu cầu ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retention Feature: Most Viewed Floating Block */}
      <div className="fixed bottom-6 right-6 z-40 animate-fade-in-up">
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200/60 max-w-[280px] hover:-translate-y-1 transition-transform cursor-pointer group">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Xu hướng tại khu vực</div>
              <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                Béc tưới Rivulis S2000 PC đang được tìm kiếm nhiều nhất
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary">
                Xem chi tiết <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
          {/* Close button - visually appealing but non-functional for demo or simple state */}
          <button className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 shadow-sm">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
