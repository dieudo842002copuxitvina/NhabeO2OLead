"use client";

import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Dealer } from "@/data/dealersData";

interface DealerCardProps {
  dealer: Dealer;
}

export default function DealerCard({ dealer }: DealerCardProps) {
  // Generate service description from services array
  const serviceDescription = dealer.services?.length 
    ? dealer.services.slice(0, 2).join(", ")
    : "Cung cấp giải pháp tưới tiêu chuyên nghiệp";

  const fullAddress = [dealer.district, dealer.province, dealer.address]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="h-full bg-white border border-slate-200 rounded-lg hover:border-[#4CAF50] transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden group">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-base text-slate-900 leading-tight flex-1 font-['Be_Vietnam_Pro'] line-clamp-2">
            {dealer.name}
          </h3>
          <Badge 
            variant="secondary"
            className="whitespace-nowrap text-xs font-semibold bg-slate-100 text-slate-700 flex-shrink-0"
          >
            {dealer.region}
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {/* Address */}
        <div className="flex gap-3 items-start">
          <MapPin className="w-4 h-4 text-[#4CAF50] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-snug font-['Be_Vietnam_Pro'] line-clamp-2">
            {fullAddress}
          </p>
        </div>

        {/* Phone */}
        {dealer.phone && (
          <div className="flex gap-3 items-center">
            <Phone className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
            <a 
              href={`tel:${dealer.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-slate-700 hover:text-[#4CAF50] font-medium font-['Be_Vietnam_Pro'] transition-colors"
            >
              {dealer.phone}
            </a>
          </div>
        )}

        {/* Hours */}
        {dealer.hours && (
          <div className="flex gap-3 items-center">
            <Clock className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
            <p className="text-sm text-slate-600 font-['Be_Vietnam_Pro']">
              {dealer.hours}
            </p>
          </div>
        )}

        {/* Service Description */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 leading-relaxed font-['Be_Vietnam_Pro'] line-clamp-2">
            {serviceDescription}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 pt-2">
        <Button
          asChild
          variant="outline"
          className="w-full text-xs font-bold uppercase tracking-wide text-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-all duration-300 font-['Be_Vietnam_Pro']"
        >
          <Link href={`/dai-ly/${dealer.slug}`}>
            Xem chi tiết
          </Link>
        </Button>
      </div>
    </div>
  );
}
