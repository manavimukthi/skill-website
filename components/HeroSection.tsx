"use client";

import { useState } from "react";

export default function HeroSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-24 px-8 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-playfair text-5xl leading-tight text-text mb-4">
          The Best Free Claude Skills
          <br />
          on the Internet
        </h1>
        <p className="font-dm text-base text-muted mb-8">
          Discover, share, and deploy Claude AI skills built by the community.
          From writing to automation — all free, all open.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2 justify-center mb-4"
        >
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="font-dm text-sm border border-border rounded-md px-4 py-2.5 w-64 bg-card focus:outline-none focus:border-accent transition-colors duration-150 placeholder:text-muted"
          />
          <button
            type="submit"
            className="font-dm text-sm font-medium bg-text text-white px-5 py-2.5 rounded-md hover:bg-accentDk transition-colors duration-150"
          >
            Subscribe
          </button>
        </form>

        <p className="font-dm text-xs text-muted">
          Join 2,400+ builders &amp; get weekly skill updates.
        </p>
      </div>
    </section>
  );
}
