"use client";

import { useState } from "react";

const CATEGORIES = ["Writing", "Coding", "Marketing", "Research", "Automation", "Business"];
const STYLES = ["Professional", "Casual", "Punchy", "Academic"];

export default function TryItBuilder() {
  const [category, setCategory] = useState("Writing");
  const [style, setStyle] = useState("Professional");
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState(false);

  return (
    <div className="border-2 border-text bg-card">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-text">
        {/* 01 INPUT */}
        <div className="p-4 sm:p-8">
          <p className="font-mono text-[10px] text-mustard uppercase tracking-widest mb-4">01 INPUT</p>
          <label className="font-mono text-[10px] text-muted uppercase tracking-widest block mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full font-dm text-sm bg-bg text-text border-2 border-text px-3 py-2.5 mb-4 focus:outline-none focus:border-mustard transition-colors duration-100"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <label className="font-mono text-[10px] text-muted uppercase tracking-widest block mb-2">
            Describe Your Skill
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="e.g. Rewrite Shopify product descriptions to be punchy and conversion-focused..."
            className="w-full font-dm text-sm bg-bg text-text border-2 border-text px-3 py-2.5 resize-none focus:outline-none focus:border-mustard placeholder:text-muted transition-colors duration-100"
          />
        </div>

        {/* 02 STYLE */}
        <div className="p-4 sm:p-8">
          <p className="font-mono text-[10px] text-mustard uppercase tracking-widest mb-4">02 STYLE</p>
          <label className="font-mono text-[10px] text-muted uppercase tracking-widest block mb-3">
            Tone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`font-mono text-[11px] uppercase tracking-widest px-3 py-2.5 border-2 transition-colors duration-100 ${
                  style === s
                    ? "bg-mustard text-text border-mustard"
                    : "bg-transparent text-muted border-text hover:border-mustard hover:text-text"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 03 OUTPUT */}
        <div className="p-4 sm:p-8 flex flex-col">
          <p className="font-mono text-[10px] text-mustard uppercase tracking-widest mb-4">03 OUTPUT</p>
          <div className="flex-1 bg-bg border-2 border-text p-4 font-mono text-xs text-muted leading-relaxed min-h-[140px]">
            {generated ? (
              <div>
                <span className="text-mustard"># ROLE{"\n"}</span>
                <span>You are a {style.toLowerCase()} {category.toLowerCase()} specialist...{"\n\n"}</span>
                <span className="text-mustard">## TASK{"\n"}</span>
                <span>{prompt || "Generate high-quality content..."}</span>
              </div>
            ) : (
              <span className="text-muted/40">{"// Your generated skill will appear here..."}</span>
            )}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="border-t-2 border-text p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted text-center sm:text-left">
          100% FREE · NO SIGNUP · INSTANT DEPLOY
        </p>
        <button
          onClick={() => setGenerated(true)}
          className="font-mono text-sm uppercase tracking-widest bg-text text-bg px-8 sm:px-10 py-3.5 sm:py-4 border-2 border-text hover:bg-mustard hover:text-text hover:border-mustard transition-colors duration-100 w-full sm:w-auto"
        >
          Generate →
        </button>
      </div>
    </div>
  );
}
