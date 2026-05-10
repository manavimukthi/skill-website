import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type AdminCollection = { id: string; title: string; skillIds: string[] };

// ── helpers ──────────────────────────────────────────────────────────────────

/** Read the "collections" key from the site_settings table. Falls back to []. */
async function readCollections(): Promise<AdminCollection[]> {
  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "collections")
      .maybeSingle();
    if (data?.value && Array.isArray(data.value)) {
      return data.value as AdminCollection[];
    }
  } catch {
    // supabase not configured or table missing — return empty
  }
  return [];
}

/** Upsert the collections array back into site_settings. */
async function writeCollections(collections: AdminCollection[]): Promise<void> {
  const supabase = getAdminClient();
  await supabase.from("site_settings").upsert(
    { key: "collections", value: collections },
    { onConflict: "key" }
  );
}

// ── route handlers ────────────────────────────────────────────────────────────

export async function GET() {
  const collections = await readCollections();
  return NextResponse.json({ data: collections });
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
  } catch (err) {
    console.error("/api/admin/collections POST", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
