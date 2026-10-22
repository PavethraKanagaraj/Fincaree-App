"use client";

import { Tag } from "@/components/fincaree/tag";
import { PipelineLead, leadGoals } from "./pipeline-data";

/* ============================================================
   Goal Tags — a lead's goals as a wrapping row of tags, so a lead
   with one goal and a lead with five read at the same scale. Shows
   the first `max` goals; the rest collapse into a "+N" tag whose
   title lists them.
   ============================================================ */

interface GoalTagsProps {
  lead: PipelineLead;
  max?: number;
}

export function GoalTags({ lead, max = 2 }: GoalTagsProps) {
  const goals = leadGoals(lead);
  const shown = goals.slice(0, max);
  const hidden = goals.slice(max);

  if (goals.length === 0) {
    return (
      <ul className="flex flex-wrap items-center gap-1 mt-1" aria-label="Goals">
        <li><Tag color="grey" size="sm">Goals pending</Tag></li>
      </ul>
    );
  }

  return (
    <ul className="flex flex-wrap items-center gap-1 mt-1" aria-label="Goals">
      {shown.map((g) => (
        <li key={g}>
          <Tag color="grey" size="sm">{g}</Tag>
        </li>
      ))}
      {hidden.length > 0 && (
        <li>
          <Tag color="grey" size="sm" title={hidden.join(", ")} aria-label={`${hidden.length} more: ${hidden.join(", ")}`}>
            +{hidden.length}
          </Tag>
        </li>
      )}
    </ul>
  );
}
