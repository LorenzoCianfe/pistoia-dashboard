import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import { requireRedazione } from "@/lib/auth/redazione";
import { getCodaRedazione } from "@/lib/data/valutazioni";
import { getGiornataDaCurare } from "@/lib/data/atti";
import { SERVIZI } from "@/lib/valutazioni";
import { FIRMA_REDAZIONE } from "@/lib/redazione";
import { ElementoCoda } from "@/components/redazione/coda-redazione";
import { ModuloNota } from "@/components/redazione/modulo-nota";
import { CuraFattoDelGiorno } from "@/components/redazione/cura-fatto-del-giorno";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { dataConPreposizione } from "@/lib/format";

export const metadata: Metadata = { title: "Redazione" };

/*
  La pagina della Redazione (R-4, forma B1 — decisione di Lorenzo 2026-08-03).

  È una rotta PROPRIA e non una sezione di /admin, perché /admin è «Riservato
  al Comune» e la Redazione non è il Comune: qui entra il ruolo `MODERATOR`,
  e NON entrano gli account del Comune — `ADMIN` compreso, che ne è il
  super-account (SECURITY.md §4). Il cancello della fase prova esattamente
  questo confine.

  Tutto ciò che esce da questa pagina firma come l'entità collettiva
  (`FIRMA_REDAZIONE`), mai con un nome proprio (piano §8.3): il pallino viola
  è lo stesso marcatore della voce redazionale di ChiPubblica.
*/
export default async function RedazionePage() {
  await requireRedazione();
  const [coda, giornata] = await Promise.all([
    getCodaRedazione(),
    getGiornataDaCurare(),
  ]);

  const dataIt = (d: Date) =>
    d.toLocaleDateString("it-IT", { day: "numeric", month: "long" });

  return (
    <div className="space-y-5 page-enter">
      <SectionHeader
        eyebrow="Riservato alla redazione"
        title="Redazione"
        description="Il fatto del giorno in prima pagina, le segnalazioni del Comune sulle valutazioni, le rimozioni e le Note. Ogni rimozione lascia una riga nel registro pubblico della scheda."
        icon={<PenLine size={22} className="text-[var(--viola)]" />}
      />

      {/*
        IL FATTO DEL GIORNO, in cima: è la sola superficie di questa pagina che
        decide che cosa vede la città aprendo il sito.

        ⚠️ È uno STRUMENTO e non una coda (`DESIGN.md` §6), quindi **niente
        contatore accanto al titolo**: nessuno accumula lavoro qui, ed è la
        redazione a decidere se oggi c'è qualcosa da spiegare.
      */}
      <Card>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          <span className="size-2 rounded-full bg-viola" aria-hidden />
          Il fatto del giorno
        </p>
        {giornata.giorno === null ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            L&apos;archivio degli atti è vuoto: la lettura automatica
            dell&apos;albo pretorio non ha ancora girato, quindi non c&apos;è
            nessun atto da curare.
          </p>
        ) : (
          <>
            <p className="mt-1 max-w-prose text-sm text-muted">
              Gli atti pubblicati{" "}
              <span className="font-medium text-foreground">
                {dataConPreposizione(giornata.giorno)}
              </span>
              , che è il giorno di cui parla la prima pagina. Il titolo lo
              scrivi tu: <strong>generarlo è vietato</strong>, e senza un titolo
              la home non finge un&apos;apertura.
            </p>
            <div className="mt-4">
              <CuraFattoDelGiorno
                atti={giornata.atti}
                curato={giornata.curato}
              />
            </div>
          </>
        )}
      </Card>

      <Card>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          <span className="size-2 rounded-full bg-viola" aria-hidden />
          Da esaminare ·{" "}
          {coda.length === 0
            ? "nessuna segnalazione del Comune"
            : `${coda.length} ${coda.length === 1 ? "segnalazione" : "segnalazioni"} del Comune`}
        </p>
        {coda.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Quando il Comune contesta una valutazione, compare qui. Il Comune
            può segnalare, non rimuovere: le due uscite di questa coda sono
            «rimuovi, con motivo pubblico» e «lascia pubblicata».
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {coda.map((v) => (
              <ElementoCoda
                key={v.id}
                item={{
                  id: v.id,
                  servizio: v.servizio,
                  stelle: v.stelle,
                  testo: v.testo,
                  autore: v.autore,
                  quando: dataIt(v.quando),
                  segnalataIl: dataIt(v.segnalataIl),
                  segnalataMotivo: v.segnalataMotivo,
                }}
              />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
          <span className="size-2 rounded-full bg-viola" aria-hidden />
          Scrivi una Nota della Redazione
        </p>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Aggiunge un dato a una scheda, non risponde — lo slot della risposta
          è del Comune. Fonte e data di consultazione sono obbligatorie: senza,
          la nota non va a schermo.
        </p>
        <div className="mt-4">
          <ModuloNota
            servizi={SERVIZI.map((s) => ({ id: s.id, nome: s.nome }))}
          />
        </div>
      </Card>

      <p className="text-xs leading-relaxed text-muted-2">
        Tutto ciò che esce da questa pagina firma come{" "}
        <span className="font-medium text-foreground">«{FIRMA_REDAZIONE}»</span>{" "}
        — mai con un nome proprio.
      </p>
    </div>
  );
}
