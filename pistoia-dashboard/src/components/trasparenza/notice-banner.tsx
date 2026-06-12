import Link from "next/link";
import { Siren, ArrowRight } from "lucide-react";
import { noticeKind, noticeSeverity } from "@/lib/transparency";
import { accent } from "@/lib/colors";

/*
  Banner avvisi in home (A1 §21): le comunicazioni critiche raggiungono il
  cittadino dove già si trova. Mostra al massimo due avvisi attivi, i più
  gravi per primi; il resto vive in /avvisi.
*/

export function NoticeBanner({
  notices,
}: {
  notices: { id: string; title: string; kind: string; severity: string }[];
}) {
  if (notices.length === 0) return null;

  return (
    <div className="space-y-2" role="region" aria-label="Avvisi urgenti">
      {notices.map((n) => {
        const sev = noticeSeverity(n.severity);
        const kind = noticeKind(n.kind);
        const tokens = accent(sev.color);
        return (
          <Link key={n.id} href="/avvisi" className="block">
            <div
              className="flex items-center gap-3 rounded-[var(--radius)] border px-4 py-3 transition-[filter] hover:brightness-[1.02]"
              style={{
                borderColor: `color-mix(in oklab, ${tokens.fg} 30%, transparent)`,
                backgroundColor: tokens.soft,
              }}
            >
              <span
                className={
                  n.severity === "critico"
                    ? "grid size-8 shrink-0 place-items-center rounded-full pulse-civico"
                    : "grid size-8 shrink-0 place-items-center rounded-full"
                }
                style={{ backgroundColor: tokens.fg, color: "white" }}
                aria-hidden
              >
                <Siren size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{n.title}</span>
                <span className="mt-0.5 block text-xs" style={{ color: tokens.fg }}>
                  {kind.label} · {sev.label} · cosa cambia per te →
                </span>
              </span>
              <ArrowRight size={16} className="shrink-0 text-muted-2" aria-hidden />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
