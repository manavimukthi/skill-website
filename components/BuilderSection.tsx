"use client";

import { useState } from "react";

const CATEGORIES = [
  "Writing",
  "Coding",
  "Marketing",
  "Automation",
  "Business",
  "Research",
  "Social Media",
];

export default function BuilderSection() {
  const [category, setCategory] = useState("Writing");
  const [description, setDescription] = useState("");

  return (
    <section className="py-16 px-8 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-xl mx-auto text-center mb-8">
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">
            AI Skill Builder
          </p>
          <h2 className="font-playfair text-3xl text-text mb-3">
            Build Your Own Skill
          </h2>
          <p className="font-dm text-sm text-muted">
            Describe what you want Claude to do and we&apos;ll generate a ready-to-use
            skill you can deploy in seconds.
          </p>
        </div>

        <div className="max-w-lg mx-auto border border-border rounded-xl p-6 bg-card">
          <div className="mb-4">
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 bg-bg focus:outline-none focus:border-accent transition-colors duration-150"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">
              Describe your skill
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Write a cold email for a SaaS product targeting startup founders..."
              rows={4}
              className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 bg-bg focus:outline-none focus:border-accent transition-colors duration-150 placeholder:text-muted resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="font-dm text-sm font-medium border border-border text-text px-4 py-2.5 rounded-md hover:border-accent hover:text-accent transition-colors duration-150">
              Preview
            </button>
            <button className="font-dm text-sm font-medium bg-accent text-white px-5 py-2.5 rounded-md hover:bg-accentDk transition-colors duration-150 flex-1">
              Generate Skill
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
