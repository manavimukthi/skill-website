"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch("https://n8n.n8yland.me/webhook/Subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } catch (err) {
      // silently fail
    }
  };

  return done ? (
    <p className="font-mono text-sm text-mustard uppercase tracking-widest">
      ✓ YOU&apos;RE IN. WELCOME TO THE LOOP.
    </p>
  ) : (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-0 border-2 border-text max-w-lg mx-auto"
    >
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="font-dm text-sm flex-1 px-5 py-3.5 bg-card text-text placeholder:text-muted focus:outline-none border-r-0 border-2 border-transparent focus:border-mustard transition-colors duration-100"
      />
      <button
        type="submit"
        className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-6 py-3.5 border-l-2 border-text hover:bg-mustard hover:text-text hover:border-mustard transition-colors duration-100 whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
