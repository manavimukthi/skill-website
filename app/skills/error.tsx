"use client";

export default function SkillsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-8 py-20 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
        — ERROR
      </p>
      <h2 className="font-display text-4xl uppercase tracking-editorial text-text mb-6">
        SOMETHING WENT WRONG.
      </h2>
      <p className="font-dm text-sm text-muted mb-8">{error.message}</p>
      <button
        onClick={reset}
        className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-6 py-3 border-2 border-text hover:bg-mustard hover:border-mustard hover:text-text transition-colors duration-100"
      >
        TRY AGAIN →
      </button>
    </div>
  );
}
