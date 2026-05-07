"use client";

const CATEGORIES = [
  "All",
  "Writing",
  "Coding",
  "Marketing",
  "Automation",
  "Business",
  "Research",
  "Social Media",
];

type FilterBarProps = {
  selected: string;
  onChange: (category: string) => void;
};

export default function FilterBar({ selected, onChange }: FilterBarProps) {
  return (
    <div className="sticky top-[72px] z-40 bg-bg border-b border-border overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-2 py-3 px-8 w-max min-w-full">
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`font-mono text-xs whitespace-nowrap px-3.5 py-1.5 rounded-full border transition-all duration-150 ${
                isActive
                  ? "bg-accent text-white border-accent"
                  : "bg-transparent text-muted border-border hover:border-accent hover:text-text"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
