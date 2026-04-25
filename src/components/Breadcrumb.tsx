import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm font-['Be_Vietnam_Pro']">
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-[#4CAF50] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Trang chủ</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-slate-400" />
          {item.href ? (
            <Link 
              href={item.href}
              className="text-slate-600 hover:text-[#4CAF50] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
