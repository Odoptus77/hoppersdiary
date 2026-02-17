import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      title: `Ground` ,
      alternates: { canonical: `/grounds/${slug}` },
    };
  }

  const { data } = await supabase
    .from("grounds")
    .select("name,city,country")
    .eq("slug", slug)
    .maybeSingle();

  const name = data?.name ?? "Ground";
  const loc = [data?.city, data?.country].filter(Boolean).join(" · ");

  const title = loc ? `${name} (${loc})` : name;
  const desc = `Tipps, Reviews und Fotos für ${name}${loc ? ` in ${loc}` : ""}.`; 

  return {
    title,
    description: desc,
    alternates: { canonical: `/grounds/${slug}` },
    openGraph: {
      title: `${title} — ${SITE.name}`,
      description: desc,
      url: `${SITE.url}/grounds/${slug}`,
      siteName: SITE.name,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE.name}`,
      description: desc,
    },
  };
}

export default function GroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
