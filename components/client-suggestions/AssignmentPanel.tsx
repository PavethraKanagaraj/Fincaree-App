"use client";

/* ============================================================
   AssignmentPanel — RIGHT PANEL
   Package details, a real AI compliance review, and assignment
   to either an individual client or a client group.
   Sourcing: Fincaree Button · Badge · Avatar · custom
   ============================================================ */

import { useState } from "react";
import { Button } from "@/components/fincaree/button";
import { Badge } from "@/components/fincaree/badge";
import { Avatar } from "@/components/fincaree/avatar";
import { Input } from "@/components/fincaree/input";
import { ComplianceBadge } from "./ComplianceBadge";
import { cn } from "@/lib/utils";
import type { ContentItem, Client, ClientGroup, PackageItem, MeetingStage, AssignmentTarget } from "./data";
import { MEETING_STAGE_LABELS } from "./data";
import {
  Sparkles,
  Send,
  Save,
  ShieldCheck,
  X,
  Search,
  User2,
  Users,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type AssignMode = "individual" | "group";
type RightTab = "details" | "assign";

interface AssignmentPanelProps {
  packageItems: PackageItem[];
  allContent: ContentItem[];
  packageName: string;
  stage: MeetingStage;
  clients: Client[];
  groups: ClientGroup[];
  assignment: AssignmentTarget | null;
  onAssignmentChange: (target: AssignmentTarget | null) => void;
  onRunAiReview: () => void;
  reviewing: boolean;
  onSaveDraft: () => void;
  onAssignAndSend: () => void;
  sending: boolean;
  saving: boolean;
}

const PLAN_COLOR: Record<string, "brand" | "warning" | "gray"> = {
  Platinum: "brand",
  Gold: "warning",
  Silver: "gray",
};

const SEVERITY_COLOR: Record<string, string> = {
  high: "text-[var(--icon-status-error)]",
  medium: "text-[var(--icon-status-warning)]",
  low: "text-[var(--text-tertiary)]",
};

export function AssignmentPanel({
  packageItems,
  allContent,
  stage,
  clients,
  groups,
  assignment,
  onAssignmentChange,
  onRunAiReview,
  reviewing,
  onSaveDraft,
  onAssignAndSend,
  sending,
  saving,
}: AssignmentPanelProps) {
  const [rightTab, setRightTab] = useState<RightTab>("details");
  const [clientSearch, setClientSearch] = useState("");
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);

  function getContent(contentId: string): ContentItem | undefined {
    return allContent.find((c) => c.id === contentId);
  }

  const packageContent = packageItems.map((pi) => getContent(pi.contentId)).filter(Boolean) as ContentItem[];
  const flagged = packageContent.filter((c) => c.compliance.status === "flagged");
  const pending = packageContent.filter((c) => c.compliance.status === "pending" || c.compliance.status === "not-reviewed");
  const approved = packageContent.filter((c) => c.compliance.status === "approved").length;

  const assignMode: AssignMode = assignment?.type === "group" ? "group" : "individual";
  const selectedClientIds = assignment?.type === "individual" ? assignment.clientIds : [];
  const selectedGroupId = assignment?.type === "group" ? assignment.groupId : null;
  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const hasTarget = assignMode === "individual" ? selectedClientIds.length > 0 : !!selectedGroupId;
  const canSend = flagged.length === 0 && packageItems.length > 0 && hasTarget;

  const filteredClients = clients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
  const selectedClients = clients.filter((c) => selectedClientIds.includes(c.id));

  function toggleClient(id: string) {
    const current = assignment?.type === "individual" ? assignment.clientIds : [];
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    onAssignmentChange({ type: "individual", clientIds: next });
  }

  function selectGroup(id: string) {
    onAssignmentChange({ type: "group", groupId: id });
  }

  function switchMode(mode: AssignMode) {
    if (mode === "individual") onAssignmentChange({ type: "individual", clientIds: [] });
    else onAssignmentChange(null);
  }

  return (
    <div className="flex flex-col h-full border-l border-[var(--border-tertiary)] bg-[var(--bg-primary)]">
      {/* Sub-tabs: Path Details | Assign */}
      <div className="shrink-0 flex border-b border-[var(--border-tertiary)]">
        {(["details", "assign"] as RightTab[]).map((tab) => {
          const labels: Record<RightTab, string> = { details: "Path Details", assign: "Assign" };
          const active = rightTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setRightTab(tab)}
              className={cn(
                "flex-1 px-3 py-3 text-xs font-semibold border-b-2 transition-colors duration-100",
                active
                  ? "border-[var(--border-brand-primary)] text-[var(--text-brand-primary)]"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              )}
            >
              {labels[tab]}
              {tab === "assign" && hasTarget && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-success-500)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {rightTab === "details" && (
          <div className="px-4 py-4 space-y-4">
            {/* Path Settings */}
            <div>
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Path Settings</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Advisory Stage</p>
                  <div className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--border-secondary)] bg-[var(--bg-secondary)] flex items-center justify-between">
                    <span className="text-sm text-[var(--text-primary)]">{MEETING_STAGE_LABELS[stage]}</span>
                    <ChevronRight size={14} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Estimated Duration</p>
                  <Input size="sm" placeholder="e.g. 45–60 mins" defaultValue={packageContent.length > 0 ? "45–60 mins" : ""} />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-tertiary)]" />

            {/* AI Compliance Review — real, not a static banner */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">AI Compliance Review</p>
                {pending.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={reviewing ? <Loader2 size={12} strokeWidth={2} className="animate-spin" /> : <Sparkles size={12} strokeWidth={1.75} />}
                    onClick={onRunAiReview}
                    disabled={reviewing}
                  >
                    {reviewing ? "Reviewing…" : `Review ${pending.length}`}
                  </Button>
                )}
              </div>

              {packageItems.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)]">Add items to run a compliance check.</p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <ComplianceBadge status="approved" />
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{approved}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <ComplianceBadge status="pending" />
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{pending.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <ComplianceBadge status="flagged" />
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{flagged.length}</span>
                    </div>
                  </div>

                  {/* Flagged items — the actual findings, not just a count */}
                  {flagged.length > 0 && (
                    <div className="space-y-2">
                      {flagged.map((item) => {
                        const expanded = expandedFindingId === item.id;
                        return (
                          <div key={item.id} className="rounded-[var(--radius-md)] border border-[var(--border-status-error-subtle)] bg-[var(--bg-status-error-subtle)] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedFindingId(expanded ? null : item.id)}
                              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left"
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                <ShieldCheck size={13} strokeWidth={2} className="text-[var(--icon-status-error)] shrink-0" />
                                <span className="text-xs font-medium text-[var(--text-status-error-strong)] truncate">{item.title}</span>
                              </span>
                              <ChevronDown size={13} strokeWidth={2} className={cn("text-[var(--icon-status-error)] shrink-0 transition-transform", expanded && "rotate-180")} />
                            </button>
                            {expanded && (
                              <div className="px-3 pb-3 space-y-2.5">
                                {item.compliance.findings.map((f) => (
                                  <div key={f.id} className="text-xs">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <AlertTriangle size={11} strokeWidth={2} className={SEVERITY_COLOR[f.severity]} />
                                      <span className="font-semibold text-[var(--text-primary)]">{f.rule}</span>
                                      {f.location && <span className="text-[var(--text-tertiary)]">· {f.location}</span>}
                                    </div>
                                    <p className="text-[var(--text-secondary)]">{f.issue}</p>
                                    <p className="text-[var(--text-tertiary)] mt-0.5">Suggestion: {f.suggestion}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <p className="text-[11px] text-[var(--text-tertiary)]">Fix flagged issues in the source content, then re-run the review.</p>
                    </div>
                  )}

                  {pending.length > 0 && flagged.length === 0 && (
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      {pending.length} item{pending.length > 1 ? "s" : ""} not yet checked — run the AI review before sending.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {rightTab === "assign" && (
          <div className="px-4 py-4 space-y-4">
            {/* Individual vs Group */}
            <div>
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Assign To</p>
              <div className="space-y-2">
                {(["individual", "group"] as AssignMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => switchMode(mode)}
                    className="flex items-center gap-3 w-full text-left focus-visible:outline-none"
                  >
                    <span className={cn(
                      "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                      assignMode === mode ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-primary)]" : "border-[var(--border-secondary)]"
                    )}>
                      {assignMode === mode && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                      {mode === "individual" ? (
                        <><User2 size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" /> One or more individual clients</>
                      ) : (
                        <><Users size={13} strokeWidth={1.75} className="text-[var(--icon-tertiary)]" /> A client group</>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {assignMode === "individual" ? (
              <>
                <div>
                  <p className="text-xs font-medium text-[var(--text-secondary)] mb-1.5">Select Clients</p>
                  <Input
                    size="sm"
                    placeholder="Search client by name"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    leadingIcon={<Search size={13} strokeWidth={1.75} />}
                  />
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {filteredClients.map((client) => {
                    const isSelected = selectedClientIds.includes(client.id);
                    return (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => toggleClient(client.id)}
                        className={cn(
                          "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[var(--radius-lg)] border text-left transition-colors duration-100",
                          isSelected ? "bg-[var(--bg-brand-subtle)] border-[var(--border-brand-primary)]" : "bg-[var(--bg-primary)] border-[var(--border-secondary)] hover:bg-[var(--bg-secondary)]"
                        )}
                      >
                        <Avatar size="xs" initials={client.initials} className={isSelected ? "ring-2 ring-[var(--border-brand-primary)]" : ""} />
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-xs font-medium truncate", isSelected ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>{client.name}</p>
                          <p className="text-[10px] text-[var(--text-tertiary)] truncate">{client.id} · {client.lifeStage}</p>
                        </div>
                        <Badge size="sm" color={PLAN_COLOR[client.plan]}>{client.plan}</Badge>
                        {isSelected && (
                          <button onClick={(e) => { e.stopPropagation(); toggleClient(client.id); }} className="shrink-0 text-[var(--icon-brand-primary)]" aria-label="Deselect client">
                            <X size={12} strokeWidth={2} />
                          </button>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedClients.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Selected ({selectedClients.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedClients.map((c) => (
                        <div key={c.id} className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-full)] bg-[var(--bg-brand-subtle)] border border-[var(--border-brand-primary)]">
                          <Avatar size="xs" initials={c.initials} />
                          <span className="text-xs font-medium text-[var(--text-brand-primary)]">{c.name}</span>
                          <button onClick={() => toggleClient(c.id)} className="text-[var(--icon-brand-primary)] hover:text-[var(--icon-brand-secondary)]">
                            <X size={11} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-1.5">
                {groups.map((group) => {
                  const isSelected = selectedGroupId === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => selectGroup(group.id)}
                      className={cn(
                        "flex items-start gap-2.5 w-full px-3 py-2.5 rounded-[var(--radius-lg)] border text-left transition-colors duration-100",
                        isSelected ? "bg-[var(--bg-brand-subtle)] border-[var(--border-brand-primary)]" : "bg-[var(--bg-primary)] border-[var(--border-secondary)] hover:bg-[var(--bg-secondary)]"
                      )}
                    >
                      <Users size={14} strokeWidth={1.75} className={cn("shrink-0 mt-0.5", isSelected ? "text-[var(--icon-brand-primary)]" : "text-[var(--icon-tertiary)]")} />
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-xs font-semibold truncate", isSelected ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>{group.name}</p>
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{group.memberIds.length} clients{group.criteria ? ` · ${group.criteria}` : ""}</p>
                      </div>
                      {isSelected && <ShieldCheck size={13} strokeWidth={2} className="text-[var(--icon-brand-primary)] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
                {selectedGroup && (
                  <p className="text-[11px] text-[var(--text-tertiary)] pt-1">
                    Sending to <span className="font-semibold text-[var(--text-secondary)]">{selectedGroup.memberIds.length} clients</span> in {selectedGroup.name}.
                  </p>
                )}
              </div>
            )}

            {!canSend && packageItems.length > 0 && (
              <p className="text-xs text-[var(--text-tertiary)]">
                {flagged.length > 0 ? "Fix flagged items before sending." : !hasTarget ? "Select at least one client or a group to assign." : ""}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="shrink-0 px-4 py-3 border-t border-[var(--border-tertiary)] space-y-2">
        <Button variant="secondary" size="sm" className="w-full" leadingIcon={<Save size={13} strokeWidth={1.75} />} onClick={onSaveDraft} loading={saving}>
          Save as Draft
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          leadingIcon={<Send size={13} strokeWidth={1.75} />}
          onClick={() => { setRightTab("assign"); onAssignAndSend(); }}
          loading={sending}
          disabled={!canSend}
        >
          Assign &amp; Send
        </Button>
      </div>
    </div>
  );
}
