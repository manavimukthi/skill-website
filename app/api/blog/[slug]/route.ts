import { NextRequest, NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import type { BlogPost } from "@/app/api/blog/route";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const posts = readDB<BlogPost[]>("blog.json", []);
  const post = posts.find((p) => p.slug === params.slug && p.status === "Published");

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: post });
}
