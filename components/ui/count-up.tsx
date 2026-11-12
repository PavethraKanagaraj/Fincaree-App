"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that counts up to its value once it is on screen, so a dashboard feels like it is loading
 * live. It eases out, lands exactly on the value, and shows the final number straight away for anyone
 * who has asked their system to reduce motion.
 */
export function CountUp({
  value,
  duration = 900,
  delay = 0,
  decimals = 0,
  className,
}: {
  value: number;
  duration?: number;
  /** Milliseconds to wait before counting, so a row of numbers can start one after another. */
  delay?: number;
  /** Digits after the point, for values like 24.6. */
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  const [visible, setVisible] = useState(false);

  /* Wait until it is actually on screen. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let frame = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(frame);
    }
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - start) / duration, 0), 1);
      setShown(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {shown.toFixed(decimals)}
    </span>
  );
}

/**
 * Counts up the number inside a ready-made display string, keeping the rest as it is:
 * "₹24.6 L" counts 0.0 to 24.6 between "₹" and " L", "91%" counts to 91 before the "%".
 * A string with no number in it is shown as it is.
 */
export function CountUpText({ text, delay, duration, className }: { text: string; delay?: number; duration?: number; className?: string }) {
  const m = text.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return <span className={className}>{text}</span>;
  const [, prefix, number, suffix] = m;
  const decimals = number.includes(".") ? number.split(".")[1].length : 0;
  return (
    <span className={className}>
      {prefix}
      <CountUp value={Number(number)} decimals={decimals} delay={delay} duration={duration} />
      {suffix}
    </span>
  );
}
