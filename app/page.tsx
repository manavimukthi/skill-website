import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionLabel from "@/components/SectionLabel";
import CategoryCard from "@/components/CategoryCard";
import SkillCard from "@/components/SkillCard";
import NewsletterForm from "@/components/NewsletterForm";
import TryItBuilder from "@/components/TryItBuilder";
import { dbSkillToSkill, type Skill } from "@/lib/skills";

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
