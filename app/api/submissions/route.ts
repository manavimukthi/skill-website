import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/admin-data";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const body = await request.json();

    const submissions = readDB<Submission[]>("submissions.json", []);
    const newSub: Submission = {
      id: `s${Date.now()}`,
      submitterId: user.id,
      submitterName: body.submitterName || profile?.name || (user.email ?? "").split("@")[0] || "",
      submitterEmail: body.submitterEmail || user.email || "",
      skillName: body.skillName,
      category: body.category,
      description: body.description || undefined,
      submittedDate: new Date().toISOString().split("T")[0],
      content: body.content,
      github: body.github ?? undefined,
      status: "Pending",
    };

    submissions.unshift(newSub);
    writeDB("submissions.json", submissions);

    return NextResponse.json({ data: newSub }, { status: 201 });
  } catch (err) {
    console.error("/api/submissions POST", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
