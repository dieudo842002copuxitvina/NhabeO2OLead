"use client";

import Link from "next/link";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dealer } from "@/data/dealersData";

interface DealerContactCardProps {
  dealer: Dealer;
}

export default function DealerContactCard({ dealer }: DealerContactCardProps) {
  const mapsUrl = dealer.lat && dealer.lng 
    ? `https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(dealer.address || dealer.province)}`;

  return (
    <div className="sticky top-32">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Title */}
        <h2 className="text-lg font-bold text-slate-900 mb-6 font-['Be_Vietnam_Pro']">
          Thông tin liên hệ
        </h2>

        {/* Contact Info */}
        <div className="space-y-4 mb-6">
          {/* Address */}
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-[#4CAF50] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-slate-900 font-medium font-['Be_Vietnam_Pro'] leading-snug">
                {dealer.district}
              </p>
              <p className="text-xs text-slate-600 font-['Be_Vietnam_Pro']">
                {dealer.province}
              </p>
              {dealer.address && (
                <p className="text-xs text-slate-500 font-['Be_Vietnam_Pro']">
                  {dealer.address}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          {dealer.phone && (
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-[#4CAF50] flex-shrink-0" />
              <a 
                href={`tel:${dealer.phone}`}
                className="text-sm text-[#4CAF50] hover:text-[#45a049] font-medium font-['Be_Vietnam_Pro'] transition-colors"
              >
                {dealer.phone}
              </a>
            </div>
          )}

          {/* Hours */}
          {dealer.hours && (
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-[#4CAF50] flex-shrink-0" />
              <p className="text-sm text-slate-600 font-['Be_Vietnam_Pro']">
                {dealer.hours}
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 my-6" />

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold py-3 rounded-lg transition-all duration-300 font-['Be_Vietnam_Pro'] text-sm uppercase tracking-wide"
          >
            <Link href="/lien-he">
              Nhận tư vấn ngay
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:border-[#4CAF50] hover:text-[#4CAF50] font-bold rounded-lg transition-all duration-300 font-['Be_Vietnam_Pro'] text-sm uppercase tracking-wide"
          >
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <ArrowRight className="w-4 h-4 mr-2" />
              Chỉ đường
            </a>
          </Button>
        </div>

        {/* Info Note */}
        <p className="text-xs text-slate-500 text-center mt-4 font-['Be_Vietnam_Pro']">
          Hỗ trợ khách hàng 24/7
        </p>
      </div>
    </div>
  );
}
