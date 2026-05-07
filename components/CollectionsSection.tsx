import Link from "next/link";
import { COLLECTIONS, SKILLS } from "@/lib/skills";
import SkillCard from "./SkillCard";

export default function CollectionsSection() {
  return (
    <section className="py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="font-playfair text-3xl text-text">Collections</h2>
          <p className="font-dm text-sm text-muted mt-1">
            Curated sets of skills for every workflow.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {COLLECTIONS.map((col) => {
            const colSkills = col.skillIds
              .map((id) => SKILLS.find((s) => s.id === id))
              .filter(Boolean) as typeof SKILLS;

            return (
              <div key={col.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-dm font-semibold text-base text-text">
                    {col.title}
                  </h3>
                  <Link
                    href="/collections"
                    className="font-dm text-sm text-accent hover:text-accentDk transition-colors duration-150"
                  >
                    View all →
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {colSkills.map((skill) => (
                    <div key={skill.id} className="min-w-[220px] flex-shrink-0">
                      <SkillCard
                        name={skill.name}
                        category={skill.category}
                        downloads={skill.downloads}
                        previewBg={skill.previewBg}
                        slug={skill.slug}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
