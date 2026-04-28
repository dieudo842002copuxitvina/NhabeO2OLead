import React from 'react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────
interface SpecItem {
  label: string;
  value: string;
  unit?: string;
}

interface TechArticleCardProps {
  title: string;
  description: string;
  imageUrl: string;
  specs: SpecItem[];
  category?: string;
  date?: string;
  href?: string;
  className?: string;
}

/**
 * Horizontal tech article card with:
 * - 40% image (left) / 60% content (right)
 * - Spec-Grid in the middle with dividers
 * - Inter font, tight leading, Slate-900 title, Green-700 accent
 * - Hover shadow-md + image scale effect
 */
export default function TechArticleCard({
  title,
  description,
  imageUrl,
  specs,
  category,
  date,
  href,
  className,
}: TechArticleCardProps) {
  const Wrapper = href ? 'a' : 'div';
  const displaySpecs = specs.slice(0, 4); // Max 4 specs

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={cn(
        'group flex overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-md',
        className
      )}
    >
      {/* Image — 40% */}
      <div className="relative w-[40%] flex-shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {category && (
          <span className="absolute left-2 top-2 rounded-md bg-green-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {category}
          </span>
        )}
      </div>

      {/* Content — 60% */}
      <div className="flex w-[60%] flex-col justify-between p-4">
        {/* Title + Description */}
        <div>
          <h3
            className="mb-1 line-clamp-2 font-sans text-sm font-bold leading-tight text-slate-900"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {title}
          </h3>
          <p className="line-clamp-2 text-xs leading-snug text-slate-500">{description}</p>
        </div>

        {/* Spec Grid */}
        {displaySpecs.length > 0 && (
          <div className="my-2 flex items-stretch divide-x divide-slate-200 rounded-lg border border-slate-100 bg-slate-50">
            {displaySpecs.map((spec, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-center px-2 py-1.5">
                <span className="text-[10px] font-medium text-slate-400">{spec.label}</span>
                <span className="text-xs font-bold text-green-700">
                  {spec.value}
                  {spec.unit && <span className="ml-0.5 text-[10px] font-normal text-slate-400">{spec.unit}</span>}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Date footer */}
        {date && (
          <p className="text-[10px] text-slate-400">{date}</p>
        )}
      </div>
    </Wrapper>
  );
}
