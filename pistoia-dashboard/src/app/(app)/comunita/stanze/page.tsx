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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 stagger">
        {CIVIC_TOPIC_KEYS.map((key) => {
          const topic = CIVIC_TOPICS[key];
          const n = counts.get(key) ?? 0;
          const tokens = accent(topic.color);
          return (
            <Link key={key} href={`/comunita/stanze/${key}`}>
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
