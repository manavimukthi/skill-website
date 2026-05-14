import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import type { Submission, ActivityItem } from "@/lib/admin-data";
import { getAdminClient } from "@/lib/supabase/admin";
import { mapAdminSkill } from "@/lib/admin-skills";

export const dynamic = "force-dynamic";

function generateDailyData(days: number) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const seed = i + 1;
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      downloads: ((seed * 48271) % 400) + 80,
      visitors: ((seed * 73129) % 900) + 200,
    });
  }
  return data;
}

export async function GET() {
  const submissions = readDB<Submission[]>("submissions.json", []);
  const activity = readDB<ActivityItem[]>("activity.json", []);

  const supabase = getAdminClient();
  const { data: skills } = await supabase
    .from("skills")
    .select("id, slug, filename, title, description, content, category_id, author_id, file_url, file_size_bytes, download_count, view_count, featured, published, tags, preview_bg, created_at, updated_at, category:categories(id, name, slug, color)")
    .order("download_count", { ascending: false })
    .limit(5);

  const topSkills = (skills ?? []).map(mapAdminSkill);
  const totalDownloads = topSkills.reduce((sum, skill) => sum + skill.downloads, 0);
  const pending = submissions.filter((s) => s.status === "Pending");
  const dailyData = generateDailyData(30);

  return NextResponse.json({
    data: {
      stats: {
        totalSkills: skills?.length ?? 0,
        totalDownloads,
        pendingSubmissions: pending.length,
        monthlyVisitors: 24890,
      },
      topSkills,
      pendingSubmissions: pending,
      recentActivity: activity.slice(0, 8),
      dailyData,
    },
  });
}
