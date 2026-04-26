import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ProductCategory } from "@/data/products";

type Props = {
  params: {
    slug: string;
  };
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveFiltersFromSlug(slug: string): { category: ProductCategory; subCategory?: string } {
  const normalized = normalizeText(slug);

  if (normalized.includes("dien-mat-troi")) {
    return { category: "SOLAR" };
  }

  if (normalized.includes("humic") || normalized.includes("fulvic")) {
    return { category: "FERTILIZER", subCategory: "Humic/Fulvic" };
  }

  if (normalized.includes("phan-bon") || normalized.includes("dinh-duong")) {
    return { category: "FERTILIZER" };
  }

  if (normalized.includes("may-bay") || normalized.includes("drone")) {
    return { category: "DRONE" };
  }

  return { category: "HARDWARE" };
}

export function generateMetadata({ params }: Props): Metadata {
  const humanName = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${humanName} | Nhà Bè Agri`,
    description: `Danh mục ${humanName} đang được lọc tự động trong cửa hàng Nhà Bè Agri.`,
  };
}

export default function CategoryRedirectPage({ params }: Props) {
  const filters = resolveFiltersFromSlug(params.slug);
  const query = new URLSearchParams({
    category: filters.category,
    slug: params.slug,
  });

  if (filters.subCategory) {
    query.set("subCategory", filters.subCategory);
  }

  redirect(`/store?${query.toString()}`);
}
