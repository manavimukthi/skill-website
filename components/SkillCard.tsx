import Link from "next/link";

type SkillCardProps = {
  id?: string;
  name: string;
  category: string;
  downloads: number;
  slug: string;
  previewBg?: string;
  description?: string;
  caseLabel?: string;
};

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function SkillCard({
  id,
  name,
  category,
  downloads,
  slug,
  // previewBg kept for backward compat with existing callers but not rendered
  description,
  caseLabel,
}: SkillCardProps) {
  // Prefer UUID id for reliable lookup; fall back to slug for backward compat
  const href = `/skills/${id ?? slug}`

  return (
    <Link
      href={href}
      className="card-brutal group block bg-card border-2 border-text flex flex-col"
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
            {category}
          </span>
          {caseLabel && (
            <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
              {caseLabel}
            </span>
          )}
        </div>

        <p className="font-mono text-xs text-muted mb-2">{slug}.md</p>

        <h3 className="font-display text-lg uppercase tracking-tight leading-tight text-text mb-2">
          {name}
        </h3>

        {description && (
          <p className="font-dm text-xs text-muted leading-relaxed line-clamp-2 flex-1">
            {description}
          </p>
        )}
      </div>

      <div className="border-t-2 border-text px-5 py-3 flex items-center justify-between">
        <span className="font-mono text-[10px] text-text uppercase tracking-widest group-hover:text-mustard transition-colors duration-100">
          ↓ SEE EXAMPLE
        </span>
        <span className="font-mono text-[10px] text-muted">
          [{formatDownloads(downloads)} ↓]
        </span>
      </div>
    </Link>
  );
}
