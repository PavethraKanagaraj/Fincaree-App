"use client";

import { useMemo, useState } from "react";
import { ActivityRecord, ActivityActor, ActivityCategory, ACTIVITY_CATEGORY_LABEL, DiscoveryContext } from "../client-data";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Calendar, Lightbulb, Wallet, BookOpen, MessageCircle, CheckSquare, Search, X, ArrowRight, Compass } from "lucide-react";

const CATEGORY_ICON: Record<ActivityCategory, any> = {
  meeting: Calendar,
  advice: Lightbulb,
  financial: Wallet,
  learning: BookOpen,
  communication: MessageCircle,
  task: CheckSquare,
};

const ACTOR_STYLE: Record<string, string> = {
  client: "bg-[var(--bg-brand-subtle)] text-[var(--text-brand-primary)]",
  advisor: "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]",
  ai: "bg-[var(--bg-status-info-subtle)] text-[var(--text-status-info-strong)]",
  system: "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]",
};

const ACTOR_LABEL: Record<ActivityActor, string> = {
  client: "Client",
  advisor: "Advisor",
  ai: "AI",
  system: "System",
};

const RANGE_DAYS: Record<string, number> = { "30d": 30, "90d": 90, "1y": 365, all: 100000 };
const RANGE_LABELS = { "30d": "Last 30 days", "90d": "Last 90 days", "1y": "Last year", all: "All time" };

function daysAgo(sortDateTime: string): number {
  const today = new Date("2025-08-24T23:59");
  return Math.floor((today.getTime() - new Date(sortDateTime).getTime()) / (1000 * 60 * 60 * 24));
}

function countBy<T extends string>(records: ActivityRecord[], key: "category" | "actor"): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of records) {
    const k = r[key] as T;
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

export function ActivityTab({ activity, discoveryContext }: { activity: ActivityRecord[]; discoveryContext: DiscoveryContext }) {
  const [category, setCategory] = useState<ActivityCategory | "all">("all");
  const [range, setRange] = useState<keyof typeof RANGE_LABELS>("90d");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activity
      .filter((a) => category === "all" || a.category === category)
      .filter((a) => daysAgo(a.sortDateTime) <= RANGE_DAYS[range])
      .filter((a) => !q || `${a.title} ${a.description ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.sortDateTime).getTime() - new Date(a.sortDateTime).getTime());
  }, [activity, category, range, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, ActivityRecord[]>();
    for (const a of filtered) {
      if (!map.has(a.date)) map.set(a.date, []);
      map.get(a.date)!.push(a);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const thisWeekCount = useMemo(() => activity.filter((a) => daysAgo(a.sortDateTime) <= 7).length, [activity]);

  const categoryCounts = useMemo(() => countBy<ActivityCategory>(filtered, "category"), [filtered]);
  const actorCounts = useMemo(() => countBy<ActivityActor>(filtered, "actor"), [filtered]);
  const maxCategoryCount = Math.max(1, ...Object.values(categoryCounts));
  const mostActiveCategory = useMemo(() => {
    const counts = countBy<ActivityCategory>(activity, "category");
    const top = (Object.entries(counts) as [ActivityCategory, number][]).sort((a, b) => b[1] - a[1])[0];
    return top ? ACTIVITY_CATEGORY_LABEL[top[0]] : "—";
  }, [activity]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Activity</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">The complete, chronological record of this client relationship.</p>
      </div>

      {/* Discovery Call — pinned context, visually distinct from ordinary activity */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-2.5 min-w-0">
            <Compass size={15} className="text-[var(--icon-brand-primary)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider mb-1">Original Discovery Context</p>
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">Discovery Call · {discoveryContext.date}</p>
              <p className="text-xs text-[var(--text-secondary)] mb-1">Client initially sought:</p>
              <ul className="text-xs text-[var(--text-secondary)] space-y-0.5">
                {discoveryContext.initialGoals.map((g) => (
                  <li key={g}>• {g}</li>
                ))}
              </ul>
            </div>
          </div>
          <button className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline flex items-center gap-1 flex-shrink-0">
            View original discovery information <ArrowRight size={11} />
          </button>
        </div>
      </div>

      {/* Orientation strip */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] px-5 py-4">
        <div className="flex flex-wrap gap-y-3">
          {[
            { label: "Total Records", value: String(activity.length) },
            { label: "This Week", value: String(thisWeekCount) },
            { label: "Most Active", value: mostActiveCategory },
            { label: "Showing", value: `${filtered.length} of ${activity.length}` },
          ].map((item, i) => (
            <div key={item.label} className={`flex-1 min-w-[130px] px-4 ${i > 0 ? "border-l border-[var(--border-tertiary)]" : "pl-0"}`}>
              <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + search + date range */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategory("all")}
            className={`text-[13px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
              category === "all" ? "bg-[var(--bg-brand-primary)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]"
            }`}
          >
            All
          </button>
          {(Object.keys(ACTIVITY_CATEGORY_LABEL) as ActivityCategory[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-[13px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                category === c ? "bg-[var(--bg-brand-primary)] text-white" : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]"
              }`}
            >
              {ACTIVITY_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SelectField
            size="sm"
            value={range}
            onValueChange={(v: unknown) => setRange(v as keyof typeof RANGE_LABELS)}
            className="w-[140px]"
            aria-label="Date range"
            items={RANGE_LABELS}
          >
            {(Object.keys(RANGE_LABELS) as (keyof typeof RANGE_LABELS)[]).map((k) => (
              <SelectItem key={k} value={k}>{RANGE_LABELS[k]}</SelectItem>
            ))}
          </SelectField>
          <div className="relative w-52">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--icon-tertiary)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity..."
              className="w-full text-xs bg-[var(--bg-secondary)] border border-[var(--border-tertiary)] rounded-[var(--radius-md)] pl-8 pr-7 py-1.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--border-brand-secondary)]"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--icon-tertiary)] hover:text-[var(--icon-primary)]">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline + composition sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-6 items-start">
        {/* Exhaustive chronological timeline */}
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          {grouped.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] py-8 text-center">No activity matches these filters.</p>
          ) : (
            <div className="space-y-5">
              {grouped.map(([date, records]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider whitespace-nowrap">{date}</span>
                    <div className="h-px flex-1 bg-[var(--border-tertiary)]" />
                  </div>
                  <div className="relative">
                    {/* Centered on the icon circle: px-0.5 (2px) + time column (56px) + gap-3 (12px) + half the 24px circle (12px) */}
                    <div className="absolute left-[82px] top-2 bottom-2 w-px bg-[var(--border-tertiary)]" />
                    {records.map((record) => {
                      const Icon = CATEGORY_ICON[record.category];
                      return (
                        <div key={record.id} className="flex items-start gap-3 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-secondary)] transition-colors px-0.5 relative z-10">
                          <span className="text-[13px] text-[var(--text-tertiary)] w-14 flex-shrink-0 pt-1.5">{record.time}</span>
                          <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                            <Icon size={12} strokeWidth={2} className="text-[var(--icon-tertiary)]" />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded flex-shrink-0 ${ACTOR_STYLE[record.actor]}`}>
                                {record.actor}
                              </span>
                              <p className="text-xs font-semibold text-[var(--text-primary)]">{record.title}</p>
                            </div>
                            {record.description && <p className="text-[13px] text-[var(--text-secondary)]">{record.description}</p>}
                            {record.source && <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">Source: {record.source}</p>}
                          </div>
                          <span className="text-[12px] text-[var(--text-tertiary)] flex-shrink-0 pt-1.5">{ACTIVITY_CATEGORY_LABEL[record.category]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Composition sidebar — what the current view is made of */}
        <div className="space-y-4 xl:sticky xl:top-4">
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">By Category</h3>
            <div className="space-y-2.5">
              {(Object.keys(ACTIVITY_CATEGORY_LABEL) as ActivityCategory[]).map((c) => {
                const count = categoryCounts[c] ?? 0;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[12px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{ACTIVITY_CATEGORY_LABEL[c]}</span>
                      <span className="text-[12px] font-semibold text-[var(--text-primary)]">{count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--bg-brand-primary)]" style={{ width: `${(count / maxCategoryCount) * 100}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-4">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">By Actor</h3>
            <div className="space-y-2">
              {(Object.keys(ACTOR_LABEL) as ActivityActor[]).map((a) => (
                <div key={a} className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${ACTOR_STYLE[a]}`}>{a}</span>
                  <span className="text-[12px] font-semibold text-[var(--text-primary)]">{actorCounts[a] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
