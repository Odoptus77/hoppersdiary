import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { MobileBottomNav } from "@/components/AppNav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Hoppersdiary — Community-Plattform für Groundhopper",
    template: "%s — Hoppersdiary",
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: "Hoppersdiary — Community-Plattform für Groundhopper",
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage,
        width: 1200,
        height: 630,
        alt: "Hoppersdiary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoppersdiary — Community-Plattform für Groundhopper",
    description: SITE.description,
    images: [SITE.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <div className="min-h-dvh bg-gradient-to-br from-white via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-foreground transition-colors duration-300">
            <SiteHeader />
            <main className="mx-auto max-w-6xl px-4 py-6 pb-28 md:py-10 md:pb-12">
              <div className="animate-fade-in">
                {children}
              </div>
            </main>
            <SiteFooter />
            <MobileBottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
