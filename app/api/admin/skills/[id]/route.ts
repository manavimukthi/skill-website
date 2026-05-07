import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import slugify from "slugify";
import { getAdminClient } from "@/lib/supabase/admin";
import { mapAdminSkill } from "@/lib/admin-skills";

const skillSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  slug: z.string().min(3).max(120).optional(),
  description: z.string().min(10).max(500).optional(),
  content: z.string().min(20).optional(),
  category_id: z.string().uuid().optional(),
  filename: z.string().endsWith(".md").optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  preview_bg: z.string().max(20).optional().nullable(),
  file_url: z.string().url().optional().nullable(),
  file_size_bytes: z.number().int().positive().optional().nullable(),
  featured: z.boolean().optional(),
  status: z.enum(["Published", "Draft", "Archived"]).optional(),
});

const selectClause = "id, slug, filename, title, description, content, category_id, author_id, file_url, file_size_bytes, download_count, view_count, featured, published, tags, preview_bg, created_at, updated_at, category:categories(id, name, slug, color)";

type Params = { params: { id: string } };

function buildPatchPayload(input: z.infer<typeof skillSchema>, existingSlug: string) {
  const slug = input.slug?.trim() || (input.title ? slugify(input.title, { lower: true, strict: true }) : existingSlug);
  const payload: Record<string, unknown> = { slug };

  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.content !== undefined) payload.content = input.content;
  if (input.category_id !== undefined) payload.category_id = input.category_id;
  if (input.filename !== undefined) payload.filename = input.filename;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.preview_bg !== undefined) payload.preview_bg = input.preview_bg;
  if (input.file_url !== undefined) payload.file_url = input.file_url;
  if (input.file_size_bytes !== undefined) payload.file_size_bytes = input.file_size_bytes;
  if (input.featured !== undefined) payload.featured = input.featured;
  if (input.status !== undefined) payload.published = input.status === "Published";

  return payload;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("skills")
      .select(selectClause)
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    return NextResponse.json({ data: mapAdminSkill(data) });
  } catch (err) {
    console.error("/api/admin/skills/[id] GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const parsed = skillSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data: existing, error: fetchError } = await supabase
      .from("skills")
      .select("id, slug")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const payload = buildPatchPayload(parsed.data, existing.slug);
    const { data, error } = await supabase
      .from("skills")
      .update(payload)
      .eq("id", params.id)
      .select(selectClause)
      .single();

    if (error) throw error;

    return NextResponse.json({ data: mapAdminSkill(data) });
  } catch (err) {
    console.error("/api/admin/skills/[id] PATCH", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from("skills").delete().eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    console.error("/api/admin/skills/[id] DELETE", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}