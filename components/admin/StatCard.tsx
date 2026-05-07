type StatCardProps = {
  label: string;
  value: string;
  change: number;
  changeLabel?: string;
};

export default function StatCard({ label, value, change, changeLabel }: StatCardProps) {
  const positive = change >= 0;
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <p className="font-playfair text-3xl text-text">{value}</p>
      <div className="flex items-center gap-1.5">
        <span
          className={`font-mono text-xs font-medium ${
            positive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
          }`}
        >
          {positive ? "↑" : "↓"} {Math.abs(change)}%
        </span>
        <span className="font-dm text-xs text-muted">
          {changeLabel ?? "vs last month"}
        </span>
      </div>
    </div>
  );
}
