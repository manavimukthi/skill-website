"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import SkillCard from "@/components/SkillCard";
import { useToast } from "@/components/admin/ToastContext";
import ConfirmModal from "@/components/admin/ConfirmModal";
import type { AdminSkill } from "@/lib/admin-skills";

type FormValues = {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  content: string;
  previewBg: string;
  tags: string;
  status: "Draft" | "Published" | "Archived";
};

type CategoryOption = { id: string; name: string; color?: string | null };

export default function EditSkillPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [skill, setSkill] = useState<AdminSkill | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      slug: "",
      categoryId: "",
      description: "",
      content: "",
      previewBg: "#D6E4F0",
      tags: "",
      status: "Draft",
    },
  });

  useEffect(() => {
    async function load() {
      try {
        const [skillRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/skills/${id}`),
          fetch("/api/categories"),
        ]);

        const skillJson = await skillRes.json();
        const categoriesJson = await categoriesRes.json();

        if (Array.isArray(categoriesJson.data)) {
          setCategories(categoriesJson.data);
        }

        if (skillRes.ok && skillJson.data) {
          setSkill(skillJson.data);
          reset({
            name: skillJson.data.name,
            slug: skillJson.data.slug,
            categoryId: skillJson.data.categoryId ?? "",
            description: skillJson.data.description,
            content: skillJson.data.content,
            previewBg: skillJson.data.previewBg,
            tags: skillJson.data.tags,
            status: skillJson.data.status,
          });
        }
      } catch {
        addToast("Failed to load skill", "error");
      } finally {
        setInitialLoading(false);
      }
    }

    load();
  }, [addToast, id, reset]);

  const watched = watch();
  const selectedCategory = categories.find((category) => category.id === watched.categoryId);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/skills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.name,
          slug: data.slug,
          category_id: data.categoryId,
          description: data.description,
          content: data.content,
          tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
          preview_bg: data.previewBg,
          status: data.status,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        addToast(errorBody?.error || "Failed to update skill", "error");
        return;
      }

      addToast(`"${data.name}" updated successfully`);
      router.push("/admin/skills");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="bg-card border border-border rounded-xl p-6 animate-pulse h-80" />;
  }

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="font-dm text-muted">Skill not found.</p>
        <Link href="/admin/skills" className="font-dm text-sm text-accent">← Back to Skills</Link>
      </div>
    );
  }

  const inputClass = (hasError?: boolean) =>
    `font-dm text-sm w-full border rounded-md px-3 py-2.5 focus:outline-none transition-colors placeholder:text-muted ${
      hasError ? "border-red-400" : "border-border focus:border-accent"
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-text">Edit Skill</h2>
          <p className="font-dm text-sm text-muted mt-0.5 font-mono">{skill.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="font-dm text-sm text-red-500 border border-red-200 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
          <Link href="/admin/skills" className="font-dm text-sm text-muted hover:text-text transition-colors">
            ← Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">Skill Name *</label>
                <input {...register("name", { required: true })} className={inputClass(!!errors.name)} />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">Slug *</label>
                <input {...register("slug", { required: true })} className={inputClass(!!errors.slug)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">Category</label>
                <select {...register("categoryId")} className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 focus:outline-none focus:border-accent bg-card">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">Status</label>
                <select {...register("status")} className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 focus:outline-none focus:border-accent bg-card">
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Archived</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">Preview Color</label>
                <input type="color" {...register("previewBg")} className="h-10 w-full rounded border border-border cursor-pointer p-0.5" />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">Description *</label>
              <textarea {...register("description", { required: true })} rows={2} className={`${inputClass(!!errors.description)} resize-none`} />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">Skill Content *</label>
              <textarea
                {...register("content", { required: true })}
                rows={14}
                className={`font-mono text-xs w-full border rounded-md px-3 py-3 focus:outline-none transition-colors resize-none leading-relaxed ${errors.content ? "border-red-400" : "border-border focus:border-accent"}`}
                style={{ minHeight: 300 }}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">Tags</label>
              <input {...register("tags")} placeholder="writing, seo, content" className={inputClass()} />
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-dm text-xs text-muted">Downloads: <span className="text-text font-semibold">{skill.downloads.toLocaleString()}</span></p>
              <p className="font-dm text-xs text-muted mt-0.5">Created: <span className="text-text">{skill.createdAt}</span></p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="font-dm text-sm font-semibold bg-accent text-white px-6 py-2.5 rounded-md hover:bg-accentDk disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving…</>
              ) : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted mb-3">Live Preview</p>
            <div className="pointer-events-none">
              <SkillCard
                name={watched.name || skill.name}
                category={selectedCategory?.name || skill.category}
                downloads={skill.downloads}
                previewBg={watched.previewBg || skill.previewBg}
                slug={skill.slug}
              />
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Skill"
          message={`Are you sure you want to permanently delete "${skill.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          confirmStyle="danger"
          onConfirm={async () => {
            await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
            addToast(`"${skill.name}" deleted`, "error");
            router.push("/admin/skills");
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </form>
  );
}
