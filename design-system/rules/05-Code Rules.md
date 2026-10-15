## COMPONENT SOURCING — STRICT RULE

Use this hierarchy for EVERY UI component:

### 1. Fincaree Design System — ALWAYS FIRST

If a component is explicitly declared in the Fincaree Design
System, use that component.

The Fincaree component must be treated as the source of truth.

Do NOT replace it with shadcn/ui.

Do NOT redesign it.

Do NOT create a custom alternative.

Use its defined:

- variants
- states
- typography
- spacing
- radius
- colors
- icons
- dimensions
- interaction behavior

If the Fincaree component exists in Figma but does not yet
exist as React:

→ implement the Figma component as a reusable React component
→ preserve the Figma specification
→ reuse that React implementation thereafter.


### 2. SHADCN/UI — SECOND

If the required component does NOT exist in the Fincaree
Design System:

→ use shadcn/ui.

The shadcn component must be customized to Fincaree using
the Fincaree Design System tokens.

Do NOT use the default shadcn visual appearance when it
conflicts with Fincaree.

Apply Fincaree:

- colors
- typography
- spacing
- radius
- states
- focus treatment
- icon treatment
- sizing
- visual hierarchy


### 3. CUSTOM — LAST RESORT

Only create a custom component when:

1. The component does not exist in Fincaree.
2. shadcn/ui does not provide the required component.
3. The functionality cannot reasonably be achieved by
   composing existing components.

Do NOT create a custom component simply because it is easier
than adapting shadcn.


### STRICT DECISION TREE

For every component ask:

Does Fincaree have it?
        │
       YES
        ↓
Use Fincaree component EXACTLY
        │
       NO
        ↓
Does shadcn/ui have it?
        │
       YES
        ↓
Use shadcn + customize to Fincaree
        │
       NO
        ↓
Create custom component


### IMPORTANT

"Fincaree component" means a component explicitly defined
in the Fincaree Design System.

Do not assume that every component currently present in
`components/` is automatically a Fincaree Design System
component.

Do not create new Fincaree components unless they are
genuinely required and the existing Fincaree + shadcn
options cannot solve the requirement.