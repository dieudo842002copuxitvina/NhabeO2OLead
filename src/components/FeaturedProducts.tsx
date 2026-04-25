"use client";

import { Package } from "lucide-react";

interface FeaturedProductsProps {
  services?: string[];
}

export default function FeaturedProducts({ services = [] }: FeaturedProductsProps) {
  const defaultProducts = [
    { name: 'Béc tưới S2000', icon: '💧' },
    { name: 'Máy bơm Pentax', icon: '🔧' },
    { name: 'Ống LDPE Rivulis', icon: '🔌' },
    { name: 'Van điều chỉnh lưu lượng', icon: '⚙️' },
  ];

  const displayProducts = services && services.length > 0 
    ? services.slice(0, 4).map(service => ({ name: service, icon: '🛠️' }))
    : defaultProducts;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-6 h-6 text-[#4CAF50]" />
            <h2 className="text-2xl font-bold text-slate-900 font-['Be_Vietnam_Pro']">
              Sản phẩm thế mạnh
            </h2>
          </div>
          <p className="text-slate-600 font-['Be_Vietnam_Pro'] text-sm">
            Các thiết bị và dịch vụ tưới tiêu chính tại cửa hàng
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayProducts.map((product, idx) => (
            <div 
              key={idx}
              className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-[#4CAF50]"
            >
              <div className="text-3xl mb-3">{product.icon}</div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 font-['Be_Vietnam_Pro']">
                {product.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
