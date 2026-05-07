"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/admin/StatCard";
import {
  VisitorsAreaChart,
  CategoryBarChart,
  TrafficPieChart,
} from "@/components/admin/AnalyticsCharts";
import type { DailyMetric, CategoryDownload, TrafficSource } from "@/lib/admin-data";

type AnalyticsData = {
  dailyData: DailyMetric[];
  categoryDownloads: CategoryDownload[];
  trafficSources: TrafficSource[];
  topSearchQueries: { query: string; count: number }[];
  geoData: { country: string; visitors: number; flag: string }[];
  topSkills: { id: string; name: string; category: string; downloads: number }[];
};

const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days"] as const;
type Range = typeof RANGES[number];
const DAY_MAP: Record<Range, number> = { "Last 7 days": 7, "Last 30 days": 30, "Last 90 days": 90 };

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("Last 30 days");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${DAY_MAP[range]}`)
      .then((r) => r.json())
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  const dailyData = data?.dailyData ?? [];
  const totalVisitors = dailyData.reduce((sum, d) => sum + d.visitors, 0);
  const totalDownloads = dailyData.reduce((sum, d) => sum + d.downloads, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-2xl text-text">Analytics</h2>
          <p className="font-dm text-sm text-muted mt-0.5">Site performance overview.</p>
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`font-dm text-xs px-3 py-1.5 rounded-md transition-colors ${
                range === r ? "bg-text text-white" : "text-muted hover:text-text"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Page Views" value={loading ? "—" : Math.floor(totalVisitors * 2.4).toLocaleString()} change={14.2} />
        <StatCard label="Unique Visitors" value={loading ? "—" : totalVisitors.toLocaleString()} change={9.8} />
        <StatCard label="Skill Downloads" value={loading ? "—" : totalDownloads.toLocaleString()} change={22.1} />
        <StatCard label="New Subscribers" value={loading ? "—" : Math.floor(totalVisitors * 0.04).toLocaleString()} change={-3.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <div className="bg-card border border-border rounded-xl p-5 animate-pulse h-64" />
            <div className="bg-card border border-border rounded-xl p-5 animate-pulse h-64" />
          </>
        ) : (
          <>
            <VisitorsAreaChart data={dailyData} />
            <CategoryBarChart data={data?.categoryDownloads} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-dm font-semibold text-sm text-text">Top Skills by Downloads</h3>
          </div>
          <table className="w-full">
            <thead className="bg-bg border-b border-border">
              <tr>
                <th className="font-mono text-[10px] uppercase tracking-wide text-muted px-4 py-2.5 text-left">#</th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-muted px-4 py-2.5 text-left">Skill</th>
                <th className="font-mono text-[10px] uppercase tracking-wide text-muted px-4 py-2.5 text-right">Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.topSkills ?? []).map((skill, i) => (
                <tr key={skill.id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <p className="font-dm text-xs font-medium text-text">{skill.name}</p>
                    <p className="font-mono text-[10px] text-muted">{skill.category}</p>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-text text-right">{skill.downloads.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TrafficPieChart data={data?.trafficSources} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-dm font-semibold text-sm text-text">Top Search Queries</h3>
          </div>
          <div className="divide-y divide-border">
            {(data?.topSearchQueries ?? []).map((q, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted w-5">{i + 1}</span>
                  <span className="font-dm text-sm text-text">{q.query}</span>
                </div>
                <span className="font-mono text-xs text-muted">{q.count} searches</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-dm font-semibold text-sm text-text">Top Countries</h3>
          </div>
          <div className="divide-y divide-border">
            {(data?.geoData ?? []).map((g, i) => {
              const max = data?.geoData[0]?.visitors ?? 1;
              return (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{g.flag}</span>
                    <span className="font-dm text-sm text-text">{g.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-border rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-accent" style={{ width: `${Math.round((g.visitors / max) * 100)}%` }} />
                    </div>
                    <span className="font-mono text-xs text-muted w-14 text-right">{g.visitors.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
