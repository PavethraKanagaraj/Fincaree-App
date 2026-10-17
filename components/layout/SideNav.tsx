"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Calendar,
  FileText,
  Library,
  FlaskConical,
  Presentation,
  BarChart3,
  Settings,
  Sparkles,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/fincaree/tooltip";
import { CONTENT_ITEMS } from "@/components/client-suggestions/content-data";
import { needsCheckCount, seedContentItems } from "@/components/client-suggestions/delivery-data";

const RAIL_WIDTH = 64;
const EXPANDED_WIDTH = 240;

/* ============================================================
   Fincaree Side Navigation
   A 64px icon rail that holds its place in the layout. Clicking the
   logo at the top expands it into a labelled menu: it widens as an
   overlay above the page, so the content never moves. Choosing an
   item, pressing Escape or clicking outside collapses it again.
   ============================================================ */

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  /** Reserved for future nested pages — none exist yet. */
  subItems?: { label: string; href: string }[];
}

/* Icon language matches the rest of the app on purpose: simulations use
   the same FlaskConical and workshops the same Presentation as the
   Content Studio cards, so an icon means one thing everywhere. */
/* Content waiting on the advisor (Draft + Needs fixes) — the same number as the
   "Needs check" tab. Read from the seed data, so it doesn't move live as the
   advisor works on the page. */
const NEEDS_CHECK = needsCheckCount(seedContentItems(CONTENT_ITEMS));

export const navItems: NavItem[] = [
  { label: "Dashboard",     href: "/home",               icon: <LayoutDashboard size={18} strokeWidth={1.75} /> },
  { label: "Leads",         href: "/leads",              icon: <UserPlus size={18} strokeWidth={1.75} /> },
  { label: "Clients",       href: "/client-profile",     icon: <Users size={18} strokeWidth={1.75} /> },
  { label: "Meetings",      href: "/meetings",           icon: <Calendar size={18} strokeWidth={1.75} /> },
  { label: "Reports",       href: "/reports",            icon: <FileText size={18} strokeWidth={1.75} /> },
  { label: "Content Management", href: "/content-management", icon: <Library size={18} strokeWidth={1.75} />, badge: NEEDS_CHECK > 0 ? String(NEEDS_CHECK) : undefined },
  { label: "Simulations",   href: "/simulations",        icon: <FlaskConical size={18} strokeWidth={1.75} /> },
  { label: "Workshops",     href: "/workshops",          icon: <Presentation size={18} strokeWidth={1.75} /> },
  { label: "Opportunities", href: "/opportunities",      icon: <BarChart3 size={18} strokeWidth={1.75} /> },
];

function RailItem({
  href,
  label,
  icon,
  active,
  badge,
  expanded,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: string;
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
        "relative flex items-center rounded-[var(--radius-lg)] h-10 transition-colors duration-100",
        expanded ? "gap-3 px-3 w-full" : "justify-center w-10",
        active
          ? "bg-[var(--bg-brand-subtle)] text-[var(--icon-brand-primary)]"
          : "text-[var(--icon-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--icon-secondary)]"
      )}
    >
      {icon}
      {expanded && <span className="flex-1 min-w-0 truncate text-sm font-medium text-[var(--text-primary)]">{label}</span>}
      {badge && (
        <span className={cn("absolute w-1.5 h-1.5 rounded-full bg-[var(--color-error-500)]", expanded ? "right-3 top-1/2 -translate-y-1/2" : "top-0.5 right-0.5")} />
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

export function SideNav() {
  const pathname = usePathname();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const expanded = pinned || hovered;
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  /* While expanded: Escape or a click outside the rail collapses it and
     returns focus to the logo button so keyboard users aren't stranded. */
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
    /* The wrapper keeps the rail's 64px footprint in the flex layout; the
       nav inside grows over the content, so expanding never shifts the page. */
    <div className="relative h-full shrink-0" style={{ width: RAIL_WIDTH }}>
      <nav
        ref={navRef}
        aria-label="Main navigation"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className={cn(
          "absolute inset-y-0 left-0 z-40 flex flex-col overflow-hidden",
          "bg-[var(--bg-primary)] border-r border-[var(--border-tertiary)]",
          "transition-[width,box-shadow] duration-200 ease-out",
          expanded && "shadow-xl"
        )}
        style={{ width: expanded ? EXPANDED_WIDTH : RAIL_WIDTH }}
      >
        {/* Menu + logo. The hamburger pins the menu open; hovering the rail opens it temporarily. */}
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
          <div className={cn("flex items-center h-10", expanded ? "px-3 w-full gap-3" : "justify-center w-10")}>
            <img src="/brand/logo.png" alt="Fincaree" width={36} height={36} style={{ display: "block" }} className="shrink-0" />
            {expanded && <span className="text-base font-semibold text-[var(--text-primary)] truncate">Fincaree</span>}
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3">
          <ul className="flex flex-col gap-0.5" role="list">
            {navItems.map((item) => (
              <li key={item.href}>
                <RailItem
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(item.href)}
                  badge={item.badge}
                  expanded={expanded}
                  onNavigate={collapse}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: Finny AI + Plan + Settings */}
        <div className="border-t border-[var(--border-tertiary)] shrink-0 py-3 px-3 flex flex-col gap-0.5">
          {expanded ? (
            <div className="flex items-center gap-3 h-10 px-3 rounded-[var(--radius-lg)] bg-[var(--bg-brand-subtle)] border border-[var(--border-brand-secondary)]">
              <Sparkles size={14} strokeWidth={2} className="text-[var(--icon-brand-primary)] shrink-0" />
              <span className="text-sm font-medium text-[var(--text-primary)] truncate">Platinum plan</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--bg-brand-subtle)] border border-[var(--border-brand-secondary)] cursor-default">
                    <Sparkles size={14} strokeWidth={2} className="text-[var(--icon-brand-primary)]" />
                  </div>
                }
              />
              <TooltipContent>Platinum plan — valid till 24 May 2025</TooltipContent>
            </Tooltip>
          )}

          {expanded ? (
            <Link
              href="/settings"
              aria-label="Settings"
              onClick={collapse}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] h-10 px-3 w-full text-[var(--icon-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--icon-secondary)] transition-colors"
            >
              <Settings size={18} strokeWidth={1.75} className="shrink-0" />
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-[var(--text-primary)]">Settings</span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/settings"
                    aria-label="Settings"
                    className="flex items-center justify-center rounded-[var(--radius-lg)] h-10 w-10 text-[var(--icon-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--icon-secondary)] transition-colors"
                  >
                    <Settings size={18} strokeWidth={1.75} />
                  </Link>
                }
              />
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          )}
        </div>
      </nav>
    </div>
  );
}
