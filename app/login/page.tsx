"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? searchParams.get("redirect") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Login failed");
        return;
      }

      router.push(returnTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen border-b-2 border-text">
        <div className="max-w-[480px] mx-auto px-8 py-24">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
            — ACCOUNT ACCESS
          </p>
          <h1 className="font-display text-5xl uppercase tracking-editorial leading-none text-text mb-12">
            SIGN IN.
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0 border-2 border-text">
            {/* Email */}
            <div className="border-b-2 border-text">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted px-5 pt-4 pb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 pb-4 bg-transparent font-dm text-sm text-text outline-none placeholder:text-muted/50"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="border-b-2 border-text">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted px-5 pt-4 pb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 pb-4 bg-transparent font-dm text-sm text-text outline-none placeholder:text-muted/50"
                placeholder="••••••••"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="border-b-2 border-text px-5 py-3 bg-terra/10">
                <p className="font-mono text-[11px] text-terra">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-7 py-4 hover:bg-mustard hover:text-text hover:border-mustard transition-colors duration-100 disabled:opacity-50 text-left"
            >
              {loading ? "SIGNING IN..." : "SIGN IN →"}
            </button>
          </form>

          <p className="font-mono text-[10px] text-muted uppercase tracking-widest mt-6">
            NO ACCOUNT?{" "}
            <Link
              href={`/signup${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
              className="text-text hover:underline underline-offset-4"
            >
              SIGN UP FREE →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
