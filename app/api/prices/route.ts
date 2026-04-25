import { NextResponse } from "next/server";
import { getPriceSnapshot } from "../../gia-nong-san/_lib/queries";
import { parsePriceFilters } from "../../gia-nong-san/_lib/schemas";

export async function GET(request: Request) {
  const filters = parsePriceFilters(new URL(request.url).searchParams);
  const snapshot = await getPriceSnapshot(filters);

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
