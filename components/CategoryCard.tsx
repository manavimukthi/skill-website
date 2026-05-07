import Link from "next/link";

type CategoryCardProps = {
  number: string;
  name: string;
  skillCount: number;
  bg: string;
  href: string;
};

export default function CategoryCard({ number, name, skillCount, bg, href }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="card-brutal group block border-2 border-text p-6 flex flex-col justify-between min-h-[180px]"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs text-[#1A1A1A]/50 uppercase tracking-widest">{number}</span>
        <span className="font-mono text-lg text-[#1A1A1A]/30 group-hover:text-[#1A1A1A]/60 transition-colors duration-100">→</span>
      </div>
      <div>
        <h3 className="font-display text-2xl uppercase text-[#1A1A1A] tracking-tight leading-none mb-3">
          {name}
        </h3>
        <p className="font-mono text-[11px] text-[#1A1A1A]/60 uppercase tracking-widest">
          {skillCount} SKILLS
        </p>
      </div>
    </Link>
  );
}
