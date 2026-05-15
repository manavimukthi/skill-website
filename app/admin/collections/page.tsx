"use client";

import { useState, useEffect } from "react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/ToastContext";
import type { AdminSkill } from "@/lib/admin-skills";

type AdminCollection = { id: string; title: string; skillIds: string[] };

export default function AdminCollectionsPage() {
  const { addToast } = useToast();
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminCollection | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/admin/collections"), fetch("/api/admin/skills")])
      .then(async ([collectionsRes, skillsRes]) => {
        const collectionsJson = await collectionsRes.json();
        const skillsJson = await skillsRes.json();

        if (Array.isArray(collectionsJson.data)) setCollections(collectionsJson.data);
        if (Array.isArray(skillsJson.data)) setSkills(skillsJson.data);
      })
      .catch(() => addToast("Failed to load collections", "error"))
      .finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setEditing({ id: "", title: "", skillIds: [] });
    setIsNew(true);
  };

  const openEdit = (col: AdminCollection) => {
    setEditing({ ...col, skillIds: [...col.skillIds] });
    setIsNew(false);
  };

  const save = async () => {
    if (!editing || !editing.title.trim()) return;
    setIsSaving(true);
    try {
      if (isNew) {
        const res = await fetch("/api/admin/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editing.title, skillIds: editing.skillIds }),
        });
        if (!res.ok) {
          addToast("Failed to create collection", "error");
          return;
        }
        const json = await res.json();
        setCollections((prev) => [...prev, json.data]);
        addToast(`Collection "${editing.title}" created`);
      } else {
        const res = await fetch(`/api/admin/collections/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editing.title, skillIds: editing.skillIds }),
        });
        if (!res.ok) {
          addToast("Failed to update collection", "error");
          return;
        }
        const json = await res.json();
        const updated: AdminCollection = json.data ?? editing;
        setCollections((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        addToast(`Collection "${updated.title}" updated`);
      }
      setEditing(null);
    } catch {
      addToast("Failed to save collection", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const del = async (id: string) => {
    await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
    setCollections((prev) => prev.filter((c) => c.id !== id));
    addToast("Collection deleted", "error");
    setDeleteConfirm(null);
  };

  const toggleSkill = (skillId: string) => {
    if (!editing) return;
    const has = editing.skillIds.includes(skillId);
    setEditing({
      ...editing,
      skillIds: has ? editing.skillIds.filter((id) => id !== skillId) : [...editing.skillIds, skillId],
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl text-text">Collections</h2>
          <p className="font-dm text-sm text-muted mt-0.5">{collections.length} collections</p>
        </div>
        <button
          onClick={openNew}
          className="font-dm text-sm font-medium bg-accent text-white px-4 py-2.5 rounded-md hover:bg-accentDk transition-colors"
        >
          + New Collection
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {collections.map((col) => {
            const colSkills = col.skillIds
              .map((id) => skills.find((s) => s.id === id))
              .filter(Boolean);
            return (
              <div key={col.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-dm font-semibold text-sm text-text">{col.title}</h3>
                    <p className="font-dm text-xs text-muted mt-0.5">{col.skillIds.length} skills</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(col)}
                      className="font-dm text-xs border border-border px-3 py-1.5 rounded hover:border-accent hover:text-accent transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(col.id)}
                      className="font-dm text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colSkills.map((s) => s && (
                    <span key={s.id} className="font-dm text-xs bg-tagBg text-tagText border border-border px-2.5 py-1 rounded-full">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { if (!isSaving) setEditing(null); }} />
          <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-dm font-semibold text-base text-text mb-4">
              {isNew ? "New Collection" : "Edit Collection"}
            </h3>

            <div className="mb-4">
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-1.5">
                Collection Title *
              </label>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="e.g. Best Writing Skills"
                className="font-dm text-sm w-full border border-border rounded-md px-3 py-2.5 focus:outline-none focus:border-accent transition-colors bg-card text-text"
              />
            </div>

            <div className="mb-5">
              <label className="font-mono text-[10px] uppercase tracking-wide text-muted block mb-2">
                Skills ({editing.skillIds.length} selected)
              </label>
              <div className="max-h-52 overflow-y-auto border border-border rounded-lg divide-y divide-border">
                {skills.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-bg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={editing.skillIds.includes(skill.id)}
                      onChange={() => toggleSkill(skill.id)}
                      className="accent-accent"
                    />
                    <span className="font-dm text-sm text-text flex-1">{skill.name}</span>
                    <span className="font-mono text-[10px] text-muted">{skill.category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={save}
                disabled={!editing.title.trim() || isSaving}
                className="font-dm text-sm font-medium bg-accent text-white px-5 py-2.5 rounded-md hover:bg-accentDk disabled:opacity-50 transition-colors"
              >
                {isSaving ? "Saving…" : isNew ? "Create" : "Save Changes"}
              </button>
              <button
                onClick={() => { if (!isSaving) setEditing(null); }}
                disabled={isSaving}
                className="font-dm text-sm text-muted border border-border px-5 py-2.5 rounded-md hover:text-text disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmModal
          title="Delete Collection"
          message="This collection will be permanently deleted. Skills inside will not be affected."
          confirmLabel="Delete"
          confirmStyle="danger"
          onConfirm={() => del(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
