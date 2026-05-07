export type AdminSkillStatus = "Published" | "Draft" | "Archived";

export type AdminSkill = {
  id: string;
  name: string;
  category: string;
  categoryId: string | null;
  downloads: number;
  status: AdminSkillStatus;
  createdAt: string;
  slug: string;
  description: string;
  previewBg: string;
  content: string;
  tags: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAdminSkill(row: any): AdminSkill {
  const category = row.category;

  return {
    id: row.id,
    name: row.title,
    category: category?.name ?? "",
    categoryId: row.category_id ?? null,
    downloads: row.download_count ?? 0,
    status: row.archived ? "Archived" : row.published === false ? "Draft" : "Published",
    createdAt: row.created_at ? String(row.created_at).slice(0, 10) : "",
    slug: row.slug,
    description: row.description ?? "",
    previewBg: row.preview_bg ?? category?.color ?? "#D4E4D4",
    content: row.content ?? "",
    tags: Array.isArray(row.tags) ? row.tags.join(", ") : row.tags ?? "",
  };
}