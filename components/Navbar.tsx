"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

function useSupabaseUser() {
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;
    let done = false;

    // Ensure we never leave the navbar in an infinite loading state.
    const timeout = setTimeout(() => {
      if (!done) setReady(true);
    }, 4000);

    async function init() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();
          setUsername(profile?.username ?? user.email?.split("@")[0] ?? null);
        }
        done = true;
        setReady(true);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_, session) => {
            if (session?.user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", session.user.id)
                .single();
              setUsername(profile?.username ?? session.user.email?.split("@")[0] ?? null);
            } else {
              setUsername(null);
            }
          }
        );
        sub = subscription;
      } catch {
        done = true;
        setReady(true);
      }
    }

    init();
    return () => {
      clearTimeout(timeout);
      sub?.unsubscribe();
    };
  }, []);

  return { username, ready };
}

const NAV_LINKS = ["Skills", "Collections", "Blog", "Submit"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { username, ready } = useSupabaseUser();
  const pathname = usePathname();
  const signInHref = ["/login", "/signup"].includes(pathname)
    ? "/login"
    : `/login?returnTo=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <nav
      className={`sticky top-0 z-50 bg-card border-b-2 border-text transition-shadow duration-100 ${
        scrolled ? "shadow-[0_2px_0_rgb(var(--color-text))]" : ""
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-[64px] md:h-[72px] flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center" onClick={() => setMobileMenuOpen(false)}>
          <Logo height={40} />
        </Link>

        {/* Center nav — desktop only */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="font-mono text-[11px] text-muted hover:text-text uppercase tracking-widest transition-colors duration-100 hover:underline underline-offset-4"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button
            aria-label="Search"
            className="p-2 text-muted hover:text-text transition-colors duration-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Auth area — desktop only */}
          <div className="hidden md:flex items-center">
            {ready && username ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-4 py-2.5 border-2 border-text hover:bg-mustard hover:border-mustard hover:text-text transition-colors duration-100 flex items-center gap-2"
                >
                  <span className="w-4 h-4 bg-mustard text-text flex items-center justify-center text-[9px] font-bold leading-none border border-text/20">
                    {username[0].toUpperCase()}
                  </span>
                  {username}
                  <span className="text-[8px]">▾</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-0 w-44 bg-card border-2 border-text shadow-brutal z-50">
                    <Link
                      href="/submit"
                      onClick={() => setDropdownOpen(false)}
                      className="block font-mono text-[10px] uppercase tracking-widest px-4 py-3 text-muted hover:text-text hover:bg-bg border-b border-border transition-colors"
                    >
                      Submit a Skill
                    </Link>
                    <Link
                      href="/skills"
                      onClick={() => setDropdownOpen(false)}
                      className="block font-mono text-[10px] uppercase tracking-widest px-4 py-3 text-muted hover:text-text hover:bg-bg border-b border-border transition-colors"
                    >
                      Browse Skills
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left font-mono text-[10px] uppercase tracking-widest px-4 py-3 text-terra hover:bg-terra/10 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : ready ? (
              <Link
                href={signInHref}
                className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-4 py-2.5 border-2 border-text hover:bg-mustard hover:border-mustard hover:text-text transition-colors duration-100"
              >
                Sign In
              </Link>
            ) : (
              <div className="w-[80px] h-[40px] border-2 border-border animate-pulse bg-card" />
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 text-text border-2 border-text hover:bg-text hover:text-bg transition-colors duration-100"
          >
            {mobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-text bg-card">
          <div className="px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="font-mono text-[12px] text-text uppercase tracking-widest px-3 py-3 border-b border-border hover:bg-bg transition-colors duration-100"
              >
                {item}
              </Link>
            ))}
            <div className="pt-3">
              {ready && username ? (
                <div className="flex flex-col gap-2">
                  <div className="font-mono text-[11px] text-muted uppercase tracking-widest px-3 py-2 flex items-center gap-2">
                    <span className="w-5 h-5 bg-mustard text-text flex items-center justify-center text-[9px] font-bold leading-none border border-text/20">
                      {username[0].toUpperCase()}
                    </span>
                    {username}
                  </div>
                  <Link
                    href="/skills"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-mono text-[11px] uppercase tracking-widest bg-transparent text-text px-4 py-3 border-2 border-text text-center hover:bg-text hover:text-bg transition-colors duration-100"
                  >
                    Browse Skills
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="font-mono text-[11px] uppercase tracking-widest text-terra px-4 py-3 border-2 border-terra text-center hover:bg-terra hover:text-bg transition-colors duration-100"
                  >
                    Log Out
                  </button>
                </div>
              ) : ready ? (
                <Link
                  href={signInHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-mono text-[12px] uppercase tracking-widest bg-text text-bg px-4 py-3 border-2 border-text text-center hover:bg-mustard hover:border-mustard hover:text-text transition-colors duration-100"
                >
                  Sign In
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
