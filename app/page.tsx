import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionLabel from "@/components/SectionLabel";
import CategoryCard from "@/components/CategoryCard";
import SkillCard from "@/components/SkillCard";
import NewsletterForm from "@/components/NewsletterForm";
import TryItBuilder from "@/components/TryItBuilder";
import { dbSkillToSkill, type Skill } from "@/lib/skills";

export const metadata: Metadata = {
  title: "SkillForge — Free Claude AI Skills Library | 940+ Free Skills",
  description:
    "SkillForge is the #1 free Claude AI skills library. Download 940+ community-built Claude skills for writing, coding, marketing, research & automation. No signup required.",
  alternates: { canonical: "https://www.tryskill.me" },
  openGraph: {
    url: "https://www.tryskill.me",
    title: "Free Claude Skills Library — 940+ Skills | SkillForge",
    description:
      "The #1 free Claude AI skills library. 940+ community-built skills. No signup required.",
  },
};

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.tryskill.me/#website",
      url: "https://www.tryskill.me",
      name: "SkillForge",
      description: "Free Claude AI Skills Library — community-built system prompts for Claude",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://www.tryskill.me/skills?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.tryskill.me/#organization",
      name: "SkillForge",
      url: "https://www.tryskill.me",
      logo: {
        "@type": "ImageObject",
        url: "https://www.tryskill.me/logo-dark.svg",
        width: 200,
        height: 60,
      },
      sameAs: [],
    },
    {
      "@type": "CollectionPage",
      "@id": "https://www.tryskill.me/#collection",
      url: "https://www.tryskill.me",
      name: "Free Claude AI Skills Library",
      description:
        "940+ free Claude AI skills built by the community. Browse writing, coding, marketing, research, automation, and business skills.",
      numberOfItems: 940,
      publisher: { "@id": "https://www.tryskill.me/#organization" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a Claude skill?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A Claude skill is a reusable system prompt (.md file) that transforms Claude AI into a specialized expert for a specific task — like a copywriter, code reviewer, or research analyst. You download the file, paste it into Claude's system prompt field, and Claude instantly behaves as that specialist. No coding or API access required.",
          },
        },
        {
          "@type": "Question",
          name: "Are Claude skills free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — all Claude skills on SkillForge are 100% free to download, use, and share. No subscription, no account required to browse or download. SkillForge is a community library maintained by builders who share their skills openly.",
          },
        },
        {
          "@type": "Question",
          name: "How do I install a Claude skill?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "To use a Claude skill: (1) Download the .md file from SkillForge. (2) Open Claude at claude.ai and create a new Project, or start a new conversation. (3) In Project settings, paste the skill content into the 'Custom instructions' field. For a regular chat, paste it at the start of your first message. (4) Start chatting — Claude will now behave as the specialist defined by the skill.",
          },
        },
        {
          "@type": "Question",
          name: "Can I build my own Claude skill?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely. SkillForge has a built-in skill builder you can use right on the homepage — no signup required. You can also read the docs for a complete guide on writing effective Claude skills. Once you've built a skill, you can submit it to the library to share with 2,400+ builders.",
          },
        },
        {
          "@type": "Question",
          name: "What categories of Claude skills are available?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SkillForge organizes Claude skills into six main categories: Writing (blog posts, emails, copywriting), Coding (code review, debugging, documentation), Marketing (ads, social media, SEO), Research (analysis, summarization, fact-checking), Automation (workflows, data processing), and Business (strategy, reports, presentations).",
          },
        },
        {
          "@type": "Question",
          name: "How is a Claude skill different from a ChatGPT Custom GPT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Claude skills are plain Markdown system prompts that work with Claude AI, while Custom GPTs are packaged assistants built on ChatGPT with a custom UI, knowledge files, and optional API actions. Claude skills are simpler, more portable, and require no GPT Builder account — you can use them in any Claude interface immediately.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need a Claude account to use skills?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You need a Claude account at claude.ai to use the skills, but you do NOT need a SkillForge account to browse or download skills. SkillForge is entirely free and open — just find a skill, download it, and use it in your Claude session.",
          },
        },
      ],
    },
  ],
};

const CASE_LABELS = ["CASE A.", "CASE B.", "CASE C.", "CASE D.", "CASE E.", "CASE F."];

async function getFeaturedSkills(): Promise<Skill[]> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data } = await supabase
      .from("skills")
      .select("*, category:categories(id, name, slug, color)")
      .eq("published", true)
      .eq("featured", true)
      .order("download_count", { ascending: false })
      .limit(6);
    if (data && data.length > 0) return data.map(dbSkillToSkill);
  } catch {
    // Supabase not yet configured — render an empty featured section.
  }
  return [];
}

async function getCategories() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("slug, name, color, skill_count, sort_order")
      .order("sort_order");
    if (data && data.length > 0) {
      return data.slice(0, 6).map((cat, i) => ({
        number: String(i + 1).padStart(2, "0"),
        name: cat.name,
        skillCount: cat.skill_count,
        bg: cat.color ?? "#D4E4D4",
        href: `/skills?cat=${cat.name}`,
      }));
    }
  } catch {
    // Supabase not yet configured — render an empty category section.
  }
  return [];
}

const STATS = [
  { value: "940+",  label: "SKILLS" },
  { value: "12K",   label: "DOWNLOADS" },
  { value: "2.4K",  label: "BUILDERS" },
  { value: "100%",  label: "FREE" },
];

export default async function HomePage() {
  const [FEATURED, CATEGORIES] = await Promise.all([getFeaturedSkills(), getCategories()]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
      <Navbar />
      <main>
        {/* ── SECTION 01: HERO ─────────────────────────────────── */}
        <section className="border-b-2 border-text bg-bg">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 md:py-20">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              {/* Left 60% */}
              <div className="flex-[3]">
                <SectionLabel n="01" label="A Free Community Library" className="mb-6" />
                <h1 className="font-display uppercase tracking-editorial leading-[0.92] text-text mb-6" style={{ fontSize: "clamp(40px, 8vw, 96px)" }}>
                  FREE CLAUDE<br />
                  SKILLS.<br />
                  <span style={{ color: "#C8553D" }}>RIGHT HERE.</span>
                </h1>
                <p className="font-dm text-base text-muted leading-relaxed max-w-[480px] mb-10">
                  Discover, share, and deploy Claude AI skills built by the community.
                  From writing to automation — all free, all open, all yours.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/skills"
                    className="font-mono text-[12px] uppercase tracking-widest bg-text text-bg px-6 sm:px-7 py-3.5 sm:py-4 border-2 border-text hover:bg-mustard hover:text-text hover:border-mustard transition-colors duration-100"
                  >
                    Browse Skills →
                  </a>
                  <a
                    href="/submit"
                    className="font-mono text-[12px] uppercase tracking-widest bg-transparent text-text px-6 sm:px-7 py-3.5 sm:py-4 border-2 border-text hover:bg-text hover:text-bg transition-colors duration-100"
                  >
                    Submit Yours
                  </a>
                </div>
              </div>

              {/* Right 40% — code mockup */}
              <div className="flex-[2] w-full border-2 border-text bg-[#1A1A1A] self-center">
                {/* Header bar */}
                <div className="bg-mustard px-4 py-2.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A1A] font-bold">
                    PREVIEW.MD
                  </span>
                  <span className="font-mono text-[10px] text-[#1A1A1A]/60">
                    shopify-rewriter.skill
                  </span>
                </div>
                {/* Code content */}
                <div className="p-4 sm:p-6 font-mono text-xs leading-relaxed">
                  <div><span className="text-mustard"># ROLE</span></div>
                  <div className="text-[#8A857A] mt-1 mb-3">
                    You are a Shopify product copywriter<br />
                    who specializes in high-converting descriptions.
                  </div>
                  <div><span className="text-mustard">## TASK</span></div>
                  <div className="text-[#8A857A] mt-1 mb-3">
                    Rewrite the following product listing<br />
                    to be punchy, benefit-led, and scannable.
                  </div>
                  <div><span className="text-mustard">## FORMAT</span></div>
                  <div className="text-[#8A857A] mt-1">
                    Return: title, 3 bullet benefits, CTA
                  </div>
                  <div className="mt-6 flex justify-end">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-mustard border border-mustard px-3 py-1.5 cursor-pointer hover:bg-mustard hover:text-[#1A1A1A] transition-colors duration-100">
                      DOWNLOAD →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 02: CATEGORY GRID ──────────────────────── */}
        <section className="border-b-2 border-text bg-card">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 md:py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
              <div>
                <SectionLabel n="02" label="Browse By Category" className="mb-4" />
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-editorial leading-none text-text">
                  PICK YOUR<br />POISON.
                </h2>
              </div>
              <a href="/skills" className="font-mono text-[11px] text-muted uppercase tracking-widest hover:text-text hover:underline underline-offset-4 transition-colors duration-100 self-start md:self-end">
                View All →
              </a>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-0 border-l-2 border-t-2 border-text">
              {CATEGORIES.map((cat) => (
                <div key={cat.number} className="border-r-2 border-b-2 border-text">
                  <CategoryCard {...cat} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 03: FEATURED SKILLS ────────────────────── */}
        <section className="border-b-2 border-text bg-bg">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 md:py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-12">
              <div>
                <SectionLabel n="03" label="Featured This Week" className="mb-4" />
                <h2 className="font-display text-3xl sm:text-4xl md:text-5xl uppercase tracking-editorial leading-none text-text">
                  SIX SKILLS<br />WORTH YOUR TIME.
                </h2>
              </div>
              <p className="font-dm text-sm text-muted max-w-xs text-right hidden md:block">
                Handpicked by our team based on downloads, quality, and community votes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l-2 border-t-2 border-text">
              {FEATURED.map((skill, i) => (
                <div key={skill.id} className="border-r-2 border-b-2 border-text">
                  <SkillCard
                    name={skill.name}
                    category={skill.category}
                    downloads={skill.downloads}
                    slug={skill.slug}
                    description={skill.description}
                    caseLabel={CASE_LABELS[i]}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 04: TRY IT BLOCK ───────────────────────── */}
        <section className="border-b-2 border-text" style={{ backgroundColor: "#E8B84A" }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 md:py-20">
            <SectionLabel n="04" label="Build Your Own Skill" className="mb-6 !text-[#1A1A1A]/50" />
            <h2 className="font-display uppercase tracking-editorial leading-none text-[#1A1A1A] mb-2" style={{ fontSize: "clamp(28px, 5vw, 64px)" }}>
              TRY IT. NO SIGNUP.
            </h2>
            <h2 className="font-display uppercase tracking-editorial leading-none mb-10 md:mb-12" style={{ fontSize: "clamp(28px, 5vw, 64px)", color: "#C8553D" }}>
              RIGHT HERE.
            </h2>
            <TryItBuilder />
          </div>
        </section>

        {/* ── SECTION 05: STATS ──────────────────────────────── */}
        <section className="border-b-2 border-text bg-text">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 md:py-20">
            <SectionLabel n="05" label="By The Numbers" className="mb-10 md:mb-12 !text-muted" />
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x-2 divide-mustard border-l-2 border-mustard">
              {STATS.map(({ value, label }) => (
                <div key={label} className="px-4 sm:px-6 lg:px-10 py-5 sm:py-6">
                  <p className="font-display text-3xl sm:text-5xl lg:text-6xl uppercase tracking-editorial text-mustard leading-none mb-2">
                    {value}
                  </p>
                  <p className="font-mono text-[10px] sm:text-[11px] text-bg/50 uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 06: NEWSLETTER ─────────────────────────── */}
        <section className="border-b-2 border-text bg-card">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-16 md:py-24 text-center">
            <SectionLabel n="06" label="Stay In The Loop" className="mb-6" />
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl uppercase tracking-editorial leading-none text-text mb-8 md:mb-10">
              NEW SKILLS<br />EVERY WEEK.
            </h2>
            <div className="mb-6">
              <NewsletterForm />
            </div>
            <p className="font-mono text-[10px] text-muted uppercase tracking-widest">
              JOIN 2,400+ BUILDERS · NO SPAM · UNSUBSCRIBE ANYTIME
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
