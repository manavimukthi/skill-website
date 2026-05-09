"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import SkillsGrid from "@/components/SkillsGrid";
import Footer from "@/components/Footer";
import { dbSkillToSkill, type Skill } from "@/lib/skills";

export default function SkillsPage() {
  const [selected, setSelected] = useState("All");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillsPerPage, setSkillsPerPage] = useState(16);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function init() {
      try {
        // If a search query is present in the URL, use the search API
        const q = searchParams.get("q")?.trim();
        if (q && q.length >= 2) {
          const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
          if (r.ok) {
            const json = await r.json();
            if (Array.isArray(json.data)) {
              setSkills(json.data.map(dbSkillToSkill));
            }
          }
        } else {
          const skillsRes = await fetch("/api/skills?limit=500");
          if (skillsRes.ok) {
            const { data } = await skillsRes.json();
            if (Array.isArray(data)) setSkills(data.map(dbSkillToSkill));
          }
        }

        // Fetch settings regardless of whether we searched or loaded full list
        const settingsRes = await fetch("/api/admin/settings");
        if (settingsRes.ok) {
          const { data } = await settingsRes.json();
          if (data?.skillsPerPage) setSkillsPerPage(data.skillsPerPage);
        }
      } catch {
        // Leave the grid empty if unavailable.
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [searchParams]);

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1); }, [selected]);

  const filtered =
    selected === "All"
      ? skills
      : skills.filter((s) => s.category === selected);

  const totalPages = Math.max(1, Math.ceil(filtered.length / skillsPerPage));
  const paginated = filtered.slice((page - 1) * skillsPerPage, page * skillsPerPage);

  return (
    <>
      <Navbar />
      <FilterBar selected={selected} onChange={setSelected} />
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-10">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl sm:text-4xl text-text">Browse Skills</h1>
          <p className="font-dm text-sm text-muted mt-1">
            {loading ? (
              <span className="animate-pulse">Loading skills...</span>
            ) : (
              <>
                {filtered.length} skill{filtered.length !== 1 ? "s" : ""} available
                {selected !== "All" ? ` in ${selected}` : ""}
              </>
            )}
          </p>
        </div>

        <SkillsGrid skills={paginated} />

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="font-dm text-sm px-4 py-2 border border-border rounded-md hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-text"
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`font-dm text-sm w-9 h-9 rounded-md border transition-colors ${
                  p === page
                    ? "bg-accent text-white border-accent"
                    : "border-border text-text hover:border-accent hover:text-accent"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="font-dm text-sm px-4 py-2 border border-border rounded-md hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-text"
            >
              Next →
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
