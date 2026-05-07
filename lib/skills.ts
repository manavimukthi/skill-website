export type Skill = {
  id: string;
  name: string;
  category: string;
  downloads: number;
  previewBg: string;
  description: string;
  slug: string;
};

// Maps a Supabase DB skill row to the component Skill shape expected by SkillCard / SkillsGrid.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dbSkillToSkill(s: any): Skill {
  return {
    id: s.id,
    name: s.title,
    category: s.category?.name ?? s.category_id ?? "",
    downloads: s.download_count ?? 0,
    previewBg: s.preview_bg ?? s.category?.color ?? "#D4E4D4",
    description: s.description ?? "",
    slug: s.slug,
  };
}

// ── FALLBACK MOCK DATA ─────────────────────────────────────────────────────
// Used when Supabase is not yet configured or returns no results.
// Once your DB has real data these are never shown to users.

export type Collection = {
  id: string;
  title: string;
  skillIds: string[];
};

export const SKILLS: Skill[] = [];

export const COLLECTIONS: Collection[] = [];
