"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkillCard from "@/components/SkillCard";
import { dbSkillToSkill, type Skill } from "@/lib/skills";
import type { UserCollection } from "@/lib/user-collections";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/collections").then((r) => r.json()),
      fetch("/api/skills?limit=100").then((r) => r.json()),
    ])
      .then(([colJson, skillsJson]) => {
        if (Array.isArray(colJson.data)) {
          setCollections(colJson.data);
          setAuthRequired(false);
        } else if (colJson?.error === "Authentication required") {
          setAuthRequired(true);
        }
        if (Array.isArray(skillsJson.data)) setSkills(skillsJson.data.map(dbSkillToSkill));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateCollection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nextTitle = title.trim();
    if (!nextTitle || saving) return;

    setSaving(true);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });

      const json = await response.json();

      if (!response.ok) {
        setAuthRequired(response.status === 401);
        setError(json?.error ?? "Failed to create collection");
        return;
      }

      if (json?.data) {
        setCollections((current) => [json.data, ...current]);
        setTitle("");
        setAuthRequired(false);
      }
    } catch {
      setError("Failed to create collection");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="font-playfair text-4xl text-text">Collections</h1>
          <p className="font-dm text-sm text-muted mt-1">
            Your saved skill bundles, visible only to your account.
          </p>
        </div>

        <section className="mb-10 rounded-[32px] border-2 border-text bg-card p-6 shadow-[10px_10px_0_0_rgba(15,23,42,1)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-dm text-xs uppercase tracking-[0.24em] text-muted">New collection</p>
              <h2 className="font-playfair text-2xl text-text mt-2">Create a collection for your own workflow</h2>
              <p className="font-dm text-sm text-muted mt-2">
                Collections are tied to your account, so only you can see what you save here.
              </p>
            </div>
            <form onSubmit={handleCreateCollection} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={authRequired || saving}
                placeholder={authRequired ? "Sign in to create collections" : "Collection title"}
                className="min-h-12 flex-1 rounded-full border-2 border-text bg-bg px-5 font-dm text-sm text-text outline-none transition placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={authRequired || saving || !title.trim()}
                className="min-h-12 rounded-full bg-text px-6 font-dm text-sm font-bold text-bg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create collection"}
              </button>
            </form>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {authRequired ? (
              <Link
                href="/login"
                className="inline-flex min-h-10 items-center rounded-full border-2 border-text bg-accent px-4 font-dm text-sm font-bold text-text transition hover:translate-y-[-1px]"
              >
                Sign in
              </Link>
            ) : null}
            {error ? <p className="font-dm text-sm text-red-600">{error}</p> : null}
          </div>
        </section>

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
          <div className="rounded-[28px] border-2 border-dashed border-border bg-card/60 py-24 text-center">
            <p className="font-dm text-muted">
              {authRequired
                ? "Sign in to see the collections you have saved to your account."
                : "No collections yet. Use the form above to create your first one."}
            </p>
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
                    <p className="font-dm text-sm text-muted mt-0.5">
                      {colSkills.length} {colSkills.length === 1 ? "skill" : "skills"}
                    </p>
                  </div>
                  {colSkills.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  ) : (
                    <div className="rounded-3xl border-2 border-dashed border-border bg-card/60 px-6 py-10 text-center">
                      <p className="font-dm text-sm text-muted">This collection is empty for now.</p>
                    </div>
                  )}
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
