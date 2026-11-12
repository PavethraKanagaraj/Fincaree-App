"use client";

/* ============================================================
   EngagementHealth — one overall picture of how a client is using
   the service, built from four things that are already tracked:

     Simulations   completed, of all started
     Learnings     modules finished, of all modules assigned
     Workshops     attended, of those already held (attended + missed)
     Plan applied  advice accepted or implemented, of the advice that
                   has reached the client

   The overall score is the average of the four. Everything is worked
   out from the profile's own data each time it renders, so the chart
   moves as soon as that data does; the "Live" mark shows it is not a
   snapshot. Colour follows the score: green from 70, amber from 40,
   red below.
   ============================================================ */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, BarChart3, ClipboardCheck, Users } from "lucide-react";
import { CountUp } from "@/components/ui/count-up";
import type { ClientProfileData } from "./client-data";
import { WORKSHOPS } from "./engagement-data";
import { ADVICE_HISTORY } from "./advice-data";

interface Dimension {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: number;
  detail: string;
}

const pct = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

function tone(score: number) {
  if (score >= 70) return { color: "var(--icon-status-success)", text: "text-[var(--text-status-success)]", label: "Healthy" };
  if (score >= 40) return { color: "var(--icon-status-warning)", text: "text-[var(--text-status-warning)]", label: "Needs a nudge" };
  return { color: "var(--icon-status-error)", text: "text-[var(--text-status-error)]", label: "At risk" };
}

export function EngagementHealth({ client }: { client: ClientProfileData }) {
  /* "Updated 2 min ago", ticking, so the chart reads as live. */
  const [minutes, setMinutes] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMinutes((m) => m + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const sims = client.simulations;
  const simsDone = sims.filter((s) => s.status === "completed").length;

  const modulesDone = client.learning.reduce((n, p) => n + p.completed, 0);
  const modulesAll = client.learning.reduce((n, p) => n + p.total, 0);

  const attended = WORKSHOPS.filter((w) => w.status === "attended").length;
  const held = WORKSHOPS.filter((w) => w.status === "attended" || w.status === "missed").length;

  const reached = ADVICE_HISTORY.filter((a) => a.status !== "draft" && a.status !== "advisor-reviewed");
  const applied = reached.filter((a) => a.status === "accepted" || a.status === "implemented").length;

  const dimensions: Dimension[] = [
    { id: "sim", label: "Simulations", icon: <BarChart3 size={16} strokeWidth={1.75} />, value: pct(simsDone, sims.length), detail: `${simsDone} of ${sims.length} completed` },
    { id: "learn", label: "Learnings", icon: <BookOpen size={16} strokeWidth={1.75} />, value: pct(modulesDone, modulesAll), detail: `${modulesDone} of ${modulesAll} modules finished` },
    { id: "ws", label: "Workshops", icon: <Users size={16} strokeWidth={1.75} />, value: pct(attended, held), detail: `${attended} of ${held} attended` },
    { id: "plan", label: "Suggested plan applied", icon: <ClipboardCheck size={16} strokeWidth={1.75} />, value: pct(applied, reached.length), detail: `${applied} of ${reached.length} advice items taken up` },
  ];

  const score = Math.round(dimensions.reduce((n, d) => n + d.value, 0) / dimensions.length);
  const overall = tone(score);

  return (
    <section aria-label="Engagement health" className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Engagement health</h2>
          <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">How {client.identity.name.split(" ")[0]} is using simulations, learnings, workshops and the suggested plan</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" style={{ backgroundColor: "var(--icon-status-success)" }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "var(--icon-status-success)" }} />
          </span>
          Live · {minutes === 0 ? "updated just now" : `updated ${minutes} min ago`}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-center">
        {/* The overall score as a ring that fills clockwise */}
        <div className="shrink-0 self-center">
          <div
            className="fc-sweep relative h-36 w-36 rounded-full"
            style={{ background: `conic-gradient(${overall.color} ${score * 3.6}deg, var(--bg-secondary) 0deg)` }}
            role="img"
            aria-label={`Overall engagement ${score} out of 100, ${overall.label}`}
          >
            <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-[var(--bg-primary)]">
              <span className="text-4xl font-bold leading-none tabular-nums text-[var(--text-primary)]">
                <CountUp value={score} delay={200} />
              </span>
              <span className={cn("mt-1 text-xs font-semibold", overall.text)}>{overall.label}</span>
            </div>
          </div>
        </div>

        {/* The four things behind it */}
        <ul className="grid flex-1 grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {dimensions.map((d, i) => {
            const t = tone(d.value);
            return (
              <li key={d.id}>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-secondary)] text-[var(--icon-tertiary)]" aria-hidden="true">
                    {d.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{d.label}</span>
                      <span className={cn("shrink-0 text-sm font-bold tabular-nums", t.text)}>
                        <CountUp value={d.value} delay={250 + i * 80} />%
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{d.detail}</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]" aria-hidden="true">
                  <div className="fc-grow h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: t.color, ["--rise-i" as string]: i }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
