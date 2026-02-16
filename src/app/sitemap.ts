import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Public routes only + dynamic Ground detail pages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const baseRoutes = ["", "/grounds", "/reviews", "/suggest"];

  const staticEntries = baseRoutes.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const supabase = createSupabaseServerClient();
  if (!supabase) return staticEntries;

  // Only include published grounds.
  const { data, error } = await supabase
    .from("grounds")
    .select("slug")
    .eq("published", true)
    .order("slug", { ascending: true });

  if (error || !data) return staticEntries;

  const groundEntries = data
    .filter((r: any) => typeof r.slug === "string" && r.slug.length)
    .map((r: any) => ({
      url: `${SITE.url}/grounds/${r.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticEntries, ...groundEntries];
}
