import { getAdminClient } from "@/lib/supabase/admin";
import type { BlogPost } from "@/lib/blog-types";

const BLOG_KEY = "blog";

export async function readBlog(): Promise<BlogPost[]> {
  const supabase = getAdminClient();
  const res = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", BLOG_KEY)
    .maybeSingle();

  if (res.error) throw res.error;

  // Row exists — parse whatever format Supabase returns
  if (res.data !== null) {
    const val = res.data?.value;
    if (Array.isArray(val)) return val as BlogPost[];
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed as BlogPost[];
      } catch {}
    }
    return [];
  }

  // No row at all — one-time migration from bundled data/blog.json
  try {
    const { readDB } = await import("@/lib/db");
    const legacy = readDB<BlogPost[]>("blog.json", []);
    if (legacy.length > 0) {
      await writeBlog(legacy);
      return legacy;
    }
  } catch {
    // ignore migration errors
  }

  return [];
}

export async function writeBlog(posts: BlogPost[]): Promise<void> {
  const supabase = getAdminClient();

  const { data: updated, error: updateError } = await supabase
    .from("site_settings")
    .update({ value: posts })
    .eq("key", BLOG_KEY)
    .select("key");

  if (updateError) throw updateError;

  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase
      .from("site_settings")
      .insert({ key: BLOG_KEY, value: posts });
    if (insertError) throw insertError;
  }
}
