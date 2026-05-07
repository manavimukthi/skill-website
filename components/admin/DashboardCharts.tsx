"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import type { DailyMetric } from "@/lib/admin-data";
import { useTheme } from "@/lib/theme";

export default function DashboardCharts({ data }: { data?: DailyMetric[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const gridColor = isDark ? "#2a2a2a" : "#E5E5E5";
  const tickColor = isDark ? "#777" : "#888";
  const tooltipBg = isDark ? "#1a1a1a" : "#fff";
  const tooltipBorder = isDark ? "#2a2a2a" : "#E5E5E5";
  const tooltipText = isDark ? "#ededed" : "#1a1a1a";

  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 h-full flex items-center justify-center">
        <div className="animate-pulse w-full h-[220px] bg-border rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <h3 className="font-dm font-semibold text-sm text-text mb-4">Downloads — Last 30 Days</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontFamily: "var(--font-share-tech-mono)", fontSize: 10, fill: tickColor }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontFamily: "var(--font-share-tech-mono)", fontSize: 10, fill: tickColor }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 12,
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              color: tooltipText,
            }}
            labelStyle={{ color: tickColor, fontFamily: "var(--font-share-tech-mono)", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="downloads"
            stroke="#A37764"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#A37764" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
