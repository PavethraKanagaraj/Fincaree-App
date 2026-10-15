# Fincaree B2B — Project Instructions

Fincaree is a B2B SaaS fintech platform.

This file is the primary project-level instruction file and is loaded
automatically by Claude Code at the start of every session.

`CLAUDE.md` defines the permanent project rules and source-of-truth hierarchy.

`AGENT.md` defines the execution workflow for individual design tasks.

---

# 1. PROJECT STRUCTURE

The Fincaree B2B project is organized as:

Fincaree B2B/
├── CLAUDE.md
├── AGENT.md
├── .claude/
├── design-system/
└── public/

## Important locations

- `CLAUDE.md` — permanent project instructions
- `AGENT.md` — design-task execution workflow
- `.claude/` — Claude skills and specialized instructions
- `design-system/` — Fincaree Design System documentation, rules and Figma references
- `public/` — project assets and references

---

# 2. DESIGN AGENT

For all Figma, UX, UI, wireframe-to-design, product screen,
design-system, or prototype tasks:

**Read and follow `AGENT.md` before executing the task.**

`AGENT.md` defines the standard Fincaree B2B design execution workflow, including:

- how to interpret wireframes
- how to read page-specific content
- how to locate the requested page in the Word document
- how to inspect the Fincaree Design System
- how to reuse existing Fincaree components
- when external UI references may be used
- UX and accessibility review
- Figma construction
- prototyping
- self-audit
- design-system conflict handling

`CLAUDE.md` defines the permanent project-level rules.

`AGENT.md` defines how those rules are executed for individual tasks.

**CLAUDE.md always takes precedence over AGENT.md if a conflict exists.**

Do not duplicate the detailed design workflow from `AGENT.md` here.

---

# 3. CODE AGENT

For all React, TypeScript, component implementation, or UI-code tasks:

**Read and follow `design-system/rules/05-Code Rules.md` before writing any code.**

`05-Code Rules.md` defines the Fincaree component sourcing hierarchy for code:

1. Fincaree Design System — always first
2. shadcn/ui — only when Fincaree does not have it, adapted to Fincaree tokens
3. Custom component — only when neither exists; stop and inform the user first

**Never use shadcn/ui when a Fincaree component already exists.**

**Never introduce another UI library without explicit approval.**

`CLAUDE.md` always takes precedence over `05-Code Rules.md` if a conflict exists.

---

# 4. DESIGN SYSTEM

| Item | Value |
|---|---|
| Figma file key | `E3iIKwdE2far5TdrPYla2z` |
| JSON tokens | `design-system/figma/` |
| Documentation | `design-system/docs/` |
| Rules | `design-system/rules/` |

### Rules files

| File | Purpose |
|---|---|
| `01-Design Rules.md` | Foundations — tokens, spacing, typography, breakpoints, effects |
| `02-Component Rules.md` | Component build and audit rules |
| `03-Claude Rules.md` | Claude-specific behaviour rules |
| `04-Figma MCP Rules.md` | Figma MCP plugin execution rules |
| `05-Code Rules.md` | Code component sourcing hierarchy |

Figma is the live visual source of truth for the Fincaree Design System.

Documentation and JSON files provide supporting documentation,
reference, and audit information.

Do not create a competing source of truth.

---

# 5. PRIMARY PRODUCT WORKFLOW

**Always design in Figma first — then code.**

```text
1. Understand UX / wireframe / requirements
        ↓
2. Inspect Fincaree Design System
        ↓
3. Inspect existing Figma components and patterns
        ↓
4. Design in Figma via MCP  →  follow AGENT.md
        ↓
5. Create prototype for important UX flows
        ↓
6. Screenshot / review
        ↓
7. User approves
        ↓
8. Update relevant documentation / JSON when required
        ↓
9. Write React + TypeScript code  →  follow 05-Code Rules.md
        ↓
10. Storybook / QA