import { getAdminClient } from "@/lib/supabase/admin";
import { readDB } from "@/lib/db";

export type AdminCollection = { id: string; title: string; skillIds: string[] };

const LEGACY_COLLECTIONS_FILE = "collections.json";
const COLLECTIONS_KEY = "collections";

export async function readCollections(): Promise<AdminCollection[]> {
  const supabase = getAdminClient();
  let data: any = null;
  try {
    const res = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", COLLECTIONS_KEY)
      .maybeSingle();
    if (res.error) throw res.error;
    data = res.data;
  } catch (err) {
    // If the table doesn't exist or Supabase isn't configured in this env,
    // fall back to the local data file instead of throwing so the app stays usable.
    // This mirrors previous behavior where `data/collections.json` was the source of truth in dev.
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
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: COLLECTIONS_KEY, value: collections }, { onConflict: "key" });

    if (error) throw error;
  } catch (err) {
    // If Supabase isn't available or the table is missing, persist locally so admin actions still work in dev.
    // eslint-disable-next-line no-console
    console.error("Supabase writeCollections error, writing to local file instead:", err?.message || err);
    const { writeDB } = await import("@/lib/db");
    writeDB(LEGACY_COLLECTIONS_FILE, collections);
  }
}