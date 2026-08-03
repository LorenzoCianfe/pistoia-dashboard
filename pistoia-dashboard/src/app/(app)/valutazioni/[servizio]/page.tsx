import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2, BadgeCheck, QrCode } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import {
  getAndamento,
  getQuartieriPerVoto,
  getRecensioni,
  getRimozioni,
  getRisposte,
  getScheda,
  type ColonnaDura,
  type RecensioneResa,
} from "@/lib/data/valutazioni";
import { ModuloVoto } from "@/components/valutazioni/modulo-voto";
import { Card, CardEyebrow } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/format";
import {
  DOMANDA_FAMIGLIA,
  SERVIZI,
  SOGLIA_PUBBLICAZIONE_VOTO,
  servizio as trovaServizio,
} from "@/lib/valutazioni";

export function generateStaticParams() {
  return SERVIZI.map((s) => ({ servizio: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ servizio: string }>;
}): Promise<Metadata> {
  const { servizio } = await params;
  const s = trovaServizio(servizio);
  if (!s) return { title: "Servizio non trovato" };
  return { title: `${s.nome} · Valutazioni`, description: s.descrizione };
}

/*
  La scheda di un servizio.

  Tre regole di composizione, e nessuna è estetica:

  1. **La cifra e l'andamento non stanno mai dentro un blocco attribuito a una
     persona.** Le risposte del Comune vivono più in basso, nel flusso; la media
     resta nella testata. Senza questa separazione la media di un servizio
     diventa la pagella dell'assessore che risponde, cioè il prerequisito 4 di
     `ROADMAP.md` §6 aggirato per disposizione grafica.
  2. **La composizione del campione sta accanto alla media, non sotto una
     piega.** La scelta del 2026-08-03 è il modello Trustpilot — nessun filtro
     su chi vota, e la credibilità viene dalla trasparenza invece che dal
     cancello. Tolta quella riga resta una media aperta a chiunque senza niente
     che aiuti a pesarla: il peggio di entrambi i disegni.
  3. **La risposta del Comune è nella stessa scheda e allo stesso peso**, mai
     dietro un `<details>` — è il prerequisito 5, il diritto di replica.
*/
export default async function SchedaServizioPage({
  params,
}: {
  params: Promise<{ servizio: string }>;
}) {
  const user = await requireUser();
  const { servizio } = await params;
  const s = trovaServizio(servizio);
  if (!s) notFound();

  const [scheda, recensioni, andamento, rimozioni, risposte, quartieri] =
    await Promise.all([
      getScheda(s),
      getRecensioni(s),
      getAndamento(s),
      getRimozioni(s),
      getRisposte(s),
      s.famiglia === "condizione" ? getQuartieriPerVoto() : Promise.resolve(undefined),
    ]);
  const { media: m, composizione: c, colonna } = scheda;
  const mesiConVoto = andamento.filter((a) => a.media != null);

  return (
    <div className="space-y-6 page-enter">
      <Link
        href="/valutazioni"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={15} aria-hidden />
        Tutte le valutazioni
      </Link>

      <SectionHeader
        eyebrow={
          s.famiglia === "sportello" ? "Servizio allo sportello" : "Come sta la città"
        }
        title={s.nome}
        description={s.descrizione}
      />

      {/* Testata: la media, o quanto manca perché esista. */}
      <Card>
        {m.pubblicabile && m.valore != null ? (
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
                {DOMANDA_FAMIGLIA[s.famiglia]}
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-[56px] font-light leading-none tracking-tight tabular-nums">
                  {m.valore.toFixed(1).replace(".", ",")}
                </span>
                <StarRating value={m.valore} size={18} />
              </div>
            </div>
            {mesiConVoto.length > 1 ? <Andamento punti={andamento} /> : null}
          </div>
        ) : (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
              Nessun voto, ancora
            </p>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
              {c.totale === 0
                ? "Nessuno ha ancora valutato questo servizio."
                : `${formatNumber(c.totale)} ${c.totale === 1 ? "persona ha" : "persone hanno"} già votato.`}{" "}
              La media compare da{" "}
              <strong className="text-foreground">
                {formatNumber(SOGLIA_PUBBLICAZIONE_VOTO)} valutazioni
              </strong>{" "}
              in su — ne mancano{" "}
              <strong className="text-foreground">{formatNumber(m.mancanti)}</strong>.
              Prima di allora un numero direbbe più di quanto sappiamo.
            </p>
          </div>
        )}

        {/*
          La composizione: portante, non decorativa. Compare anche a zero, dove
          dice che il conto è a zero — che è un fatto, non un vuoto.
        */}
        <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
          <strong className="text-foreground">{formatNumber(c.totale)}</strong>{" "}
          {c.totale === 1 ? "valutazione" : "valutazioni"}
          {s.famiglia === "condizione" ? " negli ultimi tre mesi" : ""} ·{" "}
          <strong className="text-foreground">{formatNumber(c.confermate)}</strong> da
          email confermata
          {c.daQr > 0 ? (
            <>
              {" "}
              · <strong className="text-foreground">{formatNumber(c.daQr)}</strong> da
              QR in loco
            </>
          ) : null}
        </p>
      </Card>

      {/* La colonna dura: c'è dal primo giorno, e non è una consolazione. */}
      {colonna?.haQualcosaDaDire ? (
        <Card className="bg-surface-2/40">
          <CardEyebrow>Cosa dicono le segnalazioni</CardEyebrow>
          <ColonnaDuraTesto
            colonna={colonna}
            materia={s.materia ?? `su ${s.nome}`}
            mediaVisibile={m.pubblicabile ? m.valore : null}
          />
        </Card>
      ) : null}

      {/*
        Il voto (R-3). Dopo il dato, mai prima: la pagina apre su ciò che la
        città ha detto, non su un modulo (piano §0). Email e nome sono
        precompilati dall'account perché qui una sessione c'è per forza — il
        percorso davvero senza account è /v/[codice], dal QR.
      */}
      <Card id="vota">
        <CardEyebrow>Vota anche tu</CardEyebrow>
        <div className="mt-3">
          <ModuloVoto
            servizioId={s.id}
            famiglia={s.famiglia}
            domanda={DOMANDA_FAMIGLIA[s.famiglia]}
            quartieri={quartieri}
            defaultEmail={user.email}
            defaultNome={user.name}
          />
        </div>
      </Card>

      {/* Le risposte del Comune e le note della redazione. */}
      {risposte.length > 0 ? (
        <section aria-labelledby="risposte" className="space-y-3">
          <h2
            id="risposte"
            className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
          >
            Le risposte
          </h2>
          {risposte.map((r) => (
            <Card key={r.id} className={r.tipo === "nota-redazione" ? "bg-surface-2/40" : ""}>
              {r.tipo === "nota-redazione" ? (
                <>
                  <CardEyebrow>Nota della redazione</CardEyebrow>
                  <p className="mt-2 text-sm leading-relaxed">{r.testo}</p>
                  {r.urlFonte ? (
                    <p className="mt-2 text-xs text-muted-2">
                      <a
                        href={r.urlFonte}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 font-medium text-teal underline decoration-dotted underline-offset-2 hover:no-underline"
                      >
                        Fonte
                        <ExternalLink size={11} aria-hidden />
                        <span className="sr-only"> (si apre in una nuova scheda)</span>
                      </a>
                      {r.dataConsultazione ? ` · consultata il ${r.dataConsultazione}` : null}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {r.autore.name}
                    <BadgeCheck size={14} className="shrink-0 text-teal" aria-hidden />
                  </p>
                  {r.caricaAlMomento ? (
                    <p className="text-xs text-muted-2">{r.caricaAlMomento}</p>
                  ) : null}
                  <p className="mt-2 text-sm leading-relaxed">{r.testo}</p>
                </>
              )}
            </Card>
          ))}
        </section>
      ) : null}

      {/* Le recensioni scritte. */}
      <section aria-labelledby="recensioni">
        <h2
          id="recensioni"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
        >
          Cosa scrivono i cittadini
        </h2>
        <Card className="mt-3">
          {recensioni.length > 0 ? (
            <ul className="space-y-4">
              {recensioni.map((r) => (
                <Recensione key={r.id} r={r} />
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Ancora nessuna recensione"
              description={
                colonna && colonna.segnalazioni > 0
                  ? "Il riquadro qui sopra è ciò che sappiamo da soli. Le parole dei cittadini arrivano da qui."
                  : "Questo servizio non ha ancora ricevuto valutazioni."
              }
            />
          )}
        </Card>
      </section>

      {/*
        Il registro delle rimozioni. Compare anche vuoto, e non è pignoleria:
        una pagina che mostra il registro solo quando qualcosa è stato tolto fa
        del registro stesso un segnale d'allarme. Dichiarare «nessuna rimossa»
        è ciò che rende credibile la riga quando un giorno dirà «due rimosse».
      */}
      <Card className="bg-surface-2/40">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-2">
          <Trash2 size={13} className="mt-0.5 shrink-0" aria-hidden />
          {rimozioni.length === 0 ? (
            <span>
              Nessuna valutazione rimossa da questa scheda. Rimuove la redazione,
              mai il Comune: chi è valutato può segnalare un contenuto, non
              cancellarlo.
            </span>
          ) : (
            <span>
              {formatNumber(rimozioni.length)}{" "}
              {rimozioni.length === 1 ? "valutazione rimossa" : "valutazioni rimosse"} —{" "}
              {rimozioni
                .map(
                  (r) =>
                    `${r.rimossaIl!.toLocaleDateString("it-IT", { day: "numeric", month: "long" })}, ${r.rimossaMotivo ?? "motivo non dichiarato"}`,
                )
                .join(" · ")}
              . Rimuove la redazione, mai il Comune.
            </span>
          )}
        </p>
      </Card>
    </div>
  );
}

/**
 * La frase che accosta il dato oggettivo alle stelle.
 *
 * Su `sicurezza` il **volume** non si accosta: più segnalazioni può voler dire
 * più vigilanza, non più pericolo, e affiancare un volume in crescita a due
 * stelle suggerirebbe un nesso che il dato non contiene. Lì la frase parla solo
 * dei tempi di chiusura, che un giudizio sul Comune lo reggono davvero.
 */
function ColonnaDuraTesto({
  colonna,
  materia,
  mediaVisibile,
}: {
  colonna: ColonnaDura;
  /** Già con la preposizione: «sulla pulizia». Vedi `Servizio.materia`. */
  materia: string;
  mediaVisibile: number | null;
}) {
  const mediana =
    colonna.giorniMediani != null ? (
      <strong className="text-foreground">
        {formatNumber(colonna.giorniMediani)}{" "}
        {colonna.giorniMediani === 1 ? "giorno mediano" : "giorni mediani"}
      </strong>
    ) : null;

  return (
    <>
      <p className="mt-2 text-sm leading-relaxed">
        {colonna.volumeAccostabile ? (
          <>
            Quest&apos;anno la città ha aperto{" "}
            <strong className="text-foreground">
              {formatNumber(colonna.segnalazioni)}{" "}
              {colonna.segnalazioni === 1 ? "segnalazione" : "segnalazioni"}
            </strong>{" "}
            {" "}
            {materia}
            {mediana ? <>, e il Comune le ha chiuse in {mediana}</> : null}.
          </>
        ) : (
          <>
            Le segnalazioni {materia} si chiudono in {mediana}.
          </>
        )}
        {mediaVisibile != null ? (
          <>
            {" "}
            I cittadini danno{" "}
            <strong className="text-foreground">
              {mediaVisibile.toFixed(1).replace(".", ",")} su 5
            </strong>
            .
          </>
        ) : null}
      </p>

      {/*
        Quando le chiuse sono troppo poche la mediana non esiste, e va DETTO:
        senza questa riga il lettore attribuisce l'assenza a un Comune che non
        chiude niente, invece che a un conteggio che non regge una sintesi.
      */}
      {colonna.giorniMediani == null ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Troppo poche risultano chiuse per dire quanto ci mette il Comune: un
          tempo medio su {colonna.risolte === 0 ? "nessun caso" : `${formatNumber(colonna.risolte)} ${colonna.risolte === 1 ? "caso" : "casi"}`}{" "}
          racconterebbe più di quello che sappiamo.
        </p>
      ) : null}

      <p className="mt-2 text-xs leading-relaxed text-muted-2">
        {colonna.volumeAccostabile
          ? "Il primo numero è nostro e c'era dal primo giorno. Il secondo lo scrivete voi."
          : "Sulla sicurezza il numero di segnalazioni non compare accanto al voto: più segnalazioni può voler dire più attenzione, non più pericolo. Quello che dice qualcosa del Comune è quanto ci mette a chiuderle."}
      </p>
    </>
  );
}

/**
 * L'andamento, un punto al mese.
 *
 * I mesi sotto soglia sono **buchi**, non zeri: la spezzata si interrompe. Uno
 * zero direbbe «valutato pessimo», che è il contrario di «non abbiamo
 * abbastanza risposte». Sotto c'è la tabella equivalente, che `DESIGN.md` §11
 * pretende per ogni grafico.
 */
function Andamento({
  punti,
}: {
  punti: { periodo: string; media: number | null; campione: number }[];
}) {
  const w = 200;
  const h = 48;
  const x = (i: number) => (punti.length === 1 ? w / 2 : (i / (punti.length - 1)) * w);
  const y = (v: number) => h - ((v - 1) / 4) * h;

  const segmenti: string[] = [];
  let corrente: string[] = [];
  punti.forEach((p, i) => {
    if (p.media == null) {
      if (corrente.length > 1) segmenti.push(corrente.join(" "));
      corrente = [];
      return;
    }
    corrente.push(`${x(i).toFixed(1)},${y(p.media).toFixed(1)}`);
  });
  if (corrente.length > 1) segmenti.push(corrente.join(" "));

  const etichetta = (p: string) => {
    const [anno, mese] = p.split("-");
    return new Date(Number(anno), Number(mese) - 1, 1)
      .toLocaleDateString("it-IT", { month: "short" })
      .replace(".", "");
  };

  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs text-muted-2">Un punto al mese</p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        aria-hidden
        className="block max-w-full"
      >
        {segmenti.map((s, i) => (
          <polyline
            key={i}
            points={s}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {punti.map((p, i) =>
          p.media != null ? (
            <circle
              key={p.periodo}
              cx={x(i)}
              cy={y(p.media)}
              r="2.5"
              fill="var(--color-accent)"
            />
          ) : null,
        )}
      </svg>

      <div className="sr-only">
        <table>
          <caption>Media mensile delle valutazioni</caption>
          <thead>
            <tr>
              <th scope="col">Mese</th>
              <th scope="col">Media</th>
              <th scope="col">Valutazioni</th>
            </tr>
          </thead>
          <tbody>
            {punti.map((p) => (
              <tr key={p.periodo}>
                <th scope="row">{p.periodo}</th>
                <td>
                  {p.media != null
                    ? p.media.toFixed(1).replace(".", ",")
                    : "sotto soglia, nessuna media"}
                </td>
                <td>{p.campione}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-1 text-xs text-muted-2" aria-hidden>
        {etichetta(punti[0].periodo)} → {etichetta(punti[punti.length - 1].periodo)}
      </p>
    </div>
  );
}

function Recensione({ r }: { r: RecensioneResa }) {
  return (
    <li className="min-w-0 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {r.autore}
          {r.confermata ? (
            <span className="rounded-pill border border-[var(--color-accent)] px-2 py-0.5 text-[11px] font-normal text-teal">
              email confermata
            </span>
          ) : null}
          {r.daQr ? (
            <span className="inline-flex items-center gap-1 rounded-pill border border-border px-2 py-0.5 text-[11px] font-normal text-muted-2">
              <QrCode size={10} aria-hidden />
              da QR{r.qrLuogo ? `, ${r.qrLuogo}` : ""}
            </span>
          ) : null}
        </p>
        <p className="text-xs text-muted-2">
          {r.quartiere ? `${r.quartiere} · ` : ""}
          <time dateTime={r.quando.toISOString()}>
            {r.quando.toLocaleDateString("it-IT", { day: "numeric", month: "long" })}
          </time>
        </p>
      </div>
      <div className="mt-1.5">
        <StarRating value={r.stelle} size={13} />
      </div>
      {r.testo ? (
        <p className="mt-1.5 text-sm leading-relaxed">{r.testo}</p>
      ) : null}
    </li>
  );
}
