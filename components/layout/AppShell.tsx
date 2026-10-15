import { SideNav } from "./SideNav";
import { TopNav } from "./TopNav";

/* ============================================================
   Fincaree App Shell
   Layout: SideNav (left, fixed) + TopNav (top, sticky) + content area
   ============================================================ */

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-canvas)]">
      {/* Left sidebar */}
      <SideNav />

      {/* Right: top + content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
