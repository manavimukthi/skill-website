import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { getAdminClient } from "@/lib/supabase/admin";
import { mapAdminSkill } from "@/lib/admin-skills";

const skillSchema = z.object({
  title: z.string().min(3).max(100),
  slug: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(500),
  content: z.string().min(20),
  category_id: z.string().uuid(),
  filename: z.string().endsWith(".md").optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  preview_bg: z.string().max(20).optional().nullable(),
  file_url: z.string().url().optional().nullable(),
  file_size_bytes: z.number().int().positive().optional().nullable(),
  featured: z.boolean().optional(),
  status: z.enum(["Published", "Draft", "Archived"]).optional(),
});

const selectClause = "id, slug, filename, title, description, content, category_id, author_id, file_url, file_size_bytes, download_count, view_count, featured, published, tags, preview_bg, created_at, updated_at, category:categories(id, name, slug, color)";

function buildSkillPayload(input: z.infer<typeof skillSchema>) {
  const slug = input.slug?.trim() || slugify(input.title, { lower: true, strict: true });

  return {
    slug,
    filename: input.filename ?? `${slug}.md`,
    title: input.title,
    description: input.description,
    content: input.content,
    category_id: input.category_id,
    tags: input.tags ?? [],
    preview_bg: input.preview_bg ?? null,
    file_url: input.file_url ?? null,
    file_size_bytes: input.file_size_bytes ?? null,
    featured: input.featured ?? false,
    published: input.status === "Published",
  };
}

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("skills")
      .select(selectClause)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: (data ?? []).map(mapAdminSkill) });
  } catch (err) {
    console.error("/api/admin/skills GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = skillSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const payload = buildSkillPayload(parsed.data);

    const { data: existing } = await supabase
      .from("skills")
      .select("id")
      .eq("slug", payload.slug)
      .maybeSingle();

    const slug = existing ? `${payload.slug}-${Date.now().toString(36)}` : payload.slug;
    const { data, error } = await supabase
      .from("skills")
      .insert({ ...payload, slug })
      .select(selectClause)
      .single();

    if (error) throw error;

    return NextResponse.json({ data: mapAdminSkill(data) }, { status: 201 });
  } catch (err) {
    console.error("/api/admin/skills POST", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}