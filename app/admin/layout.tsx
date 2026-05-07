"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import { ToastProvider } from "@/components/admin/ToastContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ThemeToggle from "@/components/ThemeToggle";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { auth, ready } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !auth.isAuthenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [ready, auth.isAuthenticated, pathname, router]);

  // Always render login page immediately — no auth needed
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // While localStorage is being read, show a neutral loading screen
  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-mono text-xs text-muted">Loading…</span>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect is in-flight, show nothing to avoid flash
  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="font-mono text-xs text-muted">Redirecting…</span>
      </div>
    );
  }

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumb = segments.map((seg, i) => {
    const label = seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = i === segments.length - 1;
    return (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <span className="text-border">/</span>}
        <span className={isLast ? "text-text" : "text-muted"}>{label}</span>
      </span>
    );
  });

  const pageTitle =
    segments.length > 1
      ? segments[segments.length - 1].charAt(0).toUpperCase() +
        segments[segments.length - 1].slice(1)
      : "Dashboard";

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      <div className="flex-1 ml-60 flex flex-col">
        <header className="sticky top-0 z-20 bg-card border-b border-border px-10 h-14 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-dm font-semibold text-sm text-text">{pageTitle}</h1>
            <div className="flex items-center gap-1 font-dm text-xs text-muted mt-0.5">
              {breadcrumb}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-7 h-7 rounded-full bg-tagBg flex items-center justify-center">
              <span className="font-mono text-[10px] text-tagText uppercase">
                {(auth.email[0] ?? "A")}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 px-10 py-10">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AdminShell>{children}</AdminShell>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
