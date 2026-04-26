"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const fallback = images.length > 0 ? images : ["https://placehold.co/1200x900?text=Product"];
  const [activeImage, setActiveImage] = useState(fallback[0]);

  return (
    <section className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={name}
            className="h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {fallback.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-lg border bg-gray-50",
              activeImage === image ? "border-[#4CAF50]" : "border-gray-200 hover:border-gray-300",
            )}
            aria-label={`Xem anh thu ${index + 1}`}
          >
            <img src={image} alt={`${name} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
