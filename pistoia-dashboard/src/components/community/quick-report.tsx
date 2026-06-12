"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Zap,
  Camera,
  MapPin,
  LocateFixed,
  Loader2,
  X,
  ArrowRight,
  ArrowLeft,
  Send,
} from "lucide-react";
import { createReportAction } from "@/app/actions/reports";
import { SimilarReports } from "@/components/community/similar-reports";
import { REPORT_CATEGORY } from "@/lib/community";
import { downscaleImage } from "@/lib/images";
import { accent } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { NeighborhoodOption } from "@/lib/data/neighborhoods";

/*
  "Segnala in 30 secondi" (A2 §4): foto → posizione → categoria → invia.
  Pensato per il telefono, davanti al problema. Titolo e descrizione li
  genera il sistema; i dettagli si aggiungono dopo, facoltativi (regola n. 5).
*/

const STEPS = ["Foto", "Posizione", "Categoria"] as const;

export function QuickReport({
  neighborhoods,
  defaultNeighborhoodId,
}: {
  neighborhoods: NeighborhoodOption[];
  defaultNeighborhoodId?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "error">("idle");
  const [location, setLocation] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState(defaultNeighborhoodId ?? "");
  const [category, setCategory] = useState<string | null>(null);

  // Apertura/chiusura: scroll lock + focus dentro, poi di nuovo dov'era.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  function reset() {
    setStep(0);
    setError(null);
    setPhoto(null);
    setCoords(null);
    setGeoStatus("idle");
    setLocation("");
    setCategory(null);
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoBusy(true);
    try {
      setPhoto(await downscaleImage(file));
    } catch {
      setPhoto(null);
    } finally {
      setPhotoBusy(false);
    }
  }

  function useMyLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("idle");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function send() {
    if (!category) return;
    setError(null);
    const fd = new FormData();
    fd.set("mode", "rapida");
    fd.set("category", category);
    if (neighborhoodId) fd.set("neighborhoodId", neighborhoodId);
    if (location.trim()) fd.set("location", location.trim());
    if (photo) fd.set("photoData", photo);
    if (coords) {
      fd.set("latitude", String(coords.lat));
      fd.set("longitude", String(coords.lng));
    }
    startTransition(async () => {
      const res = await createReportAction(undefined, fd);
      if (res?.ok && res.id) {
        setOpen(false);
        reset();
        router.push(`/segnalazioni/${res.id}`);
      } else {
        setError(res?.error ?? "Invio non riuscito. Riprova.");
      }
    });
  }

  const dialog = (
    <div
      className="fixed inset-0 z-50 bg-[#0b0e14]/45 backdrop-blur-[2px] sm:p-6"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Segnala in 30 secondi — passo ${step + 1} di ${STEPS.length}: ${STEPS[step]}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="card flex h-full w-full flex-col overflow-y-auto !rounded-none p-5 outline-none sm:mx-auto sm:mt-[8dvh] sm:h-auto sm:max-h-[80dvh] sm:max-w-md sm:!rounded-[var(--radius)] sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            <Zap size={13} className="text-[var(--amber)]" aria-hidden />
            Segnala in 30 secondi · {step + 1} di {STEPS.length}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Chiudi"
            className="grid size-8 place-items-center rounded-full text-muted-2 transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avanzamento */}
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-pill transition-colors",
                i <= step ? "bg-teal" : "bg-surface-3",
              )}
            />
          ))}
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-[var(--red)]">
            {error}
          </p>
        ) : null}

        {/* Passo 1 — Foto */}
        {step === 0 ? (
          <div className="mt-5 flex flex-1 flex-col">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Scatta o carica una foto
            </h2>
            <p className="mt-1 text-sm text-muted">
              La foto dice quasi tutto. Se non puoi farla, salta pure.
            </p>
            <label
              htmlFor="quick-photo"
              className="mt-4 grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-[var(--radius-sm)] border-2 border-dashed border-border-strong transition-colors hover:border-teal"
            >
              {photoBusy ? (
                <Loader2 size={24} className="animate-spin text-muted-2" aria-hidden />
              ) : photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Anteprima della foto" className="size-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-muted">
                  <Camera size={28} aria-hidden />
                  <span className="text-sm font-medium">Tocca per scattare o caricare</span>
                </span>
              )}
            </label>
            <input
              id="quick-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPhoto}
              className="sr-only"
            />
          </div>
        ) : null}

        {/* Passo 2 — Posizione */}
        {step === 1 ? (
          <div className="mt-5 flex flex-1 flex-col gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Dove si trova il problema?
              </h2>
              <p className="mt-1 text-sm text-muted">
                La posizione precisa aiuta chi interviene.
              </p>
            </div>
            <button
              type="button"
              onClick={useMyLocation}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-border-strong text-sm font-semibold transition-colors hover:border-teal hover:text-teal"
            >
              {geoStatus === "loading" ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <LocateFixed size={16} aria-hidden />
              )}
              {coords ? "Posizione acquisita ✓" : "Usa la mia posizione"}
            </button>
            {geoStatus === "error" ? (
              <p className="text-xs text-[var(--red)]">
                Posizione non disponibile: indica almeno via o quartiere.
              </p>
            ) : null}
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={160}
              placeholder="Via o luogo (es. Via Ciliegiole)"
              aria-label="Via o luogo"
              className="h-12 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
            />
            <select
              value={neighborhoodId}
              onChange={(e) => setNeighborhoodId(e.target.value)}
              aria-label="Quartiere o frazione"
              className="h-12 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm focus-visible:border-teal focus-visible:outline-none"
            >
              <option value="">Quartiere: tutta la città</option>
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Passo 3 — Categoria + anti-duplicati */}
        {step === 2 ? (
          <div className="mt-5 flex flex-1 flex-col gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Di cosa si tratta?
              </h2>
              <p className="mt-1 text-sm text-muted">
                Scegli la categoria: al resto pensiamo noi.
              </p>
            </div>
            <div role="radiogroup" aria-label="Categoria" className="grid grid-cols-2 gap-2">
              {Object.entries(REPORT_CATEGORY).map(([key, c]) => {
                const active = category === key;
                const tokens = accent(c.color);
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCategory(key)}
                    className={cn(
                      "min-h-11 rounded-[var(--radius-sm)] border px-3 py-2 text-left text-sm font-medium transition-colors",
                      active
                        ? "border-transparent"
                        : "border-border-strong text-muted hover:text-foreground",
                    )}
                    style={
                      active
                        ? { backgroundColor: tokens.soft, color: tokens.fg }
                        : undefined
                    }
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <SimilarReports
              category={category}
              neighborhoodId={neighborhoodId || null}
            />
          </div>
        ) : null}

        {/* Navigazione */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex h-11 items-center gap-1.5 rounded-pill border border-border-strong px-4 text-sm font-semibold text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft size={15} aria-hidden />
              Indietro
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="gradient-teal-viola inline-flex h-11 items-center gap-1.5 rounded-pill px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-105"
            >
              {step === 0 && !photo ? "Salta" : "Avanti"}
              <ArrowRight size={15} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={send}
              disabled={!category || pending}
              className="gradient-teal-viola inline-flex h-11 items-center gap-1.5 rounded-pill px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-105 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 size={15} className="animate-spin" aria-hidden />
              ) : (
                <Send size={15} aria-hidden />
              )}
              Invia segnalazione
            </button>
          )}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-2">
          <MapPin size={12} aria-hidden />
          Potrai aggiungere dettagli e foto anche dopo l&apos;invio.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-pill bg-[var(--amber-soft)] px-5 text-sm font-bold text-[var(--amber)] transition-[filter] hover:brightness-95 sm:w-auto dark:hover:brightness-110"
      >
        <Zap size={16} aria-hidden />
        Segnala in 30 secondi
      </button>
      {open ? createPortal(dialog, document.body) : null}
    </>
  );
}
