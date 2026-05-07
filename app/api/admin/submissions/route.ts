import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { Submission } from "@/lib/admin-data";
import { ensurePublishedSkillFromSubmission } from "@/lib/submission-publish";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const submissions = readDB<Submission[]>("submissions.json", []);
  const filtered = status ? submissions.filter((s) => s.status === status) : submissions;

  if (!status || status === "Approved") {
    await Promise.all(
      filtered
        .filter((submission) => submission.status === "Approved")
        .map((submission) => ensurePublishedSkillFromSubmission(submission).catch((err) => {
          console.error("/api/admin/submissions GET publish sync", submission.id, err);
        }))
    );
  }

  return NextResponse.json({ data: filtered });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const submissions = readDB<Submission[]>("submissions.json", []);
    const newSub: Submission = {
      id: `s${Date.now()}`,
      submitterName: body.submitterName,
      submitterEmail: body.submitterEmail,
      skillName: body.skillName,
      category: body.category,
      submittedDate: new Date().toISOString().split("T")[0],
      content: body.content,
      status: "Pending",
    };
    submissions.unshift(newSub);
    writeDB("submissions.json", submissions);
    return NextResponse.json({ data: newSub }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
