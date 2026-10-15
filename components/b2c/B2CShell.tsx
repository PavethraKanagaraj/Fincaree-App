"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/fincaree/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/fincaree/tooltip";
import { BookOpen, Clock, FileText, FlaskConical, Home, Menu, Target, UserRound, type LucideIcon } from "lucide-react";

/* ============================================================
   FinCaree customer shell — header + left navigation for the
   discovery and client-profile journeys. The rail uses the same
   hover-to-expand / pin / tooltip interaction as the advisor
   SideNav (components/layout/SideNav.tsx) for a consistent feel
   across the platform; only the item set differs.
   ============================================================ */

const RAIL_WIDTH = 64;
const EXPANDED_WIDTH = 240;

const NAV_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Home", href: "/customer-home", icon: Home },
  { label: "Financial Picture", href: "/financial-summary", icon: Clock },
  { label: "Plan & Goals", href: "/goals", icon: Target },
  { label: "Simulations", href: "#", icon: FlaskConical },
  { label: "Learn", href: "#", icon: BookOpen },
  { label: "Advisory", href: "#", icon: UserRound },
  { label: "Documents", href: "#", icon: FileText },
];

function RailItem({
  href,
  label,
  icon: Icon,
  active,
  expanded,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  expanded: boolean;
  onNavigate: () => void;
}) {
  const link = (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex items-center rounded-[var(--radius-lg)] h-10 transition-colors duration-100",
        expanded ? "gap-3 px-3 w-full" : "justify-center w-10",
        active
          ? "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]"
          : "text-[var(--icon-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--icon-secondary)]"
      )}
    >
      <Icon size={18} strokeWidth={1.75} className="shrink-0" />
      {expanded && (
        <span className={cn("flex-1 min-w-0 truncate text-sm", active ? "font-semibold text-[var(--text-brand-primary)]" : "font-medium text-[var(--text-primary)]")}>
          {label}
        </span>
      )}
    </Link>
  );

  if (expanded) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/* The customer is already signed up, so the header shows their account rather than a sign-up call to action. */
export function B2CShell({ children, user }: { children: React.ReactNode; user: { name: string; initials: string } }) {
  const pathname = usePathname();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const expanded = pinned || hovered;
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function isActive(href: string) {
    return href !== "#" && pathname.startsWith(href);
  }

  useEffect(() => {
    if (!pinned) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPinned(false);
        toggleRef.current?.focus();
      }
    }
    function onPointer(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setPinned(false);
    }

    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [pinned]);

  const collapse = () => {
    setPinned(false);
    setHovered(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <header className="sticky top-0 z-30 bg-[var(--bg-primary)] border-b border-[var(--border-tertiary)]">
        <div className="px-6 h-16 flex items-center justify-between gap-8">
          <Link href="/customer-home" aria-label="FinCaree home" className="flex items-center shrink-0">
            <Image src="/brand/logo-lockup-on-light.png" alt="" width={136} height={32} priority />
          </Link>

          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar size="sm" initials={user.initials} />
            <span className="hidden sm:inline text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">{user.name}</span>
          </div>
        </div>
      </header>

      <div className="flex items-start">
        {/* The wrapper keeps the rail's 64px footprint in the flex layout; the
            nav inside grows over the content, so expanding never shifts the page. */}
        <div className="relative hidden h-[calc(100vh-4rem)] shrink-0 md:block" style={{ width: RAIL_WIDTH }}>
          <nav
            ref={navRef}
            aria-label="Customer navigation"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            className={cn(
              "absolute inset-y-0 left-0 z-20 flex flex-col overflow-hidden",
              "bg-[var(--bg-primary)] border-r border-[var(--border-tertiary)]",
              "transition-[width,box-shadow] duration-200 ease-out",
              expanded && "shadow-xl"
            )}
            style={{ width: expanded ? EXPANDED_WIDTH : RAIL_WIDTH }}
          >
            {/* Pin toggle — hovering the rail opens it temporarily; clicking this pins it open. */}
            <div className="flex flex-col items-center gap-2 py-2.5 border-b border-[var(--border-tertiary)] shrink-0">
              <button
                ref={toggleRef}
                type="button"
                onClick={() => setPinned((v) => !v)}
                aria-expanded={expanded}
                aria-label={pinned ? "Unpin navigation" : "Pin navigation open"}
                className={cn(
                  "flex items-center rounded-[var(--radius-lg)] h-10 hover:bg-[var(--bg-secondary)] transition-colors text-[var(--icon-secondary)]",
                  expanded ? "gap-3 px-3 w-full" : "justify-center w-10",
                  pinned && "bg-[var(--bg-secondary)]"
                )}
              >
                <Menu size={20} strokeWidth={1.75} className="shrink-0" />
                {expanded && <span className="text-sm font-medium text-[var(--text-primary)] truncate">Menu</span>}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3">
              <ul className="flex flex-col gap-0.5" role="list">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <RailItem
                      href={link.href}
                      label={link.label}
                      icon={link.icon}
                      active={isActive(link.href)}
                      expanded={expanded}
                      onNavigate={collapse}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
