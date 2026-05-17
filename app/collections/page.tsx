import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkillCard from "@/components/SkillCard";
import { dbSkillToSkill, type Skill } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Collections — Curated Claude AI Skill Sets",
  description:
    "Curated collections of free Claude AI skills grouped by workflow. Find the perfect set of skills for writing, coding, marketing, research, and more.",
  alternates: { canonical: "https://www.tryskill.me/collections" },
  openGraph: {
    url: "https://www.tryskill.me/collections",
    title: "Collections — Curated Claude AI Skill Sets | TrySkill",
    description: "Curated skill groups for every workflow. Browse and download for free.",
  },
};

type AdminCollection = { id: string; title: string; skillIds: string[] };

async function fetchCollections(): Promise<AdminCollection[]> {
  try {
    const { readCollections } = await import("@/lib/collections-store");
    return await readCollections();
  } catch {
    return [];
  }
}

async function fetchSkillsByIds(ids: string[]): Promise<Skill[]> {
  if (ids.length === 0) return [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data } = await supabase
      .from("skills")
      .select("id, slug, title, description, download_count, preview_bg, category:categories(id, name, slug, color)")
      .in("id", ids)
      .eq("published", true);
    return (data ?? []).map(dbSkillToSkill);
  } catch {
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await fetchCollections();

  // Gather all unique skill IDs across collections in one DB query.
  const allIds = [...new Set(collections.flatMap((c) => c.skillIds))];
  const allSkills = await fetchSkillsByIds(allIds);
  const skillsById = new Map(allSkills.map((s) => [s.id, s]));

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="font-playfair text-4xl text-text">Collections</h1>
          <p className="font-dm text-sm text-muted mt-1">
            Curated groups of skills for every workflow.
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-dm text-muted">No collections yet. Add some from the admin panel.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {collections.map((col) => {
              const colSkills = col.skillIds
                .map((id) => skillsById.get(id))
                .filter(Boolean) as Skill[];

              return (
                <div key={col.id}>
                  <div className="mb-5">
                    <h2 className="font-playfair text-2xl text-text">{col.title}</h2>
                    <p className="font-dm text-sm text-muted mt-0.5">{colSkills.length} skills</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {colSkills.map((skill) => (
                      <SkillCard
                        key={skill.id}
                        name={skill.name}
                        category={skill.category}
                        downloads={skill.downloads}
                        previewBg={skill.previewBg}
                        slug={skill.slug}
                      />
                    ))}
                  </div>
                  <div className="mt-6 h-px bg-border" />
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
