"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkillCard from "@/components/SkillCard";
import { dbSkillToSkill, type Skill } from "@/lib/skills";

type Collection = { id: string; title: string; skillIds: string[] };

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/collections").then((r) => r.json()),
      fetch("/api/skills?limit=100").then((r) => r.json()),
    ])
      .then(([colJson, skillsJson]) => {
        if (Array.isArray(colJson.data)) setCollections(colJson.data);
        if (Array.isArray(skillsJson.data)) setSkills(skillsJson.data.map(dbSkillToSkill));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

        {loading ? (
          <div className="flex flex-col gap-14">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <div className="mb-5 space-y-2">
                  <div className="h-7 bg-card border border-border rounded w-48 animate-pulse" />
                  <div className="h-4 bg-card border border-border rounded w-24 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="bg-card border-2 border-text rounded h-40 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-dm text-muted">No collections yet. Add some from the admin panel.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {collections.map((col) => {
              const colSkills = col.skillIds
                .map((id) => skills.find((s) => s.id === id))
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
