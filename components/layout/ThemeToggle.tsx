"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "fincaree-theme";

/**
 * Reads the theme the pre-hydration script in app/layout.tsx already applied,
 * rather than recomputing it — keeps the button in sync with the live DOM.
 */
function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private browsing / storage disabled — theme still applies for this session.
  }
}

export function ThemeToggle() {
  // null until mounted: the server can't know the theme, so the first client
  // render must match the server's output or hydration mismatches.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-[var(--radius-lg)]",
        "text-[var(--icon-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
      )}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === null ? null : theme === "dark" ? (
        <Sun size={16} strokeWidth={1.75} />
      ) : (
        <Moon size={16} strokeWidth={1.75} />
      )}
    </button>
  );
}
