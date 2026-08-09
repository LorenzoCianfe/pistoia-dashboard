import Link from "next/link";
import { Layers } from "lucide-react";
import { formatDate } from "@/lib/format";

/*
  LE ALTRE APERTE COME QUESTA (Ondata 8, moderazione assistita).

  ⚠️ **È un fatto, non un suggerimento**, e la differenza è tutto il disegno:
  sono le altre segnalazioni aperte della stessa categoria nello stesso
  quartiere — la stessa lente che il cittadino vede mentre scrive
  (`findSimilarReports`) e che il moderatore non vedeva. Nessuna stima, niente
  da tarare, niente da dichiarare incerto.

  **Perché non una somiglianza sul testo.** Misurato il 2026-08-09 sul corpus
  del seed: zero duplicati veri sopra il 50%, e in cima un falso positivo
  pericoloso — «Lampione a intermittenza in Via Dalmazia» contro «…in Via
  Bonellina», due lampioni in due strade diverse. Le segnalazioni comunali sono
  formulari, quindi il testo si somiglia **proprio quando il luogo cambia**; il
  luogo è il segnale che distingue, ed è quello che questa lente guarda.

  Non compare quasi mai, ed è giusto: con 14 aperte su dieci categorie e dieci
  quartieri, i vicini veri sono rari (1 segnalazione su 5 sul seed).
*/

export type Simile = {
  id: string;
  title: string;
  createdAt: Date;
  location: string | null;
};

export function SimiliAperte({
  simili,
  quartiere,
}: {
  simili: Simile[];
  quartiere: string | null;
}) {
  if (simili.length === 0) return null;

  return (
    <div className="mt-4 rounded-[var(--radius-container)] border border-border bg-surface-2 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Layers size={15} className="shrink-0 text-teal" aria-hidden />
        {simili.length === 1
          ? "Un'altra aperta come questa"
          : `Altre ${simili.length} aperte come questa`}
        {quartiere ? ` in ${quartiere}` : ""}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        Stessa categoria e stessa zona. Se è lo stesso problema, si uniscono dal
        pannello di moderazione.
      </p>
      <ul className="mt-2 space-y-1.5">
        {simili.map((s) => (
          <li key={s.id} className="text-sm">
            <Link
              href={`/admin/segnalazioni/${s.id}`}
              className="inline-flex min-h-11 items-center text-teal hover:underline"
            >
              {s.title}
            </Link>
            <span className="text-xs text-muted-2">
              {" · "}
              {formatDate(s.createdAt)}
              {s.location ? ` · ${s.location}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
