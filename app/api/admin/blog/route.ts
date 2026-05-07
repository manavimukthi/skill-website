import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import type { BlogPost } from "@/app/api/blog/route";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const posts = readDB<BlogPost[]>("blog.json", []);
  const filtered = status && status !== "All"
    ? posts.filter((p) => p.status === status)
    : posts;

  filtered.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ data: filtered });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const posts = readDB<BlogPost[]>("blog.json", []);

    const now = new Date().toISOString();
    const newPost: BlogPost = {
      id: `post${Date.now()}`,
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt ?? "",
      content: body.content ?? "",
      author: body.author ?? "Admin",
      coverBg: body.coverBg ?? "#D6E4F0",
      tags: Array.isArray(body.tags) ? body.tags : [],
      status: body.status ?? "Draft",
      publishedAt: body.status === "Published" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    posts.push(newPost);
    writeDB("blog.json", posts);

    return NextResponse.json({ data: newPost }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
