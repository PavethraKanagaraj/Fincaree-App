"use client";

import { useMemo } from "react";
import { MeetingCard } from "./MeetingCard";
import {
  MeetingRecord,
  MeetingStatus,
  MEETING_STAGES,
  MeetingStageId,
  stageForStatus,
} from "./data";

/* ============================================================
   Meeting Board — Kanban view for /meetings
   Four fixed columns from MEETING_STAGES:
     ① Needs Prep    ② Upcoming
     ③ In Progress   ④ Completed
   Same structure as the Report Queue's ReportBoard.
   ============================================================ */

interface MeetingBoardProps {
  meetings: MeetingRecord[];
  onCardClick: (meeting: MeetingRecord) => void;
}

export function MeetingBoard({ meetings, onCardClick }: MeetingBoardProps) {
  const byStage = useMemo(() => {
    const groups = new Map<MeetingStageId, MeetingRecord[]>(MEETING_STAGES.map((s) => [s.id, [] as MeetingRecord[]]));
    for (const meeting of meetings) {
      groups.get(stageForStatus(meeting.status))!.push(meeting);
    }
    return groups;
  }, [meetings]);

  return (
    <div className="fc-board-scroller">
      {MEETING_STAGES.map((stage) => {
        const stageMeetings = byStage.get(stage.id) ?? [];

        const subGroups = stage.statuses
          .map((status: MeetingStatus) => ({
            status,
            items: stageMeetings.filter((m) => m.status === status),
          }))
          .filter((g) => g.items.length > 0);

        return (
          <section
            key={stage.id}
            aria-label={stage.label}
            className="flex-1 min-w-[320px] max-w-[420px] flex flex-col rounded-[var(--radius-xl)] bg-[var(--bg-subtle)]"
          >
            <header className="px-3 pt-3 pb-2.5 bg-[var(--bg-subtle)] rounded-t-[var(--radius-xl)]">
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: stage.accent }}
                >
                  {stage.number}
                </span>
                <h2 className="text-[13px] font-bold uppercase tracking-wide text-[var(--text-primary)]">{stage.label}</h2>
                <span className="ml-auto text-xs font-semibold text-[var(--text-tertiary)] bg-[var(--bg-primary)] border border-[var(--border-secondary)] rounded-full px-2 py-0.5">
                  {stageMeetings.length}
                </span>
              </div>
              <div className="mt-2.5 h-0.5 rounded-full" style={{ backgroundColor: stage.accent }} />
            </header>

            <div className="px-3 pb-3 flex flex-col gap-4 flex-1">
              {subGroups.length === 0 ? (
                <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-secondary)] py-8 text-center text-[12px] text-[var(--text-tertiary)]">
                  No meetings
                </div>
              ) : (
                subGroups.map((group) => (
                  <div key={group.status} className="flex flex-col gap-2">
                    {group.items.map((meeting) => (
                      <MeetingCard key={meeting.id} meeting={meeting} onClick={onCardClick} />
                    ))}
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
