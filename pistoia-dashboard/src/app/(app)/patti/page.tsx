import type { Metadata } from "next";
import { Handshake, MapPin, Sprout } from "lucide-react";
import { getPacts, getAdoptedPlaces } from "@/lib/data/territorio";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { pactStatus, placeKind, placeStatus, adopterType } from "@/lib/territorio";
import { formatDate, formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Patti e luoghi adottati",
  description:
    "I patti digitali di quartiere e i luoghi pubblici adottati da cittadini, scuole e associazioni: la cura condivisa della città.",
};

/*
  Patti digitali di quartiere (A2 §31) + "Adotta un luogo" (A2 §16, O4):
  la collaborazione civica resa visibile — chi firma, cosa promette ciascuno,
  a che punto siamo. La cura è un dato pubblico come il bilancio.
*/

export default async function PattiPage() {
  const [pacts, places] = await Promise.all([getPacts(), getAdoptedPlaces()]);

  return (
    <div className="space-y-8 page-enter">
      <SectionHeader
        eyebrow="Territorio"
        title="Patti e luoghi adottati"
        description="Obiettivi condivisi tra cittadini e Comune, quartiere per quartiere — e i luoghi pubblici di cui qualcuno si prende cura. Ogni patto dice chi firma e a che punto è."
        icon={<Handshake size={26} />}
      />

      {/* Patti digitali di quartiere */}
      <section aria-labelledby="patti-quartiere" className="space-y-4">
        <h2
          id="patti-quartiere"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
        >
          Patti digitali di quartiere
        </h2>
        {pacts.length === 0 ? (
          <EmptyState
            title="Nessun patto attivo"
            description="Quando cittadini e Comune firmeranno obiettivi condivisi, qui ne seguirai l'avanzamento."
          />
        ) : (
          <div className="space-y-4 stagger">
            {pacts.map((p) => {
              const st = pactStatus(p.status);
              return (
                <Card key={p.id} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color={st.color}>{st.label}</Badge>
                    <Badge color="viola">
                      <MapPin size={12} aria-hidden /> {p.neighborhoodName}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-2" suppressHydrationWarning>
                      dal {formatDate(p.startedAt)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight">{p.title}</h3>
                    <p className="mt-1 text-sm font-medium text-teal">{p.goal}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.description}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <span className="font-medium text-muted">Avanzamento</span>
                      <span className="font-bold tabular-nums">{p.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-pill bg-surface-2" aria-hidden>
                      <div
                        className="h-full rounded-pill gradient-teal-viola"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-2">Firmato da: {p.signedBy}</p>
                  {p.updates.length > 0 ? (
                    <ul className="space-y-2 border-t border-border pt-3">
                      {p.updates.map((u) => (
                        <li key={u.id} className="flex items-start gap-2.5 text-sm">
                          <span
                            className={
                              u.official
                                ? "mt-1.5 size-2 shrink-0 rounded-full bg-[var(--red)]"
                                : "mt-1.5 size-2 shrink-0 rounded-full bg-teal"
                            }
                            aria-hidden
                          />
                          <span className="min-w-0">
                            <span className="leading-relaxed">{u.note}</span>
                            <span className="ml-2 text-xs text-muted-2" suppressHydrationWarning>
                              {u.official ? "Comune · " : ""}
                              {formatRelativeTime(u.createdAt)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Adotta un luogo */}
      <section aria-labelledby="luoghi-adottati" className="space-y-4">
        <h2
          id="luoghi-adottati"
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
        >
          <Sprout size={15} aria-hidden />
          Luoghi adottati
        </h2>
        {places.length === 0 ? (
          <EmptyState
            title="Nessun luogo adottato"
            description="Parchi, aiuole e fontane aspettano qualcuno che se ne prenda cura."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 stagger">
            {places.map((pl) => {
              const kind = placeKind(pl.kind);
              const st = placeStatus(pl.status);
              return (
                <Card key={pl.id} className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color={st.color}>{st.label}</Badge>
                    <span className="text-xs text-muted-2">
                      <span aria-hidden>{kind.emoji}</span> {kind.label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold tracking-tight">{pl.name}</h3>
                  <p className="text-xs text-muted-2">
                    {adopterType(pl.adopterType)}: <strong className="text-muted">{pl.adopterName}</strong>
                    {pl.neighborhoodName ? ` · ${pl.neighborhoodName}` : ""}
                  </p>
                  <p className="text-sm leading-relaxed text-muted">{pl.description}</p>
                  {pl.lastUpdate ? (
                    <p className="rounded-[var(--radius-sm)] bg-surface-2/60 px-3.5 py-2.5 text-sm leading-relaxed">
                      {pl.lastUpdate}
                      {pl.lastUpdateAt ? (
                        <span className="ml-2 text-xs text-muted-2" suppressHydrationWarning>
                          {formatRelativeTime(pl.lastUpdateAt)}
                        </span>
                      ) : null}
                    </p>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Card className="bg-surface-2/40">
        <p className="text-sm text-muted">
          Contenuti <strong>dimostrativi</strong>: in una versione reale i patti
          seguirebbero il regolamento comunale per la collaborazione civica, con
          firma e rendicontazione degli uffici.
        </p>
      </Card>
    </div>
  );
}
