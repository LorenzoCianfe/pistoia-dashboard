import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ETICHETTA_TIPO } from "@/lib/atti";
import { civicTopic } from "@/lib/civic-topics";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import type { MonitorAtti } from "@/lib/data/atti";

/*
  IL MONITOR DELLA PIPELINE DEGLI ATTI — forma C, scelta da Lorenzo il
  2026-08-09 sui tre mockup iniettati sull'applicazione vera. Le altezze
  misurate prima di decidere: +445px a 1280, +585 a 360 in modalità semplice,
  dentro il tetto dell'area (3.327px, `/admin/valutazioni`).

  È una LETTURA (`DESIGN.md` §6: le letture sul cruscotto, finché ci stanno) —
  la ROADMAP la chiama «superficie minima da amministratore». Le pagine
  PUBBLICHE dell'archivio non sono qui: nascono in Ondata 11.

  ⚠️ I due elenchi non hanno la stessa natura, e la card LO DICE:
  - i tipi sono un CONTEGGIO di ciò che il portale scrive
    (`Titolo sottocategoria`), cioè un fatto;
  - i temi civici sono una DEDUZIONE nostra dall'ufficio proponente
    (`temaCivicoDaUfficio`), giusta al 69% per costruzione.
  Presentarli con la stessa autorevolezza violerebbe «il conteggio è un fatto,
  la sintesi è un giudizio»: da qui il «dedotto dall'ufficio che li propone»
  nell'intestazione della sezione temi.

  Lo stato («Aggiornato» / «Fermo») usa LE STESSE SOGLIE del cancello di
  freschezza (`statoArchivio` in lib/atti.ts): due definizioni dello stesso
  indicatore sono peggio di nessun indicatore.
*/

/** Stato → parola e colore. La parola c'è sempre: il colore non è un canale. */
const STATO: Record<MonitorAtti["stato"], { label: string; color: string }> = {
  aggiornato: { label: "Aggiornato", color: "green" },
  fermo: { label: "Fermo", color: "red" },
  "mai-letto": { label: "Mai letto", color: "amber" },
};

export function MonitorAttiCard({ dati }: { dati: MonitorAtti }) {
  const stato = STATO[dati.stato];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Archivio degli atti</h2>
        <Badge color={stato.color}>
          <span className="size-1.5 rounded-full bg-current" aria-hidden />
          {stato.label}
        </Badge>
      </div>

      {dati.totale === 0 ? (
        /*
          Il database dimostrativo e quello degli E2E nascono senza atti: qui
          non è un guasto, è una pipeline che non è ancora stata lanciata. Lo
          stato vuoto lo dice, col comando per uscirne.
        */
        <p className="mt-1 text-sm text-muted">
          Nessun atto in archivio: la lettura dal portale della trasparenza non
          è ancora stata lanciata su questa base dati. Si lancia con{" "}
          <code className="font-mono text-xs">npm run atti -- --tutte</code>.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">
            <strong className="tabular-nums">{formatNumber(dati.totale)}</strong>{" "}
            atti letti dal portale della trasparenza.
            {dati.ultimaPubblicazione ? (
              <>
                {" "}
                Ultimo pubblicato{" "}
                <span suppressHydrationWarning>
                  {formatRelativeTime(dati.ultimaPubblicazione)}
                </span>
              </>
            ) : null}
            {dati.ultimaLetturaRiuscita ? (
              <>
                {" "}
                · letto{" "}
                <span suppressHydrationWarning>
                  {formatRelativeTime(dati.ultimaLetturaRiuscita)}
                </span>
              </>
            ) : null}
            .
          </p>

          <ul className="mt-3">
            {dati.perTipo.map((r) => (
              <li
                key={r.tipo}
                className="flex items-baseline justify-between gap-3 border-t border-border py-2.5"
              >
                <span className="text-sm font-medium">{ETICHETTA_TIPO[r.tipo]}</span>
                <span className="text-sm tabular-nums">
                  <strong>{formatNumber(r.totale)}</strong>
                </span>
              </li>
            ))}
          </ul>

          {dati.perTema.length > 0 ? (
            <>
              {/* «dedotto», detto nell'intestazione: i tipi qui sopra sono
                  parola del portale, questi sono una nostra lettura. */}
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                Per tema civico, dedotto dall&apos;ufficio che li propone
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {dati.perTema.map((r) => {
                  const t = civicTopic(r.tema);
                  return (
                    <li
                      key={r.tema}
                      className="rounded-pill bg-surface-2 px-2.5 py-1 text-xs"
                    >
                      {t?.label ?? r.tema}{" "}
                      <strong className="tabular-nums">{formatNumber(r.totale)}</strong>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-muted-2">
                {formatNumber(dati.senzaTema)} atti restano senza tema: sono di
                amministrazione interna — personale, bilancio, tributi — e per
                loro «nessun tema» è la risposta giusta, non una lacuna.
              </p>
            </>
          ) : null}
        </>
      )}
    </Card>
  );
}
