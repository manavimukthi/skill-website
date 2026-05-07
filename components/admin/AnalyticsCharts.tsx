"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type {
  DailyMetric,
  CategoryDownload,
  TrafficSource,
} from "@/lib/admin-data";
import { CATEGORY_DOWNLOADS, TRAFFIC_SOURCES } from "@/lib/admin-data";
import { useTheme } from "@/lib/theme";

function useChartColors() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return {
    grid:         isDark ? "#2a2a2a" : "#E5E5E5",
    tick:         isDark ? "#777"    : "#888",
    tooltipBg:    isDark ? "#1a1a1a" : "#fff",
    tooltipBorder:isDark ? "#2a2a2a" : "#E5E5E5",
    tooltipText:  isDark ? "#ededed" : "#1a1a1a",
  };
}

export function VisitorsAreaChart({ data }: { data: DailyMetric[] }) {
  const c = useChartColors();
  const interval = data.length > 14 ? 4 : 1;
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-dm font-semibold text-sm text-text mb-4">Daily Visitors</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A37764" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#A37764" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fontFamily: "var(--font-share-tech-mono)", fontSize: 10, fill: c.tick }} tickLine={false} axisLine={false} interval={interval} />
          <YAxis tick={{ fontFamily: "var(--font-share-tech-mono)", fontSize: 10, fill: c.tick }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, backgroundColor: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, color: c.tooltipText }} />
          <Area type="monotone" dataKey="visitors" stroke="#A37764" strokeWidth={2} fill="url(#visGrad)" dot={false} activeDot={{ r: 4, fill: "#A37764" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBarChart({ data }: { data?: CategoryDownload[] }) {
  const c = useChartColors();
  const chartData = data ?? CATEGORY_DOWNLOADS;
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-dm font-semibold text-sm text-text mb-4">Downloads by Category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="category" tick={{ fontFamily: "var(--font-share-tech-mono)", fontSize: 9, fill: c.tick }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontFamily: "var(--font-share-tech-mono)", fontSize: 10, fill: c.tick }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, backgroundColor: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, color: c.tooltipText }} />
          <Bar dataKey="downloads" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const RADIAN = Math.PI / 180;
function PieLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
  const ir = Number(innerRadius ?? 0);
  const or = Number(outerRadius ?? 0);
  const r = ir + (or - ir) * 0.5;
  const x = Number(cx ?? 0) + r * Math.cos(-Number(midAngle ?? 0) * RADIAN);
  const y = Number(cy ?? 0) + r * Math.sin(-Number(midAngle ?? 0) * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="var(--font-dm-sans)">
      {`${value}%`}
    </text>
  );
}

export function TrafficPieChart({ data }: { data?: TrafficSource[] }) {
  const c = useChartColors();
  const chartData = data ?? TRAFFIC_SOURCES;
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="font-dm font-semibold text-sm text-text mb-4">Traffic Sources</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="60%" height={200}>
          <PieChart>
            <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={PieLabel}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <Tooltip contentStyle={{ fontFamily: "var(--font-dm-sans)", fontSize: 12, backgroundColor: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8, color: c.tooltipText }} formatter={(v) => [`${v}%`, ""]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-2">
          {chartData.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.fill }} />
              <span className="font-dm text-xs text-text">{s.name}</span>
              <span className="font-mono text-xs text-muted ml-auto">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
