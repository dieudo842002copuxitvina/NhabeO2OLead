"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Phone, ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import menuData from '@/data/megaMenuData.json';
import { ALL_BRANDS } from '@/data/brand-slugs';

// Dành cho Mobile Accordion
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductMegaMenuProps {
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export default function ProductMegaMenu({ isMobile = false, onMobileClose }: ProductMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // -----------------------------------------------------
  // 1. MOBILE VIEW (ACCORDION)
  // -----------------------------------------------------
  if (isMobile) {
    return (
      <div className="w-full">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="mega-menu" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 px-4 min-h-[52px] rounded-lg text-base font-medium hover:bg-emerald-50 py-0 hover:no-underline [&[data-state=open]]:bg-emerald-50 [&[data-state=open]]:text-emerald-600 transition-colors">
              <span className="flex items-center gap-3">
                <Package className="w-5 h-5" />
                Danh Mục Sản Phẩm
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="pl-12 pr-4 space-y-4">
                {/* Brands section — from brand-slugs.ts */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Thương Hiệu
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ALL_BRANDS.map((brand) => (
                      <Link
                        key={brand.slug}
                        href={brand.url}
                        onClick={onMobileClose}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 rounded-full transition-colors"
                      >
                        {brand.label} {brand.flag}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Other categories — from JSON */}
                {menuData.categories
                  .filter((cat) => cat.id !== "thuong-hieu")
                  .map((category) => (
                    <div key={category.id} className="space-y-2">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        {category.name}
                      </h4>
                      <ul className="space-y-1">
                        {category.subcategories.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={`/danh-muc/${sub.slug}`}
                              onClick={onMobileClose}
                              className="block py-1.5 text-sm text-slate-600 hover:text-primary transition-colors"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                {/* CTA Mobile */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    href="/lien-he?source=megamenu_mobile_cta"
                    onClick={onMobileClose}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                      <Phone className="w-4 h-4" />
                      Nhận tư vấn thiết kế miễn phí
                    </div>
                    <ArrowRight className="w-4 h-4 text-orange-600" />
                  </Link>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  // -----------------------------------------------------
  // 2. DESKTOP VIEW (MULTI-COLUMN DROPDOWN)
  // -----------------------------------------------------
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button
        className={cn(
          "flex items-center gap-1.5 h-10 px-3 text-sm font-medium rounded-md transition-all duration-200",
          isOpen
            ? "text-emerald-600 bg-emerald-50"
            : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50"
        )}
        onMouseEnter={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Package className="w-4 h-4" />
        Sản phẩm
        <ChevronDown className={cn(
          "w-3 h-3 transition-transform duration-200",
          isOpen ? "rotate-180" : ""
        )} />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 pt-2 z-[70]">
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-[980px] max-w-[95vw] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => setIsOpen(true)}
          >
            {/* Brand Header Strip */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-base">Thương hiệu thiết bị tưới</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Nhà phân phối ủy quyền chính hãng: Rivulis, Ducar, Azud, Bermad...
                </p>
              </div>
              <Link
                href="/thuong-hieu"
                onClick={() => setIsOpen(false)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
              >
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Brand Pills */}
            <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap gap-2">
              {ALL_BRANDS.map((brand) => (
                <Link
                  key={brand.slug}
                  href={brand.url}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 rounded-full transition-colors"
                >
                  {brand.label} {brand.flag}
                </Link>
              ))}
            </div>

            {/* Grid Layout cho Mega Menu */}
            <div className="p-6 grid grid-cols-4 gap-x-6 gap-y-5">
              {menuData.categories
                // Exclude the brands section from grid — rendered as pills above
                .filter((cat) => cat.id !== "thuong-hieu")
                .map((category) => (
                <div key={category.id} className="flex flex-col">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    {category.name}
                  </h3>
                  <ul className={cn("space-y-2", category.isScrollable && "max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2")}>
                    {category.subcategories.map((sub) => {
                      // Brand items use "thuong-hieu/xxx" format → prepend /
                      const href = sub.slug.includes("thuong-hieu")
                        ? `/${sub.slug}`
                        : `/danh-muc/${sub.slug}`;

                      return (
                        <li key={sub.slug}>
                          <Link
                            href={href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "text-sm transition-colors block py-0.5",
                              sub.isHighlighted
                                ? "text-emerald-600 font-semibold hover:text-emerald-700"
                                : "text-slate-600 hover:text-primary"
                            )}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA Banner O2O Lead - Gắn Tracking Param */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6">
              <Link
                href="/lien-he?source=megamenu_desktop_cta"
                className="flex items-center justify-between group/cta"
              >
                <div>
                  <h4 className="font-bold text-orange-600 text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Nhận tư vấn thiết kế hệ thống tưới miễn phí
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Để lại thông tin, đội ngũ kỹ sư Nhà Bè Agri sẽ liên hệ hỗ trợ bạn.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center group-hover/cta:bg-orange-600 transition-colors">
                  <ArrowRight className="w-4 h-4 text-orange-600 group-hover/cta:text-white" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
