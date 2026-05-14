"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    id: "what-are-skills",
    title: "What are Skills?",
    content: `Skills are reusable system prompts that transform Claude into a specialized assistant for a specific task. Think of each skill as a "job description" you hand to Claude at the start of a conversation — it defines the role, tone, output format, and constraints.

Instead of typing long instructions every time, you download a skill file (.md), paste it as Claude's system prompt, and instantly have a focused expert assistant.`,
  },
  {
    id: "how-to-use",
    title: "How to Use a Skill",
    steps: [
      { n: "01", title: "Browse the library", body: "Go to the Skills page and filter by category or search for what you need." },
      { n: "02", title: "Download the skill", body: "Click the Download button on any skill page to save the .md file to your device." },
      { n: "03", title: "Open Claude", body: "Go to claude.ai and create a new Project, or open a new conversation." },
      { n: "04", title: "Paste as system prompt", body: "In your Project settings, paste the skill content into the \"Custom instructions\" field. For a regular chat, paste it at the start of your first message." },
      { n: "05", title: "Start chatting", body: "Claude will now behave as the specialist defined in the skill. Give it your task and iterate." },
    ],
  },
  {
    id: "writing-skills",
    title: "Writing Your Own Skills",
    content: `Great skills follow a consistent structure:

**1. Role definition** — Start with a clear persona: "You are a professional copywriter specializing in B2B SaaS."

**2. Output format** — Specify exactly what Claude should return: bullet points, word count, JSON, markdown, etc.

**3. Constraints** — Tell Claude what NOT to do: "Never add disclaimers", "Always respond in the user's language", "Keep responses under 200 words."

**4. Examples** — Include 1–3 examples of ideal input/output pairs. This is the single biggest quality lever.

Once you have a working skill, submit it to the library so the community can benefit.`,
  },
  {
    id: "submitting",
    title: "Submitting a Skill",
    content: `Anyone can submit a skill to the library. All submissions are reviewed by the TrySkill team before publishing.

**Requirements:**
- The skill must produce consistent, high-quality output
- It must be original (not a copy of an existing skill)
- The content must be safe and appropriate for all audiences
- You agree to release it under CC0 (public domain)

Go to the Submit page to contribute your skill.`,
    cta: { label: "Submit a Skill →", href: "/submit" },
  },
  {
    id: "faq",
    title: "FAQ",
    faqs: [
      {
        q: "Are skills free?",
        a: "Yes. Every skill in the library is free to download and use, forever. We're a community project.",
      },
      {
        q: "Which Claude models work with skills?",
        a: "Skills work with all Claude models (Haiku, Sonnet, Opus). More capable models produce better results with complex skills.",
      },
      {
        q: "Can I use skills in the Claude API?",
        a: "Absolutely. Paste the skill content as the `system` parameter in your API request.",
      },
      {
        q: "Can I modify a downloaded skill?",
        a: "Yes. Skills are released under CC0 — you're free to edit, remix, and use them commercially without attribution.",
      },
      {
        q: "How do I report a bad skill?",
        a: "Use the Contact page to report any skill that violates our guidelines.",
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* Header */}
        <div className="border-b-2 border-text bg-card">
          <div className="max-w-[1200px] mx-auto px-8 py-16">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Documentation
            </span>
            <h1 className="font-display text-5xl lg:text-6xl uppercase tracking-editorial leading-none text-text mt-3 mb-4">
              DOCS
            </h1>
            <p className="font-dm text-base text-muted max-w-xl">
              Everything you need to know about using, creating, and submitting
              Claude AI skills.
            </p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-8 py-16 flex flex-col lg:flex-row gap-16">
          {/* Sidebar nav */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
                On this page
              </p>
              <nav className="flex flex-col gap-1">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="font-dm text-sm text-muted hover:text-text transition-colors py-1 border-l-2 border-border hover:border-accent pl-3"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-16">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-3xl uppercase tracking-editorial text-text mb-6 pb-3 border-b-2 border-text">
                  {section.title}
                </h2>

                {"steps" in section && section.steps && (
                  <div className="flex flex-col gap-4">
                    {section.steps.map((step) => (
                      <div key={step.n} className="flex gap-5 border-2 border-text p-5">
                        <span className="font-mono text-2xl text-mustard font-bold flex-shrink-0 leading-none mt-0.5">
                          {step.n}
                        </span>
                        <div>
                          <p className="font-dm font-semibold text-text mb-1">{step.title}</p>
                          <p className="font-dm text-sm text-muted leading-relaxed">{step.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {"faqs" in section && section.faqs && (
                  <div className="flex flex-col gap-0 border-2 border-text divide-y-2 divide-text">
                    {section.faqs.map((faq) => (
                      <div key={faq.q} className="p-5">
                        <p className="font-dm font-semibold text-text mb-1">{faq.q}</p>
                        <p className="font-dm text-sm text-muted leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                )}

                {"content" in section && section.content && (
                  <div className="font-dm text-sm text-muted leading-relaxed whitespace-pre-line">
                    {section.content.split("\n").map((line, i) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <p key={i} className="font-semibold text-text mt-4 mb-1">
                            {line.slice(2, -2)}
                          </p>
                        );
                      }
                      if (line.startsWith("- ")) {
                        return (
                          <li key={i} className="ml-4 list-disc mb-1">
                            {line.slice(2)}
                          </li>
                        );
                      }
                      if (line.trim() === "") return <div key={i} className="h-3" />;
                      return <p key={i} className="mb-2 leading-relaxed">{line}</p>;
                    })}
                  </div>
                )}

                {"cta" in section && section.cta && (
                  <div className="mt-6">
                    <Link
                      href={section.cta.href}
                      className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-6 py-3 border-2 border-text hover:bg-mustard hover:border-mustard hover:text-text transition-colors duration-100 inline-block"
                    >
                      {section.cta.label}
                    </Link>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
