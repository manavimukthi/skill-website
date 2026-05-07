export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655m0 0l3.122-1.725c.501-.277.998-.557 1.498-.834M19.5 4.5l-1.75 1.75M4.5 19.5l1.75-1.75M12 3v1.5M3 12h1.5M20.25 12H21M12 20.25V21"
            />
          </svg>
        </div>
        <h1 className="font-playfair text-3xl text-text mb-3">Under Maintenance</h1>
        <p className="font-dm text-sm text-muted leading-relaxed">
          We&apos;re making some improvements. We&apos;ll be back shortly — thanks for your patience.
        </p>
      </div>
    </div>
  );
}
