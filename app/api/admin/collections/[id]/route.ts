import { NextRequest, NextResponse } from "next/server";
import { AdminCollection, readCollections, writeCollections } from "@/lib/collections-store";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const collections = await readCollections();
    const idx = collections.findIndex((c) => c.id === params.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    collections[idx] = {
      ...collections[idx],
      title: body.title?.trim() ?? collections[idx].title,
      skillIds: Array.isArray(body.skillIds) ? body.skillIds : collections[idx].skillIds,
    };
    await writeCollections(collections);
    return NextResponse.json({ data: collections[idx] });
  } catch (err) {
    console.error("/api/admin/collections/[id] PUT", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const collections = await readCollections();
    const filtered = collections.filter((c) => c.id !== params.id);
    if (filtered.length === collections.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await writeCollections(filtered);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("/api/admin/collections/[id] DELETE", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
