"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Phone, ArrowRight, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';
import menuData from '@/data/megaMenuData.json';

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
            <AccordionTrigger className="flex items-center gap-3 px-4 min-h-[52px] rounded-lg text-base font-medium hover:bg-muted py-0 hover:no-underline [&[data-state=open]]:bg-primary/10 [&[data-state=open]]:text-primary transition-colors">
              <span className="flex items-center gap-3">
                <Sprout className="w-5 h-5" />
                Danh Mục Sản Phẩm
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="pl-12 pr-4 space-y-4">
                {menuData.categories.map((category) => (
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
      className="relative group" 
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium bg-transparent hover:text-primary transition-colors rounded-md group-hover:bg-muted/50">
        <Sprout className="w-4 h-4" />
        {menuData.title}
        <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 pt-2 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-[850px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Grid Layout cho Mega Menu */}
            <div className="p-6 grid grid-cols-3 gap-x-8 gap-y-6">
              {menuData.categories.map((category) => (
                <div key={category.id} className="flex flex-col">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    {category.name}
                  </h3>
                  <ul className={cn("space-y-2", category.isScrollable && "max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2")}>
                    {category.subcategories.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={`/danh-muc/${sub.slug}`}
                          className="text-sm text-slate-600 hover:text-primary transition-colors block py-0.5"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
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
                    Để lại thông tin, đội ngũ kỹ sư Nhà Bè Agris sẽ liên hệ hỗ trợ bạn.
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
