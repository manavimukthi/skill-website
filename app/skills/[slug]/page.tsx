import { notFound } from "next/navigation";
import { headers } from 'next/headers'
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkillActions from "@/components/SkillActions";
import type { Skill } from "@/lib/types/database";

type Props = { params: { slug: string } };

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

async function fetchSkill(slug: string): Promise<Skill | null> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    // Sanitize: strip whitespace/encoding artifacts
    const clean = slug.trim().replace(/\s+/g, "-");

    const selectClause = "*, category:categories(id, name, slug, color), author:profiles(username, display_name)";

    // 1. Try by slug first (most common case)
    const { data: bySlug } = await supabase
      .from("skills")
      .select(selectClause)
      .eq("slug", clean)
      .eq("published", true)
      .maybeSingle();
    if (bySlug) return bySlug as Skill;

    // 2. If it looks like a UUID, try by id (bypasses slug entirely)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidPattern.test(clean)) {
      const { data: byId } = await supabase
        .from("skills")
        .select(selectClause)
        .eq("id", clean)
        .eq("published", true)
        .maybeSingle();
      if (byId) return byId as Skill;
    }

    return null;
  } catch (err) {
    // Log server-side so the dev server / Vercel logs show the root cause
    // eslint-disable-next-line no-console
    console.error("fetchSkill error for slug:", slug, err);
    return null;
  }
}

async function checkAuth(): Promise<boolean> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('checkAuth error', err);
    return false;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const skill = await fetchSkill(params.slug);
  if (!skill) return { title: "Skill Not Found" };

  const category = skill.category as { name: string } | null | undefined;
  const categoryName = (category as { name?: string })?.name ?? "General";
  const desc = skill.description
    ? skill.description.length > 155
      ? skill.description.slice(0, 152) + "..."
      : skill.description
    : `Download this free Claude ${categoryName} skill from TrySkill.`;

  return {
    title: `${skill.title} — Free Claude ${categoryName} Skill`,
    description: desc,
    alternates: { canonical: `https://www.tryskill.me/skills/${skill.slug}` },
    openGraph: {
      type: "article",
      url: `https://www.tryskill.me/skills/${skill.slug}`,
      title: `${skill.title} | TrySkill`,
      description: desc,
      siteName: "TrySkill",
    },
    twitter: {
      card: "summary",
      title: `${skill.title} | TrySkill`,
      description: desc,
    },
  };
}

export default async function SkillPage({ params }: Props) {
  let [skill, isLoggedIn] = await Promise.all([
    fetchSkill(params.slug),
    checkAuth(),
  ]);

  // Fallback: if direct Supabase lookup failed, try the internal API route.
  if (!skill) {
    try {
      // Build origin from incoming request headers so we match the dev server port
      const h = headers()
      const host = h.get('x-forwarded-host') ?? h.get('host')
      const proto = h.get('x-forwarded-proto') ?? 'http'
      const origin = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'http://localhost:3000')
      const res = await fetch(`${origin}/api/skills/${encodeURIComponent(params.slug)}`)
      if (res.ok) {
        const json = await res.json()
        skill = json?.data ?? null
      } else {
        // eslint-disable-next-line no-console
        console.error('/api/skills fallback responded with', res.status)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('fallback fetch to /api/skills failed', err)
    }
  }

  if (!skill) notFound();

  const category = skill.category as { name: string; slug: string; color: string | null } | null | undefined;
  const author = skill.author as { username: string; display_name: string | null } | null | undefined;
  const tags: string[] = skill.tags ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: skill.title,
        description: skill.description,
        url: `https://www.tryskill.me/skills/${skill.slug}`,
        applicationCategory: "AIApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        downloadUrl: `https://www.tryskill.me/skills/${skill.slug}`,
        datePublished: skill.created_at,
        dateModified: skill.updated_at ?? skill.created_at,
        publisher: { "@type": "Organization", name: "TrySkill", url: "https://www.tryskill.me" },
        ...(author?.username && {
          author: { "@type": "Person", name: author.display_name ?? author.username },
        }),
        keywords: [
          "Claude skill",
          "Claude AI",
          "system prompt",
          (category as { name?: string })?.name,
        ]
          .filter(Boolean)
          .join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home",   item: "https://www.tryskill.me" },
          { "@type": "ListItem", position: 2, name: "Skills", item: "https://www.tryskill.me/skills" },
          ...(category
            ? [{ "@type": "ListItem", position: 3, name: (category as { name?: string }).name, item: `https://www.tryskill.me/skills?cat=${(category as { name?: string }).name}` },
               { "@type": "ListItem", position: 4, name: skill.title, item: `https://www.tryskill.me/skills/${skill.slug}` }]
            : [{ "@type": "ListItem", position: 3, name: skill.title, item: `https://www.tryskill.me/skills/${skill.slug}` }]),
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="bg-bg min-h-screen">
        {/* BREADCRUMB */}
        <div className="border-b-2 border-text bg-card">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            <Link href="/" className="hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/skills" className="hover:text-text transition-colors">Skills</Link>
            <span>/</span>
            {category && (
              <>
                <Link
                  href={`/skills?cat=${(category as { name?: string }).name}`}
                  className="hover:text-text transition-colors"
                >
                  {(category as { name?: string }).name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-text">{skill.title}</span>
          </div>
        </div>

        {/* HEADER */}
        <section className="border-b-2 border-text">
          <div className="max-w-[1200px] mx-auto px-8 py-16">
            <div className="flex flex-col lg:flex-row gap-16">
              {/* Left */}
              <div className="flex-[3]">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {category && (
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 border border-text text-text"
                      style={{ backgroundColor: (category as { color?: string | null }).color ?? undefined }}
                    >
                      {(category as { name?: string }).name}
                    </span>
                  )}
                  {tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/skills?q=${encodeURIComponent(tag)}`}
                      className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 bg-tagBg text-tagText hover:underline"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>

                <p className="font-mono text-xs text-muted mb-3">{skill.filename}</p>

                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-editorial leading-none text-text mb-6">
                  {skill.title}
                </h1>

                <p className="font-dm text-base text-muted leading-relaxed max-w-[540px] mb-6">
                  {skill.description}
                </p>

                {/* HOW TO USE — helps Google extract a featured snippet */}
                <details className="mb-10 border border-border rounded p-4 group">
                  <summary className="font-mono text-[10px] uppercase tracking-widest text-muted cursor-pointer select-none group-open:text-text">
                    How to use this Claude skill ↓
                  </summary>
                  <ol className="mt-4 space-y-2 font-dm text-sm text-muted list-decimal list-inside leading-relaxed">
                    <li>Click <strong className="text-text">Download</strong> below to save the <code>.md</code> file.</li>
                    <li>Open <strong className="text-text">claude.ai</strong> and create a new Project.</li>
                    <li>In Project settings, paste the file content into <strong className="text-text">Custom instructions</strong>.</li>
                    <li>Start a conversation — Claude will now act as the specialist defined by this skill.</li>
                  </ol>
                </details>

                <SkillActions
                  skill={skill}
                  initialFavorited={false}
                  isLoggedIn={isLoggedIn}
                />
              </div>

              {/* Right — metadata panel */}
              <div className="flex-[1] min-w-[220px]">
                <div className="border-2 border-text">
                  <div className="bg-text px-4 py-2.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-bg">
                      STATS
                    </span>
                  </div>
                  <div className="divide-y-2 divide-text">
                    <div className="px-4 py-3">
                      <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">
                        Downloads
                      </p>
                      <p className="font-display text-2xl text-text uppercase">
                        {formatCount(skill.download_count)}
                      </p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">
                        Views
                      </p>
                      <p className="font-display text-2xl text-text uppercase">
                        {formatCount(skill.view_count)}
                      </p>
                    </div>
                    {author && (
                      <div className="px-4 py-3">
                        <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">
                          Author
                        </p>
                        <p className="font-mono text-xs text-text">
                          @{author.username}
                        </p>
                      </div>
                    )}
                    <div className="px-4 py-3">
                      <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">
                        Category
                      </p>
                      <p className="font-mono text-xs text-text">
                        {(category as { name?: string })?.name ?? "General"}
                      </p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">
                        Added
                      </p>
                      <p className="font-mono text-xs text-text">
                        {new Date(skill.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="border-b-2 border-text">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 md:py-16">
            <div className="mb-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                SKILL CONTENT
              </span>
            </div>

            <div className="border-2 border-text bg-[#1A1A1A] w-full">
              <div className="bg-mustard px-4 py-2.5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#1A1A1A] font-bold">
                  {skill.filename}
                </span>
                <span className="font-mono text-[10px] text-[#1A1A1A]/60">
                  {skill.file_size_bytes
                    ? `${(skill.file_size_bytes / 1024).toFixed(1)} KB`
                    : `${new Blob([skill.content]).size} B`}
                </span>
              </div>
              <pre className="p-6 font-mono text-xs leading-relaxed text-[#8A857A] overflow-x-auto whitespace-pre-wrap">
                {skill.content}
              </pre>
            </div>
          </div>
        </section>

        {/* BACK LINK */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
          <Link
            href="/skills"
            className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-text transition-colors inline-flex items-center gap-2"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Browse all Claude skills
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
