import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

type AdminCollection = { id: string; title: string; skillIds: string[] };

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const collections = readDB<AdminCollection[]>("collections.json", []);
    const idx = collections.findIndex((c) => c.id === params.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    collections[idx] = { ...collections[idx], ...body };
    writeDB("collections.json", collections);
    return NextResponse.json({ data: collections[idx] });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const collections = readDB<AdminCollection[]>("collections.json", []);
  const filtered = collections.filter((c) => c.id !== params.id);
  if (filtered.length === collections.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  writeDB("collections.json", filtered);
  return NextResponse.json({ success: true });
}
