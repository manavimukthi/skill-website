"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { BlogPost } from "@/app/api/blog/route";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then(({ data }) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-8 py-16">
        <div className="mb-12">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted border border-border px-2 py-1">
            Blog
          </span>
          <h1 className="font-playfair text-5xl text-text mt-4 mb-3">
            Insights & Guides
          </h1>
          <p className="font-dm text-base text-muted max-w-xl">
            Tutorials, tips, and updates from the TrySkill team to help you get
            the most out of Claude AI skills.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl animate-pulse h-72" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-dm text-muted text-sm">No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-card border-2 border-text rounded-xl overflow-hidden hover:shadow-brutal transition-shadow duration-150 flex flex-col"
              >
                <div
                  className="h-36 w-full flex-shrink-0"
                  style={{ backgroundColor: post.coverBg }}
                />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] uppercase tracking-wider bg-tagBg text-tagText px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-playfair text-lg text-text leading-snug mb-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="font-dm text-sm text-muted leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className="font-dm text-xs text-muted">{post.author}</span>
                    {post.publishedAt && (
                      <span className="font-mono text-[10px] text-muted">
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
