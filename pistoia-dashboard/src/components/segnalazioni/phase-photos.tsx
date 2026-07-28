import { ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { REPORT_PHOTO_PHASE, REPORT_PHOTO_PHASES } from "@/lib/community";
import { accent } from "@/lib/colors";

/*
  Foto "Prima / Durante / Dopo" (A1 §4): il confronto fotografico rende
  visibile l'intervento. "Prima" è la foto del cittadino (photoData della
  segnalazione o ReportPhoto); durante/dopo arrivano dal Comune. Le foto del
  seed usano un gradiente da imageSeed come placeholder dichiaratamente mock.
*/

type PhotoItem = {
  id: string;
  phase: string;
  photoData: string | null;
  imageSeed: string | null;
  caption: string | null;
  authorName: string | null;
  official: boolean;
};

/** Gradiente deterministico dal seed: placeholder dichiarato, mai finta foto. */
function seedGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const tones = ["teal", "viola", "amber", "green"] as const;
  const a = accent(tones[hash % tones.length]).soft;
  const b = accent(tones[(hash >> 2) % tones.length]).soft;
  const angle = 80 + (hash % 80);
  return `linear-gradient(${angle}deg, ${a}, ${b})`;
}

export function PhasePhotos({
  reportTitle,
  citizenPhoto,
  citizenName,
  photos,
}: {
  reportTitle: string;
  /** La photoData della segnalazione: è la foto "prima" del cittadino. */
  citizenPhoto: string | null;
  citizenName: string;
  photos: PhotoItem[];
}) {
  // "Prima" preferisce la foto del cittadino; le fasi successive sono ufficiali.
  const byPhase = new Map<string, PhotoItem[]>();
  for (const p of photos) {
    const list = byPhase.get(p.phase) ?? [];
    list.push(p);
    byPhase.set(p.phase, list);
  }
  if (citizenPhoto && !byPhase.has("prima")) {
    byPhase.set("prima", [
      {
        id: "citizen",
        phase: "prima",
        photoData: citizenPhoto,
        imageSeed: null,
        caption: null,
        authorName: citizenName,
        official: false,
      },
    ]);
  }

  const phases = REPORT_PHOTO_PHASES.filter((ph) => byPhase.has(ph));
  if (phases.length === 0) return null;
  const showEmptySlots = phases.length > 1;

  return (
    <div>
      <h2 className="text-base font-semibold">L&apos;intervento in foto</h2>
      <p className="text-sm text-muted">
        Prima, durante e dopo: il cambiamento si vede.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {REPORT_PHOTO_PHASES.map((ph) => {
          const meta = REPORT_PHOTO_PHASE[ph];
          const items = byPhase.get(ph);
          if (!items && !showEmptySlots) return null;
          const item = items?.[items.length - 1];
          return (
            <figure
              key={ph}
              className="overflow-hidden rounded-[var(--radius-sm)] border border-border bg-surface-2/50"
            >
              <div className="relative aspect-[4/3]">
                {item?.photoData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photoData}
                    alt={`${meta.label}: ${item.caption ?? reportTitle}`}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : item?.imageSeed ? (
                  <div
                    role="img"
                    aria-label={`${meta.label}: ${item.caption ?? reportTitle} (immagine dimostrativa)`}
                    className="absolute inset-0"
                    style={{ background: seedGradient(item.imageSeed) }}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-muted-2">
                    <span className="flex flex-col items-center gap-1.5 text-xs">
                      <ImageOff size={18} aria-hidden />
                      In attesa
                    </span>
                  </div>
                )}
                <span className="absolute left-2 top-2">
                  <Badge color={meta.color}>{meta.label}</Badge>
                </span>
              </div>
              <figcaption className="px-3 py-2 text-xs text-muted-2">
                {item
                  ? (item.caption ?? (item.official ? "Aggiornamento del Comune" : `Foto di ${item.authorName ?? "un cittadino"}`))
                  : "Il Comune aggiungerà la foto di questa fase."}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
