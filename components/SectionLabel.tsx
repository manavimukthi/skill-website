type SectionLabelProps = {
  n: string;
  label: string;
  className?: string;
};

export default function SectionLabel({ n, label, className = "" }: SectionLabelProps) {
  return (
    <p className={`font-mono text-xs text-muted uppercase tracking-widest ${className}`}>
      {n} — {label}
    </p>
  );
}
