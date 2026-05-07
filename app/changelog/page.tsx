"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ENTRIES = [
  {
    version: "1.0.0",
    date: "May 2026",
    tag: "Major Release",
    tagColor: "bg-accent text-white",
    changes: [
      { type: "new", text: "Public launch of SkillForge — the free Claude AI skills library." },
      { type: "new", text: "Blog with tutorials, tips, and guides for Claude skill builders." },
      { type: "new", text: "Skill detail pages with one-click download and favorite support." },
      { type: "new", text: "Admin panel with full skill, blog, and submission management." },
      { type: "new", text: "Dark / light mode toggle with persistent preference." },
      { type: "new", text: "Community skill submissions with admin review workflow." },
    ],
  },
  {
    version: "0.9.0",
    date: "April 2026",
    tag: "Beta",
    tagColor: "bg-mustard text-text",
    changes: [
      { type: "new", text: "Skills browsing page with category filtering and search." },
      { type: "new", text: "Collections feature — curated sets of skills for specific workflows." },
      { type: "new", text: "User accounts via Supabase Auth — sign up, log in, favorites." },
      { type: "improve", text: "14-day persistent sessions — stay logged in across browser restarts." },
      { type: "improve", text: "Smart redirect after sign up/log in — returns you to the page you came from." },
    ],
  },
  {
    version: "0.8.0",
    date: "March 2026",
    tag: "Alpha",
    tagColor: "bg-tagBg text-tagText",
    changes: [
      { type: "new", text: "Initial skill library with seeded categories and sample skills." },
      { type: "new", text: "Admin dashboard with analytics, skill management, and activity feed." },
      { type: "fix", text: "Skill detail pages now load reliably via UUID-based routing." },
      { type: "improve", text: "Navbar Sign In button passes return destination — no lost context after auth." },
    ],
  },
];

const TYPE_STYLES: Record<string, string> = {
  new: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  improve: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  fix: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  break: "bg-red-100 text-red-600",
};

export default function ChangelogPage() {
  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* Header */}
        <div className="border-b-2 border-text bg-card">
          <div className="max-w-[1200px] mx-auto px-8 py-16">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              What&apos;s New
            </span>
            <h1 className="font-display text-5xl lg:text-6xl uppercase tracking-editorial leading-none text-text mt-3 mb-4">
              CHANGELOG
            </h1>
            <p className="font-dm text-base text-muted max-w-xl">
              A record of all notable updates, improvements, and fixes to
              SkillForge.
            </p>
          </div>
        </div>

        <div className="max-w-[860px] mx-auto px-8 py-16 flex flex-col gap-12">
          {ENTRIES.map((entry) => (
            <div key={entry.version} className="flex flex-col sm:flex-row gap-6">
              {/* Left — version + date */}
              <div className="sm:w-44 flex-shrink-0">
                <div className="sm:sticky sm:top-24">
                  <span className="font-mono text-xl font-bold text-text">
                    v{entry.version}
                  </span>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
                    {entry.date}
                  </p>
                  <span
                    className={`inline-block font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded mt-2 ${entry.tagColor}`}
                  >
                    {entry.tag}
                  </span>
                </div>
              </div>

              {/* Right — changes */}
              <div className="flex-1 border-2 border-text divide-y-2 divide-text">
                {entry.changes.map((change, i) => (
                  <div key={i} className="px-5 py-4 flex items-start gap-3">
                    <span
                      className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${
                        TYPE_STYLES[change.type] ?? "bg-tagBg text-tagText"
                      }`}
                    >
                      {change.type}
                    </span>
                    <p className="font-dm text-sm text-text leading-relaxed">
                      {change.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
