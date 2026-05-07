"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/admin/StatCard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import DashboardCharts from "@/components/admin/DashboardCharts";
import StatusBadge from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/ToastContext";
import type { Submission, ActivityItem, DailyMetric } from "@/lib/admin-data";
import type { AdminSkill } from "@/lib/admin-skills";

type DashboardData = {
  stats: { totalSkills: number; totalDownloads: number; pendingSubmissions: number; monthlyVisitors: number };
  topSkills: AdminSkill[];
  pendingSubmissions: Submission[];
  recentActivity: ActivityItem[];
  dailyData: DailyMetric[];
};

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(({ data }) => setData(data))
      .catch(() => addToast("Failed to load dashboard", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleDecision = async (subId: string, status: "Approved" | "Rejected", skillName: string) => {
    await fetch(`/api/admin/submissions/${subId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pendingSubmissions: prev.pendingSubmissions.filter((s) => s.id !== subId),
        stats: { ...prev.stats, pendingSubmissions: prev.stats.pendingSubmissions - 1 },
      };
    });
    addToast(`"${skillName}" ${status.toLowerCase()}`, status === "Rejected" ? "error" : undefined);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const topSkills = data?.topSkills ?? [];
  const pending = data?.pendingSubmissions ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Skills" value={String(stats?.totalSkills ?? 0)} change={12} />
        <StatCard label="Total Downloads" value={(stats?.totalDownloads ?? 0).toLocaleString()} change={8.4} />
        <StatCard label="Pending Submissions" value={String(stats?.pendingSubmissions ?? 0)} change={-5} changeLabel="vs last week" />
        <StatCard label="Monthly Visitors" value={(stats?.monthlyVisitors ?? 0).toLocaleString()} change={18.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCharts data={data?.dailyData} />
        <ActivityFeed items={data?.recentActivity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-dm font-semibold text-sm text-text">Top Skills</h3>
            <Link href="/admin/skills" className="font-dm text-xs text-accent hover:text-accentDk transition-colors">
              View all →
            </Link>
          </div>
          <table className="w-full">
            <thead className="bg-bg border-b border-border">
              <tr>
                {["#", "Skill", "Category", "Downloads", "Status", ""].map((h) => (
                  <th key={h} className="font-mono text-[10px] uppercase tracking-wider text-muted px-4 py-2.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topSkills.map((skill, i) => (
                <tr key={skill.id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-dm text-sm font-medium text-text">{skill.name}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[10px] bg-tagBg text-tagText px-2 py-0.5 rounded">{skill.category}</span>
                  </td>
                  <td className="px-4 py-3 font-dm text-sm text-text">{skill.downloads.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={skill.status} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/skills/${skill.id}`} className="font-dm text-xs text-accent hover:text-accentDk transition-colors">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-card border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-dm font-semibold text-sm text-text">Pending Submissions</h3>
            <span className="font-mono text-[10px] bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
              {pending.length} pending
            </span>
          </div>
          <div className="divide-y divide-border">
            {pending.length === 0 && (
              <p className="px-5 py-6 font-dm text-xs text-muted text-center">No pending submissions</p>
            )}
            {pending.map((sub) => (
              <div key={sub.id} className="px-5 py-3.5">
                <p className="font-dm text-sm font-medium text-text">{sub.skillName}</p>
                <p className="font-dm text-xs text-muted mb-2">{sub.submitterName} · {sub.submittedDate}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision(sub.id, "Approved", sub.skillName)}
                    className="font-dm text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded hover:bg-green-200 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(sub.id, "Rejected", sub.skillName)}
                    className="font-dm text-xs bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border">
            <Link href="/admin/submissions" className="font-dm text-xs text-accent hover:text-accentDk transition-colors">
              View all submissions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
