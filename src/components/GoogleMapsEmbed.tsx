"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface GoogleMapsEmbedProps {
  address: string;
  title: string;
}

export default function GoogleMapsEmbed({ address, title }: GoogleMapsEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Requirement: URL must be https://www.google.com/maps?q={encodeURIComponent(address)}&output=embed
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="w-full rounded-[12px] overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
      {/* 16:9 Aspect Ratio Container */}
      <div className="relative w-full aspect-video bg-white">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-10">
            <Skeleton className="w-full h-full rounded-none" />
          </div>
        )}

        {/* Google Maps Iframe */}
        <iframe
          src={mapsUrl}
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            border: 0,
          }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Bản đồ ${title}`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
