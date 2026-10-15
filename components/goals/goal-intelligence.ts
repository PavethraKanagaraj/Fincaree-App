/* ============================================================
   Goal intelligence — the AI layer shown at the start of each goal
   category and sub-goal. It explains why planning for the goal helps,
   and gives a recommendation tailored to the customer's profile and to
   the advisor they subscribed to.

   This is rule-based guidance, not a model call. Profile and advisor
   data below are placeholders until they are connected to the account
   and advisor services.
   ============================================================ */

export type Gender = "male" | "female";

export const CUSTOMER = {
  name: "Arjun Mehta",
  age: 61,
  gender: "male" as Gender,
  lifeStage: "Retired",
};

/** Advisor the customer subscribed to, with the goals they have served. */
export const ADVISOR = {
  name: "Aditya Sharma",
  designation: "RA · SEBI Reg.",
  activeClients: 86,
  /** Number of goals of each kind the advisor has planned for clients. */
  served: {
    retirementIncome: 24,
    healthCover: 31,
    emergencyFund: 19,
    termLife: 17,
    livingSupport: 15,
    travel: 11,
    celebration: 6,
    daughterMarriage: 14,
    education: 18,
    elderlyParents: 12,
    grandchildren: 7,
    homeUpgrade: 9,
    hobbies: 4,
    wealthTransfer: 8,
    charitable: 5,
    inheritance: 6,
  } as Record<string, number>,
  /** Areas where the advisor's plans have had the strongest client outcomes. */
  bestServiced: ["healthCover", "retirementIncome"],
};

export type AdvisorStat = { count: number | null; label: string; best: boolean };

export type Guidance = { why: string; recommendation: string; advisor: AdvisorStat; followUp?: string };

const isRetired = () => CUSTOMER.lifeStage === "Retired" || CUSTOMER.lifeStage === "Semi-retired";
const isSenior = () => CUSTOMER.age >= 55;

/* Planning horizon depends on life expectancy, which differs by gender.
   Used as the basis for income and withdrawal recommendations. */
function planningAge() {
  return CUSTOMER.gender === "female" ? 90 : 85;
}

function advisorNote(key: string, label: string): AdvisorStat {
  return { count: ADVISOR.served[key] ?? null, label, best: ADVISOR.bestServiced.includes(key) };
}

/* ── categories ── */

export const CATEGORY_GUIDANCE: Record<string, () => Guidance> = {
  retirement: () => ({
    why: "Retirement is when your savings must provide your income for many years. A clear plan keeps that income steady.",
    recommendation: isRetired()
      ? "Plan monthly needs from regular income sources first, and draw on savings only for the rest."
      : "Estimate the income you'll need after retirement, then work back to the savings needed.",
    advisor: advisorNote("retirementIncome", "retirement"),
  }),
  grow: () => ({
    why: "Growing savings works best when they're spread across suitable options and matched to the date you need the money.",
    recommendation: isSenior()
      ? "Keep money needed in the next few years in accessible savings, so market falls don't affect it."
      : "Balance growth and stability against the date you need the money.",
    advisor: advisorNote("grow", "portfolio"),
  }),
  major: () => ({
    why: "Large one-time costs are easier to plan when they're funded in advance, rather than from monthly income.",
    recommendation: isRetired()
      ? "Fund these from savings you already have, so your monthly budget stays intact."
      : "Set a target date and amount so the goal can be funded in steady steps.",
    advisor: advisorNote("homeUpgrade", "major goal"),
  }),
  protect: () => ({
    why: "Health and income protection keep a sudden shock from reaching your long-term savings.",
    recommendation: isSenior()
      ? `At ${CUSTOMER.age}, cover is harder to get and costs more. Review health cover first.`
      : "Review health cover and income protection before other goals.",
    advisor: advisorNote("healthCover", "health and protection"),
  }),
  emergency: () => ({
    why: "An emergency fund stops unexpected costs from forcing you to sell long-term investments at the wrong time.",
    recommendation: isRetired()
      ? "Aim for 12 months of essential costs in accessible savings, since there's no salary to fall back on."
      : "Aim for 6 months of essential costs in accessible savings.",
    advisor: advisorNote("emergencyFund", "emergency fund"),
  }),
  family: () => ({
    why: "Support for family is often a major planned cost. Naming each commitment makes it easier to plan.",
    recommendation: "Confirm which family commitments are fixed and which are flexible, so the plan can prioritise the fixed ones.",
    advisor: advisorNote("education", "family and education"),
  }),
  taxes: () => ({
    why: "Tax costs reduce what you keep from your savings. Planning withdrawals and holdings in advance can lower them.",
    recommendation: isRetired()
      ? "Plan the order of withdrawals so your tax bill stays manageable each year."
      : "Review tax-saving options well before the financial year ends.",
    advisor: advisorNote("taxes", "tax planning"),
  }),
  legacy: () => ({
    why: "A clear legacy plan protects your family and reduces disputes. It works best when assets are listed and nominations are up to date.",
    recommendation: isSenior()
      ? "Start with a list of your assets and check nominations. A will review is usually the first step at this stage."
      : "List your assets and check nominations now, so the next steps are straightforward.",
    advisor: advisorNote("wealthTransfer", "estate and wealth transfer"),
  }),
  loans: () => ({
    why: "Reducing high-cost debt frees up monthly cashflow for your other goals.",
    recommendation: "Prioritise the loan with the highest interest rate, since prepayment has the greatest effect there.",
    advisor: advisorNote("loans", "loan planning"),
  }),
};

/* ── sub-goals, keyed by the label shown in the questionnaire ── */

const SUB_KEY: Record<string, string> = {
  "Retirement corpus": "retirementIncome",
  "Early retirement": "retirementIncome",
  "Lifestyle after retirement": "livingSupport",
  "Home": "homeUpgrade",
  "Education": "education",
  "Travel": "travel",
  "Health": "healthCover",
  "Life insurance": "termLife",
  "Income protection": "termLife",
  "Medical expenses": "healthCover",
  "Access to money": "emergencyFund",
  "Children's education": "education",
  "Dependent parents": "elderlyParents",
  "Family support": "grandchildren",
  "Estate": "wealthTransfer",
  "Inheritance": "inheritance",
  "Nomination": "inheritance",
  "Retirement income": "retirementIncome",
  "Monthly living support": "livingSupport",
  "Health insurance top-up": "healthCover",
  "Term life cover": "termLife",
  "Emergency fund": "emergencyFund",
  "Travel & experiences": "travel",
  "Grand celebration": "celebration",
  "Daughter marriage": "daughterMarriage",
  "Sons higher education": "education",
  "Supporting elderly parents": "elderlyParents",
  "Supporting grandchildren expenses": "grandchildren",
  "Home upgrade": "homeUpgrade",
  "Hobbies & memberships": "hobbies",
  "Wealth transfer": "wealthTransfer",
  "Charitable giving": "charitable",
  "Inheritance planning": "inheritance",
};

const SUB_GUIDANCE: Record<string, () => Guidance> = {
  retirementIncome: () => ({
    why: "Your savings now need to provide your income for many years. A plan for regular withdrawals keeps that income steady.",
    recommendation: `Plan to a horizon of about age ${planningAge()}, the planning age for your profile. Keep 2–3 years of essential costs in accessible savings.`,
    advisor: advisorNote("retirementIncome", "retirement income"),
  }),
  livingSupport: () => ({
    why: "Turns savings into a steady monthly income for essential costs, so they're covered each month.",
    recommendation: "Separate essential costs from discretionary spending, so withdrawals stay sustainable.",
    advisor: advisorNote("livingSupport", "monthly living support"),
  }),
  healthCover: () => ({
    why: "Medical costs rise about 12% a year. Cover that's adequate today may fall short in five years.",
    recommendation: isSenior()
      ? `At ${CUSTOMER.age}, a top-up is usually the most cost-effective way to add cover. Review it early.`
      : "A top-up is usually the most cost-effective way to add cover. Compare options before renewal.",
    advisor: advisorNote("healthCover", "health cover"),
  }),
  termLife: () => ({
    why: "Term cover protects the people who depend on your income.",
    recommendation: isSenior()
      ? "Term cover costs more after 60. If anyone relies on your income, compare options now."
      : "If anyone relies on your income, a term plan is usually the simplest protection.",
    advisor: advisorNote("termLife", "term life cover"),
  }),
  emergencyFund: () => ({
    why: "A fund covering several months of expenses protects your long-term savings from being sold during a downturn.",
    recommendation: isRetired()
      ? "Aim for 12 months of essential costs, since there's no salary income to fall back on."
      : "Aim for 6 months of essential costs in accessible savings.",
    advisor: advisorNote("emergencyFund", "emergency fund"),
  }),
  travel: () => ({
    why: "Planned travel from a dedicated amount keeps it from disrupting your monthly budget.",
    recommendation: isRetired()
      ? "Fund trips from a one-time amount in existing savings, rather than from monthly withdrawals."
      : "Set a yearly travel budget so trips don't compete with other goals.",
    advisor: advisorNote("travel", "travel and experience"),
  }),
  celebration: () => ({
    why: "Large celebrations are easier to enjoy when the cost is set aside in advance.",
    recommendation: "Set the date and budget early, and fund it in steady steps or from one lump sum.",
    advisor: advisorNote("celebration", "celebration"),
  }),
  daughterMarriage: () => ({
    why: "Wedding costs in India typically rise about 10% a year. Starting early keeps the monthly commitment low.",
    recommendation: isRetired()
      ? "Because you're retired, a lump sum from existing savings may suit this better than monthly contributions."
      : "Starting early keeps monthly contributions low. Set the target year and budget first.",
    advisor: advisorNote("daughterMarriage", "wedding"),
  }),
  education: () => ({
    why: "Education costs in India rise about 10–12% a year. Starting early spreads the cost over time.",
    recommendation: "A monthly plan spreads the cost. Confirm the course and year so the target amount is accurate.",
    advisor: advisorNote("education", "education"),
  }),
  elderlyParents: () => ({
    why: "Support for parents covers healthcare and living costs, which tend to rise with age.",
    recommendation: "Set aside a monthly provision and review it once a year.",
    advisor: advisorNote("elderlyParents", "parent support"),
  }),
  grandchildren: () => ({
    why: "Education and family support costs rise each year, and they're easier to plan as a separate provision.",
    recommendation: "A dedicated monthly provision keeps this apart from your retirement income.",
    advisor: advisorNote("grandchildren", "grandchildren support"),
  }),
  homeUpgrade: () => ({
    why: "Property prices in metros grow about 6–8% a year, so timing and budget both matter.",
    recommendation: isRetired()
      ? "Check how the upgrade affects your monthly cashflow before committing."
      : "Set a budget and timeline that fit your monthly surplus.",
    advisor: advisorNote("homeUpgrade", "home upgrade"),
  }),
  hobbies: () => ({
    why: "Membership costs are easier to plan as a fixed monthly amount.",
    recommendation: "Add the yearly total to your monthly budget so it's covered every month.",
    advisor: advisorNote("hobbies", "lifestyle"),
  }),
  wealthTransfer: () => ({
    why: "A clear plan for transferring assets avoids disputes and unexpected tax costs for your family.",
    recommendation: isSenior()
      ? "Start with a list of assets and nominations. A will review is the usual first step."
      : "Start with a list of assets and nominations, then review them with your advisor.",
    advisor: advisorNote("wealthTransfer", "wealth transfer"),
  }),
  charitable: () => ({
    why: "Planned giving can be structured around your goals and tax position.",
    recommendation: "Decide the amount and recipients first, so the structure fits your plan.",
    advisor: advisorNote("charitable", "charitable giving"),
  }),
  inheritance: () => ({
    why: "Clear nominations and a will help your family receive assets without delay.",
    recommendation: isSenior()
      ? "Check nominations on every account first. They're the quickest way to make transfers simple."
      : "Check nominations on every account, then add a will if you don't have one.",
    advisor: advisorNote("inheritance", "inheritance"),
  }),
};

const CUSTOM_GUIDANCE = (): Guidance => ({
  why: "Goals with a clear amount and date are easier to plan and track.",
  recommendation: "Describe the cost in today's terms and the date you need it. We'll estimate the rest.",
  advisor: { count: null, label: "custom goals", best: false },
});

const CATEGORY_FOLLOW_UP: Record<string, string> = {
  retirement: "Map out your regular income sources, so withdrawals only cover the gap.",
  grow: "Match each investment to the date you need the money.",
  major: "Set the target year now, so monthly contributions stay steady.",
  protect: "Check each cover amount against current needs and renewal dates.",
  emergency: "Keep the fund in accessible savings, separate from long-term money.",
  family: "Note each commitment's timeline, so support is planned before it's needed.",
  taxes: "Check the tax position before each withdrawal, not only at year-end.",
  legacy: "Keep nominations and asset lists up to date as your accounts change.",
  loans: "Compare each loan's interest rate before choosing what to prepay.",
};

export function categoryGuidance(categoryId: string): Guidance | null {
  const base = CATEGORY_GUIDANCE[categoryId]?.();
  return base ? { ...base, followUp: CATEGORY_FOLLOW_UP[categoryId] } : null;
}

export function subgoalGuidance(label: string, categoryId?: string | null): Guidance {
  const key = SUB_KEY[label];
  if (key && SUB_GUIDANCE[key]) return SUB_GUIDANCE[key]();
  const category = categoryId ? categoryGuidance(categoryId) : null;
  if (category) return { ...category, advisor: { count: null, label: label.toLowerCase(), best: false } };
  return CUSTOM_GUIDANCE();
}

/** Short description of the profile the guidance is based on, shown with it. */
export function guidanceBasis() {
  const gender = CUSTOMER.gender === "female" ? "female" : "male";
  return `Based on your profile (age ${CUSTOMER.age}, ${gender}, ${CUSTOMER.lifeStage.toLowerCase()}) and ${ADVISOR.name}'s experience with ${ADVISOR.activeClients} clients.`;
}
