type Status = "Published" | "Draft" | "Archived" | "Pending" | "Approved" | "Rejected";

const styles: Record<Status, string> = {
  Published: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50",
  Approved:  "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50",
  Draft:     "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50",
  Pending:   "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50",
  Archived:  "bg-gray-100 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700/50",
  Rejected:  "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[status]}`}
    >
      {status}
    </span>
  );
}
