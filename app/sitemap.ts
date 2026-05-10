import type { MetadataRoute } from "next";
import { readDB } from "@/lib/db";

const BASE = "https://www.tryskill.me";

type BlogPost = {
  slug: string;
  updatedAt: string;
  status: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/skills`,        lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/blog`,          lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/submit`,        lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/docs`,          lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/collections`,   lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/changelog`,     lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`,       lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
  ];

  // Dynamic skill pages from Supabase
  let skillPages: MetadataRoute.Sitemap = [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data } = await supabase
      .from("skills")
      .select("slug, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false });

    if (data) {
      skillPages = data.map((skill) => ({
        url: `${BASE}/skills/${skill.slug}`,
        lastModified: new Date(skill.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Supabase not configured — skip dynamic skill pages
  }

  // Blog post pages from local JSON
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = readDB<BlogPost[]>("blog.json", []);
    blogPages = posts
      .filter((p) => p.status === "Published")
      .map((post) => ({
        url: `${BASE}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch {
    // JSON not found — skip blog pages
  }

  return [...staticPages, ...skillPages, ...blogPages];
}
