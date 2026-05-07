"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="font-playfair text-4xl text-text mt-8 mb-4">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="font-playfair text-2xl text-text mt-8 mb-3">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="font-dm font-semibold text-lg text-text mt-6 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={key++} className="font-dm text-base text-text leading-relaxed ml-6 list-decimal mb-1">
          {line.replace(/^\d+\. /, "")}
        </li>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={key++} className="font-dm text-base text-text leading-relaxed ml-6 list-disc mb-1">
          {line.slice(2)}
        </li>
      );
    } else if (line.startsWith("*") && line.endsWith("*")) {
      elements.push(
        <p key={key++} className="font-dm text-base text-muted italic leading-relaxed mb-3">
          {line.slice(1, -1)}
        </p>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <p key={key++} className="font-dm text-base text-text leading-relaxed mb-3">
          {line}
        </p>
      );
    }
  }

  return elements;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((json) => {
        if (json?.data) setPost(json.data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <Navbar />
      <main className="max-w-[720px] mx-auto px-8 py-16">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-card border border-border rounded w-3/4" />
            <div className="h-4 bg-card border border-border rounded w-1/2" />
            <div className="h-48 bg-card border border-border rounded mt-8" />
          </div>
        ) : notFound || !post ? (
          <div className="text-center py-24">
            <p className="font-playfair text-2xl text-text mb-3">Post not found</p>
            <p className="font-dm text-sm text-muted mb-8">
              This post may have been removed or the URL is incorrect.
            </p>
            <Link
              href="/blog"
              className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-4 py-2.5 border-2 border-text hover:bg-mustard hover:border-mustard hover:text-text transition-colors"
            >
              Back to Blog
            </Link>
          </div>
        ) : (
          <>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-text transition-colors mb-8"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              All Posts
            </Link>

            <div
              className="h-48 w-full rounded-xl border-2 border-text mb-8"
              style={{ backgroundColor: post.coverBg }}
            />

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] uppercase tracking-wider bg-tagBg text-tagText px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="font-playfair text-4xl text-text leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
              <span className="font-dm text-sm text-muted">{post.author}</span>
              <span className="text-border">·</span>
              {post.publishedAt && (
                <span className="font-mono text-[10px] text-muted">
                  {formatDate(post.publishedAt)}
                </span>
              )}
            </div>

            <article className="prose-blog">{renderContent(post.content)}</article>

            <div className="mt-16 pt-8 border-t border-border">
              <Link
                href="/blog"
                className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-text transition-colors inline-flex items-center gap-1.5"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Blog
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
