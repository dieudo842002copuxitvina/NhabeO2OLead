"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DealerCard from "@/components/DealerCard";
import type { Dealer } from "@/data/dealersData";

interface DealerNetworkGridProps {
  dealers: Dealer[];
}

const REGIONS = ['Miền Bắc', 'Miền Trung', 'Tây Nguyên', 'Miền Nam'] as const;

export default function DealerNetworkGrid({ dealers }: DealerNetworkGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<typeof REGIONS[number] | "all">("all");

  // Client-side filtering
  const filteredDealers = useMemo(() => {
    let result = dealers;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (dealer) =>
          dealer.name.toLowerCase().includes(query) ||
          dealer.province.toLowerCase().includes(query) ||
          dealer.district.toLowerCase().includes(query) ||
          dealer.address?.toLowerCase().includes(query) ||
          dealer.phone?.includes(query)
      );
    }

    // Filter by region
    if (selectedRegion !== "all") {
      result = result.filter((dealer) => dealer.region === selectedRegion);
    }

    return result;
  }, [dealers, searchQuery, selectedRegion]);

  return (
    <div className="min-h-screen bg-white">
      {/* Search & Filter Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-2 font-['Be_Vietnam_Pro'] tracking-tight">
              Mạng lưới Đại lý
            </h1>
            <p className="text-slate-600 font-['Be_Vietnam_Pro']">
              Tìm kiếm đại lý ủy quyền Nhà Bè Agri gần bạn
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm tên đại lý, tỉnh, huyện hoặc địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 border-slate-300 rounded-lg focus:border-[#4CAF50] focus:ring-[#4CAF50] font-['Be_Vietnam_Pro']"
            />
          </div>

          {/* Region Filter */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setSelectedRegion("all")}
              variant={selectedRegion === "all" ? "default" : "outline"}
              className={`font-bold font-['Be_Vietnam_Pro'] transition-colors ${
                selectedRegion === "all"
                  ? "bg-[#4CAF50] hover:bg-[#45a049] text-white"
                  : "border-slate-300 text-slate-700 hover:border-[#4CAF50] hover:text-[#4CAF50]"
              }`}
            >
              Tất cả
            </Button>
            {REGIONS.map((region) => (
              <Button
                key={region}
                onClick={() => setSelectedRegion(region)}
                variant={selectedRegion === region ? "default" : "outline"}
                className={`font-bold font-['Be_Vietnam_Pro'] transition-colors ${
                  selectedRegion === region
                    ? "bg-[#4CAF50] hover:bg-[#45a049] text-white"
                    : "border-slate-300 text-slate-700 hover:border-[#4CAF50] hover:text-[#4CAF50]"
                }`}
              >
                {region}
              </Button>
            ))}
          </div>

          {/* Result Count */}
          <p className="text-sm text-slate-600 mt-6 font-['Be_Vietnam_Pro']">
            Tìm thấy <span className="font-bold text-[#4CAF50]">{filteredDealers.length}</span> đại lý
          </p>
        </div>
      </div>

      {/* Dealers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredDealers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-slate-600 font-['Be_Vietnam_Pro']">
              Không tìm thấy đại lý nào
            </p>
            <p className="text-sm text-slate-500 mt-2 font-['Be_Vietnam_Pro']">
              Hãy thử thay đổi điều kiện tìm kiếm của bạn
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDealers.map((dealer) => (
              <DealerCard key={dealer.id} dealer={dealer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
