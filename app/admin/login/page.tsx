"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@tryskill.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      router.replace("/admin");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl text-text mb-1">TrySkill</h1>
          <p className="font-mono text-xs text-muted uppercase tracking-widest">Admin Panel</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-7 flex flex-col gap-4"
        >
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="admin123"
              className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 focus:outline-none focus:border-accent transition-colors placeholder:text-muted"
            />
          </div>

          {error && (
            <p className="font-dm text-xs text-red-500 bg-red-50 border border-red-100 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-dm text-sm font-semibold bg-accent text-white py-2.5 rounded-md hover:bg-accentDk disabled:opacity-60 transition-colors mt-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="font-dm text-xs text-center text-muted mt-1">
            Hint: password is <span className="font-mono">admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
