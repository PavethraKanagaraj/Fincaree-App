/* ============================================================
   client-summary — the handful of profile facts worth showing on the
   Clients list, so the advisor does not have to open every profile.

   They are the same facts the client profile shows: the assets you advise them on,
   how they feel about risk, how far their main goal has got, and when
   their plan renews. Only Anika Rao has a full profile in the app, so
   for everyone else these are sample values worked out from the client's
   plan, life stage and open items, the same way every time. They are
   placeholders until each profile is connected to real data.
   ============================================================ */

import type { Client } from "@/components/client-suggestions/content-data";
import { ANIKA_RAO } from "./client-data";
import { silverPlanEndsInDays } from "@/components/home/home-data";

export type RiskProfile = "conservative" | "moderate" | "aggressive";
export type GoalStatus = "on-track" | "needs-review" | "needs-attention";

export interface ClientSummary {
  /** Assets under advice (AUA): the value of everything the advisor advises this client on, in rupees. */
  assetsUnderAdvice: number;
  risk: RiskProfile;
  /** Percent of the main goal reached, 0 to 100. */
  goalProgress: number;
  goalStatus: GoalStatus;
  /** Days until the plan renews or ends; negative once it has ended. */
  planInDays: number;
}

/** How many goals each plan covers. Silver is the advisory plan: one or two small goals. The Gold and
    Platinum limits are placeholders until the plans are priced and defined. */
export const GOAL_LIMIT_BY_PLAN: Record<Client["plan"], number> = { Silver: 2, Gold: 4, Platinum: 6 };

const hash = (s: string) => [...s].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 100_003, 7);
const within = (h: number, lo: number, hi: number) => lo + ((h % 1000) / 1000) * (hi - lo);

const CRORE = 10_000_000;
const LAKH = 100_000;

export function clientSummary(c: Client): ClientSummary {
  const h = hash(c.id);

  const assetsUnderAdvice =
    c.id === "C12345"
      ? 1.2 * CRORE
      : c.plan === "Platinum"
        ? within(h, 2.5 * CRORE, 9 * CRORE)
        : c.plan === "Gold"
          ? within(h, 0.6 * CRORE, 2.4 * CRORE)
          : within(h, 4 * LAKH, 35 * LAKH);

  const risk: RiskProfile =
    c.id === "C12345" ? ANIKA_RAO.identity.riskProfile : c.lifeStage === "retired" ? "conservative" : c.lifeStage === "pre-retirement" ? "moderate" : h % 2 === 0 ? "moderate" : "aggressive";

  const off = c.advisoryContext.includes("goal-off-track");
  const due = c.advisoryContext.includes("review-due");
  const goalStatus: GoalStatus = off ? "needs-attention" : due ? "needs-review" : "on-track";
  const goalProgress = Math.round(off ? within(h, 28, 52) : due ? within(h, 52, 72) : within(h, 70, 96));

  const planInDays = silverPlanEndsInDays(c.id) ?? Math.round(within(h, 20, 330));

  return { assetsUnderAdvice, risk, goalProgress, goalStatus, planInDays };
}

/** ₹1.2 Cr, ₹24 L */
export function formatRupees(n: number): string {
  if (n >= CRORE) return `₹${(n / CRORE).toFixed(1)} Cr`;
  return `₹${Math.round(n / LAKH)} L`;
}

