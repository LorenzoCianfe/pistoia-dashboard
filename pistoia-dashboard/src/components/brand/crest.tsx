import { cn } from "@/lib/utils";

/**
 * Stemma del Comune di Pistoia — the heraldic shield "scaccato di rosso e
 * d'argento" (checkered red and white). Rendered as scalable SVG.
 */
export function Crest({
  className,
  title = "Stemma del Comune di Pistoia",
}: {
  className?: string;
  title?: string;
}) {
  // 5 columns × 6 rows of squares clipped to the shield silhouette.
  const cols = 5;
  const rows = 6;
  const cell = 16;
  const x0 = 10;
  const y0 = 6;
  const squares: { x: number; y: number; red: boolean }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      squares.push({
        x: x0 + c * cell,
        y: y0 + r * cell,
        red: (r + c) % 2 === 0,
      });
    }
  }

  const shield =
    "M10 6 H90 V64 C90 86 73 100 50 110 C27 100 10 86 10 64 Z";

  return (
    <svg
      viewBox="0 0 100 116"
      className={cn("block", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <clipPath id="pistoia-shield">
          <path d={shield} />
        </clipPath>
      </defs>
      <g clipPath="url(#pistoia-shield)">
        <rect x="0" y="0" width="100" height="116" fill="#ffffff" />
        {squares.map((s, i) =>
          s.red ? (
            <rect
              key={i}
              x={s.x}
              y={s.y}
              width={cell}
              height={cell}
              fill="#d2283f"
            />
          ) : null,
        )}
      </g>
      <path
        d={shield}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.18}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
