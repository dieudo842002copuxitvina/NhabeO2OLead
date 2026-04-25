import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check, X, Star, Droplets, Gauge, CircleDashed, Phone, MapPin, Loader2 } from 'lucide-react';
import { getRecommendedCombos } from '@/utils/comboEngine';
import { IrrigationCombo } from '@/data/comboData';

const mockProduct = {
  name: 'Béc tưới bù áp Rivulis S2000',
  price: '15.000đ',
  tags: ['Sầu riêng', 'Áp lực thấp'],
  media: [
    { type: 'image', url: 'https://images.unsplash.com/photo-1592861343717-3bf79ab44621?w=800&q=80' },
    { type: 'image', url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80' }
  ],
  specs: { pressure: '1.0 - 3.0 bar', flow: '35 - 95 L/H', radius: '3.5 - 4.5 m' },
  fit: ['Cây ăn trái lâu năm', 'Địa hình dốc', 'Nguồn nước yếu'],
  notFit: ['Rau màu ngắn ngày', 'Phun sương nhà màng'],
  reviews: [
    { text: "Béc quay êm, hạt nước đều. Lắp cho vườn sầu riêng Đắk Lắk rất hợp.", author: "Chú Tư - Đắk Lắk" },
    { text: "Chống nghẹt tốt, dễ vệ sinh. Tưới phủ gốc sầu riêng tuyệt vời.", author: "Anh Bình - Đồng Nai" }
  ],
  bom: {
    equipment: [
      { name: 'Béc S2000', qty: 100, price: '1.500.000đ' },
      { name: 'Ống LDPE 20mm', qty: '500m', price: '3.000.000đ' }
    ],
    fert: [
      { name: 'NPK 20-20-20', qty: '10kg', price: '850.000đ' }
    ]
  },
  combos: [
    {
      name: "Bộ tưới phủ gốc tiêu chuẩn",
      description: "Giải pháp tưới sầu riêng tiết kiệm nước, chống tắc nghẽn.",
      tags: ["Cho sầu riêng", "Rẫy nhỏ", "Tiết kiệm"],
      items: [
        { name: "Béc S2000 bù áp", qty: "100 cái" },
        { name: "Khởi thủy 6mm", qty: "100 cái" },
        { name: "Ống 20mm LDPE", qty: "1 cuộn" }
      ],
      why: ["Đủ áp lực cho vườn đồi dốc", "Chống nghẹt béc", "Dễ lắp ráp"],
      recommended: true,
      price: "1.250.000đ"
    },
    {
      name: "Bộ tưới + Châm phân",
      description: "Kết hợp bón phân qua đường ống tự động.",
      tags: ["Trang trại lớn", "Tự động hóa"],
      items: [
        { name: "Béc S2000 bù áp", qty: "100 cái" },
        { name: "Châm phân Venturi", qty: "1 bộ" },
        { name: "Bộ lọc đĩa 60mm", qty: "1 cái" }
      ],
      why: ["Bón phân rảnh tay", "Hòa tan 100% dinh dưỡng", "Tiết kiệm 50% nhân công"],
      recommended: false,
      price: "2.100.000đ"
    }
  ]
};

function ProductMedia() {
  const [idx, setIdx] = useState(0);
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 group">
      <img src={mockProduct.media[idx].url} alt="Product" className="w-full h-full object-cover" />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {mockProduct.media.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}

function ProductHeader() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {mockProduct.tags.map(tag => (
          <Badge key={tag} className="bg-[#2D5A27]/10 text-[#2D5A27] hover:bg-[#2D5A27]/20 border-0">{tag}</Badge>
        ))}
      </div>
      <h1 className="text-2xl font-bold text-slate-800 font-display leading-tight">{mockProduct.name}</h1>
      <p className="text-xl font-bold text-[#F57C00]">{mockProduct.price} <span className="text-sm font-normal text-slate-500">/ bộ</span></p>
    </div>
  );
}

function QuickSpecs() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="shadow-sm border-slate-100"><CardContent className="p-4 text-center space-y-1"><Gauge className="w-5 h-5 mx-auto text-slate-400"/><p className="text-[10px] text-slate-500 uppercase font-bold">Áp lực</p><p className="font-semibold text-sm">{mockProduct.specs.pressure}</p></CardContent></Card>
      <Card className="shadow-sm border-slate-100"><CardContent className="p-4 text-center space-y-1"><Droplets className="w-5 h-5 mx-auto text-blue-400"/><p className="text-[10px] text-slate-500 uppercase font-bold">Lưu lượng</p><p className="font-semibold text-sm">{mockProduct.specs.flow}</p></CardContent></Card>
      <Card className="shadow-sm border-slate-100"><CardContent className="p-4 text-center space-y-1"><CircleDashed className="w-5 h-5 mx-auto text-[#2D5A27]"/><p className="text-[10px] text-slate-500 uppercase font-bold">Bán kính</p><p className="font-semibold text-sm">{mockProduct.specs.radius}</p></CardContent></Card>
    </div>
  );
}

function FitSection() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-green-50/50 border-green-100"><CardContent className="p-5">
        <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2"><Check className="w-5 h-5 text-green-600"/> Phù hợp nhất cho</h3>
        <ul className="space-y-2">{mockProduct.fit.map(i => <li key={i} className="text-sm text-green-700 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"/>{i}</li>)}</ul>
      </CardContent></Card>
      <Card className="bg-slate-50 border-slate-200"><CardContent className="p-5">
        <h3 className="font-bold text-slate-600 mb-3 flex items-center gap-2"><X className="w-5 h-5 text-slate-400"/> Không phù hợp</h3>
        <ul className="space-y-2">{mockProduct.notFit.map(i => <li key={i} className="text-sm text-slate-500 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"/>{i}</li>)}</ul>
      </CardContent></Card>
    </div>
  );
}

function SocialProof() {
  const [idx, setIdx] = useState(0);
  return (
    <div className="space-y-3">
      <h3 className="font-bold text-slate-800 text-lg">Đánh giá thực tế</h3>
      <Card className="overflow-hidden shadow-md border-slate-100">
        <div className="h-32 bg-[url('https://images.unsplash.com/photo-1558448938-1645e5eb8035?w=600&q=80')] bg-cover bg-center" />
        <CardContent className="p-5">
          <div className="flex gap-1 mb-2"><Star className="w-4 h-4 fill-amber-400 text-amber-400"/><Star className="w-4 h-4 fill-amber-400 text-amber-400"/><Star className="w-4 h-4 fill-amber-400 text-amber-400"/><Star className="w-4 h-4 fill-amber-400 text-amber-400"/><Star className="w-4 h-4 fill-amber-400 text-amber-400"/></div>
          <p className="text-slate-700 text-sm italic mb-2">"{mockProduct.reviews[idx].text}"</p>
          <p className="text-xs font-semibold text-slate-500">— {mockProduct.reviews[idx].author}</p>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={() => setIdx(Math.max(0, idx - 1))}><ChevronLeft className="w-4 h-4"/></Button>
        <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={() => setIdx(Math.min(mockProduct.reviews.length - 1, idx + 1))}><ChevronRight className="w-4 h-4"/></Button>
      </div>
    </div>
  );
}

function Simulation() {
  // Generate random 10x10 grid map
  const map = Array.from({ length: 100 }, () => {
    const rand = Math.random();
    return rand > 0.3 ? 'bg-green-400' : rand > 0.1 ? 'bg-yellow-400' : 'bg-red-400';
  });
  return (
    <Card className="overflow-hidden border-slate-100 shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-bold text-slate-800 mb-4 text-center">Mô phỏng áp lực tưới</h3>
        <div className="grid grid-cols-10 gap-0.5 aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border border-slate-100 p-1 bg-slate-50">
          {map.map((color, i) => <div key={i} className={`w-full h-full ${color} opacity-80 rounded-sm`} />)}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-sm"/> Tốt</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rounded-sm"/> Trung bình</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-sm"/> Yếu</span>
        </div>
      </CardContent>
    </Card>
  );
}

function BOMSection() {
  const [tab, setTab] = useState<'eq'|'fert'>('eq');
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 text-lg">Dự toán tham khảo (1 Ha)</h3>
      <div className="flex gap-2">
        <Button variant={tab === 'eq' ? 'default' : 'outline'} onClick={() => setTab('eq')} className={`rounded-full h-9 ${tab === 'eq' ? 'bg-[#2D5A27]' : 'text-slate-600'}`}>Thiết bị</Button>
        <Button variant={tab === 'fert' ? 'default' : 'outline'} onClick={() => setTab('fert')} className={`rounded-full h-9 ${tab === 'fert' ? 'bg-orange-500 hover:bg-orange-600' : 'text-slate-600'}`}>Phân bón</Button>
      </div>
      <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-100/50">
            <tr><th className="p-3 text-left font-semibold text-slate-600">Tên</th><th className="p-3 text-center font-semibold text-slate-600">SL</th><th className="p-3 text-right font-semibold text-slate-600">T.Tiền</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(tab === 'eq' ? mockProduct.bom.equipment : mockProduct.bom.fert).map((item, i) => (
              <tr key={i}><td className="p-3 font-medium text-slate-800">{item.name}</td><td className="p-3 text-center text-slate-500">{item.qty}</td><td className="p-3 text-right font-semibold text-[#2D5A27]">{item.price}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComboCard({ combo, onSelect }: { combo: IrrigationCombo, onSelect: (c: IrrigationCombo) => void }) {
  const handleSend = () => alert(`Đã gửi yêu cầu tư vấn ${combo.name} cho đại lý`);

  return (
    <Card className={`overflow-hidden transition-all ${combo.isFeatured ? 'border-2 border-[#F57C00] shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-slate-800 text-lg">{combo.name}</h4>
          {combo.isFeatured && <Badge className="bg-[#F57C00] text-white hover:bg-[#F57C00] border-0 text-xs shadow-sm">Phổ biến nhất</Badge>}
        </div>
        <p className="text-sm text-slate-500 mb-3">{combo.description}</p>
        
        {/* Tags */}
        {combo.tags && (
          <div className="flex flex-wrap gap-2 mb-3">
            {combo.tags.map((tag: string, i: number) => (
              <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${i === 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>{tag}</span>
            ))}
          </div>
        )}

        {/* Included Items */}
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thành phần bộ Combo</p>
          <ul className="space-y-2">
            {combo.items.map((item: any, i: number) => (
              <li key={i} className="text-sm text-slate-700 flex justify-between items-center border-b border-slate-50 pb-1 last:border-0">
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2D5A27]/50" /> {item.name}</span>
                <span className="font-semibold text-slate-600">{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why this combo box */}
        <div className="bg-[#2D5A27]/5 p-3 rounded-xl border border-[#2D5A27]/10 mb-5">
          <p className="text-xs font-bold text-[#2D5A27] mb-2 flex items-center gap-1"><Check className="w-4 h-4"/> Tại sao chọn bộ này?</p>
          <ul className="space-y-1">
            {combo.benefits.map((reason: string, i: number) => (
              <li key={i} className="text-xs text-[#2D5A27]/80 flex items-start gap-1">
                <span className="mt-1">-</span> {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mb-4">
          <span className="text-slate-500 text-sm">Giá tham khảo</span>
          <span className="text-lg font-bold text-[#F57C00]">{combo.priceEstimate}</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2">
          <Button onClick={() => onSelect(combo)} className="w-full bg-[#2D5A27] hover:bg-[#1f421b] text-white rounded-xl h-12 font-bold shadow-md">
            Chọn combo này
          </Button>
          <Button onClick={handleSend} variant="outline" className="w-full border-[#2D5A27] text-[#2D5A27] hover:bg-[#2D5A27]/5 rounded-xl h-12 font-semibold">
            Gửi cho đại lý
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ComboSection() {
  const [combos, setCombos] = useState<IrrigationCombo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Infer cropType from tags (Mock logic: if tags contain "Sầu riêng" -> 'sau-rieng')
    const hasSauRieng = mockProduct.tags.some(t => t.toLowerCase().includes('sầu riêng'));
    const inferredCrop = hasSauRieng ? 'sau-rieng' : 'all';

    // Mock async loading
    setTimeout(() => {
      // We assume standard area = 1ha, capacity = 20
      const fetchedCombos = getRecommendedCombos({ cropType: inferredCrop, area: 1, waterCapacity: 20 });
      setCombos(fetchedCombos);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSelectCombo = (combo: IrrigationCombo) => {
    // Prepare payload
    const payload = {
      comboId: combo.id,
      name: combo.name,
      items: combo.items,
      estimatedCost: combo.priceEstimate,
      timestamp: new Date().toISOString()
    };
    
    console.log("SENDING PAYLOAD TO API:", payload);
    alert(`Đã chuẩn bị dữ liệu Combo "${combo.name}".\nSẵn sàng gửi về API đại lý.\n(Kiểm tra console để xem cấu trúc payload)`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">Gợi ý mua kèm (Combo hoàn chỉnh)</h3>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-[#F57C00]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 text-lg">Gợi ý mua kèm (Combo hoàn chỉnh)</h3>
      <div className="space-y-3">
        {combos.map((combo) => (
          <ComboCard key={combo.id} combo={combo} onSelect={handleSelectCombo} />
        ))}
      </div>
    </div>
  );
}

export default function ProductDetailV2Page() {
  return (
    <div className="min-h-screen bg-white relative pb-28">
      <div className="max-w-md mx-auto w-full px-4 py-6">
        <div className="space-y-8">
          <ProductMedia />
          <ProductHeader />
          <QuickSpecs />
          <FitSection />
          <SocialProof />
          <Simulation />
          <ComboSection />
          <BOMSection />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 p-4 pb-safe">
        <div className="max-w-md mx-auto flex gap-3">
          <Button variant="outline" className="flex-1 border-[#2D5A27] text-[#2D5A27] rounded-xl h-14 font-bold text-base hover:bg-[#2D5A27]/5">
            <MapPin className="w-5 h-5 mr-2" /> Tìm đại lý
          </Button>
          <Button className="flex-[1.5] bg-[#F57C00] hover:bg-[#E65100] text-white rounded-xl h-14 font-bold text-base shadow-lg shadow-orange-500/25 border-0">
            <Phone className="w-5 h-5 mr-2" /> Gọi Zalo Đại Lý
          </Button>
        </div>
      </div>
    </div>
  );
}
