"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Input } from "@/components/fincaree/input";
import { SelectField, SelectItem } from "@/components/fincaree/select";
import { Checkbox } from "@/components/fincaree/checkbox";
import { Button } from "@/components/fincaree/button";
import { Send } from "lucide-react";

/* ============================================================
   Invite Contact — how an advisor brings their own network into
   the pipeline. An outside contact has no goals, income or consent
   on file, so this is an invite, not a lead form: the advisor
   supplies only a name and a way to reach them, the contact joins
   Fincaree and shares the rest themselves. Until they do, the lead
   waits in Invited.

   The consent checkbox is required — it is the advisor attesting
   they may contact this person, before Fincaree holds more than
   a name.
   ============================================================ */

export interface ContactInvite {
  name: string;
  contact: string;
  /** Empty when the advisor chose "Not sure yet". */
  goal: string;
}

const NOT_SURE = "not-sure";
const GOAL_ITEMS: Record<string, string> = {
  [NOT_SURE]: "Not sure yet",
  Retirement: "Retirement",
  "Buy a home": "Buy a home",
  "Wealth building": "Wealth building",
  "Child's education": "Child's education",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/;

interface InviteContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (invite: ContactInvite) => void;
}

export function InviteContactDialog({ open, onOpenChange, onInvite }: InviteContactDialogProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [goal, setGoal] = useState(NOT_SURE);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameError = name.trim() ? undefined : "Enter the contact's name";
  const trimmedContact = contact.trim();
  const contactError = !trimmedContact
    ? "Enter a mobile number or email"
    : EMAIL_RE.test(trimmedContact) || MOBILE_RE.test(trimmedContact)
      ? undefined
      : "Enter a valid 10-digit mobile number or an email";
  const consentError = consent ? undefined : "Confirm you have their permission to contact them";

  function reset() {
    setName("");
    setContact("");
    setGoal(NOT_SURE);
    setConsent(false);
    setSubmitted(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (nameError || contactError || consentError) return;
    onInvite({ name: name.trim(), contact: trimmedContact, goal: goal === NOT_SURE ? "" : goal });
    handleOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-[440px]">
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-5 pt-5 pb-4 pr-12">
            <ModalTitle>Invite a contact</ModalTitle>
            <ModalDescription className="mt-1">
              They get an invite to join Fincaree and share their goals and finances themselves. Until they do, they wait in Invited.
            </ModalDescription>
          </div>

          <div className="px-5 pb-5 flex flex-col gap-4">
            <Input
              label="Full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={submitted ? nameError : undefined}
              autoComplete="off"
            />
            <Input
              label="Mobile number or email"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              error={submitted ? contactError : undefined}
              hint="Where we send the invite"
              autoComplete="off"
            />
            <SelectField
              label="Main goal"
              hint="Optional — they can add or change goals when they join"
              value={goal}
              onValueChange={(v: unknown) => setGoal(v as string)}
              items={GOAL_ITEMS}
            >
              {Object.keys(GOAL_ITEMS).map((g) => (
                <SelectItem key={g} value={g}>{GOAL_ITEMS[g]}</SelectItem>
              ))}
            </SelectField>

            <div>
              <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={submitted && !!consentError}>
                I have this person&apos;s permission to contact them about Fincaree
              </Checkbox>
              {submitted && consentError && (
                <p role="alert" className="mt-1.5 text-xs text-[var(--text-status-error)]">{consentError}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border-tertiary)]">
            <Button type="button" variant="tertiary" size="md" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" leadingIcon={<Send size={14} strokeWidth={2} />}>
              Send invite
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
