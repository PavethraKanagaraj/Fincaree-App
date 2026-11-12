"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Holds its content back until it scrolls into view, then lets it rise in. Bars, charts and counting
 * numbers inside it wait too (see .fc-reveal in globals.css), so a widget further down the page
 * animates when the advisor reaches it, not at page load while it is still off screen.
 *
 * `index` is a small stagger step (a beat of 60ms each) for blocks that appear together, such as the
 * two cards in one row.
 */
export function Reveal({ index = 0, className, children }: { index?: number; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setSeen(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-in={seen} className={cn("fc-reveal", className)} style={{ "--rise-i": index } as React.CSSProperties}>
      {children}
    </div>
  );
}
