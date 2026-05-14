import type { Metadata } from "next";
import SkillsClient from "./SkillsClient";

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

export default function SkillsPage() {
  return <SkillsClient />;
}
