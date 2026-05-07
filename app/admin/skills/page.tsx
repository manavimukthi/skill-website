"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { AdminSkill } from "@/lib/admin-skills";
import SkillsTable from "@/components/admin/SkillsTable";
import { useToast } from "@/components/admin/ToastContext";

const CATEGORIES = ["All", "Writing", "Coding", "Marketing", "Automation", "Business", "Research", "Social Media"];
const STATUSES = ["All", "Published", "Draft", "Archived"];

export default function AdminSkillsPage() {
  const { addToast } = useToast();
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    fetch("/api/admin/skills")
      .then((r) => r.json())
      .then(({ data }) => {
        if (Array.isArray(data)) setSkills(data);
      })
      .catch(() => addToast("Failed to load skills", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = skills.filter((s) => {
    const matchName = s.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || s.category === category;
    const matchStatus = status === "All" || s.status === status;
    return matchName && matchCat && matchStatus;
  });

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    if (!res.ok) {
      addToast("Failed to delete skill", "error");
      return;
    }
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  const handleArchive = async (id: string) => {
    const res = await fetch(`/api/admin/skills/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Draft" }),
    });

    if (!res.ok) {
      addToast("Failed to archive skill", "error");
      return;
    }

    const { data } = await res.json();
    if (data) {
      setSkills((prev) => prev.map((s) => (s.id === id ? data : s)));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl text-text">All Skills</h2>
          <p className="font-dm text-sm text-muted mt-0.5">{loading ? "Loading…" : `${filtered.length} skills`}</p>
        </div>
        <Link
          href="/admin/skills/new"
          className="font-dm text-sm font-medium bg-accent text-white px-4 py-2.5 rounded-md hover:bg-accentDk transition-colors flex items-center gap-2"
        >
          <span>+</span> Add New Skill
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills…"
            className="font-dm text-sm w-full border border-border rounded-md pl-9 pr-3 py-2 focus:outline-none focus:border-accent transition-colors placeholder:text-muted bg-card text-text"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="font-dm text-sm border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent transition-colors text-text"
        >
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="font-dm text-sm border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent transition-colors text-text"
        >
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        {(search || category !== "All" || status !== "All") && (
          <button
            onClick={() => { setSearch(""); setCategory("All"); setStatus("All"); }}
            className="font-dm text-xs text-muted hover:text-text transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl animate-pulse h-64" />
      ) : (
        <SkillsTable skills={filtered} onDelete={handleDelete} onArchive={handleArchive} />
      )}
    </div>
  );
}
