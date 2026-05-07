"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-8">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">
        — ERROR
      </p>
      <h1 className="font-display text-5xl uppercase tracking-editorial text-text mb-6">
        SOMETHING<br />BROKE.
      </h1>
      <p className="font-dm text-sm text-muted mb-8 max-w-sm text-center">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="font-mono text-[11px] uppercase tracking-widest bg-text text-bg px-6 py-3 border-2 border-text hover:bg-mustard hover:border-mustard hover:text-text transition-colors duration-100"
      >
        TRY AGAIN →
      </button>
    </div>
  );
}
