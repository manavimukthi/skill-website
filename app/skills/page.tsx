import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkillsGrid from "@/components/SkillsGrid";
import SkillsFilterBar from "./SkillsFilterBar";
import { dbSkillToSkill, type Skill } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Browse Claude Skills — Writing, Coding, Marketing & More",
  description:
    "Browse 940+ free Claude AI skills. Filter by category: Writing, Coding, Marketing, Research, Automation & Business. Download any skill in one click — no signup required.",
  alternates: { canonical: "https://www.tryskill.me/skills" },
  openGraph: {
    url: "https://www.tryskill.me/skills",
    title: "Browse Claude Skills — Writing, Coding, Marketing & More | TrySkill",
    description:
      "940+ free Claude AI skills, organized by category. Download instantly — no signup needed.",
  },
};

const PER_PAGE = 20;

async function fetchSkills(cat?: string, q?: string): Promise<Skill[]> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data } = await supabase
      .from("skills")
      .select(
        "id, slug, title, description, download_count, preview_bg, category:categories(id, name, slug, color)"
      )
      .eq("published", true)
      .order("download_count", { ascending: false })
      .limit(500);

    const skills = (data ?? []).map(dbSkillToSkill);

    if (q && q.length >= 2) {
      const lq = q.toLowerCase();
      return skills.filter(
        (s) =>
          s.name.toLowerCase().includes(lq) ||
          s.description.toLowerCase().includes(lq)
      );
    }

    if (cat && cat !== "All") {
      return skills.filter((s) => s.category === cat);
    }

    return skills;
  } catch {
    return [];
  }
}

function buildUrl(params: { cat?: string; q?: string; page?: number }): string {
  const qs = new URLSearchParams();
  if (params.cat && params.cat !== "All") qs.set("cat", params.cat);
  if (params.q) qs.set("q", params.q);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const str = qs.toString();
  return str ? `/skills?${str}` : "/skills";
}

type Props = {
  searchParams: { cat?: string; q?: string; page?: string };
};

export default async function SkillsPage({ searchParams }: Props) {
  const cat = searchParams.cat ?? "All";
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const allSkills = await fetchSkills(cat, q);
  const totalPages = Math.max(1, Math.ceil(allSkills.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const skills = allSkills.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const subtitle =
    q.length >= 2
      ? `${allSkills.length} result${allSkills.length !== 1 ? "s" : ""} for "${q}"`
      : cat !== "All"
      ? `${allSkills.length} skill${allSkills.length !== 1 ? "s" : ""} in ${cat}`
      : `${allSkills.length} skill${allSkills.length !== 1 ? "s" : ""} — writing, coding, marketing & more`;

  // Generate a compact page window: always show first, last, current ±2
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 2 && p <= currentPage + 2)
  );

  return (
    <>
      <Navbar />
      <SkillsFilterBar selected={cat} />
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-10">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl sm:text-4xl text-text">
            Browse Claude Skills
          </h1>
          <p className="font-dm text-sm text-muted mt-1">{subtitle}</p>
        </div>

        <SkillsGrid skills={skills} />

        {totalPages > 1 && (
          <nav
            aria-label="Skill pages"
            className="flex items-center justify-center gap-1.5 mt-10 flex-wrap"
          >
            {/* Prev */}
            {currentPage > 1 ? (
              <Link
                href={buildUrl({ cat, q, page: currentPage - 1 })}
                className="font-dm text-sm px-4 py-2 border border-border rounded-md hover:border-accent hover:text-accent transition-colors text-text"
              >
                ← Prev
              </Link>
            ) : (
              <span className="font-dm text-sm px-4 py-2 border border-border rounded-md opacity-40 text-text cursor-not-allowed">
                ← Prev
              </span>
            )}

            {/* Page numbers */}
            {pageNums.map((p, idx) => {
              const prev = pageNums[idx - 1];
              const showEllipsis = prev !== undefined && p - prev > 1;
              return (
                <span key={p} className="flex items-center gap-1.5">
                  {showEllipsis && (
                    <span className="font-dm text-sm text-muted px-1">…</span>
                  )}
                  {p === currentPage ? (
                    <span className="font-dm text-sm w-9 h-9 rounded-md border bg-accent text-white border-accent flex items-center justify-center">
                      {p}
                    </span>
                  ) : (
                    <Link
                      href={buildUrl({ cat, q, page: p })}
                      className="font-dm text-sm w-9 h-9 rounded-md border border-border text-text hover:border-accent hover:text-accent transition-colors flex items-center justify-center"
                    >
                      {p}
                    </Link>
                  )}
                </span>
              );
            })}

            {/* Next */}
            {currentPage < totalPages ? (
              <Link
                href={buildUrl({ cat, q, page: currentPage + 1 })}
                className="font-dm text-sm px-4 py-2 border border-border rounded-md hover:border-accent hover:text-accent transition-colors text-text"
              >
                Next →
              </Link>
            ) : (
              <span className="font-dm text-sm px-4 py-2 border border-border rounded-md opacity-40 text-text cursor-not-allowed">
                Next →
              </span>
            )}
          </nav>
        )}
      </main>
      <Footer />
    </>
  );
}
