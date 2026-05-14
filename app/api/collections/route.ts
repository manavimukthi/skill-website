import { NextRequest, NextResponse } from "next/server";
import { createUserCollection, readUserCollections } from "@/lib/user-collections";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, collections } = await readUserCollections();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    return NextResponse.json({ data: collections });
  } catch (err) {
    console.error("/api/collections GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { user, collection } = await createUserCollection({
      title: body.title,
      skillIds: Array.isArray(body.skillIds) ? body.skillIds : [],
    });

    if (!user || !collection) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    return NextResponse.json({ data: collection }, { status: 201 });
  } catch (err) {
    console.error("/api/collections POST", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}