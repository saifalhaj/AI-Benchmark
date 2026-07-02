"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Atlas" },
  { href: "/trust", label: "Trust" },
  { href: "/explore", label: "Explore" },
];

export function SiteNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-grid items-center gap-3 px-4 sm:gap-6">
        <Link href="/" className="press flex shrink-0 items-center gap-2">
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded bg-accent/15 font-mono text-2xs font-bold text-accent ring-1 ring-accent/30"
          >
            /\
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-fg sm:inline">
            Benchmark<span className="text-faint">/</span>Trust
          </span>
        </Link>

        <nav
          className="flex items-center gap-1 overflow-x-auto text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`press relative shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 transition-colors ${
                isActive(l.href)
                  ? "bg-elevated text-fg"
                  : "text-muted hover:bg-surface hover:text-fg"
              }`}
            >
              {l.label}
              {isActive(l.href) && (
                <span
                  aria-hidden
                  className="absolute inset-x-2.5 -bottom-[9px] h-0.5 rounded-full bg-accent"
                />
              )}
            </Link>
          ))}
        </nav>

        <a
          href="https://github.com/saifalhaj/AI-Benchmark"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hidden text-2xs text-faint hover:text-muted sm:inline"
        >
          GitHub ↗
        </a>
      </div>
    </header>
  );
}
