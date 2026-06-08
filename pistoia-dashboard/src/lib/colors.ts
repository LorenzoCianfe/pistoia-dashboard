// Semantic accent tokens shared by avatars, badges, charts and progress bars.
// Each token resolves to CSS custom properties so it follows the active theme.

export type AccentColor = "teal" | "viola" | "amber" | "red" | "green";

export const ACCENTS: AccentColor[] = ["teal", "viola", "amber", "red", "green"];

type AccentTokens = {
  /** Strong colour, e.g. for chart strokes and icons — `var(--teal)`. */
  fg: string;
  /** Soft tinted background — `var(--teal-soft)`. */
  soft: string;
};

const MAP: Record<AccentColor, AccentTokens> = {
  teal: { fg: "var(--teal)", soft: "var(--teal-soft)" },
  viola: { fg: "var(--viola)", soft: "var(--viola-soft)" },
  amber: { fg: "var(--amber)", soft: "var(--amber-soft)" },
  red: { fg: "var(--red)", soft: "var(--red-soft)" },
  green: { fg: "var(--green)", soft: "var(--green-soft)" },
};

export function accent(color: string): AccentTokens {
  return MAP[(color as AccentColor)] ?? MAP.teal;
}

/** Deterministically pick an accent from a string (e.g. a name) for avatars. */
export function accentFromString(input: string): AccentColor {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}

/** Initials from a display name, e.g. "Marco Gentili" -> "MG". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
