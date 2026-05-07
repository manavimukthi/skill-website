import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { BlogPost } from "@/app/api/blog/route";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const posts = readDB<BlogPost[]>("blog.json", []);
  const post = posts.find((p) => p.id === params.id);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: post });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const posts = readDB<BlogPost[]>("blog.json", []);
    const idx = posts.findIndex((p) => p.id === params.id);

    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const existing = posts[idx];
    const now = new Date().toISOString();

    const wasUnpublished = existing.status !== "Published";
    const isBeingPublished = body.status === "Published";

    posts[idx] = {
      ...existing,
      ...body,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now,
      publishedAt:
        isBeingPublished && wasUnpublished
          ? now
          : body.status === "Draft"
          ? null
          : existing.publishedAt,
    };

    writeDB("blog.json", posts);
    return NextResponse.json({ data: posts[idx] });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const posts = readDB<BlogPost[]>("blog.json", []);
  const filtered = posts.filter((p) => p.id !== params.id);

  if (filtered.length === posts.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  writeDB("blog.json", filtered);
  return NextResponse.json({ data: { deleted: true } });
}
