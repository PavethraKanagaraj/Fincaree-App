import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/* Shared layout + live-CSS helpers for the Foundations stories.
   Not a story file (no .stories suffix), so Storybook doesn't index it. */

export const mono: CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12 };

export function Page({ title, description, summary, children }: { title: string; description: ReactNode; summary?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ maxWidth: 1200, color: "var(--text-primary)", fontFamily: "var(--font-family)" }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h2>
      <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-secondary)", maxWidth: "72ch" }}>{description}</p>
      {summary && <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>{summary}</p>}
      <div style={{ marginTop: 20 }}>{children}</div>
    </div>
  );
}

export function Section({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section style={{ padding: "16px 0", borderTop: "1px solid var(--border-tertiary)" }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h3>
      {note && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-tertiary)", maxWidth: "80ch" }}>{note}</p>}
      <div style={{ marginTop: 12 }}>{children}</div>
    </section>
  );
}

/** A plain data table with real header cells (keeps axe happy). */
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  const cell: CSSProperties = { padding: "8px 16px 8px 0", borderBottom: "1px solid var(--border-tertiary)", verticalAlign: "middle", fontSize: 13 };
  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} scope="col" style={{ ...cell, textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-secondary)" }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} style={cell}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type Check = "match" | "differs" | "missing" | "none";

/** Status line under a CSS variable name. "none" = no CSS variable is expected. */
export function CodeStatus({ cssVar, status, actual }: { cssVar: string | null; status: Check; actual?: string }) {
  return (
    <div>
      <span style={{ ...mono, color: cssVar ? "var(--text-primary)" : "var(--text-tertiary)" }}>{cssVar ?? "—"}</span>
      {status === "differs" && (
        <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-status-warning)" }}>
          Differs in code{actual ? ` (${actual})` : ""}
        </span>
      )}
      {status === "missing" && <span style={{ display: "block", fontSize: 12, color: "var(--text-tertiary)" }}>Not in code yet</span>}
    </div>
  );
}

/** Reads CSS custom properties from :root once mounted. */
export function useCssVars(names: string[]) {
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const key = names.join("|");
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setValues(Object.fromEntries(names.map((n) => [n, cs.getPropertyValue(n).trim()])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return values;
}

/** "16px" / "16" / "0px" → 16 */
export const px = (v: string | undefined) => (v === undefined || v === "" ? null : parseFloat(v));

export function checkPx(cssValue: string | undefined, want: number): Check {
  if (cssValue === undefined) return "match";
  if (cssValue === "") return "missing";
  return px(cssValue) === want ? "match" : "differs";
}

export function Summary({ total, inCode, differs, label = "tokens in Figma" }: { total: number; inCode?: number; differs?: number; label?: string }) {
  return (
    <>
      {total} {label}
      {inCode !== undefined && ` · ${inCode} in code`}
      {differs !== undefined && ` · ${differs} differ from Figma`}
    </>
  );
}
