import { z } from "zod";

export const priceCategorySchema = z
  .enum(["all", "coffee", "pepper", "rice", "fruit", "cashew", "rubber"])
  .default("all");

export const priceSortSchema = z.enum(["change", "price", "name"]).default("change");

export const priceFiltersSchema = z.object({
  cat: priceCategorySchema,
  region: z.string().trim().min(1).optional(),
  sort: priceSortSchema,
  q: z.string().trim().max(80).optional(),
});

export type PriceCategory = z.infer<typeof priceCategorySchema>;
export type PriceSort = z.infer<typeof priceSortSchema>;
export type PriceFilters = z.infer<typeof priceFiltersSchema>;

export function parsePriceFilters(
  input:
    | URLSearchParams
    | Record<string, string | string[] | undefined>
    | undefined
): PriceFilters {
  const value =
    input instanceof URLSearchParams
      ? {
          cat: input.get("cat") ?? undefined,
          region: input.get("region") ?? undefined,
          sort: input.get("sort") ?? undefined,
          q: input.get("q") ?? undefined,
        }
      : {
          cat: firstValue(input?.cat),
          region: firstValue(input?.region),
          sort: firstValue(input?.sort),
          q: firstValue(input?.q),
        };

  return priceFiltersSchema.parse(value);
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
