import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  siteName: "TrySkill",
  siteDescription: "The best free Claude AI skills on the internet.",
  skillsPerPage: 16,
  maintenanceMode: false,
  adsense: {
    publisherId: "pub-0000000000000000",
    heroSlotId: "", sidebarSlotId: "", gridSlotId: "", footerSlotId: "",
    hero: true, sidebar: false, grid: true, footer: false,
  },
  api: { apiKey: "", model: "claude-sonnet-4-6", maxTokens: 4096 },
  notifications: {
    newSubmission: true,
    submissionEmail: "admin@tryskill.com",
    weeklyStats: true,
    newSubscriber: false,
  },
};

export async function GET() {
  const settings = readDB("settings.json", DEFAULT_SETTINGS);
  return NextResponse.json(
    { data: settings },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const current = readDB("settings.json", DEFAULT_SETTINGS);
    const updated = deepMerge(current, body);
    writeDB("settings.json", updated);
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (target[key] as Record<string, unknown>) ?? {},
        source[key] as Record<string, unknown>
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
