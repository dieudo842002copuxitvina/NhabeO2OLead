"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FERTILIZER_CATEGORIES, type Category } from '@/types/taxonomy';

interface CategoryMenuProps {
  categories?: Category[];
  className?: string;
}

interface MenuItemProps {
  category: Category;
  depth?: number;
  pathname: string;
}

function categoryHref(category: Category) {
  return `/danh-muc/${category.slug}`;
}

function hasActiveCategory(category: Category, pathname: string): boolean {
  if (pathname === categoryHref(category)) {
    return true;
  }

  return category.children?.some((child) => hasActiveCategory(child, pathname)) ?? false;
}

function MenuItem({ category, depth = 0, pathname }: MenuItemProps) {
  const hasChildren = Boolean(category.children?.length);
  const isActive = pathname === categoryHref(category);
  const hasActiveChild = hasChildren && hasActiveCategory(category, pathname);
  const [isOpen, setIsOpen] = useState(hasActiveChild);
  const leftPadding = 12 + depth * 16;

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={categoryHref(category)}
          className={cn(
            'relative flex min-h-10 items-center rounded-md border-l-4 py-2 pr-3 text-sm text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700',
            isActive
              ? 'border-green-600 bg-green-50 font-semibold text-green-800'
              : 'border-transparent font-medium',
          )}
          style={{ paddingLeft: leftPadding }}
        >
          {category.name}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          'flex min-h-10 w-full items-center justify-between rounded-md border-l-4 py-2 pr-3 text-left text-sm transition-colors hover:bg-green-50 hover:text-green-700',
          isActive
            ? 'border-green-600 bg-green-50 font-semibold text-green-800'
            : hasActiveChild
              ? 'border-transparent font-semibold text-green-700'
              : 'border-transparent font-medium text-gray-800',
        )}
        style={{ paddingLeft: leftPadding }}
        aria-expanded={isOpen}
      >
        <span>{category.name}</span>
        <ChevronDown
          className={cn(
            'ml-2 h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180 text-green-700',
          )}
        />
      </button>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <ul className="mt-1 space-y-1">
            {category.children?.map((child) => (
              <MenuItem
                key={child.id}
                category={child}
                depth={depth + 1}
                pathname={pathname}
              />
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

export default function CategoryMenu({
  categories = FERTILIZER_CATEGORIES,
  className,
}: CategoryMenuProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'w-full rounded-lg border border-gray-200 bg-white p-3 shadow-sm',
        className,
      )}
    >
      <div className="border-b border-gray-100 px-2 pb-3">
        <h2 className="text-base font-bold text-gray-900">Danh mục phân bón</h2>
      </div>
      <nav className="pt-3" aria-label="Danh mục phân bón">
        <ul className="space-y-1">
          {categories.map((category) => (
            <MenuItem key={category.id} category={category} pathname={pathname} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
