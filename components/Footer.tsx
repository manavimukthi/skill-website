"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme";

const COLS = [
  {
    heading: "PRODUCT",
    links: [
      { label: "Browse Skills", href: "/skills" },
      { label: "Submit a Skill", href: "/submit" },
      { label: "Build a Skill", href: "/docs" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    heading: "CATEGORIES",
    links: [
      { label: "Writing Skills", href: "/skills?cat=Writing" },
      { label: "Coding Skills", href: "/skills?cat=Coding" },
      { label: "Marketing Skills", href: "/skills?cat=Marketing" },
      { label: "Research Skills", href: "/skills?cat=Research" },
      { label: "Automation Skills", href: "/skills?cat=Automation" },
      { label: "Business Skills", href: "/skills?cat=Business" },
    ],
  },
  {
    heading: "RESOURCES",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "COMMUNITY",
    links: [
      { label: "Reddit", href: "https://www.reddit.com/r/TrySkill/s/ZUEwO2m56f" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className="bg-text text-bg">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-12 md:pt-16 pb-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 pb-12 md:pb-16">
          {/* Brand column — full-width on mobile */}
          <div className="col-span-2 md:col-span-1" aria-label="SkillForge brand">
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isDark ? "/logo-light.svg" : "/logo-dark.svg"}
                alt="SkillForge"
                style={{ height: 36, width: "auto", display: "block" }}
              />
            </div>
            <p className="font-dm text-sm text-bg/60 leading-relaxed max-w-[200px]">
              The best free Claude AI skills, built by the community.
            </p>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.heading}>
              <p className="font-mono text-[10px] text-mustard uppercase tracking-widest mb-5">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-dm text-sm text-bg/70 hover:text-bg hover:underline underline-offset-4 transition-colors duration-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="border-t border-mustard py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-bg/50 uppercase tracking-widest">
            © 2026 SKILLFORGE · ALL RIGHTS RESERVED
          </p>
          <p className="font-mono text-[11px] text-bg/50 uppercase tracking-widest flex items-center gap-2">
            V1.0.0 · STATUS: ALL SYSTEMS GO
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
