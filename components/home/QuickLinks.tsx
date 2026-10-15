"use client";

/* ============================================================
   QuickLinks — the rest of the workspace that isn't a queue:
   Content Management (the library the Send tab opens into) and
   a client's full workspace. Same row idiom as the Meeting Desk
   drawer's Quick Access section: label, one-line context, chevron.
   ============================================================ */

import Link from "next/link";
import { Library, UserCircle2, ChevronRight } from "lucide-react";

const LINKS = [
  {
    href: "/content-management",
    icon: <Library size={16} strokeWidth={1.75} />,
    label: "Content Management",
    supporting: "Reports, learning, simulations and resources to share",
  },
  {
    href: "/client-profile",
    icon: <UserCircle2 size={16} strokeWidth={1.75} />,
    label: "Client Profile",
    supporting: "Anika Rao's full client workspace",
  },
];

export function QuickLinks() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
      <div className="text-base font-semibold text-[var(--text-primary)] mb-0.5">Quick Links</div>
      <div className="divide-y divide-[var(--border-tertiary)]">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 py-2.5 group"
          >
            <span className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] text-[var(--icon-tertiary)] flex items-center justify-center shrink-0">
              {link.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--text-brand-primary)] transition-colors">
                {link.label}
              </span>
              <span className="block text-xs text-[var(--text-tertiary)] truncate">{link.supporting}</span>
            </span>
            <ChevronRight
              size={14}
              strokeWidth={1.75}
              className="text-[var(--icon-tertiary)] group-hover:text-[var(--icon-secondary)] transition-colors shrink-0"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
