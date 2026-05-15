import { NextRequest, NextResponse } from "next/server";
import { AdminCollection, readCollections, writeCollections } from "@/lib/collections-store";

export const dynamic = "force-dynamic";

// ── route handlers ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const collections = await readCollections();
    return NextResponse.json({ data: collections });
  } catch (err) {
    console.error("/api/admin/collections GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const collections = await readCollections();
    const newCol: AdminCollection = {
      id: `col${Date.now()}`,
      title: body.title.trim(),
      skillIds: Array.isArray(body.skillIds) ? body.skillIds : [],
    };
    collections.push(newCol);
    await writeCollections(collections);
    return NextResponse.json({ data: newCol }, { status: 201 });
  } catch (err: any) {
    console.error("/api/admin/collections POST", err);
    return NextResponse.json({ error: "Internal server error", detail: err?.message || String(err) }, { status: 500 });
  }
}
