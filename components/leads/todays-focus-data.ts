/* ============================================================
   Today's Focus — derived, not authored

   The old card typed its numbers into a data file, so they drifted
   from the page: it said "2 discovery calls" while the calendar
   showed 3, and "4/6 done" beside four unchecked tasks. Every count
   and name here is computed from the same pipeline the board and the
   calendar read, so the three can't disagree.

   Each task maps to one of the board's existing filters. Selecting a
   task filters the pipeline to exactly the leads it counts — the
   number on the card and the number of cards on the board are the
   same number.
   ============================================================ */

import { PIPELINE_LEADS, PipelineLead } from "./pipeline-data";
import { PIPELINE_TODAY, formatTime, meetingsOn } from "./meeting-calendar";

/** A subset of the leads page's filter ids — the ones a task can scope to. */
export type FocusFilter = "today-meetings" | "needs-followup" | "ready-to-plan" | "decision-pending";

export interface FocusTask {
  id: FocusFilter;
  title: string;
  /** The one lead worth naming, and why. */
  context: string;
  count: number;
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const most = <T,>(xs: T[], by: (x: T) => number): T | undefined => xs.reduce<T | undefined>((a, b) => (a === undefined || by(b) > by(a) ? b : a), undefined);
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const inStage = (stage: PipelineLead["stage"]) => PIPELINE_LEADS.filter((l) => l.stage === stage);

function buildTasks(): FocusTask[] {
  const tasks: FocusTask[] = [];

  // Meetings today — the board's "Today's Meetings" filter matches on the
  // same label, so its count is the count of the calendar's Today.
  const today = meetingsOn(PIPELINE_TODAY);
  if (today.length > 0) {
    const allDiscovery = today.every((m) => m.lead.stage === "discovery-call");
    const next = today[0]!;
    tasks.push({
      id: "today-meetings",
      title: `Prepare for ${plural(today.length, allDiscovery ? "discovery call" : "meeting")}`,
      context: `Next up: ${next.lead.name} · ${formatTime(next.start)}`,
      count: today.length,
    });
  }

  const followUp = inStage("needs-followup");
  const quietest = most(followUp, (l) => l.lastActivitySort);
  if (quietest) {
    tasks.push({
      id: "needs-followup",
      title: `Follow up with ${plural(followUp.length, "lead")}`,
      context: `Longest quiet: ${quietest.name} · ${quietest.lastActivitySort} days`,
      count: followUp.length,
    });
  }

  const ready = inStage("ready-for-advice");
  const fullest = most(ready, (l) => l.completeness ?? 0);
  if (fullest) {
    tasks.push({
      id: "ready-to-plan",
      title: `Review ${plural(ready.length, "lead")} ready for advice`,
      context: `Most complete: ${fullest.name} · ${fullest.completeness}%`,
      count: ready.length,
    });
  }

  const deciding = inStage("decision-pending");
  const waiting = most(deciding, (l) => l.lastActivitySort);
  if (waiting) {
    tasks.push({
      id: "decision-pending",
      title: `Check in on ${plural(deciding.length, "plan decision")}`,
      context: `${waiting.name} · ${lowerFirst(waiting.planSharedNote ?? `quiet ${waiting.lastActivitySort} days`)}`,
      count: deciding.length,
    });
  }

  return tasks;
}

export const FOCUS_TASKS: FocusTask[] = buildTasks();
