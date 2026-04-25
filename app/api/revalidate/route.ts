import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const secret = process.env.MARKET_REVALIDATE_SECRET;
  const headerSecret = request.headers.get("x-revalidate-secret");

  if (secret && secret !== headerSecret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: string[] };
  const tags = body.tags?.length ? body.tags : ["prices"];

  tags.forEach((tag) => revalidateTag(tag));

  return NextResponse.json({ ok: true, revalidated: tags, at: new Date().toISOString() });
}
