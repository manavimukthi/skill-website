import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { Submission, ActivityItem } from "@/lib/admin-data";
import { ensurePublishedSkillFromSubmission } from "@/lib/submission-publish";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const submissions = readDB<Submission[]>("submissions.json", []);
  const sub = submissions.find((s) => s.id === params.id);
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: sub });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const submissions = readDB<Submission[]>("submissions.json", []);
    const idx = submissions.findIndex((s) => s.id === params.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const previousStatus = submissions[idx].status;

    submissions[idx] = { ...submissions[idx], ...body };
    writeDB("submissions.json", submissions);

    if (body.status === "Approved" && previousStatus !== "Approved") {
      try {
        await ensurePublishedSkillFromSubmission(submissions[idx]);
      } catch (err) {
        console.error("/api/admin/submissions/[id] PUT publish", err);
        return NextResponse.json({ error: "Failed to publish approved skill" }, { status: 500 });
      }
    }

    // Record activity
    if (body.status === "Approved" || body.status === "Rejected") {
      const activity = readDB<ActivityItem[]>("activity.json", []);
      activity.unshift({
        id: `a${Date.now()}`,
        type: body.status === "Approved" ? "approval" : "rejection",
        description: `"${submissions[idx].skillName}" was ${body.status === "Approved" ? "approved and published" : "rejected"}`,
        timestamp: "just now",
      });
      writeDB("activity.json", activity.slice(0, 50));
    }

    return NextResponse.json({ data: submissions[idx] });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
