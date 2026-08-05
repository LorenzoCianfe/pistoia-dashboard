import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2, BadgeCheck, QrCode } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/dal";
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
import {
  ControlliRecensione,
  RispondiQuadro,
} from "@/components/valutazioni/controlli-staff";
import { Card, CardEyebrow } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/lib/format";
import { isStaff } from "@/lib/community";
import { TimbroMetodologia } from "@/components/valutazioni/timbro-metodologia";
import {
  DOMANDA_FAMIGLIA,
  SERVIZI,
  periodoDi,
  servizio as trovaServizio,
} from "@/lib/valutazioni";
import {
  FIRMA_REDAZIONE,
  TIPO_NOTA_REDAZIONE,
  TIPO_QUADRO,
  etichettaPeriodo,
} from "@/lib/redazione";

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
  // Sola lettura anche senza account (R-5, decisione W1 del 2026-08-04):
  // `user` può essere null, e da null discendono tre degradi dichiarati —
  // niente controlli staff, niente precompilazione, modulo sostituito
  // dall'invito ad accedere (il voto senza account resta sui QR).
  const user = await getCurrentUser();
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

  /*
    I controlli di scrittura del Comune (R-4, forma A1) si montano SOLO per
    staff e admin: per chiunque altro non entrano nell'albero, quindi né i
    bottoni né lo stato «segnalata» raggiungono il browser di un cittadino —
    la segnalazione non ha segni pubblici finché la Redazione non decide.
  */
  const staff = user != null && isStaff(user.role);
  const periodoCorrente = periodoDi(new Date());
  const quadroGiaRisposto = risposte.some(
    (r) => r.tipo === TIPO_QUADRO && r.periodo === periodoCorrente,
  );

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

      {/* Testata: la media dal primo voto, o l'assenza vera dichiarata. */}
      <Card>
        {m.valore != null ? (
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
              {s.famiglia === "condizione"
                ? "Nessun voto negli ultimi tre mesi."
                : "Nessuno ha ancora valutato questo servizio."}{" "}
              La media compare col primo voto, insieme al numero di voti che la
              compone.
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
            mediaVisibile={m.valore}
          />
        </Card>
      ) : null}

      {/*
        Il voto (R-3). Dopo il dato, mai prima: la pagina apre su ciò che la
        città ha detto, non su un modulo (piano §0). Con la sessione, email e
        nome arrivano precompilati dall'account; senza (W1, lettura pubblica)
        il modulo DEGRADA a invito — il voto dalla scheda vuole l'accesso,
        perché è l'accesso a tenere il rinnovo mensile legato a una persona
        sola; il percorso senza account resta /v/[codice], dal QR.
      */}
      <Card id="vota">
        <CardEyebrow>Vota anche tu</CardEyebrow>
        <div className="mt-3">
          {user ? (
            <ModuloVoto
              servizioId={s.id}
              famiglia={s.famiglia}
              domanda={DOMANDA_FAMIGLIA[s.famiglia]}
              quartieri={quartieri}
              defaultEmail={user.email}
              defaultNome={user.name}
            />
          ) : (
            <InvitoVotoAnonimo servizioId={s.id} />
          )}
        </div>
      </Card>

      {/*
        Le risposte del Comune (al quadro) e le Note della Redazione — le
        SINGOLE vivono annidate sotto la propria recensione (forma C3).
        Per lo staff la sezione esiste anche vuota: è da qui che si risponde
        al quadro del mese. La risposta resta allo stesso peso visivo della
        pagina, mai dietro un <details> (prerequisito 5).
      */}
      {risposte.length > 0 || staff ? (
        <section aria-labelledby="risposte" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="risposte"
              className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
            >
              Le risposte
            </h2>
            {staff ? (
              <RispondiQuadro
                servizioId={s.id}
                etichetta={etichettaPeriodo(periodoCorrente)}
                giaRisposto={quadroGiaRisposto}
              />
            ) : null}
          </div>
          {risposte.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">
                Nessuna risposta, ancora. Il quadro di{" "}
                {etichettaPeriodo(periodoCorrente)} non ha una risposta del
                Comune.
              </p>
            </Card>
          ) : null}
          {risposte.map((r) => (
            <Card
              key={r.id}
              className={r.tipo === TIPO_NOTA_REDAZIONE ? "bg-surface-2/40" : ""}
            >
              {r.tipo === TIPO_NOTA_REDAZIONE ? (
                <>
                  {/* Il pallino viola è il marcatore della voce redazionale
                      (ChiPubblica); la firma è SEMPRE l'entità collettiva. */}
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                    <span className="size-2 rounded-full bg-viola" aria-hidden />
                    Nota della Redazione
                  </p>
                  <p className="mt-2 text-sm leading-relaxed">{r.testo}</p>
                  <p className="mt-2 text-xs text-muted-2">
                    Firmata:{" "}
                    <span className="font-medium text-foreground">
                      {FIRMA_REDAZIONE}
                    </span>{" "}
                    ·{" "}
                    <a
                      href={r.urlFonte!}
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
                </>
              ) : (
                <>
                  {r.periodo ? (
                    <CardEyebrow>
                      Risposta del Comune · quadro di {etichettaPeriodo(r.periodo)}
                    </CardEyebrow>
                  ) : (
                    <CardEyebrow>Risposta del Comune</CardEyebrow>
                  )}
                  <p className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold">
                    {r.firma}
                    <BadgeCheck size={14} className="shrink-0 text-teal" aria-hidden />
                  </p>
                  {r.caricaAlMomento ? (
                    <p className="text-xs text-muted-2">{r.caricaAlMomento}</p>
                  ) : null}
                  <p className="mt-2 text-sm leading-relaxed">{r.testo}</p>
                  <p className="mt-2 text-xs text-muted-2">
                    <time dateTime={r.createdAt.toISOString()}>
                      {r.createdAt.toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </p>
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
                <Recensione key={r.id} r={r} staff={staff} />
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
        Il registro delle rimozioni — elenco documentale (forma E2, decisione
        2026-08-03), firmato come entità collettiva. Compare anche vuoto, e non
        è pignoleria: una pagina che mostra il registro solo quando qualcosa è
        stato tolto fa del registro stesso un segnale d'allarme. Dichiarare
        «nessuna rimossa» è ciò che rende credibile la riga quando un giorno
        dirà «due rimosse».
      */}
      <Card className="bg-surface-2/40">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          <span className="size-2 rounded-full bg-viola" aria-hidden />
          Registro delle rimozioni
        </p>
        {rimozioni.length === 0 ? (
          <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-2">
            <Trash2 size={13} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Nessuna valutazione rimossa da questa scheda. Rimuove la redazione,
              mai il Comune: chi è valutato può segnalare un contenuto, non
              cancellarlo.
            </span>
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rimozioni.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm"
              >
                <time
                  dateTime={r.rimossaIl!.toISOString()}
                  className="text-xs tabular-nums text-muted-2"
                >
                  {r.rimossaIl!.toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
                <span className="min-w-0">
                  {r.rimossaMotivo ?? "Motivo non dichiarato."}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-2">
          Ogni rimozione è firmata:{" "}
          <span className="font-medium text-foreground">{FIRMA_REDAZIONE}</span>.
          Il Comune può segnalare una valutazione, non rimuoverla.
        </p>
      </Card>

      {/* Il colophon (B2): in calce, dove firma anche la Redazione. */}
      <TimbroMetodologia />
    </div>
  );
}

/**
 * Il modulo, degradato a invito per chi non ha una sessione (W1).
 *
 * Il `next` riporta ESATTAMENTE qui, sull'ancora del modulo: chi accede per
 * votare non deve ritrovare la strada da solo. Il secondo percorso — il QR —
 * si dichiara a parole: è carta appesa nei luoghi del servizio, non ha un
 * link. «Come funziona» porta a /metodologia (R-6): l'invito spiega regole,
 * e ora ha un posto dove mostrarle per intero.
 */
function InvitoVotoAnonimo({ servizioId }: { servizioId: string }) {
  const next = encodeURIComponent(`/valutazioni/${servizioId}#vota`);
  return (
    <div>
      <p className="max-w-prose text-sm leading-relaxed text-muted">
        Per votare da qui serve un accesso: è ciò che tiene il rinnovo mensile
        legato a una persona sola. Oppure vota senza account dal{" "}
        <strong className="text-foreground">codice QR</strong> esposto nei
        luoghi del servizio.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/login?next=${next}`} className="btn btn-primary btn-sm">
          Accedi e vota
        </Link>
        {/*
          L'approdo esisteva già come bisogno in R-5 (l'invito spiega regole
          che non poteva mostrare); il bottone è arrivato con /metodologia.
        */}
        <Link href="/metodologia" className="btn btn-secondary btn-sm">
          Come funziona
        </Link>
      </div>
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
 * I mesi senza voti sono **buchi**, non zeri: la spezzata si interrompe. Uno
 * zero direbbe «valutato pessimo», che è il contrario di «nessuno ha
 * risposto». Sotto c'è la tabella equivalente, che `DESIGN.md` §11 pretende
 * per ogni grafico.
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
                    : "nessun voto quel mese"}
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

function Recensione({ r, staff }: { r: RecensioneResa; staff: boolean }) {
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

      {/*
        La risposta del Comune, ANNIDATA sotto la recensione a cui risponde
        (forma C3, decisione 2026-08-03): si capisce a colpo d'occhio a cosa
        risponde, e resta allo stesso peso visivo del flusso — mai dietro un
        <details> (prerequisito 5). La firma è il nome pubblico dell'account;
        il timbro della carica, se c'è, è quello scattato alla scrittura.
      */}
      {r.risposta ? (
        <div className="mt-3 ml-3.5 border-l-2 border-[var(--color-accent)] pl-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            Risposta del Comune
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
            {r.risposta.firma}
            <BadgeCheck size={14} className="shrink-0 text-teal" aria-hidden />
          </p>
          {r.risposta.carica ? (
            <p className="text-xs text-muted-2">{r.risposta.carica}</p>
          ) : null}
          <p className="mt-1.5 text-sm leading-relaxed">{r.risposta.testo}</p>
          <p className="mt-1 text-xs text-muted-2">
            <time dateTime={r.risposta.quando.toISOString()}>
              {r.risposta.quando.toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
              })}
            </time>
          </p>
        </div>
      ) : null}

      {staff ? (
        <ControlliRecensione
          valutazioneId={r.id}
          segnalata={r.segnalata}
          haRisposta={r.risposta != null}
        />
      ) : null}
    </li>
  );
}
