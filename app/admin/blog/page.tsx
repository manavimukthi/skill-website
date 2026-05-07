"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastContext";
import type { BlogPost } from "@/app/api/blog/route";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUSES = ["All", "Published", "Draft"];

export default function AdminBlogPage() {
  const { addToast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then(({ data }) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => addToast("Failed to load posts", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All" || p.status === status;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (!res.ok) {
      addToast("Failed to delete post", "error");
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    addToast(`"${title}" deleted`);
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === "Published" ? "Draft" : "Published";
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      addToast("Failed to update post", "error");
      return;
    }
    const { data } = await res.json();
    if (data) setPosts((prev) => prev.map((p) => (p.id === post.id ? data : p)));
    addToast(newStatus === "Published" ? `"${post.title}" published` : `"${post.title}" set to draft`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl text-text">Blog Posts</h2>
          <p className="font-dm text-sm text-muted mt-0.5">
            {loading ? "Loading…" : `${filtered.length} post${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="font-dm text-sm font-medium bg-accent text-white px-4 py-2.5 rounded-md hover:bg-accentDk transition-colors flex items-center gap-2"
        >
          <span>+</span> New Post
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
            placeholder="Search posts…"
            className="font-dm text-sm w-full border border-border rounded-md pl-9 pr-3 py-2 focus:outline-none focus:border-accent transition-colors placeholder:text-muted bg-card text-text"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="font-dm text-sm border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent transition-colors text-text"
        >
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(search || status !== "All") && (
          <button
            onClick={() => { setSearch(""); setStatus("All"); }}
            className="font-dm text-xs text-muted hover:text-text transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl animate-pulse h-64" />
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="font-dm text-sm text-muted">No posts found.</p>
          <Link href="/admin/blog/new" className="font-dm text-sm text-accent hover:underline mt-2 inline-block">
            Create your first post →
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="font-mono text-[10px] uppercase tracking-wide text-muted text-left px-5 py-3">Title</th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-muted text-left px-4 py-3 hidden md:table-cell">Author</th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-muted text-left px-4 py-3 hidden lg:table-cell">Tags</th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-muted text-left px-4 py-3">Status</th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-muted text-left px-4 py-3 hidden md:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((post, i) => (
                <tr
                  key={post.id}
                  className={`${i !== filtered.length - 1 ? "border-b border-border" : ""} hover:bg-bg/50 transition-colors`}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-dm text-sm font-medium text-text">{post.title}</span>
                    <p className="font-dm text-xs text-muted truncate max-w-[260px] mt-0.5">{post.excerpt}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="font-dm text-sm text-muted">{post.author}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {post.tags.slice(0, 2).map((t) => (
                        <span key={t} className="font-mono text-[9px] uppercase tracking-wide bg-tagBg text-tagText px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        post.status === "Published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-tagBg text-tagText"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="font-mono text-[10px] text-muted">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className="font-dm text-xs text-muted hover:text-accent transition-colors whitespace-nowrap"
                      >
                        {post.status === "Published" ? "Unpublish" : "Publish"}
                      </button>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-dm text-xs text-muted hover:text-text transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="font-dm text-xs text-muted hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
