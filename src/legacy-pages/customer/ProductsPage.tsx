import { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { fetchProducts, type PimProduct } from '@/lib/pim';
import type { Product } from '@/data/types';

const ALL = 'Tất cả';

/** Adapter: PimProduct (DB) → Product (legacy ProductCard prop shape). */
function toCardProduct(p: PimProduct): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.id, // fallback
    category_id: p.category,
    brand_id: '',
    description: p.description ?? '',
    price: Number(p.price) || 0,
    unit: p.unit,
    thumbnail: p.image ?? '',
    gallery: [],
    specs: {},
    tags: p.tags ?? [],
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<PimProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((all) => {
        if (cancelled) return;
        // Public storefront only sees active products
        setProducts(all.filter((p) => p.active));
      })
      .catch(() => { /* swallow — empty list is fine */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Dynamic categories from DB (distinct, sorted)
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.category) set.add(p.category); });
    return [ALL, ...Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'))];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch = !q || p.name.toLowerCase().includes(q);
      const matchCat = category === ALL || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  return (
    <div className="container py-6 md:py-8">
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Sản phẩm</h1>
      <p className="text-muted-foreground text-sm md:text-base mb-5">Thiết bị nông nghiệp công nghệ cao chính hãng</p>

      {/* Search bar + mobile filter trigger */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm sản phẩm..." className="pl-9 h-11" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden h-11 gap-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              {category !== ALL && (
                <Badge variant="secondary" className="ml-0.5 h-5 px-1.5 text-[10px]">1</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Bộ lọc danh mục</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-2 py-4 max-h-[60vh] overflow-y-auto">
              {categories.map((cat) => (
                <SheetClose asChild key={cat}>
                  <button
                    onClick={() => setCategory(cat)}
                    className={`text-sm px-3 py-3 rounded-lg font-medium transition-colors text-left ${
                      category === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat}
                  </button>
                </SheetClose>
              ))}
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" onClick={() => setCategory(ALL)} className="w-full">
                  <X className="w-4 h-4 mr-1" /> Xóa bộ lọc
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop pill filters — dynamic from DB */}
      <div className="hidden md:flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active filter chip on mobile */}
      {category !== ALL && (
        <div className="md:hidden mb-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Đang lọc:</span>
          <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setCategory(ALL)}>
            {category} <X className="w-3 h-3" />
          </Badge>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {filtered.map((p) => <ProductCard key={p.id} product={toCardProduct(p)} />)}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          )}
        </>
      )}
    </div>
  );
}
