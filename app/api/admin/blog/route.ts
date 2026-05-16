import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readBlog, writeBlog } from "@/lib/blog-store";
import type { BlogPost } from "@/app/api/blog/route";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const posts = await readBlog();
    const filtered = status && status !== "All"
      ? posts.filter((p) => p.status === status)
      : posts;

    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ data: filtered });
  } catch (err) {
    console.error("/api/admin/blog GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const posts = await readBlog();

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
    await writeBlog(posts);
    revalidatePath("/blog");

    return NextResponse.json({ data: newPost }, { status: 201 });
  } catch (err) {
    console.error("/api/admin/blog POST", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
