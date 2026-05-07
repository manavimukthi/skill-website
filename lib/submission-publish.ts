import slugify from "slugify";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Submission } from "@/lib/admin-data";

async function getCategoryId(categoryName: string) {
  const supabase = getAdminClient();
  const categorySlug = slugify(categoryName, { lower: true, strict: true });
  const { data } = await supabase.from("categories").select("id, name, slug");

  return data?.find((category) => category.name === categoryName || category.slug === categorySlug)?.id ?? null;
}

export async function ensurePublishedSkillFromSubmission(submission: Submission) {
  const supabase = getAdminClient();
  const slug = slugify(submission.skillName, { lower: true, strict: true });

  const { data: existing } = await supabase
    .from("skills")
    .select("id")
    .or(`slug.eq.${slug},title.eq.${submission.skillName}`)
    .maybeSingle();

  if (existing) {
    return { created: false as const, skillId: existing.id };
  }

  const categoryId = await getCategoryId(submission.category);
  if (!categoryId) {
    throw new Error(`Unknown category: ${submission.category}`);
  }

  const { data, error } = await supabase
    .from("skills")
    .insert({
      title: submission.skillName,
      description: submission.content.slice(0, 500),
      content: submission.content,
      category_id: categoryId,
      author_id: submission.submitterId ?? null,
      slug,
      filename: `${slug}.md`,
      tags: [],
      preview_bg: null,
      file_url: null,
      file_size_bytes: null,
      featured: false,
      published: true,
    })
    .select("id")
    .single();

  if (error) throw error;

  return { created: true as const, skillId: data.id };
}
