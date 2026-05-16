import { NextRequest, NextResponse } from "next/server";
import { readBlog } from "@/lib/blog-store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const posts = await readBlog();
    const post = posts.find((p) => p.slug === params.slug && p.status === "Published");

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: post }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("/api/blog/[slug] GET", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
