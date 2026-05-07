"use client";

import { useEffect, useState } from "react";
import type { ActivityItem } from "@/lib/admin-data";

const typeStyles = {
  submission: { dot: "bg-blue-400", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50", label: "Submitted" },
  approval:   { dot: "bg-green-400", badge: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50", label: "Approved" },
  subscriber: { dot: "bg-accent", badge: "bg-tagBg text-tagText border-border", label: "Subscriber" },
  rejection:  { dot: "bg-red-400", badge: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50", label: "Rejected" },
};

export default function ActivityFeed({ items }: { items?: ActivityItem[] }) {
  const [feed, setFeed] = useState<ActivityItem[]>(items ?? []);
  const [loading, setLoading] = useState(!items);

  useEffect(() => {
    if (items) return;
    fetch("/api/admin/activity")
      .then((r) => r.json())
      .then(({ data }) => { if (Array.isArray(data)) setFeed(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [items]);

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <h3 className="font-dm font-semibold text-sm text-text mb-4">Recent Activity</h3>
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="mt-1.5 w-2 h-2 rounded-full bg-border flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-border rounded w-3/4" />
                <div className="h-2 bg-border rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {feed.map((item) => {
            const style = typeStyles[item.type];
            return (
              <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-dm text-xs text-text leading-snug">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${style.badge}`}>
                      {style.label}
                    </span>
                    <span className="font-dm text-[11px] text-muted">{item.timestamp}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
