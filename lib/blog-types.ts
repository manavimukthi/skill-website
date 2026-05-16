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
