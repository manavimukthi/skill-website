import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_DOWNLOADS, TRAFFIC_SOURCES, TOP_SEARCH_QUERIES, GEO_DATA } from "@/lib/admin-data";
import { getAdminClient } from "@/lib/supabase/admin";
import { mapAdminSkill } from "@/lib/admin-skills";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const range = parseInt(searchParams.get("days") ?? "30", 10);

  const dailyData = generateDailyData(range);
  const supabase = getAdminClient();
  const { data } = await supabase
    .from("skills")
    .select("id, slug, filename, title, description, content, category_id, author_id, file_url, file_size_bytes, download_count, view_count, featured, published, tags, preview_bg, created_at, updated_at, category:categories(id, name, slug, color)")
    .order("download_count", { ascending: false })
    .limit(10);

  const topSkills = (data ?? []).map(mapAdminSkill);

  return NextResponse.json({
    data: {
      dailyData,
      categoryDownloads: CATEGORY_DOWNLOADS,
      trafficSources: TRAFFIC_SOURCES,
      topSearchQueries: TOP_SEARCH_QUERIES,
      geoData: GEO_DATA,
      topSkills,
    },
  });
}
