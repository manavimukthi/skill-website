import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import type { ActivityItem } from "@/lib/admin-data";

export async function GET() {
  const activity = readDB<ActivityItem[]>("activity.json", []);
  return NextResponse.json({ data: activity });
}
