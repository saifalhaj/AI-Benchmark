import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SiteNav } from "@/components/SiteNav";
import { meta } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Benchmark/Trust: AI agent benchmark dashboard",
    template: "%s · Benchmark/Trust",
  },
  description:
    "Aggregated AI agent and model benchmarks with a trust layer: saturation, contamination, scaffold-dependence, and vendor-vs-independent sourcing made visible.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-[100dvh]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-elevated focus:px-3 focus:py-2 focus:text-xs focus:text-fg"
        >
          Skip to content
        </a>
        <SiteNav />
        <main id="main" className="mx-auto max-w-grid px-4 py-8">
          {children}
        </main>
        <footer className="mx-auto max-w-grid px-4 pb-10 pt-6">
          <div className="border-t border-line pt-6 text-2xs text-faint">
            <p>
              Static dashboard. No key needed to view. Scores refresh daily from
              source leaderboards; see{" "}
              <a href="/trust" className="text-muted hover:text-fg">
                Trust
              </a>{" "}
              for how flags are assigned.
            </p>
            <p className="tnum mt-1 font-mono">Data last updated {meta.lastUpdated}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
