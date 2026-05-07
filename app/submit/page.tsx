"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = [
  "Writing",
  "Coding",
  "Marketing",
  "Automation",
  "Business",
  "Research",
  "Social Media",
];

export default function SubmitPage() {
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Writing",
    description: "",
    promptContent: "",
    authorName: "",
    authorEmail: "",
    github: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // submit via API
    (async () => {
      try {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submitterName: form.authorName,
            submitterEmail: form.authorEmail,
            skillName: form.name,
            category: form.category,
            description: form.description,
            content: form.promptContent,
            github: form.github,
          }),
        });

        if (res.status === 401) {
          // require signup/login
          router.push(`/signup?returnTo=/submit`);
          return;
        }

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          alert(body?.error || "Failed to submit");
          return;
        }

        setSubmitted(true);
      } catch (err) {
        console.error(err);
        alert("Failed to submit");
      }
    })();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!mounted) return;
        if (res.ok) {
          const json = await res.json();
          const user = json?.data?.user;
          const profile = json?.data?.profile;
          setIsAuth(true);
          setForm((prev) => ({
            ...prev,
            authorName: prev.authorName || profile?.name || user?.email?.split("@")[0] || "",
            authorEmail: prev.authorEmail || user?.email || "",
          }));
        } else {
          setIsAuth(false);
        }
      } catch (err) {
        setIsAuth(false);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-12 h-12 bg-tagBg rounded-full flex items-center justify-center mx-auto mb-5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A37764"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-playfair text-3xl text-text mb-3">
              Skill Submitted!
            </h1>
            <p className="font-dm text-sm text-muted">
              Thanks for contributing. We&apos;ll review your skill and publish it
              within 24 hours.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 md:py-12">
        <div className="max-w-xl mx-auto">
          <div className="mb-10">
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
              Contribute
            </p>
            <h1 className="font-playfair text-4xl text-text mb-2">
              Submit a Skill
            </h1>
            <p className="font-dm text-sm text-muted">
              Share your Claude skill with 2,400+ builders. All skills are free
              and open.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">
                Skill Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Cold Email Generator"
                className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 bg-card focus:outline-none focus:border-accent transition-colors duration-150 placeholder:text-muted"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 bg-card focus:outline-none focus:border-accent transition-colors duration-150"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">
                Short Description *
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                placeholder="One sentence describing what this skill does"
                className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 bg-card focus:outline-none focus:border-accent transition-colors duration-150 placeholder:text-muted"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">
                Prompt / Skill Content *
              </label>
              <textarea
                name="promptContent"
                value={form.promptContent}
                onChange={handleChange}
                required
                placeholder="Paste the full system prompt or skill instructions here..."
                rows={6}
                className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 bg-card focus:outline-none focus:border-accent transition-colors duration-150 placeholder:text-muted resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">
                  Your Name
                </label>
                <input
                  name="authorName"
                  value={form.authorName}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 bg-card focus:outline-none focus:border-accent transition-colors duration-150 placeholder:text-muted"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">
                  Email
                </label>
                <input
                  name="authorEmail"
                  value={form.authorEmail}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@example.com"
                  className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 bg-card focus:outline-none focus:border-accent transition-colors duration-150 placeholder:text-muted"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-wide block mb-1.5">
                GitHub URL (optional)
              </label>
              <input
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="https://github.com/yourname/skill-repo"
                className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 bg-card focus:outline-none focus:border-accent transition-colors duration-150 placeholder:text-muted"
              />
            </div>

            <div className="pt-2">
              {!authLoading && !isAuth ? (
                <div className="text-center">
                  <p className="font-dm text-sm text-muted mb-3">You must be signed in to submit a skill.</p>
                  <div className="flex gap-3 justify-center">
                    <a href="/login?returnTo=/submit" className="font-dm text-sm font-semibold border px-4 py-2 rounded-md">Log in</a>
                    <a href="/signup?returnTo=/submit" className="font-dm text-sm font-semibold bg-accent text-white px-4 py-2 rounded-md">Sign up</a>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="submit"
                    className="font-dm text-sm font-semibold bg-accent text-white w-full py-3 rounded-md hover:bg-accentDk transition-colors duration-150"
                  >
                    Submit Skill
                  </button>
                  <p className="font-dm text-xs text-muted text-center mt-3">
                    By submitting, you agree to share this skill freely under CC0.
                  </p>
                </>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
