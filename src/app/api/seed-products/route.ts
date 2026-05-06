import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "seed-products API works!" });
}
