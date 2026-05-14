"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastContext";

type FormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  coverBg: string;
  tags: string;
  status: "Draft" | "Published";
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "TrySkill Team",
      coverBg: "#D6E4F0",
      tags: "",
      status: "Draft",
    },
  });

  const watched = watch();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("title", e.target.value);
    setValue("slug", slugify(e.target.value));
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          author: data.author,
          coverBg: data.coverBg,
          tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
          status: data.status,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        addToast(body?.error || "Failed to save post", "error");
        return;
      }

      addToast(data.status === "Published" ? `"${data.title}" published!` : `"${data.title}" saved as draft`);
      router.push("/admin/blog");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `font-dm text-sm w-full border rounded-md px-3 py-2.5 focus:outline-none transition-colors placeholder:text-muted bg-card text-text ${
      hasError ? "border-red-400 focus:border-red-400" : "border-border focus:border-accent"
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-text">New Blog Post</h2>
          <p className="font-dm text-sm text-muted mt-0.5">Write and publish a new blog post.</p>
        </div>
        <Link href="/admin/blog" className="font-dm text-sm text-muted hover:text-text transition-colors">
          ← Back
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Title *
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                onChange={handleTitleChange}
                placeholder="e.g. Getting Started with Claude Skills"
                className={inputClass(!!errors.title)}
              />
              {errors.title && <p className="font-dm text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Slug *
              </label>
              <input
                {...register("slug", { required: "Slug is required" })}
                placeholder="getting-started-with-claude-skills"
                className={inputClass(!!errors.slug)}
              />
              {errors.slug && <p className="font-dm text-xs text-red-500 mt-1">{errors.slug.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                  Author
                </label>
                <input
                  {...register("author")}
                  placeholder="TrySkill Team"
                  className={inputClass()}
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                  Cover Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...register("coverBg")}
                    className="h-10 w-14 rounded border border-border cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-xs text-muted">{watched.coverBg}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Excerpt *
              </label>
              <textarea
                {...register("excerpt", { required: "Excerpt is required" })}
                rows={2}
                placeholder="A short description shown on the blog listing page."
                className={`${inputClass(!!errors.excerpt)} resize-none`}
              />
              {errors.excerpt && <p className="font-dm text-xs text-red-500 mt-1">{errors.excerpt.message}</p>}
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Content * <span className="normal-case text-[9px]">(Markdown supported: # H1, ## H2, - list, 1. ordered)</span>
              </label>
              <textarea
                {...register("content", { required: "Content is required" })}
                rows={18}
                placeholder="# My Post Title&#10;&#10;Write your content here using Markdown syntax..."
                className={`font-mono text-xs w-full border rounded-md px-3 py-3 focus:outline-none transition-colors placeholder:text-muted resize-none leading-relaxed bg-card text-text ${
                  errors.content ? "border-red-400" : "border-border focus:border-accent"
                }`}
                style={{ minHeight: 360 }}
              />
              {errors.content && <p className="font-dm text-xs text-red-500 mt-1">{errors.content.message}</p>}
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Tags (comma separated)
              </label>
              <input
                {...register("tags")}
                placeholder="tutorial, getting-started, tips"
                className={inputClass()}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted mb-3">Preview</p>
            <div
              className="h-24 w-full rounded-lg border border-border mb-3"
              style={{ backgroundColor: watched.coverBg }}
            />
            <p className="font-playfair text-base text-text leading-snug mb-1">
              {watched.title || "Post Title"}
            </p>
            <p className="font-dm text-xs text-muted leading-relaxed">
              {watched.excerpt || "Excerpt will appear here."}
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <label className="font-dm text-sm text-text flex items-center gap-2 cursor-pointer">
                <input type="radio" value="Draft" {...register("status")} className="accent-accent" />
                Save as Draft
              </label>
              <label className="font-dm text-sm text-text flex items-center gap-2 cursor-pointer mb-3">
                <input type="radio" value="Published" {...register("status")} className="accent-accent" />
                Publish
              </label>

              <button
                type="submit"
                disabled={saving}
                className="font-dm text-sm font-semibold bg-accent text-white py-2.5 rounded-md hover:bg-accentDk disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : watched.status === "Published" ? "Publish Post" : "Save as Draft"}
              </button>

              <Link
                href="/admin/blog"
                className="font-dm text-sm text-center text-muted hover:text-text transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
