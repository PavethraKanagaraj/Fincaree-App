# Fincaree B2B — Design Agent

## Purpose

This file defines the standard execution workflow for designing Fincaree B2B
product screens in Figma.

The agent is responsible for translating:

- Page-specific content
- Page wireframes
- Fincaree Design System
- Existing Fincaree Figma components
- Fincaree UX/accessibility guidance

into production-ready Fincaree B2B designs.

This file defines HOW the design task should be executed.

It does NOT replace the Fincaree Design System, component rules, or project
rules defined elsewhere in the repository.

---

# 1. PROJECT CONTEXT

The Fincaree B2B project contains the persistent product and design context.

Project structure:

Fincaree B2B/
├── CLAUDE.md
├── AGENT.md
├── .claude/
├── design-system/
└── public/

Before beginning any design task, use the relevant project context from
these locations.

## Priority

Always read:

1. `CLAUDE.md`
2. This `AGENT.md`

Then identify and read only the relevant files from:

3. `.claude/`
4. `design-system/rules/` — especially:
   - `01-Design Rules.md` for foundations
   - `02-Component Rules.md` for component rules
   - `05-Code Rules.md` before writing any code
5. `public/`

Do not unnecessarily load unrelated project files.

---

# 2. SOURCE-OF-TRUTH HIERARCHY

Use the following hierarchy when making design decisions.

1. Fincaree B2B project rules
2. Fincaree Design System
3. Fincaree component rules
4. Existing Fincaree Figma components and patterns
5. Existing Fincaree assets
6. Page-specific requirements/content
7. Page wireframe
8. UX/accessibility guidance
9. External UI references

Fincaree is the visual source of truth.

The page wireframe is a structural and UX reference.

The page content defines the information and requirements that the page
must communicate.

External UI libraries are references only.

Do not allow external references, wireframes, or generic UX conventions
to override established Fincaree rules.

---

# 3. PAGE INPUTS

A page-design task will normally contain:

1. A wireframe image
2. A Word document containing the content/specification for multiple pages

The Word document follows this convention:

- Each page has its own tab/section.
- The tab/section name corresponds to the page name.
- The content inside that tab/section contains the requirements and
  information for that page.

Example:

Word document:

    Meetings Pipeline
        → Meetings Pipeline content

    Client Profile
        → Client Profile content

    Dashboard
        → Dashboard content

    Settings
        → Settings content

When I request:

    "Design Meetings Pipeline"

and provide the Word document, locate the tab/section named:

    "Meetings Pipeline"

and use ONLY the relevant content from that page section.

Do not treat content belonging to another page as requirements for the
current page.

---

# 4. PAGE NAME MATCHING

When identifying the correct page section in the Word document:

1. First look for an exact page-name match.
2. If no exact match exists, look for an obvious formatting difference,
   such as capitalization, punctuation, spacing, or minor naming variation.
3. If the match is still ambiguous, do not guess.
4. Report the ambiguity and ask for clarification.

Examples:

    "Meetings Pipeline"
    "meetings pipeline"
    "Meetings – Pipeline"

may represent the same page if the document structure clearly indicates
that they do.

Do not assume two substantially different names refer to the same page.

---

# 5. PAGE CONTENT IS PAGE-SPECIFIC SOURCE OF TRUTH

Once the correct page section is identified:

Extract and understand:

- page purpose
- required sections
- required content
- information hierarchy
- actions
- navigation
- filters
- search
- sorting
- statuses
- states
- data
- labels
- terminology
- workflows
- business requirements
- interaction requirements

Do not silently invent missing business requirements.

Do not move requirements from another page into the current page.

Do not materially rewrite required terminology unless necessary for
interface clarity.

If the page content contains an ambiguity or conflict, identify it rather
than inventing a solution.

---

# 6. WIREFRAME INTERPRETATION

The provided wireframe defines the intended:

- structure
- hierarchy
- layout
- information grouping
- interaction intent
- navigation
- workflow

Do NOT blindly copy the wireframe's visual styling.

The wireframe may use:

- placeholder components
- arbitrary colors
- temporary spacing
- generic UI patterns
- rough typography
- approximate dimensions

Translate the wireframe into the Fincaree Design System.

Preserve the intended UX unless doing so would clearly conflict with an
established Fincaree rule or an explicit page requirement.

---

# 7. DESIGN-SYSTEM INITIALIZATION

Before creating UI:

Inspect the Fincaree Design System relevant to the page.

Look for:

- Foundations
- Semantic variables
- Typography
- Spacing
- Radius
- Screen widths
- Z-index
- Styles
- Effects
- Focus rings
- Grid
- Components
- Component documentation
- Relevant JSON/reference exports

Use JSON files as reference/audit information where applicable.

Do not create a competing token system from JSON.

Figma remains the live visual source of truth.

---

# 8. FIGMA INSPECTION

Before creating new components or UI, inspect the connected Figma file.

Check for existing:

- components
- component sets
- variants
- component properties
- variables
- styles
- navigation
- tables
- cards
- buttons
- badges
- avatars
- inputs
- dropdowns
- tabs
- filters
- search
- date/time controls
- modals
- drawers
- tooltips
- empty states
- loading states
- feedback patterns
- page layouts
- existing product screens

Search for similar existing Fincaree patterns before creating anything new.

Do not assume a component does not exist until the relevant Figma system
has been inspected.

---

# 9. COMPONENT REUSE RULE

Fincaree components always take priority.

For every major UI requirement:

1. Find an existing Fincaree component.
2. Determine whether an existing variant can satisfy the requirement.
3. Determine whether an existing component property can satisfy it.
4. Determine whether existing Fincaree components can be composed.
5. Only create a new component if the requirement cannot reasonably be
   satisfied using the existing system.

Never recreate an existing Fincaree component merely because creating a
new one is faster.

Do not create visually similar duplicate components.

---

# 10. COMPONENT DECISION TREE

Use this decision process:

    Does a Fincaree component exist?
                ↓
              YES
                ↓
        Use the Fincaree component
                ↓
        Use existing variants/properties

              NO
                ↓
    Can existing Fincaree components
          be composed to solve it?
                ↓
              YES
                ↓
        Compose Fincaree components

              NO
                ↓
    Is an external interaction pattern
              required?
                ↓
              YES
                ↓
     Use shadcn/ui / Base UI as the
       behavioral/accessibility reference
                ↓
       Adapt completely to Fincaree

              NO
                ↓
       Identify a genuine system gap
                ↓
       Flag before making a system-level
               decision

---

# 11. SHADCN / BASE UI RULE

shadcn/ui and Base UI are external references.

Use them only when Fincaree does not already provide the required
interaction or accessibility pattern.

They may inform:

- component anatomy
- interaction behavior
- keyboard behavior
- accessibility
- state behavior
- composition

They must NOT determine:

- Fincaree colors
- Fincaree typography
- Fincaree spacing
- Fincaree radius
- Fincaree effects
- Fincaree visual styling
- Fincaree tokens
- Fincaree component naming conventions

Do not copy shadcn visual styling into Fincaree.

The final UI must look and behave as a Fincaree product.

When writing code, the full component sourcing hierarchy is defined in
`design-system/rules/05-Code Rules.md`. Read it before implementing any
React/TypeScript component.

---

# 12. UX AND ACCESSIBILITY

Use the UX and accessibility guidance available in the Fincaree project.

Apply it to evaluate:

- visual hierarchy
- proximity
- alignment
- consistency
- whitespace
- information density
- recognition over recall
- progressive disclosure
- cognitive load
- clear actions
- feedback
- error prevention
- focus
- keyboard interaction
- color-independent communication
- readable data presentation
- responsive behavior

UX guidance is advisory.

It does not override Fincaree Design System rules.

If a UX recommendation conflicts with an established Fincaree pattern:

1. Identify the conflict.
2. Explain the concern.
3. Check whether another existing Fincaree pattern solves it.
4. Do not silently modify the design system.

---

# 13. PAGE DESIGN PROCESS

For every new page, execute the following sequence.

## Phase 1 — Understand

Understand the page from:

- matching Word document section
- wireframe
- existing Fincaree product context

Determine:

- user goal
- page purpose
- information hierarchy
- sections
- content groups
- actions
- navigation
- states
- workflows
- data relationships

---

## Phase 2 — Inspect

Inspect:

- relevant Fincaree documentation
- relevant Figma components
- existing similar screens
- variables
- styles
- assets
- component variants

Prioritize reuse.

---

## Phase 3 — Map

Map every major requirement to:

- existing Fincaree component
- existing Fincaree variant
- existing Fincaree property
- composition of Fincaree components

Identify genuine gaps.

Do not create unnecessary new UI.

---

## Phase 4 — Design

Translate the wireframe into Fincaree.

Use:

- Fincaree variables
- semantic tokens
- typography styles
- effects
- focus styles
- grid
- components
- variants
- properties
- existing assets

Do not invent parallel visual rules.

---

# 14. FIGMA CONSTRUCTION

Build directly in the connected Figma file.

Use:

- Auto Layout
- components
- component properties
- variants
- variables
- styles
- constraints
- responsive structures
- meaningful layer names
- meaningful component names

Avoid:

- unnecessary groups
- flattened UI
- arbitrary absolute positioning
- duplicate components
- one-off styles
- unnecessary nesting
- unexplained raw values

The Figma structure should be clean and suitable for later React
implementation.

---

# 15. RESPONSIVE DESIGN

Follow the Fincaree responsive system.

Use the established:

- screen widths
- grid
- breakpoints
- gutters
- container rules
- responsive component behavior

Do not create a page-specific responsive system.

When the wireframe represents only one viewport, infer other responsive
behavior from established Fincaree patterns rather than inventing a new
system.

---

# 16. COMPONENT STATES

Where relevant, use established Fincaree component states.

Possible states include:

- Default
- Hover
- Focus
- Pressed
- Selected
- Disabled
- Loading
- Error
- Open
- Empty

Only create states relevant to the component and workflow.

Do not create unnecessary variants.

---

# 17. CONTENT FIDELITY

Use the content from the matching Word document section.

Preserve:

- terminology
- labels
- required data
- actions
- status names
- hierarchy
- business meaning

Do not replace real content with generic placeholder content unless the
Word document explicitly uses placeholders.

Do not fabricate realistic-looking financial data that is not present in
the supplied content unless the design task explicitly requires sample
data.

If sample data is necessary to demonstrate a UI state, clearly keep it
consistent with the supplied content and existing product conventions.

---

# 18. DATA-DENSE INTERFACES

For CRM/fintech interfaces involving:

- tables
- pipelines
- lists
- dashboards
- financial data
- client information
- meeting data

prioritize:

- scanability
- alignment
- meaningful grouping
- consistent column/field hierarchy
- appropriate density
- clear status communication
- predictable actions
- progressive disclosure

Do not sacrifice usability for decorative styling.

Do not turn information-dense B2B interfaces into oversized marketing-style
cards unless the Fincaree system or page requirements explicitly call for it.

---

# 19. PROTOTYPING

When the page contains meaningful interactions, create a Figma prototype
for the primary UX journey.

Examples:

- navigation
- opening details
- filtering
- searching
- selecting
- creating
- editing
- changing status
- progressing through a workflow
- opening a modal
- opening a drawer
- returning to the previous context

Prototype UX behavior, not backend logic.

Do not simulate:

- APIs
- databases
- authentication
- real-time synchronization
- server-side logic

---

# 20. DESIGN-SYSTEM CONFLICTS

Never silently modify the Fincaree Design System to solve a single page.

If a requirement exposes a genuine system gap:

1. Identify the gap.
2. Determine whether an existing component can solve it.
3. Determine whether composition can solve it.
4. If not, flag the required new pattern.
5. Ask for approval before making a system-level change.

A page-specific exception must not become an accidental global design rule.

---

# 21. SELF-AUDIT

Before declaring the page complete, perform an internal audit.

Check:

### Content

- Required content from the correct Word section is represented.
- No unrelated page content was included.
- Terminology is consistent.
- Required actions are represented.

### Design System

- Existing Fincaree components reused.
- Existing Fincaree variables reused.
- Existing Fincaree styles reused.
- Existing semantic tokens reused.
- No unnecessary tokens created.
- No duplicate components created.
- No unnecessary variants created.

### Visual Design

- Typography follows Fincaree.
- Spacing follows Fincaree.
- Colors follow Fincaree.
- Radius follows Fincaree.
- Effects follow Fincaree.
- Icons follow Fincaree.
- Focus treatment follows Fincaree.
- Visual hierarchy is clear.

### UX

- Primary action is clear.
- Information hierarchy matches the page goal.
- Content is scannable.
- Cognitive load is appropriate.
- Recognition is prioritized over recall.
- Feedback is clear.
- Interaction behavior is predictable.

### Accessibility

- Focus is visible.
- Color is not the only means of communicating meaning.
- Interactive targets are appropriate.
- Text hierarchy is clear.
- Error/feedback states are understandable.
- Keyboard interaction is considered where applicable.

### Figma

- Auto Layout is used appropriately.
- Components are real components where appropriate.
- Variants/properties are used correctly.
- Layer names are meaningful.
- No unnecessary flattened UI.
- No unnecessary absolute positioning.
- Structure is suitable for later React implementation.

### Code (when implementing)

- Component sourcing follows `05-Code Rules.md` hierarchy.
- Fincaree components used before shadcn/ui.
- shadcn/ui adapted to Fincaree tokens — no default shadcn styling.
- No component library introduced outside the approved hierarchy.
- Custom components flagged and approved before creation.

### Prototype

- Primary journey is connected where appropriate.
- Interactions are understandable.
- No unnecessary backend simulation.

---

# 22. WHEN TO STOP AND ASK

Stop and ask for clarification when:

- The page name cannot be confidently matched to a Word document section.
- The Word document contains conflicting requirements.
- The wireframe and page requirements contradict each other materially.
- A required component has no reasonable Fincaree equivalent.
- A new design-system-level component appears necessary.
- A requirement would require changing an established Fincaree rule.
- The available Figma system does not provide enough information to make a
  reliable decision.

Do not guess when the decision would affect the design system or product
architecture.

For ordinary page-level design decisions that can be resolved using the
existing Fincaree system, proceed without unnecessary questions.

---

# 23. EFFICIENCY RULE

Keep execution efficient.

Do not repeatedly read the entire repository.

For each page:

1. Read the project entry rules.
2. Identify relevant design-system documentation.
3. Identify relevant components.
4. Inspect relevant Figma patterns.
5. Read the matching Word section.
6. Analyze the wireframe.
7. Design.

Avoid loading:

- unrelated pages
- unrelated components
- old/archived documentation
- implementation code that does not affect the design
- unrelated assets

Use the smallest relevant context needed to make a correct design decision.

---

# 24. MULTI-PAGE WORD DOCUMENT RULE

The Word document is a shared content source for multiple Fincaree pages.

Never assume the entire document applies to the current page.

When a page is requested:

    Requested Page Name
            ↓
    Find matching Word tab/section
            ↓
    Extract that section
            ↓
    Use it as page-specific content
            ↓
    Ignore unrelated page sections

If the Word document contains a table, heading, subsection, or structured
content inside the matching page section, preserve its relationships and
meaning when translating it into the UI.

Do not flatten structured requirements into arbitrary UI.

---

# 25. PAGE-TO-PAGE CONSISTENCY

When designing multiple Fincaree pages:

Reuse established patterns across pages.

If an earlier page established a Fincaree pattern for:

- page headers
- filters
- tables
- pipeline stages
- client identity
- actions
- navigation
- empty states
- status indicators
- page-level spacing

reuse that pattern when appropriate.

Do not redesign the same interaction differently on every page.

Consistency across the product is more important than making each page
individually novel.

---

# 26. DESIGN PRINCIPLE

The objective is not to create the most visually impressive individual
screen.

The objective is to create a coherent Fincaree B2B product.

Therefore:

    Reuse > Reinvention

    System consistency > Page-specific novelty

    Fincaree > External UI libraries

    Existing patterns > New patterns

    Clear UX > Decoration

    Real content > Generic placeholders

    Evidence > Assumption

    System integrity > Convenience

---

# 27. FINAL OUTPUT

After completing the page, provide a concise final report containing:

1. Page created
2. Fincaree components reused
3. New components/patterns created, if any
4. Prototype interactions created
5. Any unresolved ambiguity
6. Any design-system gap requiring approval

Do not claim that a component, variable, style, asset, page, or prototype
was inspected or created unless it was actually verified.

---

# 28. DEFAULT PAGE REQUEST FORMAT

The normal page request will be intentionally minimal.

Example:

    Design the Meetings Pipeline page.

    Use the attached wireframe and the page content from the Word document.

    Build it directly in Figma using the Fincaree B2B design workflow.

The agent should then automatically:

    Read CLAUDE.md
          ↓
    Read AGENT.md
          ↓
    Read relevant .claude instructions
          ↓
    Inspect relevant Fincaree design-system documentation
          ↓
    Locate "Meetings Pipeline" in the Word document
          ↓
    Read the Meetings Pipeline content
          ↓
    Analyze the wireframe
          ↓
    Inspect relevant Figma components
          ↓
    Map requirements to Fincaree components
          ↓
    Use shadcn/Base UI only when necessary
          ↓
    Build the page in Figma
          ↓
    Prototype important interactions
          ↓
    Self-audit
          ↓
    Report completion