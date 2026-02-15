import { Tabs } from "@/components/Tabs";

export default async function GroundLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const base = `/grounds/${slug}`;

  // We can't know active tab here without route segment; each page passes its active key
  // via query (?tab=) would be messy. So we keep tabs inside each page for now.
  // This file exists so we can later move shared UI here.
  return <>{children}</>;
}
