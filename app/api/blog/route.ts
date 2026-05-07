import { NextRequest, NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  coverBg: string;
  tags: string[];
  status: "Draft" | "Published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  const posts = readDB<BlogPost[]>("blog.json", []);
  let published = posts.filter((p) => p.status === "Published");

  if (tag) {
    published = published.filter((p) => p.tags.includes(tag));
  }

  published.sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.createdAt).getTime() -
      new Date(a.publishedAt ?? a.createdAt).getTime()
  );

  return NextResponse.json({ data: published });
}
