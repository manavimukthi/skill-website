"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? searchParams.get("redirect") ?? "/";
  const [form, setForm] = useState({ email: "", password: "", username: "", display_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Signup failed");
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

  const fields = [
    { id: "username",     label: "Username",     type: "text",     placeholder: "your-handle",        note: "Lowercase, letters, numbers, - and _ only" },
    { id: "display_name", label: "Display Name", type: "text",     placeholder: "Your Name",          note: "" },
    { id: "email",        label: "Email",        type: "email",    placeholder: "you@example.com",    note: "" },
    { id: "password",     label: "Password",     type: "password", placeholder: "Min 8 characters",   note: "" },
  ] as const;

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen border-b-2 border-text">
        <div className="max-w-[480px] mx-auto px-8 py-24">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
            — JOIN THE COMMUNITY
          </p>
          <h1 className="font-display text-5xl uppercase tracking-editorial leading-none text-text mb-12">
            CREATE<br />ACCOUNT.
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0 border-2 border-text">
            {fields.map(({ id, label, type, placeholder, note }, i) => (
              <div key={id} className={i < fields.length - 1 ? "border-b-2 border-text" : ""}>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted px-5 pt-4 pb-1">
                  {label}
                </label>
                <input
                  type={type}
                  required={id !== "display_name"}
                  value={form[id]}
                  onChange={set(id)}
                  className="w-full px-5 pb-3 bg-transparent font-dm text-sm text-text outline-none placeholder:text-muted/50"
                  placeholder={placeholder}
                />
                {note && (
                  <p className="font-mono text-[9px] text-muted px-5 pb-3 uppercase tracking-wider">
                    {note}
                  </p>
                )}
              </div>
            ))}

            {error && (
              <div className="border-t-2 border-text px-5 py-3 bg-terra/10">
                <p className="font-mono text-[11px] text-terra">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-7 py-4 border-t-2 border-text hover:bg-mustard hover:text-text transition-colors duration-100 disabled:opacity-50 text-left"
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
            </button>
          </form>

          <p className="font-mono text-[10px] text-muted uppercase tracking-widest mt-6">
            HAVE AN ACCOUNT?{" "}
            <Link
              href={`/login${returnTo !== "/" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
              className="text-text hover:underline underline-offset-4"
            >
              SIGN IN →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
