import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/login", "/signup", "/maintenance"],
      },
    ],
    sitemap: "https://www.tryskill.me/sitemap.xml",
    host: "https://www.tryskill.me",
  };
}
