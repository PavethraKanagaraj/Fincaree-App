# 04 — Figma MCP Rules

Technical rules for working with the Fincaree Figma file via the MCP plugin.

**File key:** `E3iIKwdE2far5TdrPYla2z`

---

## Before Every use_figma Call

```
1. Load skill://figma/figma-use/SKILL.md
2. If building components → also load skill://figma/figma-generate-library/SKILL.md
3. Pass skillNames: "resource:figma-use" (add "resource:figma-generate-library" if needed)
```

---

## Returning Data

- Always use `return`. `console.log` is invisible in MCP context.
- Include `createdNodeIds` or `mutatedNodeIds` on every call that modifies the canvas.
- Page context resets each call. Switch with `await figma.setCurrentPageAsync(page)` — the sync setter does not work.

---

## Reading Variables

Always call these fresh at the start of every task — never trust data from a previous turn:

```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const allVars     = await figma.variables.getLocalVariablesAsync();
```

**Mode reference — match by name, not index:**

| Collection | Mode(s) |
|---|---|
| `x_Primitives` | `Light/Dark Mode` (single) |
| `1.Semantic color modes` | `Light Mode`, `Dark Mode` |
| `2.Radius` → `6.Z Index` | `Mode 1` (single) |
| `5.Typography` | `Mode 1` (single) |
| `7.Components` | `Light Mode`, `Dark Mode` |

---

## Binding Variables

**Fill / stroke color:**
```js
node.fills = [figma.variables.setBoundVariableForPaint([...node.fills][0], 'color', variable)];
```

**Effect color:**
```js
const newEffect = { ...effect, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: variable.id } } };
node.effects = node.effects.map((e, i) => i === idx ? newEffect : e);
```

**What can and cannot be bound:**

| Property | Bindable? |
|---|---|
| Fill color | ✅ Yes |
| Stroke color | ✅ Yes |
| Effect color (shadow) | ✅ Yes |
| Effect X/Y offset | ❌ No — hardcode |
| Effect blur / spread | ❌ No — hardcode |
| fontSize | ✅ Yes (text styles) |
| lineHeight | ✅ Yes (text styles) |
| letterSpacing | ✅ Yes (text styles) |
| fontFamily | ✅ Yes (text styles) |
| fontStyle | ✅ Yes (text styles) |

---

## Text Style Bindings

All 5 properties must be bound:

```js
style.setBoundVariable('fontSize',      fontSizeVar);      // Font Size/100–1700
style.setBoundVariable('lineHeight',    lineHeightVar);    // Line Height/100–1500
style.setBoundVariable('letterSpacing', letterSpacingVar); // Letter Spacing/100–700
style.setBoundVariable('fontFamily',    fontFamilyVar);    // Font Family/Base = "Geist"
style.setBoundVariable('fontStyle',     fontStyleVar);     // Font Style/Bold|Semi Bold|Medium|Regular
```

Font style strings that work: `'Regular'` · `'Medium'` · `'Semi Bold'` (space required) · `'Bold'`
`'SemiBold'` without a space will fail to load.

---

## Auto-Layout Rules

- Set `layoutSizingHorizontal/Vertical = 'FILL'` or `'HUG'` **after** `parent.appendChild(child)`.
- `'HUG'` is valid only on an auto-layout frame itself or on TEXT children of one.
- `'FILL'` is valid only on a child of an auto-layout frame that is not absolutely positioned.
- Use `figma.createAutoLayout()` for containers with structurally related children.

---

## Creating Components

```
figma.createComponent()         ← not createFrame()
figma.combineAsVariants(comps)  ← requires COMPONENT nodes, not frames
```

- Variant names must be `Property=Value, Property=Value` — invalid names cause Figma panel errors.
- Position the component set after `combineAsVariants` — variants default to (0,0).
- Append child to parent **before** setting HUG/FILL sizing.

---

## Effect Styles

- Every shadow color must be bound to a `Colors/Overlay/Black/*` or `Colors/Overlay/White/*` primitive.
- Focus ring styles have two layers: inner (spread 2px, white) + outer (spread 4px, halo color). Both must be bound.
- X/Y/blur/spread are hardcoded geometry values — this is expected and correct.

---

## Grid Styles

`GridStyle.grids` cannot be set programmatically — the MCP plugin API blocks this (`Reflect.set` returns false).

- Create grid styles **manually** through the Figma Styles panel (Styles → Grid → +).
- After creating manually: document the specs in `figma/grids.json` and `docs/Foundations/Grid.md`.

---

## Detecting Unbound Properties

Local variable IDs start with `VariableID:9` or `VariableID:10`. External library IDs contain a long hash prefix.

```js
const isLocal = (id) => id && (id.startsWith('VariableID:9') || id.startsWith('VariableID:10'));
```

Check fills, strokes, and effects recursively — icon colors and sub-component properties are often missed.

---

## Design Workflow in Figma

When asked to design a screen or component:

1. `get_metadata` — inspect the target page first
2. Check for existing Fincaree components before building new ones
3. Build incrementally — skeleton with `placeholder = true`, fill sections one at a time
4. Bind all token values — zero hardcoded colors at any level
5. `await node.screenshot()` after each major section to validate
6. Return all created node IDs

---

## Safety Rules

- Only modify pages, collections, and components named in the current task.
- Before deleting any variable — confirm nothing is still bound to it.
- For batch operations — state scope before executing, report applied / skipped / errored after.
- `figma.notify()` — throws "not implemented". Never use it.
- `loadAllPagesAsync`, `setPluginData`, `createImageAsync` — not supported in MCP context.
