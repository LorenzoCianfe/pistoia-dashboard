import type { Metadata } from "next";
import Link from "next/link";
import { DoorOpen, ArrowRight } from "lucide-react";
import { getTopicCounts } from "@/lib/data/comunita";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { CIVIC_TOPICS, CIVIC_TOPIC_KEYS } from "@/lib/civic-topics";
import { accent } from "@/lib/colors";

export const metadata: Metadata = {
  title: "Stanze tematiche",
  description:
    "La community organizzata per tema: mobilità, ambiente, scuole… Ogni stanza raccoglie le conversazioni sul suo argomento.",
};

/*
  Stanze tematiche (A1 §17, O4): la community non è solo geografia. Ogni tema
  civico ha la sua stanza; le conversazioni con un tema entrano da sole.
*/

export default async function StanzePage() {
  const counts = await getTopicCounts();

  return (
    <div className="space-y-5 page-enter">
      <SectionHeader
        eyebrow="Comunità"
        title="Stanze tematiche"
        description="Le conversazioni organizzate per tema, non solo per quartiere. Entra nella stanza che ti riguarda: ci trovi le discussioni e le risposte ufficiali su quell'argomento."
        icon={<DoorOpen size={26} />}
      />

      {/*
        Una colonna sotto `sm`, e non è una preferenza di stile.

        A 360px in modalità semplice le due colonne davano 155px a scheda contro
        168px di contenuto: 5px di traboccamento orizzontale. Il pavimento del
        min-content non bastava a toglierlo — l'elemento di griglia si stringe
        con `min-w-0`, ma la parola «conversazioni» non si spezza e sporge
        comunque dallo span ristretto.

        Allargare la colonna è l'unica correzione che non nasconde
        informazione: troncare il conteggio o spezzare la parola a metà
        risolverebbero la misura peggiorando la lettura. E a 155px una scheda
        con emoji, «Ambiente e verde» e il conteggio era già stretta.
      */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger">
        {CIVIC_TOPIC_KEYS.map((key) => {
          const topic = CIVIC_TOPICS[key];
          const n = counts.get(key) ?? 0;
          const tokens = accent(topic.color);
          return (
            /*
              `min-w-0` sull'elemento della griglia, ed è il punto del difetto.

              Le tracce di Tailwind sono `minmax(0, 1fr)` e si stringono, ma un
              elemento di griglia ha `min-width: auto`, il cui minimo è il
              min-content: qui la parola «conversazioni» non si spezza, quindi
              la scheda si rifiutava di scendere sotto 168px in una colonna da
              155 — 5px di traboccamento a 360px in modalità semplice. È la
              trappola AGENTS.md §3 (ondata 7, 5) presa dal lato dell'elemento
              invece che da quello della traccia.

              `min-w-0` toglie il pavimento; la freccia via sotto `sm` libera i
              29px che servono perché il contenuto ci stia davvero. È
              `aria-hidden` su una scheda che è già tutta un link: non porta
              informazione.
            */
            <Link key={key} href={`/comunita/stanze/${key}`} className="min-w-0">
              <Card hover className="flex h-full items-center gap-3 p-4">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)] text-lg"
                  style={{ backgroundColor: tokens.soft }}
                  aria-hidden
                >
                  {topic.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug">{topic.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-2">
                    {n === 0
                      ? "Ancora nessuna conversazione"
                      : n === 1
                        ? "1 conversazione"
                        : `${n} conversazioni`}
                  </span>
                </span>
                <ArrowRight size={15} className="shrink-0 text-muted-2" aria-hidden />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
