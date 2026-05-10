"use client";

import { useState } from "react";

const CATEGORIES = ["Writing", "Coding", "Marketing", "Research", "Automation", "Business"];
const STYLES = ["Professional", "Casual", "Punchy", "Academic"];
const WEBHOOK_URL = "https://n8n.n8yland.me/webhook/skill";

export default function TryItBuilder() {
  const [category, setCategory] = useState("Writing");
  const [style, setStyle] = useState("Professional");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const submitGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError("");
    setOutput(null);
    setCopied(false);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          style,
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // Try to parse JSON first, otherwise use raw text
      const text = await response.text();
      let resultText = text;
      try {
        const json = JSON.parse(text);
        // Support common n8n response shapes
        resultText =
          json.output ??
          json.result ??
          json.skill ??
          json.content ??
          json.message ??
          JSON.stringify(json, null, 2);
      } catch {
        // raw text is fine
      }

      setOutput(resultText);
    } catch {
      setError("Could not reach the webhook right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitGenerate();
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border-2 border-text bg-card">
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
                type="button"
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
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] text-mustard uppercase tracking-widest">03 OUTPUT</p>
            {output && !loading && (
              <button
                type="button"
                onClick={handleCopy}
                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1 border transition-colors duration-100 ${
                  copied
                    ? "bg-mustard text-text border-mustard"
                    : "bg-transparent text-muted border-text hover:border-mustard hover:text-text"
                }`}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
          </div>

          <div className="bg-bg border-2 border-text p-4 font-mono text-xs text-muted leading-relaxed h-[180px] overflow-y-auto relative">
            {loading ? (
              /* Loading animation */
              <div className="flex flex-col gap-2 animate-pulse">
                <div className="flex items-center gap-2 text-mustard">
                  <span className="inline-block w-2 h-2 rounded-full bg-mustard animate-bounce [animation-delay:0ms]" />
                  <span className="inline-block w-2 h-2 rounded-full bg-mustard animate-bounce [animation-delay:150ms]" />
                  <span className="inline-block w-2 h-2 rounded-full bg-mustard animate-bounce [animation-delay:300ms]" />
                  <span className="ml-1 text-mustard text-[11px] tracking-widest">Generating...</span>
                </div>
                <div className="h-2 bg-muted/20 rounded w-3/4 mt-2" />
                <div className="h-2 bg-muted/20 rounded w-full" />
                <div className="h-2 bg-muted/20 rounded w-5/6" />
                <div className="h-2 bg-muted/20 rounded w-2/3 mt-1" />
                <div className="h-2 bg-muted/20 rounded w-full" />
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap break-words text-text select-none">{output}</pre>
            ) : (
              <span className="text-muted/40">{"// Your generated skill will appear here..."}</span>
            )}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="border-t-2 border-text p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <p className="font-mono text-xs text-muted">100% FREE · NO SIGNUP · INSTANT DEPLOY</p>
          {error ? <p className="font-mono text-[11px] text-[#C8553D] uppercase tracking-widest">{error}</p> : null}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="font-mono text-sm uppercase tracking-widest bg-text text-bg px-8 sm:px-10 py-3.5 sm:py-4 border-2 border-text hover:bg-mustard hover:text-text hover:border-mustard transition-colors duration-100 w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate →"}
        </button>
      </div>
    </form>
  );
}
