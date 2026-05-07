"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminSkill } from "@/lib/admin-data";
import StatusBadge from "./StatusBadge";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./ToastContext";

type SortKey = keyof Pick<AdminSkill, "name" | "category" | "downloads" | "status" | "createdAt">;

type Props = {
  skills: AdminSkill[];
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
};

export default function SkillsTable({ skills, onDelete, onArchive }: Props) {
  const { addToast } = useToast();
  const [sortKey, setSortKey] = useState<SortKey>("downloads");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ type: "delete" | "archive"; id: string | null } | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const sorted = [...skills].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((s) => s.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    setSelected(next);
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <span className="text-accent">{sortDir === "asc" ? " ↑" : " ↓"}</span>
    ) : (
      <span className="text-border"> ↕</span>
    );

  const thClass = "font-mono text-[10px] uppercase tracking-wider text-muted px-3 py-3 text-left cursor-pointer select-none whitespace-nowrap hover:text-text transition-colors";

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 bg-tagBg border border-border rounded-lg px-4 py-2.5">
          <span className="font-mono text-xs text-muted">{selected.size} selected</span>
          <button
            onClick={() => { selected.forEach((id) => onArchive?.(id)); setSelected(new Set()); addToast(`${selected.size} skills archived`); }}
            className="font-dm text-xs text-text border border-border px-3 py-1.5 rounded hover:border-accent hover:text-accent transition-colors"
          >
            Archive
          </button>
          <button
            onClick={() => { selected.forEach((id) => onDelete?.(id)); setSelected(new Set()); addToast(`${selected.size} skills deleted`, "error"); }}
            className="font-dm text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="font-dm text-xs text-muted ml-auto hover:text-text">
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto border border-border rounded-xl bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg">
            <tr>
              <th className="px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selected.size === paged.length && paged.length > 0}
                  onChange={toggleAll}
                  className="accent-accent"
                />
              </th>
              <th className={thClass} onClick={() => toggleSort("name")}>
                Skill Name <SortIcon col="name" />
              </th>
              <th className={thClass} onClick={() => toggleSort("category")}>
                Category <SortIcon col="category" />
              </th>
              <th className={thClass} onClick={() => toggleSort("downloads")}>
                Downloads <SortIcon col="downloads" />
              </th>
              <th className={thClass} onClick={() => toggleSort("status")}>
                Status <SortIcon col="status" />
              </th>
              <th className={thClass} onClick={() => toggleSort("createdAt")}>
                Created <SortIcon col="createdAt" />
              </th>
              <th className="font-mono text-[10px] uppercase tracking-wider text-muted px-3 py-3 text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map((skill) => (
              <tr key={skill.id} className="hover:bg-bg/60 transition-colors group">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(skill.id)}
                    onChange={() => toggleOne(skill.id)}
                    className="accent-accent"
                  />
                </td>
                <td className="px-3 py-3">
                  <div>
                    <p className="font-dm text-sm font-medium text-text">{skill.name}</p>
                    <p className="font-mono text-[10px] text-muted">{skill.slug}</p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-wide bg-tagBg text-tagText px-2 py-0.5 rounded">
                    {skill.category}
                  </span>
                </td>
                <td className="px-3 py-3 font-dm text-sm text-text">
                  {skill.downloads.toLocaleString()}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge status={skill.status} />
                </td>
                <td className="px-3 py-3 font-dm text-xs text-muted">{skill.createdAt}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/skills/${skill.id}`}
                      className="p-1.5 text-muted hover:text-accent rounded transition-colors"
                      title="Edit"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => setConfirm({ type: "archive", id: skill.id })}
                      className="p-1.5 text-muted hover:text-yellow-600 rounded transition-colors"
                      title="Archive"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="21 8 21 21 3 21 3 8" />
                        <rect x="1" y="3" width="22" height="5" />
                        <line x1="10" y1="12" x2="14" y2="12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setConfirm({ type: "delete", id: skill.id })}
                      className="p-1.5 text-muted hover:text-red-500 rounded transition-colors"
                      title="Delete"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="font-dm text-xs px-3 py-1.5 border border-border rounded hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`font-dm text-xs w-8 h-8 rounded border transition-colors ${
                p === page ? "bg-accent text-white border-accent" : "border-border hover:border-accent"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="font-dm text-xs px-3 py-1.5 border border-border rounded hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.type === "delete" ? "Delete Skill" : "Archive Skill"}
          message={
            confirm.type === "delete"
              ? "This action cannot be undone. The skill will be permanently removed."
              : "The skill will be hidden from the public library."
          }
          confirmLabel={confirm.type === "delete" ? "Delete" : "Archive"}
          confirmStyle={confirm.type === "delete" ? "danger" : "accent"}
          onConfirm={() => {
            if (confirm.type === "delete") { onDelete?.(confirm.id!); addToast("Skill deleted", "error"); }
            else { onArchive?.(confirm.id!); addToast("Skill archived"); }
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
