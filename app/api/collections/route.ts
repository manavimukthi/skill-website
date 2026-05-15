import { NextResponse } from "next/server";
import { readCollections } from "@/lib/collections-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const collections = await readCollections();
    return NextResponse.json({ data: collections }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("/api/collections GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}