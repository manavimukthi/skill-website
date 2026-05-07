"use client";

import { useState } from "react";
import type { Skill } from "@/lib/types/database";

type Props = {
  skill: Skill;
  initialFavorited?: boolean;
  isLoggedIn: boolean;
};

export default function SkillActions({ skill, initialFavorited = false, isLoggedIn }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favLoading, setFavLoading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/skills/${skill.slug}/download`, { method: "POST" });

      if (!res.ok) {
        const { error } = await res.json();
        alert(error ?? "Download failed");
        return;
      }

      // If the response is a file (no file_url in DB), the API streams the content directly
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("text/markdown") || contentType.includes("text/plain")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = skill.filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const { data } = await res.json();
        if (data?.file_url) {
          window.location.href = data.file_url;
        }
      }
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleFavorite() {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    setFavLoading(true);
    try {
      const method = favorited ? "DELETE" : "POST";
      const res = await fetch(`/api/skills/${skill.slug}/favorite`, { method });
      if (res.ok) setFavorited(!favorited);
    } catch {
      // silent
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-7 py-3.5 border-2 border-text hover:bg-mustard hover:border-mustard hover:text-text transition-colors duration-100 disabled:opacity-50"
      >
        {downloading ? "DOWNLOADING..." : `↓ DOWNLOAD ${skill.filename}`}
      </button>

      <button
        onClick={handleFavorite}
        disabled={favLoading}
        title={isLoggedIn ? (favorited ? "Remove from favorites" : "Add to favorites") : "Log in to favorite"}
        className={`font-mono text-[11px] uppercase tracking-widest px-5 py-3.5 border-2 transition-colors duration-100 disabled:opacity-50 ${
          favorited
            ? "bg-terra border-terra text-bg hover:bg-transparent hover:text-terra"
            : "bg-transparent border-text text-text hover:bg-text hover:text-bg"
        }`}
      >
        {favorited ? "♥ SAVED" : "♡ SAVE"}
      </button>
    </div>
  );
}
