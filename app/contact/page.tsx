"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type FormState = "idle" | "loading" | "success" | "error";

const TOPICS = [
  "General Question",
  "Report a Skill",
  "Submit Feedback",
  "Bug Report",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "General Question",
    message: "",
  });
  const [state, setState] = useState<FormState>("idle");

  function set(field: string) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    // Simulate send — replace with your actual email/API integration
    await new Promise((r) => setTimeout(r, 1200));
    setState("success");
  }

  if (state === "success") {
    return (
      <>
        <Navbar />
        <main className="bg-bg min-h-screen flex items-center justify-center px-8">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 border-2 border-text bg-mustard flex items-center justify-center mx-auto mb-6">
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-display text-4xl uppercase tracking-editorial text-text mb-3">
              MESSAGE SENT
            </h2>
            <p className="font-dm text-sm text-muted leading-relaxed mb-8">
              Thanks for reaching out, {form.name}. We&apos;ll get back to you
              at <span className="text-text">{form.email}</span> within 1–2
              business days.
            </p>
            <button
              onClick={() => {
                setForm({ name: "", email: "", topic: "General Question", message: "" });
                setState("idle");
              }}
              className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-6 py-3 border-2 border-text hover:bg-mustard hover:border-mustard hover:text-text transition-colors duration-100"
            >
              Send Another →
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen border-b-2 border-text">
        <div className="max-w-[1200px] mx-auto px-8 py-16 flex flex-col lg:flex-row gap-16">
          {/* Left — info */}
          <div className="lg:w-80 flex-shrink-0">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Get in Touch
            </span>
            <h1 className="font-display text-5xl uppercase tracking-editorial leading-none text-text mt-3 mb-6">
              CONTACT
            </h1>
            <p className="font-dm text-sm text-muted leading-relaxed mb-10">
              Have a question, found a bug, or want to collaborate? We read
              every message and reply within 1–2 business days.
            </p>

            <div className="flex flex-col gap-6">
              {[
                {
                  icon: (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                  label: "Email",
                  value: "hello@tryskill.com",
                },
                {
                  icon: (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  label: "Based in",
                  value: "Remote — Worldwide",
                },
                {
                  icon: (
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  label: "Response time",
                  value: "1–2 business days",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-8 h-8 border-2 border-text flex items-center justify-center flex-shrink-0 text-text">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                      {item.label}
                    </p>
                    <p className="font-dm text-sm text-text mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="flex-1 max-w-xl">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-0 border-2 border-text"
            >
              {/* Name */}
              <div className="border-b-2 border-text">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted px-5 pt-4 pb-1">
                  Your Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Jane Smith"
                  className="w-full px-5 pb-4 bg-transparent font-dm text-sm text-text outline-none placeholder:text-muted/50"
                />
              </div>

              {/* Email */}
              <div className="border-b-2 border-text">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted px-5 pt-4 pb-1">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  className="w-full px-5 pb-4 bg-transparent font-dm text-sm text-text outline-none placeholder:text-muted/50"
                />
              </div>

              {/* Topic */}
              <div className="border-b-2 border-text">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted px-5 pt-4 pb-1">
                  Topic *
                </label>
                <select
                  value={form.topic}
                  onChange={set("topic")}
                  className="w-full px-5 pb-4 bg-transparent font-dm text-sm text-text outline-none cursor-pointer"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="border-b-2 border-text">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted px-5 pt-4 pb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Tell us what's on your mind…"
                  className="w-full px-5 pb-4 bg-transparent font-dm text-sm text-text outline-none placeholder:text-muted/50 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={state === "loading"}
                className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-7 py-4 hover:bg-mustard hover:text-text transition-colors duration-100 disabled:opacity-50 text-left flex items-center gap-3"
              >
                {state === "loading" ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    SENDING…
                  </>
                ) : (
                  "SEND MESSAGE →"
                )}
              </button>
            </form>

            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mt-4">
              For skill submissions use the{" "}
              <a href="/submit" className="text-text hover:underline underline-offset-4">
                Submit page →
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
