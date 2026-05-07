import { Skill } from "@/lib/skills";
import SkillCard from "./SkillCard";

type SkillsGridProps = {
  skills: Skill[];
};

export default function SkillsGrid({ skills }: SkillsGridProps) {
  if (skills.length === 0) {
    return (
      <div className="col-span-4 py-20 text-center">
        <p className="font-dm text-muted text-sm">
          No skills found in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          id={skill.id}
          name={skill.name}
          category={skill.category}
          downloads={skill.downloads}
          previewBg={skill.previewBg}
          slug={skill.slug}
          description={skill.description}
        />
      ))}
    </div>
  );
}
