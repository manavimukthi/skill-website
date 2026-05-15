import { getAdminClient } from "@/lib/supabase/admin";

export type AdminCollection = { id: string; title: string; skillIds: string[] };

const COLLECTIONS_KEY = "collections";

export async function readCollections(): Promise<AdminCollection[]> {
  const supabase = getAdminClient();
  const res = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", COLLECTIONS_KEY)
    .maybeSingle();

  if (res.error) throw res.error;

  if (res.data?.value && Array.isArray(res.data.value)) {
    return (res.data.value as AdminCollection[]).map((collection) => ({
      id: collection.id,
      title: collection.title,
      skillIds: Array.isArray(collection.skillIds) ? collection.skillIds : [],
    }));
  }

  return [];
}

export async function writeCollections(collections: AdminCollection[]): Promise<void> {
  const supabase = getAdminClient();

  const { data: updated, error: updateError } = await supabase
    .from("site_settings")
    .update({ value: collections })
    .eq("key", COLLECTIONS_KEY)
    .select("key");

  if (updateError) throw updateError;

  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase
      .from("site_settings")
      .insert({ key: COLLECTIONS_KEY, value: collections });
    if (insertError) throw insertError;
  }
}