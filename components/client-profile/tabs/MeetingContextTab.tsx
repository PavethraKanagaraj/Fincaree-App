"use client";

import { useState } from "react";
import { ClientMeeting } from "../client-data";
import { OPEN_LOOPS } from "../engagement-data";
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plus,
  CalendarPlus,
  Square,
  CheckSquare,
  ListChecks,
  FolderOpen,
  PlayCircle,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

interface AgendaItem {
  time: string;
  duration: string;
  title: string;
  description?: string;
}

interface Material {
  name: string;
  type: "pdf" | "document" | "spreadsheet";
  date: string;
}

const MEETING_TYPE_LABEL: Record<ClientMeeting["type"], string> = {
  discovery: "Discovery Call",
  proposal: "Proposal Meeting",
  review: "Review Meeting",
  quarterly: "Quarterly Review",
};

function PhaseLabel({ icon: Icon, title, subtext }: { icon: any; title: string; subtext: string }) {
  return (
    <div className="flex items-baseline gap-2.5 mb-3">
      <Icon size={13} className="text-[var(--icon-tertiary)] flex-shrink-0 translate-y-[1px]" />
      <div className="flex items-baseline gap-2 flex-wrap">
        <h2 className="text-[13px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{title}</h2>
        <span className="text-[13px] text-[var(--text-tertiary)]">— {subtext}</span>
      </div>
    </div>
  );
}

export function MeetingContextTab({ meeting, onBack }: { meeting: ClientMeeting; onBack?: () => void }) {
  const [notes, setNotes] = useState("");
  const [decisions, setDecisions] = useState<string[]>(["Retirement target updated to age 58"]);
  const [newDecision, setNewDecision] = useState("");
  const [clientDone, setClientDone] = useState<Record<number, boolean>>({});
  const [advisorDone, setAdvisorDone] = useState<Record<number, boolean>>({});
  const [agendaDone, setAgendaDone] = useState<Record<number, boolean>>({ 0: true });
  const [referenceOpen, setReferenceOpen] = useState(false);

  const addDecision = () => {
    if (!newDecision.trim()) return;
    setDecisions((prev) => [...prev, newDecision.trim()]);
    setNewDecision("");
  };

  const agendaItems: AgendaItem[] = [
    { time: "10:30", duration: "5 mins", title: "Welcome and recap" },
    { time: "10:35", duration: "10 mins", title: "Goal progress review", description: "Retirement, Education, Wealth" },
    { time: "10:45", duration: "10 mins", title: "Portfolio review", description: "Performance and allocation" },
    { time: "10:55", duration: "10 mins", title: "Pending actions and open questions" },
    { time: "11:05", duration: "5 mins", title: "Plan for next year", description: "Meetings, learning, simulations" },
    { time: "11:10", duration: "0 mins", title: "Next steps and close" },
  ];

  const materials: Material[] = [
    { name: "Goal Progress Report", type: "pdf", date: "Updated 25 Aug 2025" },
    { name: "Portfolio Summary", type: "pdf", date: "Updated 24 Aug 2025" },
    { name: "Retirement Simulation", type: "document", date: "Last run 20 Aug 2025" },
    { name: "Education Planning Note", type: "pdf", date: "Updated 18 Aug 2025" },
    { name: "Action Tracker", type: "spreadsheet", date: "Updated 15 Aug 2025" },
  ];

  const discussionPriorities = [
    { number: 1, title: "Review updated retirement projections", description: "Discuss impact of revised retirement age (58)" },
    { number: 2, title: "Education goal planning", description: "Understand additional funding options" },
    { number: 3, title: "Portfolio review", description: "Discuss allocation drift and rebalancing options" },
    { number: 4, title: "Review pending action", description: "Increase SIP contribution after bonus review" },
    { number: 5, title: "Plan activities for next year", description: "Finalize goals, learning paths and key milestones" },
  ];

  const openQuestions = [
    "Should we consider increasing equity allocation?",
    "How much additional funding is required for education?",
    "Would you like to explore tax-saving options for this year?",
  ];

  const changedSinceLastMeeting = [
    { label: "Retirement target", change: "Age 60 → 58", isNew: false },
    { label: "Child education goal", change: "₹25L → ₹35L", isNew: false },
    { label: "Healthcare expense", change: "New", isNew: true },
    { label: "Portfolio value", change: "+6.2% since last review", isNew: false },
    { label: "Risk profile", change: "No change", isNew: false },
  ];

  return (
    <div className="space-y-8">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors w-fit"
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Back to Overview
        </button>
      )}

      {/* Meeting Header — orientation only, kept compact */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-6 border-b border-[var(--border-tertiary)]">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
            <Calendar size={18} className="text-[var(--icon-tertiary)]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg font-bold text-[var(--text-primary)]">{meeting.title}</h1>
              <span className="text-[12px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--bg-brand-subtle)] text-[var(--text-brand-primary)]">
                {MEETING_TYPE_LABEL[meeting.type]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] flex-wrap mb-2">
              <Clock size={13} className="text-[var(--icon-tertiary)]" />
              <span>{meeting.date}</span>
              <span>•</span>
              <span>{meeting.time}</span>
              <span>•</span>
              <span>{meeting.duration}</span>
              <span>•</span>
              <span className="capitalize">{meeting.mode} Meeting</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">{meeting.description}</p>
          </div>
        </div>
      </div>

      {/* ============================================================
          PHASE 1 — PREPARE
          One unified briefing: what changed, what Finny thinks
          matters, what to raise. This is the 90% use case — the
          advisor has 5 minutes before the call and needs one
          place to get ready, not four cards to cross-reference.
          ============================================================ */}
      <div>
        <PhaseLabel icon={ListChecks} title="Prepare" subtext="what to know and raise before you start" />
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-brand-secondary)] bg-[var(--bg-brand-subtle)] p-5">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={13} className="text-[var(--icon-brand-primary)]" />
            <span className="text-xs font-semibold text-[var(--text-brand-primary)] uppercase tracking-wider">Finny Meeting Brief</span>
          </div>
          <p className="text-[13px] text-[var(--text-brand-secondary)] mb-3">Evidence-backed insights</p>
          <ul className="space-y-1.5 text-[12px] text-[var(--text-secondary)] mb-3">
            <li>• Retirement timeline moved from 60 to 58.</li>
            <li>• Portfolio 5% away from target allocation.</li>
            <li>• Education goal amount increased by ₹10L.</li>
            <li>• 1 action pending from last meeting.</li>
          </ul>
          <button className="text-[12px] font-semibold text-[var(--text-brand-primary)] hover:underline flex items-center gap-1 mb-4">
            View evidence <ArrowRight size={11} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[var(--border-brand-secondary)]">
            {/* What changed */}
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">What changed since last meeting</p>
              <div className="space-y-1.5">
                {changedSinceLastMeeting.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.isNew && (
                        <span className="text-xs font-bold text-white bg-[var(--color-info-500)] px-1 py-0.5 rounded flex-shrink-0">New</span>
                      )}
                      <span className="text-[12px] text-[var(--text-secondary)] truncate">{item.label}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-[var(--text-primary)] whitespace-nowrap flex-shrink-0">{item.change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Talking points: priorities + open questions */}
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2">Talking points</p>
              <div className="space-y-1.5 mb-3">
                {discussionPriorities.slice(0, 4).map((item) => (
                  <div key={item.number} className="flex items-start gap-2">
                    <span className="text-[12px] font-bold text-[var(--text-brand-primary)] flex-shrink-0 mt-0.5">{item.number}.</span>
                    <p className="text-[12px] text-[var(--text-secondary)]">{item.title}</p>
                  </div>
                ))}
              </div>
              <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Open questions</p>
              <div className="space-y-1">
                {openQuestions.map((q, idx) => (
                  <p key={idx} className="text-[12px] text-[var(--text-secondary)]">? {q}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          PHASE 2 — REFERENCE
          Situational, not read every time. Collapsed by default.
          ============================================================ */}
      <div>
        <button onClick={() => setReferenceOpen((v) => !v)} className="w-full flex items-center justify-between group">
          <PhaseLabel icon={FolderOpen} title="Reference" subtext="materials and prior meeting, if you need them" />
          <ChevronDown size={14} className={`text-[var(--icon-tertiary)] transition-transform mb-3 ${referenceOpen ? "rotate-180" : ""}`} />
        </button>
        {referenceOpen && (
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Relevant Materials</p>
              <div className="space-y-1">
                {materials.map((material, idx) => (
                  <button key={idx} className="w-full flex items-start gap-2.5 p-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-secondary)] transition-colors text-left">
                    <FileText size={13} className="text-[var(--icon-tertiary)] mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">{material.name}</p>
                      <p className="text-[13px] text-[var(--text-tertiary)]">{material.type.charAt(0).toUpperCase() + material.type.slice(1)} • {material.date}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Previous Meeting Context</p>
              <p className="text-xs font-semibold text-[var(--text-primary)] mb-1.5">Plan Discussion · 20 May 2025</p>
              <ul className="text-[12px] text-[var(--text-secondary)] space-y-1">
                <li>• Discussed goal prioritisation</li>
                <li>• Agreed to increase SIP contribution after bonus review</li>
                <li>• Shared retirement simulation</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          PHASE 3 — DURING THE MEETING
          The live runbook. Checkable so it doubles as pacing.
          ============================================================ */}
      <div>
        <PhaseLabel icon={PlayCircle} title="During the meeting" subtext="the agenda, live" />
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Agenda</p>
            <span className="text-xs text-[var(--text-tertiary)]">{meeting.duration}</span>
          </div>
          <div>
            {agendaItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setAgendaDone((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                className="w-full flex items-start gap-3 py-2.5 px-2 hover:bg-[var(--bg-secondary)] rounded-[var(--radius-md)] transition-colors text-left"
              >
                {agendaDone[idx] ? (
                  <CheckSquare size={15} className="text-[var(--text-status-success)] flex-shrink-0 mt-0.5" />
                ) : (
                  <Square size={15} className="text-[var(--icon-tertiary)] flex-shrink-0 mt-0.5" />
                )}
                <span className="text-xs font-bold text-[var(--text-brand-primary)] min-w-fit mt-0.5">{item.time}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${agendaDone[idx] ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"}`}>
                    {item.title}
                  </p>
                  {item.description && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.description}</p>}
                </div>
                <span className="text-xs font-medium text-[var(--text-tertiary)] min-w-fit mt-0.5">{item.duration}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          PHASE 4 — AFTER THE MEETING
          Capture and close.
          ============================================================ */}
      <div>
        <PhaseLabel icon={CheckCircle2} title="After the meeting" subtext="capture notes, decisions and commitments" />
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-tertiary)] bg-[var(--bg-primary)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notes */}
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Capture notes during the meeting..."
                rows={4}
                className="w-full text-xs bg-[var(--bg-secondary)] border border-[var(--border-tertiary)] rounded-[var(--radius-md)] p-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--border-brand-secondary)] resize-none"
              />
            </div>

            {/* Decisions */}
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Decisions</p>
              <div className="space-y-1.5 mb-2">
                {decisions.map((d, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-[var(--radius-md)] bg-[var(--bg-secondary)]">
                    <CheckCircle2 size={13} className="text-[var(--text-status-success)] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[var(--text-primary)]">{d}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={newDecision}
                  onChange={(e) => setNewDecision(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addDecision()}
                  placeholder="Add a decision..."
                  className="flex-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border-tertiary)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--border-brand-secondary)]"
                />
                <button
                  onClick={addDecision}
                  className="flex-shrink-0 w-8 h-8 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] flex items-center justify-center transition-colors"
                >
                  <Plus size={14} className="text-[var(--icon-tertiary)]" />
                </button>
              </div>
            </div>

            {/* Client commitments */}
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Client Commitments</p>
              <div className="space-y-1.5">
                {OPEN_LOOPS.client.map((item, idx) => (
                  <button
                    key={item.title}
                    onClick={() => setClientDone((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className="w-full flex items-center gap-2 p-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-secondary)] transition-colors text-left"
                  >
                    {clientDone[idx] ? (
                      <CheckSquare size={14} className="text-[var(--text-status-success)] flex-shrink-0" />
                    ) : (
                      <Square size={14} className="text-[var(--icon-tertiary)] flex-shrink-0" />
                    )}
                    <p className={`text-xs flex-1 ${clientDone[idx] ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"}`}>
                      {item.title}
                    </p>
                    {item.due && <span className="text-[13px] text-[var(--text-tertiary)] flex-shrink-0">Due {item.due}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Advisor commitments */}
            <div>
              <p className="text-[13px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Advisor Commitments</p>
              <div className="space-y-1.5">
                {OPEN_LOOPS.advisor.map((item, idx) => (
                  <button
                    key={item.title}
                    onClick={() => setAdvisorDone((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className="w-full flex items-center gap-2 p-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-secondary)] transition-colors text-left"
                  >
                    {advisorDone[idx] ? (
                      <CheckSquare size={14} className="text-[var(--text-status-success)] flex-shrink-0" />
                    ) : (
                      <Square size={14} className="text-[var(--icon-tertiary)] flex-shrink-0" />
                    )}
                    <p className={`text-xs flex-1 ${advisorDone[idx] ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"}`}>
                      {item.title}
                    </p>
                    {item.due && <span className="text-[13px] text-[var(--text-tertiary)] flex-shrink-0">Due {item.due}</span>}
                  </button>
                ))}
                {OPEN_LOOPS.pending.map((item) => (
                  <div key={item.title} className="flex items-center gap-2 p-2">
                    <AlertTriangle size={13} className="text-[var(--text-status-warning)] flex-shrink-0" />
                    <p className="text-xs text-[var(--text-secondary)] flex-1">{item.title}</p>
                    <span className="text-[12px] font-semibold text-[var(--text-status-warning)] flex-shrink-0">Pending</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next meeting */}
          <div className="mt-5 pt-5 border-t border-[var(--border-tertiary)] flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <CalendarPlus size={15} className="text-[var(--icon-tertiary)]" />
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">Next Meeting</p>
                <p className="text-[13px] text-[var(--text-tertiary)]">Not yet scheduled</p>
              </div>
            </div>
            <button className="text-xs font-semibold text-white bg-[var(--bg-brand-primary)] px-3.5 py-2 rounded-[var(--radius-md)] hover:opacity-90 transition-opacity">
              Schedule Next Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Primary action */}
      <button className="w-full bg-[var(--bg-brand-primary)] text-white text-sm font-semibold py-3 rounded-[var(--radius-md)] hover:opacity-90 transition-opacity">
        Start Meeting
      </button>
    </div>
  );
}
