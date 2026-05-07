export default function SkillsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-8">
        <div className="h-8 w-48 bg-border animate-pulse rounded-none" />
        <div className="h-4 w-32 bg-border animate-pulse mt-2 rounded-none" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-2 border-border h-48 animate-pulse bg-card" />
        ))}
      </div>
    </div>
  );
}
