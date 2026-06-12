import { accent, type AccentColor } from "@/lib/colors";

/*
  Sparkline minimale (O3, hero "Stato della città"): un andamento a colpo
  d'occhio, senza assi né tooltip. Server component: solo SVG statico.
*/

const W = 96;
const H = 28;
const PAD = 2;

export function Sparkline({
  points,
  color = "teal",
  label,
  className,
}: {
  points: number[];
  color?: AccentColor;
  /** Descrizione accessibile dell'andamento, es. "Risolte per settimana". */
  label?: string;
  className?: string;
}) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const step = (W - PAD * 2) / (points.length - 1);
  const xy = points.map((v, i): [number, number] => [
    PAD + i * step,
    PAD + (H - PAD * 2) * (1 - (v - min) / range),
  ]);
  const path = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x},${y}`).join(" ");
  const area = `${path} L ${xy[xy.length - 1][0]},${H} L ${xy[0][0]},${H} Z`;
  const { fg } = accent(color);
  const [lastX, lastY] = xy[xy.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={area} fill={fg} opacity="0.12" />
      <path d={path} fill="none" stroke={fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={fg} />
    </svg>
  );
}
