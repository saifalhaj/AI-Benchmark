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
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh]">
        {/* gate reveal-hidden states on JS being present; runs before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
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
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-5 text-2xs text-faint">
            <p>
              Static site, no key to view. Flags explained in{" "}
              <a href="/trust" className="text-muted hover:text-fg">
                Trust
              </a>
              .
            </p>
            <p className="tnum font-mono">updated {meta.lastUpdated}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
