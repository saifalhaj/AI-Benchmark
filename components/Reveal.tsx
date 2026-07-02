"use client";

import { useEffect, useRef } from "react";

// Scroll-reveal gate: adds .in once the block enters the viewport, which
// activates any .rv / .pop / .grow-x / .fade descendants (see globals.css).
// Children pass through untouched, so server components stay server.
export function Reveal({
  children,
  className = "",
  threshold = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    // The spec guarantees an initial callback when IO is alive. If nothing
    // arrives, the environment isn't delivering entries (prerender, odd
    // embeds): fail open so content is never stuck hidden.
    let alive = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        alive = true;
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    const fallback = window.setTimeout(() => {
      if (!alive) {
        el.classList.add("in");
        io.disconnect();
      }
    }, 1200);
    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
