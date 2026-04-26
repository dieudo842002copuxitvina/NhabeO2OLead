import { PRODUCTS_DATA as RAW_PRODUCTS_DATA, type ProductData } from "./productsData";

export type ProductCategory = "DRONE" | "FERTILIZER" | "HARDWARE";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  unit: string;
  image: string;
  images: string[];
  badges: string[];
  description: string;
  specs: Record<string, unknown>;
  relatedSlugs: string[];
};

function resolveCategory(product: ProductData): ProductCategory {
  if (product.type === "FERTILIZER") return "FERTILIZER";
  if (product.category_id.includes("may-bay-nong-nghiep")) return "DRONE";
  return "HARDWARE";
}

function resolveCategoryLabel(category: ProductCategory) {
  if (category === "DRONE") return "May bay Nong nghiep";
  if (category === "FERTILIZER") return "Dinh duong & Phan bon";
  return "Vat tu & Thiet bi";
}

function resolveBadges(product: ProductData, category: ProductCategory): string[] {
  const badges: string[] = [];

  if (category === "DRONE") badges.push("Drone");
  if (category === "FERTILIZER") badges.push("Dinh duong");
  if (product.tags.includes("best seller")) badges.push("Ban chay");
  if (product.tags.includes("tuoi chinh xac")) badges.push("Tuoi chinh xac");

  return badges;
}

function buildBaseProduct(product: ProductData): Product {
  const category = resolveCategory(product);
  const images = (product.images && product.images.length > 0 ? product.images : [product.thumbnail]).filter(Boolean);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand ?? "Nha Be Agri",
    category,
    categoryLabel: resolveCategoryLabel(category),
    price: product.price,
    unit: product.unit,
    image: product.thumbnail,
    images,
    badges: resolveBadges(product, category),
    description: product.description,
    specs: product.specs ?? {},
    relatedSlugs: [],
  };
}

function buildRelatedSlugs(product: Product, allProducts: Product[]) {
  const byCategory = (category: ProductCategory) =>
    allProducts.filter((item) => item.category === category && item.slug !== product.slug);

  let candidates: Product[] = [];

  if (product.category === "DRONE") {
    candidates = [...byCategory("FERTILIZER").slice(0, 2), ...byCategory("HARDWARE").slice(0, 2)];
  } else if (product.category === "FERTILIZER") {
    candidates = [...byCategory("HARDWARE").slice(0, 2), ...byCategory("FERTILIZER").slice(0, 2)];
  } else {
    candidates = [...byCategory("HARDWARE").slice(0, 3), ...byCategory("FERTILIZER").slice(0, 1)];
  }

  return Array.from(new Set(candidates.map((item) => item.slug))).slice(0, 4);
}

const BASE_PRODUCTS: Product[] = RAW_PRODUCTS_DATA.map(buildBaseProduct);

export const PRODUCTS_DATA: Product[] = BASE_PRODUCTS.map((product) => ({
  ...product,
  relatedSlugs: buildRelatedSlugs(product, BASE_PRODUCTS),
}));

export function findProductBySlug(slug: string) {
  return PRODUCTS_DATA.find((product) => product.slug === slug);
}
