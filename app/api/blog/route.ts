import { NextRequest, NextResponse } from "next/server";
import { readBlog } from "@/lib/blog-store";
export type { BlogPost } from "@/lib/blog-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");

    const posts = await readBlog();
    let published = posts.filter((p) => p.status === "Published");

    if (tag) {
      published = published.filter((p) => p.tags.includes(tag));
    }

    published.sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.createdAt).getTime() -
        new Date(a.publishedAt ?? a.createdAt).getTime()
    );

    return NextResponse.json({ data: published }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("/api/blog GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
