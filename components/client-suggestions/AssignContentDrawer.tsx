"use client";

/* ============================================================
   AssignContentDrawer — one item, sent deliberately

   This is the fast path. Most sharing in a solo practice is one
   piece of content to one client, or the same piece to everyone
   who shares a goal. Neither should require building a path.

   Two shapes behind one toggle:

   INDIVIDUAL   pick the client, see why this is relevant to
                them right now, write a line, send.

   GROUP        compose the audience from facets, see the count
                update live, review the actual recipients before
                anything goes out.

   Finny may point at clients the facets cannot see — people who
   raised the topic in a meeting. Those are never counted in the
   match and never pre-selected. The advisor adds them or doesn't.

   Nothing sends on its own. [Assign & Send] is the only exit.
   ============================================================ */

import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/fincaree/button";
import { Badge } from "@/components/fincaree/badge";
import { Avatar } from "@/components/fincaree/avatar";
import { Input } from "@/components/fincaree/input";
import { Checkbox } from "@/components/fincaree/checkbox";
import { Radio } from "@/components/fincaree/radio";
import { Textarea } from "@/components/fincaree/textarea";
import { cn } from "@/lib/utils";
import type { ContentItem, Client, ClientPlan, Topic, EngagementState4, AdvisoryContext, DeliveryChannel } from "./content-data";
import {
  COMPLIANCE_STATUS_LABEL,
  TOPIC_LABEL,
  ENGAGEMENT_STATE_LABEL,
  ADVISORY_CONTEXT_LABEL,
  DELIVERY_CHANNEL_LABEL,
  DELIVERY_CHANNEL_HINT,
} from "./content-data";
import { COMPLIANCE_BADGE_COLOR, getTypeVisual, typeLabel } from "./content-visual";
import { GROUP_GOAL_OPTIONS, audienceHintFor } from "./learning-path-data";
import { Sparkles, Search, User2, UsersRound, Check, ChevronRight, ArrowLeft, Send } from "lucide-react";

type Mode = "individual" | "group";

const PLAN_OPTIONS: ClientPlan[] = ["Silver", "Gold", "Platinum"];
const ENGAGEMENT_OPTIONS: EngagementState4[] = ["highly-engaged", "active", "needs-attention", "inactive"];
const CONTEXT_OPTIONS: AdvisoryContext[] = ["review-due", "goal-off-track", "new-client"];
const CHANNELS: DeliveryChannel[] = ["portal", "whatsapp", "email"];

interface AssignContentDrawerProps {
  item: ContentItem | null;
  clients: Client[];
  onClose: () => void;
  onAssign: (itemId: string, clientIds: string[], channel: DeliveryChannel, message: string) => void;
}

/* ─────────── Small pieces ─────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">{children}</p>;
}

function FacetGroup<T extends string>({
  label,
  options,
  selected,
  labelFor,
  onToggle,
}: {
  label: string;
  options: T[];
  selected: T[];
  labelFor: (o: T) => string;
  onToggle: (o: T) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">{label}</p>
      <div className="space-y-1">
        {options.map((o) => (
          <Checkbox key={o} size="sm" checked={selected.includes(o)} onChange={() => onToggle(o)} className="flex gap-2 py-0.5">
            <span className="text-xs text-[var(--text-secondary)]">{labelFor(o)}</span>
          </Checkbox>
        ))}
      </div>
    </div>
  );
}

function ClientRow({
  client,
  trailing,
  onClick,
}: {
  client: Client;
  trailing?: React.ReactNode;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "flex items-center gap-2.5 w-[calc(100%+2rem)] -mx-4 px-4 py-2.5 text-left",
        onClick && "hover:bg-[var(--bg-secondary)] transition-colors"
      )}
    >
      <Avatar size="xs" initials={client.initials} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[var(--text-primary)] truncate">{client.name}</p>
        <p className="text-xs text-[var(--text-tertiary)] truncate">
          {client.plan} · {TOPIC_LABEL[client.primaryGoal]}
        </p>
      </div>
      {trailing}
    </Wrapper>
  );
}

/* ─────────── Why this client, right now ─────────── */
function ClientContext({ client, item }: { client: Client; item: ContentItem }) {
  const goalMatch = client.goals.includes(item.topic);
  return (
    <div className="pt-3 border-t border-[var(--border-tertiary)] space-y-1.5">
      {goalMatch ? (
        <div className="flex items-start gap-1.5">
          <Check size={12} strokeWidth={2.5} className="text-[var(--icon-status-success)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">{TOPIC_LABEL[item.topic]}</span> is an active goal
          </p>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-tertiary)]">
          {TOPIC_LABEL[item.topic]} is not a recorded goal — their goal is {TOPIC_LABEL[client.primaryGoal]}
        </p>
      )}
      <p className="text-xs text-[var(--text-secondary)]">
        Next review: <span className="font-medium text-[var(--text-primary)]">{client.nextReviewInDays} days</span>
      </p>
      {client.advisoryContext.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {client.advisoryContext.map((c) => (
            <Badge key={c} size="sm" color={c === "goal-off-track" ? "warning" : c === "new-client" ? "gray-blue" : "gray"}>
              {ADVISORY_CONTEXT_LABEL[c]}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/* Outer shell: nothing to render without an item. Kept separate from the
   body so every hook below runs unconditionally — an early `return null`
   in front of hooks changes the hook count between renders and crashes
   ("Rendered more hooks than during the previous render"). `key` also
   gives every item a fresh drawer instead of leaking the last picked
   client, message and facets into the next one. */
export function AssignContentDrawer(props: AssignContentDrawerProps) {
  if (!props.item) return null;
  return <AssignContentDrawerBody key={props.item.id} {...props} item={props.item} />;
}

function AssignContentDrawerBody({
  item,
  clients,
  onClose,
  onAssign,
}: Omit<AssignContentDrawerProps, "item"> & { item: ContentItem }) {
  const [mode, setMode] = useState<Mode>("individual");
  const [search, setSearch] = useState("");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<DeliveryChannel>("portal");

  /* Group facets */
  const [goals, setGoals] = useState<Topic[]>([]);
  const [plans, setPlans] = useState<ClientPlan[]>([]);
  const [engagement, setEngagement] = useState<EngagementState4[]>([]);
  const [contexts, setContexts] = useState<AdvisoryContext[]>([]);

  /* Finny's extras are opt-in, one at a time */
  const [hintOpen, setHintOpen] = useState(false);
  const [acceptedHintIds, setAcceptedHintIds] = useState<string[]>([]);
  const [reviewing, setReviewing] = useState(false);

  const content = item;

  const cfg = getTypeVisual(item);
  const picked = clients.find((c) => c.id === pickedId) ?? null;
  const hint = audienceHintFor(item.topic);

  /* Facet match — every chosen facet group must match (AND across groups,
     OR within a group), which is how an advisor actually thinks about it. */
  const matched = useMemo(() => {
    if (goals.length + plans.length + engagement.length + contexts.length === 0) return [];
    return clients.filter(
      (c) =>
        (goals.length === 0 || goals.some((g) => c.goals.includes(g))) &&
        (plans.length === 0 || plans.includes(c.plan)) &&
        (engagement.length === 0 || engagement.includes(c.engagement)) &&
        (contexts.length === 0 || contexts.some((x) => c.advisoryContext.includes(x)))
    );
  }, [clients, goals, plans, engagement, contexts]);

  /* Hints only count if they aren't already matched. */
  const hintClients = useMemo(() => {
    if (!hint) return [];
    const matchedIds = new Set(matched.map((c) => c.id));
    return hint.clientIds.map((id) => clients.find((c) => c.id === id)).filter((c): c is Client => !!c && !matchedIds.has(c.id));
  }, [hint, matched, clients]);

  const acceptedClients = hintClients.filter((c) => acceptedHintIds.includes(c.id));
  const recipients = mode === "individual" ? (picked ? [picked] : []) : [...matched, ...acceptedClients];
  const canSend = recipients.length > 0;

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients.slice(0, 8);
    return clients.filter((c) => c.name.toLowerCase().includes(q) || TOPIC_LABEL[c.primaryGoal].toLowerCase().includes(q)).slice(0, 12);
  }, [clients, search]);

  function toggle<T>(list: T[], set: (v: T[]) => void, v: T) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  function send() {
    if (!canSend) return;
    onAssign(content.id, recipients.map((c) => c.id), channel, message.trim());
    onClose();
  }

  /* ── Recipient review — the advisor sees the actual list ── */
  if (reviewing) {
    return (
      <Sheet open onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="right" className="sm:w-[520px]">
          <SheetHeader className="border-b border-[var(--border-tertiary)] pb-4">
            <button
              type="button"
              onClick={() => setReviewing(false)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-brand-primary)] hover:underline mb-2 w-fit"
            >
              <ArrowLeft size={12} strokeWidth={2} />
              Back to audience
            </button>
            <SheetTitle className="text-base">Review recipients</SheetTitle>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {recipients.length} client{recipients.length === 1 ? "" : "s"} will receive {item.title}.
            </p>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-[var(--border-tertiary)]">
            {recipients.map((c) => (
              <ClientRow
                key={c.id}
                client={c}
                trailing={
                  acceptedHintIds.includes(c.id) ? (
                    <Badge size="sm" color="brand">
                      Finny
                    </Badge>
                  ) : undefined
                }
              />
            ))}
          </div>
          <div className="shrink-0 border-t border-[var(--border-tertiary)] p-4">
            <Button variant="primary" size="sm" className="w-full" onClick={() => setReviewing(false)}>
              Looks right
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="sm:w-[520px]">
        <SheetHeader className="border-b border-[var(--border-tertiary)] pb-4">
          <SheetTitle className="text-base">{mode === "group" ? "Assign to Client Group" : "Assign Content"}</SheetTitle>

          {/* What is being sent — never ambiguous */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border-tertiary)]">
            <div className={cn("w-9 h-9 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center", cfg.bgColor, cfg.iconColor)}>
              {cfg.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.title}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {typeLabel(item)} · {TOPIC_LABEL[item.topic]}
              </p>
            </div>
            <Badge size="sm" color={COMPLIANCE_BADGE_COLOR[item.compliance.status]}>
              {COMPLIANCE_STATUS_LABEL[item.compliance.status]}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* ── Send to ── */}
          <div>
            <SectionLabel>Send to</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {(["individual", "group"] as Mode[]).map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-lg)] border text-left transition-colors",
                      active
                        ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]"
                        : "border-[var(--border-secondary)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]"
                    )}
                  >
                    <span className={active ? "text-[var(--icon-brand-primary)]" : "text-[var(--icon-tertiary)]"}>
                      {m === "individual" ? <User2 size={15} strokeWidth={1.75} /> : <UsersRound size={15} strokeWidth={1.75} />}
                    </span>
                    <span className={cn("text-xs font-semibold", active ? "text-[var(--text-brand-primary)]" : "text-[var(--text-secondary)]")}>
                      {m === "individual" ? "Individual Client" : "Client Group"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Individual ── */}
          {mode === "individual" && (
            <div>
              {picked ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <SectionLabel>Client</SectionLabel>
                    <button
                      type="button"
                      onClick={() => setPickedId(null)}
                      className="text-xs font-semibold text-[var(--text-brand-primary)] hover:underline -mt-2"
                    >
                      Change
                    </button>
                  </div>
                  <ClientRow client={picked} />
                  <ClientContext client={picked} item={item} />
                </div>
              ) : (
                <div className="space-y-2.5">
                  <Input
                    size="sm"
                    placeholder="Search client…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leadingIcon={<Search size={14} strokeWidth={1.75} />}
                  />
                  <div className="divide-y divide-[var(--border-tertiary)]">
                    {filteredClients.map((c) => (
                      <ClientRow
                        key={c.id}
                        client={c}
                        onClick={() => setPickedId(c.id)}
                        trailing={<ChevronRight size={13} strokeWidth={2} className="text-[var(--icon-tertiary)] shrink-0" />}
                      />
                    ))}
                    {filteredClients.length === 0 && (
                      <p className="text-xs text-[var(--text-tertiary)] px-3 py-4 text-center">No client matches “{search}”.</p>
                    )}
                  </div>
                  {!search && <p className="text-xs text-[var(--text-tertiary)]">Showing 8 of {clients.length} — search to narrow.</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Group ── */}
          {mode === "group" && (
            <div className="space-y-4">
              <div>
                <SectionLabel>Define the audience</SectionLabel>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[var(--border-tertiary)] py-4">
                  <FacetGroup label="Goal" options={GROUP_GOAL_OPTIONS} selected={goals} labelFor={(g) => TOPIC_LABEL[g]} onToggle={(g) => toggle(goals, setGoals, g)} />
                  <FacetGroup label="Plan" options={PLAN_OPTIONS} selected={plans} labelFor={(p) => p} onToggle={(p) => toggle(plans, setPlans, p)} />
                  <FacetGroup
                    label="Engagement"
                    options={ENGAGEMENT_OPTIONS}
                    selected={engagement}
                    labelFor={(e) => ENGAGEMENT_STATE_LABEL[e]}
                    onToggle={(e) => toggle(engagement, setEngagement, e)}
                  />
                  <FacetGroup
                    label="Advisory context"
                    options={CONTEXT_OPTIONS}
                    selected={contexts}
                    labelFor={(c) => ADVISORY_CONTEXT_LABEL[c]}
                    onToggle={(c) => toggle(contexts, setContexts, c)}
                  />
                </div>
              </div>

              {/* Live match */}
              <div
                className={cn(
                  "flex items-center justify-between gap-3 py-3",
                  matched.length > 0 && "-mx-4 px-4 bg-[var(--bg-brand-subtle)]"
                )}
              >
                {matched.length > 0 ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--text-brand-primary)] tabular-nums">
                      {matched.length} client{matched.length === 1 ? "" : "s"} match
                      {acceptedClients.length > 0 && (
                        <span className="font-medium text-[var(--text-brand-secondary)]"> + {acceptedClients.length} added</span>
                      )}
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => setReviewing(true)}>
                      Review Clients
                    </Button>
                  </>
                ) : (
                  <p className="text-xs text-[var(--text-tertiary)]">Pick at least one facet to compose the group.</p>
                )}
              </div>

              {/* Finny's audience suggestion — additional, never included */}
              {hint && hintClients.length > 0 && (
                <div className="-mx-4 px-4 py-4 bg-[var(--bg-brand-subtle)]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={13} strokeWidth={1.75} className="text-[var(--icon-brand-primary)]" />
                    <p className="text-xs font-semibold text-[var(--text-brand-primary)]">Finny Suggestion</p>
                  </div>
                  {matched.length > 0 && (
                    <p className="text-xs text-[var(--text-brand-secondary)] leading-relaxed mb-1.5">
                      This content is relevant to the {matched.length} client{matched.length === 1 ? "" : "s"} your facets matched.
                    </p>
                  )}
                  <p className="text-xs text-[var(--text-brand-secondary)] leading-relaxed">
                    <span className="font-semibold">
                      {hintClients.length} additional client{hintClients.length === 1 ? "" : "s"}
                    </span>{" "}
                    may also benefit — {hint.reason.charAt(0).toLowerCase() + hint.reason.slice(1)}.
                  </p>

                  {!hintOpen ? (
                    <Button variant="secondary" size="sm" className="mt-2.5" onClick={() => setHintOpen(true)}>
                      Review {hintClients.length} Suggestion{hintClients.length === 1 ? "" : "s"}
                    </Button>
                  ) : (
                    <div className="mt-2.5 divide-y divide-[var(--border-brand-tint)]">
                      {hintClients.map((c) => {
                        const on = acceptedHintIds.includes(c.id);
                        return (
                          <ClientRow
                            key={c.id}
                            client={c}
                            trailing={
                              <Button
                                variant={on ? "tertiary" : "secondary"}
                                size="sm"
                                onClick={() => toggle(acceptedHintIds, setAcceptedHintIds, c.id)}
                                leadingIcon={on ? <Check size={12} strokeWidth={2.5} /> : undefined}
                              >
                                {on ? "Added" : "Add"}
                              </Button>
                            }
                          />
                        );
                      })}
                      <p className="text-xs text-[var(--text-brand-secondary)] pt-1">
                        These aren&apos;t counted in the match. Add the ones you agree with.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Message ── */}
          <div>
            <SectionLabel>Message to client</SectionLabel>
            <Textarea
              rows={3}
              placeholder="Please go through this before our next retirement review."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Optional. Sent alongside the content.</p>
          </div>

          {/* ── Delivery ── */}
          <div>
            <SectionLabel>Delivery</SectionLabel>
            <div className="space-y-1.5">
              {CHANNELS.map((ch) => {
                const active = channel === ch;
                return (
                  <label
                    key={ch}
                    className={cn(
                      "flex items-start gap-2.5 px-3 py-2.5 rounded-[var(--radius-lg)] border cursor-pointer transition-colors",
                      active
                        ? "border-[var(--border-brand-primary)] bg-[var(--bg-brand-subtle)]"
                        : "border-[var(--border-secondary)] bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)]"
                    )}
                  >
                    <Radio size="sm" name="delivery" checked={active} onChange={() => setChannel(ch)} className="mt-0.5" />
                    <div className="min-w-0">
                      <p className={cn("text-xs font-medium", active ? "text-[var(--text-brand-primary)]" : "text-[var(--text-primary)]")}>
                        {DELIVERY_CHANNEL_LABEL[ch]}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{DELIVERY_CHANNEL_HINT[ch]}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-[var(--border-tertiary)] p-4">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              disabled={!canSend}
              leadingIcon={<Send size={13} strokeWidth={1.75} />}
              onClick={send}
            >
              Assign &amp; Send
            </Button>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] text-center mt-2">
            {canSend
              ? `Goes to ${recipients.length} client${recipients.length === 1 ? "" : "s"} via ${DELIVERY_CHANNEL_LABEL[channel]}.`
              : mode === "individual"
              ? "Choose a client to continue."
              : "Compose an audience to continue."}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
