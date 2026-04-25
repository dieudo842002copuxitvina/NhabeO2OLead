'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  Droplets,
  Filter,
  MapPin,
  Package,
  Search,
  SlidersHorizontal,
  Sprout,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { PRODUCTS_DATA, type ProductData, type ProductGroup } from '@/data/productsData';
import { cn } from '@/lib/utils';

type CategoryNode = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

const PAGE_SIZE = 12;
const USER_PROVINCE = 'Đồng Nai';

const GROUP_META: Record<ProductGroup, { label: string; icon: typeof Package; tone: string }> = {
  HARDWARE: {
    label: 'Thiết bị',
    icon: Package,
    tone: 'text-blue-700 bg-blue-50 border-blue-100',
  },
  FERTILIZER: {
    label: 'Phân bón',
    icon: Sprout,
    tone: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  },
};

const NPK_OPTIONS = ['19-19-19', '13-5-35', '12-61-0', '30-10-10'];
const FLOW_OPTIONS = ['2 L/h', '35-95 L/h', '120-250 L/h', '10-30 m3/h', '8-14 m3/h'];
const PIPE_SIZE_OPTIONS = ['16', '63', '1', '2'];

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSpecValue(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function categoryName(product: ProductData) {
  return product.specs.category_tier?.tier3_name ?? product.category_id;
}

function categoryTier(product: ProductData) {
  return product.specs.category_tier as
    | { tier2_id: string; tier2_name: string; tier3_id: string; tier3_name: string }
    | undefined;
}

function buildCategoryTree(type: ProductGroup): CategoryNode[] {
  const tier2Map = new Map<string, CategoryNode>();

  PRODUCTS_DATA.filter((product) => product.type === type).forEach((product) => {
    const tier = categoryTier(product);
    if (!tier) return;

    if (!tier2Map.has(tier.tier2_id)) {
      tier2Map.set(tier.tier2_id, {
        id: tier.tier2_id,
        name: tier.tier2_name,
        children: [],
      });
    }

    const parent = tier2Map.get(tier.tier2_id);
    if (parent && !parent.children.some((child) => child.id === tier.tier3_id)) {
      parent.children.push({
        id: tier.tier3_id,
        name: tier.tier3_name,
      });
    }
  });

  return [...tier2Map.values()];
}

function distanceToDealer(product: ProductData, province: string) {
  if (!product.geo_availability.includes(province)) return null;
  const seed = product.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return 8 + (seed % 38);
}

function getBadge(product: ProductData) {
  if (product.type === 'FERTILIZER') {
    const npk = formatSpecValue(product.specs.npk);
    if (formatSpecValue(product.specs.solubility).includes('100')) return 'Phân hòa tan';
    if (npk) return `NPK ${npk}`;
    return 'Dinh dưỡng cây';
  }

  if (product.category_id.includes('dau-tuoi') || product.category_id.includes('bec')) return 'Tưới chính xác';
  if (product.category_id.includes('may-bom')) return 'Máy bơm';
  if (product.category_id.includes('bo-dieu-khien')) return 'Tự động hóa';
  return 'Thiết bị vườn';
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function StoreProductCard({ product }: { product: ProductData }) {
  const meta = GROUP_META[product.type];
  const Icon = meta.icon;
  const distance = distanceToDealer(product, USER_PROVINCE);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md">
      <Link href={`/san-pham/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.thumbnail}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge className={cn('border px-2.5 py-1 text-[11px] font-bold shadow-sm', meta.tone)}>
            <Icon className="mr-1 h-3 w-3" />
            {getBadge(product)}
          </Badge>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="truncate font-medium">{product.brand}</span>
          <span className="shrink-0">{product.sku}</span>
        </div>

        <Link href={`/san-pham/${product.slug}`} className="min-h-[3rem]">
          <h2 className="line-clamp-2 text-sm font-bold leading-6 text-slate-900 transition-colors group-hover:text-green-700">
            {product.name}
          </h2>
        </Link>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
            {categoryName(product)}
          </span>
          {product.type === 'FERTILIZER' && product.specs.npk ? (
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
              NPK {formatSpecValue(product.specs.npk)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <p className="text-lg font-black text-green-700">{formatVND(product.price)}</p>
          <p className="mt-0.5 text-xs text-slate-500">/{product.unit}</p>

          <div className="mt-3 flex min-h-9 items-center rounded-md border border-slate-100 bg-slate-50 px-3 text-xs font-medium text-slate-600">
            <MapPin className="mr-2 h-4 w-4 text-orange-500" />
            {distance ? `${distance} km tới đại lý gần nhất` : `Có hàng tại ${product.geo_availability[0]}`}
          </div>
        </div>
      </div>
    </article>
  );
}

function FilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <label htmlFor={id} className="flex min-h-9 cursor-pointer items-center gap-3 rounded-md px-2 text-sm text-slate-700 hover:bg-slate-50">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <span className="leading-5">{label}</span>
    </label>
  );
}

export default function StoreClient() {
  const [selectedType, setSelectedType] = useState<ProductGroup>('HARDWARE');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedNpk, setSelectedNpk] = useState<string[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string[]>([]);
  const [selectedPipeSize, setSelectedPipeSize] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const categoryTree = useMemo(() => buildCategoryTree(selectedType), [selectedType]);
  const brands = useMemo(
    () => [...new Set(PRODUCTS_DATA.filter((product) => product.type === selectedType).map((product) => product.brand))].sort(),
    [selectedType],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return PRODUCTS_DATA.filter((product) => {
      if (product.type !== selectedType) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category_id)) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

      if (selectedType === 'FERTILIZER') {
        const npk = formatSpecValue(product.specs.npk);
        if (selectedNpk.length > 0 && !selectedNpk.includes(npk)) return false;
      }

      if (selectedType === 'HARDWARE') {
        const flow = formatSpecValue(product.specs.flow_lph || product.specs.flow_m3h);
        const pipeSize = formatSpecValue(product.specs.diameter_mm || product.specs.size_inch);
        if (selectedFlow.length > 0 && !selectedFlow.includes(flow)) return false;
        if (selectedPipeSize.length > 0 && !selectedPipeSize.includes(pipeSize)) return false;
      }

      if (!normalizedQuery) return true;
      return `${product.name} ${product.brand} ${categoryName(product)} ${product.description}`.toLowerCase().includes(normalizedQuery);
    });
  }, [query, selectedBrands, selectedCategories, selectedFlow, selectedNpk, selectedPipeSize, selectedType]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function switchType(type: ProductGroup) {
    setSelectedType(type);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedNpk([]);
    setSelectedFlow([]);
    setSelectedPipeSize([]);
    setPage(1);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedNpk([]);
    setSelectedFlow([]);
    setSelectedPipeSize([]);
    setQuery('');
    setPage(1);
  }

  function goToPage(nextPage: number) {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
    requestAnimationFrame(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <section className="border-b border-slate-200 bg-white">
        <div className="container py-6">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Link href="/" className="hover:text-green-700">
              Trang chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-900">Cửa hàng tổng hợp</span>
          </nav>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black leading-tight text-slate-950 md:text-4xl">Cửa hàng tổng hợp</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Lọc nhanh thiết bị tưới, máy nông nghiệp và phân bón theo danh mục, thông số vận hành và khu vực có hàng.
              </p>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Tìm theo tên, thương hiệu, thông số..."
                className="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container grid grid-cols-1 gap-6 py-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-24 rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Bộ lọc</p>
                  <h2 className="mt-1 text-base font-bold text-slate-950">Danh mục sản phẩm</h2>
                </div>
                <Filter className="h-5 w-5 text-green-700" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(['HARDWARE', 'FERTILIZER'] as ProductGroup[]).map((type) => {
                  const Icon = GROUP_META[type].icon;
                  const active = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => switchType(type)}
                      className={cn(
                        'flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition',
                        active ? 'border-green-600 bg-green-50 text-green-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {GROUP_META[type].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[calc(100vh-190px)] overflow-y-auto p-4">
              <Accordion type="multiple" defaultValue={['categories', 'dynamic']} className="space-y-2">
                <AccordionItem value="categories" className="rounded-md border border-slate-200 px-3">
                  <AccordionTrigger className="py-3 text-sm font-bold hover:no-underline">Danh mục đa tầng</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {categoryTree.map((node) => (
                        <div key={node.id}>
                          <p className="mb-1 px-2 text-xs font-bold uppercase tracking-wide text-slate-400">{node.name}</p>
                          <div className="space-y-1">
                            {node.children.map((child) => (
                              <FilterCheckbox
                                key={child.id}
                                id={`category-${child.id}`}
                                label={child.name}
                                checked={selectedCategories.includes(child.id)}
                                onCheckedChange={() => {
                                  setSelectedCategories((current) => toggleValue(current, child.id));
                                  setPage(1);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="dynamic" className="rounded-md border border-slate-200 px-3">
                  <AccordionTrigger className="py-3 text-sm font-bold hover:no-underline">
                    <span className="inline-flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-green-700" />
                      {selectedType === 'FERTILIZER' ? 'Thương hiệu & NPK' : 'Lưu lượng & kích thước ống'}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-400">Thương hiệu</p>
                        <div className="space-y-1">
                          {brands.slice(0, 8).map((brand) => (
                            <FilterCheckbox
                              key={brand}
                              id={`brand-${brand}`}
                              label={brand}
                              checked={selectedBrands.includes(brand)}
                              onCheckedChange={() => {
                                setSelectedBrands((current) => toggleValue(current, brand));
                                setPage(1);
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {selectedType === 'FERTILIZER' ? (
                        <div>
                          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-400">Chỉ số NPK</p>
                          <div className="grid grid-cols-2 gap-1">
                            {NPK_OPTIONS.map((npk) => (
                              <FilterCheckbox
                                key={npk}
                                id={`npk-${npk}`}
                                label={npk}
                                checked={selectedNpk.includes(npk)}
                                onCheckedChange={() => {
                                  setSelectedNpk((current) => toggleValue(current, npk));
                                  setPage(1);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-400">Lưu lượng</p>
                            <div className="space-y-1">
                              {FLOW_OPTIONS.map((flow) => (
                                <FilterCheckbox
                                  key={flow}
                                  id={`flow-${flow}`}
                                  label={flow}
                                  checked={selectedFlow.includes(flow)}
                                  onCheckedChange={() => {
                                    setSelectedFlow((current) => toggleValue(current, flow));
                                    setPage(1);
                                  }}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-400">Kích thước ống</p>
                            <div className="grid grid-cols-2 gap-1">
                              {PIPE_SIZE_OPTIONS.map((size) => (
                                <FilterCheckbox
                                  key={size}
                                  id={`pipe-${size}`}
                                  label={Number(size) <= 4 ? `${size}"` : `${size} mm`}
                                  checked={selectedPipeSize.includes(size)}
                                  onCheckedChange={() => {
                                    setSelectedPipeSize((current) => toggleValue(current, size));
                                    setPage(1);
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button variant="outline" className="mt-4 h-10 w-full rounded-md text-sm font-bold" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </aside>

        <section id="products" className="scroll-mt-24 lg:col-span-9">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {filteredProducts.length} sản phẩm {selectedType === 'FERTILIZER' ? 'phân bón' : 'thiết bị'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Vị trí tham chiếu: <span className="font-semibold text-slate-700">{USER_PROVINCE}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Droplets className="h-4 w-4 text-green-700" />
              Sắp xếp theo mức phù hợp và có hàng gần bạn
            </div>
          </div>

          {pagedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pagedProducts.map((product) => (
                <StoreProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-lg font-bold text-slate-900">Không có sản phẩm phù hợp</p>
              <p className="mt-2 text-sm text-slate-500">Thử bỏ bớt bộ lọc hoặc đổi nhóm danh mục.</p>
              <Button className="mt-5" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          )}

          {totalPages > 1 ? (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    href="#products"
                    size="default"
                    onClick={(event) => {
                      event.preventDefault();
                      goToPage(currentPage - 1);
                    }}
                    className={cn('gap-1 pl-2.5', currentPage === 1 && 'pointer-events-none opacity-40')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Trước</span>
                  </PaginationLink>
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#products"
                      isActive={currentPage === pageNumber}
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationLink
                    href="#products"
                    size="default"
                    onClick={(event) => {
                      event.preventDefault();
                      goToPage(currentPage + 1);
                    }}
                    className={cn('gap-1 pr-2.5', currentPage === totalPages && 'pointer-events-none opacity-40')}
                  >
                    <span>Tiếp</span>
                    <ChevronRight className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </section>
      </div>
    </main>
  );
}
