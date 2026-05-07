import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";

type AdminCollection = { id: string; title: string; skillIds: string[] };

export async function GET() {
  const collections = readDB<AdminCollection[]>("collections.json", []);
  return NextResponse.json({ data: collections });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const collections = readDB<AdminCollection[]>("collections.json", []);
    const newCol: AdminCollection = {
      id: `col${Date.now()}`,
      title: body.title,
      skillIds: body.skillIds ?? [],
    };
    collections.push(newCol);
    writeDB("collections.json", collections);
    return NextResponse.json({ data: newCol }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
