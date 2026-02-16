import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// MVP: static routes only. Later we can add dynamic ground slugs via DB fetch.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/grounds",
    "/reviews",
    "/suggest",
    "/login",
    "/me",
  ];

  return routes.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
