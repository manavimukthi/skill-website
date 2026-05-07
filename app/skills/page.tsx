"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import SkillsGrid from "@/components/SkillsGrid";
import Footer from "@/components/Footer";
import { dbSkillToSkill, type Skill } from "@/lib/skills";

export default function SkillsPage() {
  const [selected, setSelected] = useState("All");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch("/api/skills?limit=100");
        if (!res.ok) throw new Error("Failed to fetch");
        const { data } = await res.json();
        if (Array.isArray(data)) {
          setSkills(data.map(dbSkillToSkill));
        }
      } catch {
        // Leave the grid empty if Supabase is unavailable.
      } finally {
        setLoading(false);
      }
    }
    fetchSkills();
  }, []);

  const filtered =
    selected === "All"
      ? skills
      : skills.filter((s) => s.category === selected);

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
        <SkillsGrid skills={filtered} />
      </main>
      <Footer />
    </>
  );
}
