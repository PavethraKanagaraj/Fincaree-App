"use client";

import { cn } from "@/lib/utils";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Sparkles,
  UserPlus,
  UserCheck,
  Calendar,
  FileText,
  FlaskConical,
  Library,
  Presentation,
} from "lucide-react";
import { Avatar } from "@/components/fincaree/avatar";
import { Button } from "@/components/fincaree/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/fincaree/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";

/* ============================================================
   Fincaree Top Navigation Bar
   Search | Quick Create | Finny AI | Theme | Notifications | Profile
   ============================================================ */

export function TopNav() {
  return (
    <header
      className={cn(
        "flex items-center gap-3 px-5 h-14 shrink-0 overflow-x-auto",
        "bg-[var(--bg-primary)] border-b border-[var(--border-tertiary)]",
        "sticky top-0 z-30"
      )}
    >
      {/* Search */}
      <div className="flex-1 min-w-[240px] max-w-[560px]">
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.75}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--icon-placeholder)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search clients, goals, meetings..."
            className={cn(
              "w-full h-10 pl-10 pr-14",
              "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]",
              "bg-[var(--bg-secondary)] border border-[var(--border-secondary)]",
              "rounded-[var(--radius-lg)]",
              "outline-none focus:border-[var(--border-brand-primary)] focus:bg-[var(--bg-primary)]",
              "transition-colors"
            )}
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 text-xs text-[var(--text-tertiary)] font-medium">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <div className="h-5 w-px bg-[var(--border-tertiary)] shrink-0 ml-auto" />

      {/* Quick Action — grouped by what the advisor is actually doing:
          growing the book, advising, or engaging. Icons match the side
          rail so a glyph means one thing across the app. */}
      <DropdownMenu>
        {/* The design system's own trigger — same 40px height, border,
            radius and chevron as the "All Leads" dropdown on /leads.
            No Button wrapper: fc-dropdown-trigger already is the control. */}
        <DropdownMenuTrigger icon={<Plus size={16} strokeWidth={2} />} className="shrink-0">
          Quick Action
        </DropdownMenuTrigger>
        <DropdownMenuContent alignment="start">
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Clients</DropdownMenuGroupLabel>
            <DropdownMenuItem icon={<UserPlus size={14} strokeWidth={1.75} />}>Add Lead</DropdownMenuItem>
            <DropdownMenuItem icon={<UserCheck size={14} strokeWidth={1.75} />}>Add Client</DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Advisory</DropdownMenuGroupLabel>
            <DropdownMenuItem icon={<Calendar size={14} strokeWidth={1.75} />}>Schedule Meeting</DropdownMenuItem>
            <DropdownMenuItem icon={<FileText size={14} strokeWidth={1.75} />}>Create Report</DropdownMenuItem>
            <DropdownMenuItem icon={<FlaskConical size={14} strokeWidth={1.75} />}>Create Simulation</DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Engagement</DropdownMenuGroupLabel>
            <DropdownMenuItem icon={<Library size={14} strokeWidth={1.75} />}>Create Content</DropdownMenuItem>
            <DropdownMenuItem icon={<Presentation size={14} strokeWidth={1.75} />}>Create Workshop</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Finny AI Copilot — Fincaree tertiary Button */}
      <Button
        variant="tertiary"
        size="sm"
        leadingIcon={<Sparkles size={14} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />}
        className="shrink-0 whitespace-nowrap"
      >
        <span className="text-[var(--text-secondary)]">Finny AI Copilot</span>
      </Button>

      {/* Light / dark mode */}
      <div className="shrink-0">
        <ThemeToggle />
      </div>

      {/* Notifications */}
      <button
        className="relative w-8 h-8 shrink-0 flex items-center justify-center rounded-[var(--radius-lg)] text-[var(--icon-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} strokeWidth={1.75} />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-error-500)] border border-white" />
      </button>

      {/* Advisor profile */}
      <button className="flex items-center gap-2 px-2 h-8 rounded-[var(--radius-lg)] hover:bg-[var(--bg-secondary)] transition-colors shrink-0 whitespace-nowrap">
        <Avatar size="xs" initials="AS" />
        <div className="text-left">
          <div className="text-[12px] font-semibold text-[var(--text-primary)] leading-tight whitespace-nowrap">
            Aditya Sharma
          </div>
          <div className="text-xs text-[var(--text-tertiary)] leading-tight whitespace-nowrap">
            RA · SEBI Reg.
          </div>
        </div>
        <ChevronDown size={12} strokeWidth={2} className="text-[var(--icon-tertiary)] shrink-0" />
      </button>
    </header>
  );
}
