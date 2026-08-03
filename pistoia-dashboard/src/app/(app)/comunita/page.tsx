import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare, DoorOpen } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getCommunityFeed, getTopicCounts } from "@/lib/data/comunita";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Composer } from "@/components/comunita/composer";
import { PostCard } from "@/components/comunita/post-card";
import { DisplayNumber } from "@/components/signature/display-number";
import { canModerate } from "@/lib/community";
import { CIVIC_TOPICS, CIVIC_TOPIC_KEYS } from "@/lib/civic-topics";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Comunità" };

export default async function ComunitaPage() {
  const user = await requireUser();
  const [feed, neighborhoods, perTema] = await Promise.all([
    getCommunityFeed(user.id),
    getNeighborhoods(),
    getTopicCounts(),
  ]);
  const moderator = canModerate(user.role);

  /*
    La domanda che questa pagina deve saper reggere è una sola: il Comune
    risponde davvero? Si conta sulle sole DOMANDE — una discussione fra
    cittadini o un'idea non chiedono una risposta ufficiale, e metterle al
    denominatore abbasserebbe il tasso raccontando un'inadempienza che non c'è.
  */
  const domande = feed.filter((p) => p.kind === "domanda");
  const conRisposta = domande.filter((p) => p.answer).length;
  const tassoRisposta =
    domande.length > 0 ? Math.round((conRisposta / domande.length) * 100) : null;

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="La città che si risponde"
        title="Comunità"
        description="Domande pubbliche dei cittadini e risposte ufficiali del Comune, visibili a tutti."
        icon={<MessagesSquare size={22} />}
      />

      {/*
        L'unica cifra display della schermata (DESIGN.md §8). Nuda: la scala a
        tacche vuole un intervallo reale, e per una percentuale 0–100 le tacche
        direbbero solo quello che la cifra dice già.

        Niente superficie mesh qui, benché il tasso sarebbe una salute buona da
        codificare: il peso di questa pagina deve restare sulle conversazioni,
        e un quarto gradiente di fila renderebbe il componente una formula
        invece di una scelta.
      */}
      {tassoRisposta !== null ? (
        <Card>
          <DisplayNumber
            value={tassoRisposta}
            unit="%"
            label="Domande con risposta ufficiale"
          />
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
            {formatNumber(conRisposta)} risposte su {formatNumber(domande.length)}{" "}
            {domande.length === 1 ? "domanda posta" : "domande poste"} dai
            cittadini. Le discussioni e le idee non entrano nel conto: non
            chiedono una risposta del Comune.
          </p>
        </Card>
      ) : null}

      {/* Stanze tematiche (A1 §17, O4): l'ingresso per tema. A griglia e non
          più a scorrimento orizzontale — le stanze sono la struttura di questo
          spazio, non una barra di filtri da far scorrere con il pollice. */}
      <section aria-labelledby="stanze">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 px-1">
          <h2 id="stanze" className="font-display text-lg font-semibold tracking-tight">
            Le stanze
          </h2>
          <Link
            href="/comunita/stanze"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"
          >
            <DoorOpen size={13} aria-hidden />
            Tutte le stanze
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CIVIC_TOPIC_KEYS.slice(0, 6).map((key) => {
            const t = CIVIC_TOPICS[key];
            const n = perTema.get(key) ?? 0;
            return (
              <Link key={key} href={`/comunita/stanze/${key}`}>
                {/* `flex-col` più `mt-auto` sul conteggio: i nomi lunghi vanno
                    a capo («Ambiente e verde», «Sicurezza urbana») e senza
                    questo i conteggi si allineavano ad altezze diverse lungo la
                    riga. */}
                <Card hover className="flex h-full flex-col p-3 text-center sm:p-4">
                  <span className="block text-xl" aria-hidden>
                    {t.emoji}
                  </span>
                  <span className="mt-1.5 block text-sm font-semibold leading-snug">
                    {t.label}
                  </span>
                  <span className="mt-auto block pt-1 text-xs tabular-nums text-muted-2">
                    {n === 0
                      ? "ancora vuota"
                      : `${formatNumber(n)} ${n === 1 ? "conversazione" : "conversazioni"}`}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <Composer
        name={user.name}
        color={user.avatarColor}
        neighborhoods={neighborhoods}
        defaultNeighborhoodId={user.neighborhoodId}
      />

      {feed.length === 0 ? (
        <EmptyState
          accent="viola"
          title="Ancora nessuna conversazione"
          description="Questo è lo spazio del dialogo con il Comune. Apri tu la prima domanda."
        />
      ) : (
        <div className="space-y-4">
          {feed.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserName={user.name}
              canModerate={moderator}
            />
          ))}
        </div>
      )}

    </div>
  );
}
