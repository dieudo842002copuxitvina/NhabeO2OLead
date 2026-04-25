import { DEALERS_DATA } from "@/data/dealers";
import type { Product } from "@/data/types";
import { absoluteUrl } from "@/lib/seo";

type ProductSchemaProps = {
  product: Pick<Product, "id" | "name" | "slug" | "sku" | "brand_id" | "price" | "description" | "thumbnail" | "unit">;
  dealers?: typeof DEALERS_DATA;
  priceCurrency?: string;
};

function parseLocality(address: string) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.at(-1) || address;
}

function dealerToSchema(dealer: (typeof DEALERS_DATA)[number]) {
  const locality = parseLocality(dealer.address);

  return {
    "@type": dealer.type === "office" ? "Organization" : "LocalBusiness",
    "@id": absoluteUrl(`/dai-ly/${dealer.slug}`),
    name: dealer.name,
    telephone: dealer.phone,
    url: absoluteUrl(`/dai-ly/${dealer.slug}`),
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.address,
      addressLocality: locality,
      addressCountry: "VN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: dealer.lat,
      longitude: dealer.lng,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: dealer.region,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      description: dealer.time,
    },
  };
}

export default function ProductSchema({
  product,
  dealers = DEALERS_DATA,
  priceCurrency = "VND",
}: ProductSchemaProps) {
  const dealerSchemas = dealers.map(dealerToSchema);
  const uniqueAreas = Array.from(new Set(dealers.flatMap((dealer) => [dealer.region, parseLocality(dealer.address)])))
    .filter(Boolean)
    .map((name) => ({ "@type": "AdministrativeArea", name }));
  const productUrl = absoluteUrl(`/san-pham/${product.slug}`);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    sku: product.sku,
    image: [absoluteUrl(product.thumbnail)],
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand_id || "Nhà Bè Agri",
    },
    category: product.unit,
    url: productUrl,
    areaServed: uniqueAreas,
    availableAtOrFrom: dealerSchemas,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency,
      lowPrice: product.price,
      highPrice: product.price,
      offerCount: dealers.length,
      availability: "https://schema.org/InStock",
      url: productUrl,
      areaServed: uniqueAreas,
      availableAtOrFrom: dealerSchemas,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
