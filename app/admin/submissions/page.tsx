"use client";

import { useState, useEffect } from "react";
import type { Submission } from "@/lib/admin-data";
import StatusBadge from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/ToastContext";

type Tab = "Pending" | "Approved" | "Rejected";

function SubmissionModal({ sub, onClose, onApprove, onReject }: {
  sub: Submission;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-dm font-semibold text-base text-text">{sub.skillName}</h3>
            <p className="font-dm text-xs text-muted mt-0.5">{sub.submitterName} · {sub.submitterEmail}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1">✕</button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[10px] uppercase bg-tagBg text-tagText px-2 py-0.5 rounded border border-border">
            {sub.category}
          </span>
          <span className="font-dm text-xs text-muted">Submitted {sub.submittedDate}</span>
          <StatusBadge status={sub.status} />
        </div>

        <div className="mb-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted mb-2">Skill Content</p>
          <textarea
            readOnly
            value={sub.content}
            rows={10}
            className="font-mono text-xs w-full border border-border rounded-lg px-3 py-3 bg-bg resize-none leading-relaxed focus:outline-none"
          />
        </div>

        {sub.status === "Pending" && (
          <div className="flex items-center gap-3">
            <button onClick={onApprove} className="font-dm text-sm font-medium bg-green-600 text-white px-4 py-2.5 rounded-md hover:bg-green-700 transition-colors">
              Approve & Publish
            </button>
            <button onClick={onReject} className="font-dm text-sm font-medium bg-red-500 text-white px-4 py-2.5 rounded-md hover:bg-red-600 transition-colors">
              Reject
            </button>
            <button onClick={onClose} className="font-dm text-sm text-muted border border-border px-4 py-2.5 rounded-md hover:border-accent hover:text-accent transition-colors">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubmissionsPage() {
  const { addToast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Pending");
  const [viewModal, setViewModal] = useState<Submission | null>(null);

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((r) => r.json())
      .then(({ data }) => { if (Array.isArray(data)) setSubmissions(data); })
      .catch(() => addToast("Failed to load submissions", "error"))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: Submission["status"]) => {
    await fetch(`/api/admin/submissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  };

  const filtered = submissions.filter((s) => s.status === activeTab);
  const pendingCount = submissions.filter((s) => s.status === "Pending").length;
  const TABS: Tab[] = ["Pending", "Approved", "Rejected"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-playfair text-2xl text-text">Community Submissions</h2>
        <p className="font-dm text-sm text-muted mt-0.5">Review and approve skills submitted by the community.</p>
      </div>

      <div className="flex items-center gap-0 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-dm text-sm px-5 py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab ? "border-accent text-accent font-medium" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {tab}
            {tab === "Pending" && pendingCount > 0 && (
              <span className="font-mono text-[9px] bg-yellow-100 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="font-dm text-sm text-muted">No {activeTab.toLowerCase()} submissions.</p>
            </div>
          )}
          {filtered.map((sub) => (
            <div key={sub.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-dm font-semibold text-sm text-text">{sub.skillName}</h3>
                    <span className="font-mono text-[10px] bg-tagBg text-tagText px-2 py-0.5 rounded border border-border">
                      {sub.category}
                    </span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="font-dm text-xs text-muted mb-2">
                    by <span className="text-text">{sub.submitterName}</span> ({sub.submitterEmail}) · {sub.submittedDate}
                  </p>
                  <p className="font-mono text-xs text-muted bg-bg border border-border rounded px-3 py-2 line-clamp-2">
                    {sub.content.slice(0, 120)}…
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => setViewModal(sub)}
                    className="font-dm text-xs border border-border px-3 py-1.5 rounded hover:border-accent hover:text-accent transition-colors"
                  >
                    View Full
                  </button>
                  {sub.status === "Pending" && (
                    <>
                      <button
                        onClick={async () => { await updateStatus(sub.id, "Approved"); addToast(`"${sub.skillName}" approved`); }}
                        className="font-dm text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => { await updateStatus(sub.id, "Rejected"); addToast(`"${sub.skillName}" rejected`, "error"); }}
                        className="font-dm text-xs bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewModal && (
        <SubmissionModal
          sub={viewModal}
          onClose={() => setViewModal(null)}
          onApprove={async () => {
            await updateStatus(viewModal.id, "Approved");
            addToast(`"${viewModal.skillName}" approved`);
            setViewModal(null);
          }}
          onReject={async () => {
            await updateStatus(viewModal.id, "Rejected");
            addToast(`"${viewModal.skillName}" rejected`, "error");
            setViewModal(null);
          }}
        />
      )}
    </div>
  );
}
