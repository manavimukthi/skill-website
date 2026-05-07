"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import SkillCard from "@/components/SkillCard";
import { useToast } from "@/components/admin/ToastContext";

type CategoryOption = { id: string; name: string; color?: string | null };

type FormValues = {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  content: string;
  previewBg: string;
  tags: string;
  status: "Draft" | "Published";
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function NewSkillPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const watched = watch();
  const selectedCategoryId = watch("categoryId");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (!selectedCategoryId && data[0]?.id) {
            setValue("categoryId", data[0].id);
            setValue("previewBg", data[0].color ?? "#D6E4F0");
          }
        }
      })
      .catch(() => addToast("Failed to load categories", "error"))
      .finally(() => setCategoryLoading(false));
  }, [addToast, selectedCategoryId, setValue]);

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("name", e.target.value);
    setValue("slug", slugify(e.target.value));
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.name,
          slug: data.slug,
          description: data.description,
          content: data.content,
          category_id: data.categoryId,
          tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
          preview_bg: data.previewBg,
          featured: false,
          status: data.status,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        addToast(errorBody?.error || "Failed to save skill", "error");
        return;
      }

      addToast(data.status === "Published" ? `"${data.name}" published!` : `"${data.name}" saved as draft`);
      router.push("/admin/skills");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `font-dm text-sm w-full border rounded-md px-3 py-2.5 focus:outline-none transition-colors placeholder:text-muted ${
      hasError ? "border-red-400 focus:border-red-400" : "border-border focus:border-accent"
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl text-text">Add New Skill</h2>
          <p className="font-dm text-sm text-muted mt-0.5">Fill in the details below to publish a skill.</p>
        </div>
        <Link href="/admin/skills" className="font-dm text-sm text-muted hover:text-text transition-colors">
          ← Back
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Skill Name *
              </label>
              <input
                {...register("name", { required: "Skill name is required" })}
                onChange={handleNameChange}
                placeholder="e.g. Cold Email Generator"
                className={inputClass(!!errors.name)}
              />
              {errors.name && <p className="font-dm text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Slug *
              </label>
              <input
                {...register("slug", { required: "Slug is required" })}
                placeholder="cold-email-generator"
                className={inputClass(!!errors.slug)}
              />
              {errors.slug && <p className="font-dm text-xs text-red-500 mt-1">{errors.slug.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                  Category *
                </label>
                <select
                  {...register("categoryId")}
                  className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 focus:outline-none focus:border-accent transition-colors bg-card"
                  disabled={categoryLoading}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                  Preview Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...register("previewBg")}
                    className="h-10 w-14 rounded border border-border cursor-pointer p-0.5"
                  />
                  <span className="font-mono text-xs text-muted">{watched.previewBg}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Short Description *
              </label>
              <textarea
                {...register("description", { required: "Description is required" })}
                rows={2}
                placeholder="One or two sentences describing what this skill does."
                className={`${inputClass(!!errors.description)} resize-none`}
              />
              {errors.description && <p className="font-dm text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Skill Content *
              </label>
              <textarea
                {...register("content", { required: "Skill content is required" })}
                rows={12}
                placeholder="You are a professional... Paste the full skill prompt here."
                className={`font-mono text-xs w-full border rounded-md px-3 py-3 focus:outline-none transition-colors placeholder:text-muted resize-none leading-relaxed ${
                  errors.content ? "border-red-400" : "border-border focus:border-accent"
                }`}
                style={{ minHeight: 300 }}
              />
              {errors.content && <p className="font-dm text-xs text-red-500 mt-1">{errors.content.message}</p>}
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Tags (comma separated)
              </label>
              <input
                {...register("tags")}
                placeholder="writing, seo, content"
                className={inputClass()}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted mb-3">Preview</p>
            <div className="pointer-events-none">
              <SkillCard
                name={watched.name || "Skill Name"}
                category={selectedCategory?.name || "Writing"}
                downloads={0}
                previewBg={watched.previewBg}
                slug=""
              />
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 mb-1">
                <label className="font-dm text-sm text-text flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Draft"
                    {...register("status")}
                    className="accent-accent"
                  />
                  Save as Draft
                </label>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <label className="font-dm text-sm text-text flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="Published"
                    {...register("status")}
                    className="accent-accent"
                  />
                  Publish
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="font-dm text-sm font-semibold bg-accent text-white py-2.5 rounded-md hover:bg-accentDk disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : watched.status === "Published" ? (
                  "Publish Skill"
                ) : (
                  "Save as Draft"
                )}
              </button>

              <Link
                href="/admin/skills"
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
