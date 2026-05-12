import { getAdminClient } from "@/lib/supabase/admin";
import { readDB } from "@/lib/db";

export type AdminCollection = { id: string; title: string; skillIds: string[] };

const LEGACY_COLLECTIONS_FILE = "collections.json";
const COLLECTIONS_KEY = "collections";

export async function readCollections(): Promise<AdminCollection[]> {
  let data: any = null;
  try {
    const supabase = getAdminClient();
    const res = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", COLLECTIONS_KEY)
      .maybeSingle();
    if (res.error) throw res.error;
    data = res.data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Supabase readCollections error, falling back to local data:", err?.message || err);
  }

  if (data?.value && Array.isArray(data.value)) {
    return (data.value as AdminCollection[]).map((collection) => ({
      id: collection.id,
      title: collection.title,
      skillIds: Array.isArray(collection.skillIds) ? collection.skillIds : [],
    }));
  }

  const legacy = readDB<AdminCollection[]>(LEGACY_COLLECTIONS_FILE, []);
  if (legacy.length > 0) {
    await writeCollections(legacy);
  }
  return legacy;
}

export async function writeCollections(collections: AdminCollection[]): Promise<void> {
  const supabase = getAdminClient();

  try {
    // Try updating existing row first (avoids needing a unique constraint for upsert)
    const { data: updated, error: updateError } = await supabase
      .from("site_settings")
      .update({ value: collections })
      .eq("key", COLLECTIONS_KEY)
      .select("key");

    if (updateError) throw updateError;

    if (!updated || updated.length === 0) {
      // No row existed — insert one
      const { error: insertError } = await supabase
        .from("site_settings")
        .insert({ key: COLLECTIONS_KEY, value: collections });
      if (insertError) throw insertError;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Supabase writeCollections error, writing to local file instead:", err?.message || err);
    const { writeDB } = await import("@/lib/db");
    writeDB(LEGACY_COLLECTIONS_FILE, collections);
  }
}