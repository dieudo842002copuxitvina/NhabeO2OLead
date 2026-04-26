import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/products';

type ProductCardProps = {
  product: Product;
};

function formatVnd(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product }: ProductCardProps) {
  const thumbnail = product.images?.[0] ?? 'https://placehold.co/800x600?text=Product';

  return (
    <Link
      href={`/store/${product.slug}`}
      className="group block h-full overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-md"
    >
      <article className="grid h-full min-h-[320px] grid-rows-2 bg-white">
        {/* Vùng ảnh chiếm 50% chiều cao thẻ */}
        <div className="relative h-full w-full overflow-hidden bg-gray-50">
          <Image
            src={thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {product.badges.length > 0 ? (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <span
                  key={`${product.id}-${badge}`}
                  className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-800"
                >
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Vùng thông tin văn bản */}
        <div className="flex flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{product.name}</h3>
          <p className="text-xs text-gray-500">{product.brand}</p>
          <p className="mt-auto text-base font-bold text-[#4CAF50]">{formatVnd(product.price)}</p>
        </div>
      </article>
    </Link>
  );
}
