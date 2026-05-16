import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readBlog, writeBlog } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const posts = await readBlog();
    const post = posts.find((p) => p.id === params.id);

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: post });
  } catch (err) {
    console.error("/api/admin/blog/[id] GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const posts = await readBlog();
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

    await writeBlog(posts);
    revalidatePath("/blog");

    return NextResponse.json({ data: posts[idx] });
  } catch (err) {
    console.error("/api/admin/blog/[id] PATCH", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const posts = await readBlog();
    const filtered = posts.filter((p) => p.id !== params.id);

    if (filtered.length === posts.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await writeBlog(filtered);
    revalidatePath("/blog");

    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    console.error("/api/admin/blog/[id] DELETE", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
