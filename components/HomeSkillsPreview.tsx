"use client";

import { useEffect, useState } from "react";
import { dbSkillToSkill, type Skill } from "@/lib/skills";
import FilterBar from "./FilterBar";
import SkillsGrid from "./SkillsGrid";
import Link from "next/link";

export default function HomeSkillsPreview() {
  const [selected, setSelected] = useState("All");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await fetch("/api/skills?limit=12");
        if (!res.ok) throw new Error("Failed to fetch skills");
        const { data } = await res.json();
        setSkills(Array.isArray(data) ? data.map(dbSkillToSkill) : []);
      } catch {
        setSkills([]);
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
  }, []);

  const filtered =
    selected === "All"
      ? skills.slice(0, 12)
      : skills.filter((s) => s.category === selected).slice(0, 12);

  return (
    <section className="pb-16">
      <FilterBar selected={selected} onChange={setSelected} />
      <div className="max-w-7xl mx-auto px-8 pt-8">
        {loading && filtered.length === 0 ? (
          <p className="font-dm text-sm text-muted mb-6">Loading skills...</p>
        ) : filtered.length === 0 ? (
          <p className="font-dm text-sm text-muted mb-6">No published skills yet.</p>
        ) : null}
        <SkillsGrid skills={filtered} />
        <div className="mt-10 text-center">
          <Link
            href="/skills"
            className="font-dm text-sm font-medium border border-border text-text px-6 py-3 rounded-md hover:border-accent hover:text-accent transition-colors duration-150 inline-block"
          >
            Browse all skills →
          </Link>
        </div>
      </div>
    </section>
  );
}
