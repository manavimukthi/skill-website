"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkillActions from "@/components/SkillActions";
import type { Skill } from "@/lib/types/database";

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function SkillDetailSkeleton() {
  return (
    <main className="bg-bg min-h-screen">
      <div className="border-b-2 border-text bg-card">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-3 h-9 flex items-center gap-2">
          <div className="h-3 w-48 bg-tagBg rounded animate-pulse" />
        </div>
      </div>
      <section className="border-b-2 border-text">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 md:py-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            <div className="flex-[3] space-y-6">
              <div className="h-4 w-24 bg-tagBg rounded animate-pulse" />
              <div className="h-16 w-3/4 bg-tagBg rounded animate-pulse" />
              <div className="h-4 w-full bg-tagBg rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-tagBg rounded animate-pulse" />
              <div className="flex gap-3">
                <div className="h-12 w-44 bg-tagBg rounded animate-pulse" />
                <div className="h-12 w-24 bg-tagBg rounded animate-pulse" />
              </div>
            </div>
            <div className="flex-[1] min-w-[220px]">
              <div className="border-2 border-border h-48 rounded animate-pulse bg-tagBg" />
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-[1200px] mx-auto px-8 py-16">
        <div className="h-64 bg-tagBg rounded animate-pulse" />
      </section>
    </main>
  );
}

export default function SkillPage() {
  const { slug } = useParams<{ slug: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth state
    async function checkAuth() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        // Primary: fetch by UUID or slug via the dedicated route
        const r = await fetch(`/api/skills/${encodeURIComponent(slug)}`);
        if (r.ok) {
          const json = await r.json();
          if (json?.data) { setSkill(json.data as Skill); return; }
        }

        // Fallback: scan the listing endpoint (works even without service role key)
        const r2 = await fetch(`/api/skills?limit=200`);
        if (r2.ok) {
          const { data } = await r2.json();
          if (Array.isArray(data)) {
            const found = data.find(
              (s: Skill) => s.id === slug || s.slug === slug
            );
            if (found) { setSkill(found as Skill); return; }
          }
        }

        setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  const category = skill?.category as { name: string; slug: string; color: string | null } | null | undefined;
  const author = skill?.author as { username: string; display_name: string | null } | null | undefined;
  const tags: string[] = skill?.tags ?? [];

  return (
    <>
      <Navbar />
      {loading ? (
        <SkillDetailSkeleton />
      ) : notFound || !skill ? (
        <main className="bg-bg min-h-screen flex items-center justify-center">
          <div className="text-center px-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">— 404</p>
            <h2 className="font-display text-5xl uppercase tracking-editorial text-text mb-4">
              SKILL NOT FOUND
            </h2>
            <p className="font-dm text-sm text-muted mb-8 max-w-sm mx-auto">
              This skill may have been removed or the URL is incorrect.
            </p>
            <Link
              href="/skills"
              className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-6 py-3 border-2 border-text hover:bg-mustard hover:border-mustard hover:text-text transition-colors duration-100"
            >
              ← Browse All Skills
            </Link>
          </div>
        </main>
      ) : (
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
                    href={`/skills?cat=${category.name}`}
                    className="hover:text-text transition-colors"
                  >
                    {category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-text">{skill.slug}</span>
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
                        style={{ backgroundColor: category.color ?? undefined }}
                      >
                        {category.name}
                      </span>
                    )}
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 bg-tagBg text-tagText"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="font-mono text-xs text-muted mb-3">{skill.filename}</p>

                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-editorial leading-none text-text mb-6">
                    {skill.title}
                  </h1>

                  <p className="font-dm text-base text-muted leading-relaxed max-w-[540px] mb-10">
                    {skill.description}
                  </p>

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
              Back to all skills
            </Link>
          </div>
        </main>
      )}
      <Footer />
    </>
  );
}
