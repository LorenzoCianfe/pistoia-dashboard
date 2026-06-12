"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ImagePlus, MapPin, LocateFixed, X, Loader2 } from "lucide-react";
import {
  createReportAction,
  type ReportFormState,
} from "@/app/actions/reports";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { SimilarReports } from "@/components/community/similar-reports";
import { REPORT_CATEGORY } from "@/lib/community";
import { downscaleImage } from "@/lib/images";
import type { NeighborhoodOption } from "@/lib/data/neighborhoods";

const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-foreground focus-visible:border-teal focus-visible:outline-none";

export function ReportComposer({
  neighborhoods,
  defaultNeighborhoodId,
}: {
  neighborhoods: NeighborhoodOption[];
  defaultNeighborhoodId?: string | null;
}) {
  const router = useRouter();
  const [state, action] = useActionState<ReportFormState, FormData>(
    createReportAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "error">("idle");
  // Categoria e zona alimentano il suggerimento anti-duplicati (A1 §2).
  const [category, setCategory] = useState<string | null>(null);
  const [neighborhood, setNeighborhood] = useState<string | null>(
    defaultNeighborhoodId ?? null,
  );

  useEffect(() => {
    // On success we navigate straight to the new report's detail page, so the
    // composer unmounts — no need to reset local photo/coords state here.
    if (state?.ok) {
      formRef.current?.reset();
      if (state.id) router.push(`/segnalazioni/${state.id}`);
    }
  }, [state, router]);

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

  return (
    <form ref={formRef} action={action} className="space-y-3.5">
      {state?.error ? <Alert>{state.error}</Alert> : null}

      {/* hidden fields driven by client state */}
      {photo ? <input type="hidden" name="photoData" value={photo} /> : null}
      {coords ? (
        <>
          <input type="hidden" name="latitude" value={coords.lat} />
          <input type="hidden" name="longitude" value={coords.lng} />
        </>
      ) : null}

      <Field label="Titolo" htmlFor="title">
        <Input
          id="title"
          name="title"
          required
          maxLength={120}
          placeholder="Es. Lampione spento in Via…"
        />
      </Field>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Categoria" htmlFor="category">
          <select
            id="category"
            name="category"
            required
            defaultValue=""
            onChange={(e) => setCategory(e.target.value || null)}
            className={selectClass}
          >
            <option value="" disabled>
              Scegli…
            </option>
            {Object.entries(REPORT_CATEGORY).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quartiere / frazione" htmlFor="neighborhoodId">
          <select
            id="neighborhoodId"
            name="neighborhoodId"
            defaultValue={defaultNeighborhoodId ?? ""}
            onChange={(e) => setNeighborhood(e.target.value || null)}
            className={selectClass}
          >
            <option value="">Tutta la città</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Anti-duplicati (A1 §2): appare appena la categoria è scelta */}
      <SimilarReports category={category} neighborhoodId={neighborhood} />

      <Field label="Posizione (indirizzo)" htmlFor="location">
        <Input id="location" name="location" maxLength={160} placeholder="Es. Via Ciliegiole, incrocio Via di Gello" />
      </Field>

      {/* Precise geolocation (§9) */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          className="inline-flex items-center gap-1.5 rounded-pill border border-border-strong px-3.5 py-2 text-sm font-medium transition-colors hover:border-teal hover:text-teal"
        >
          {geoStatus === "loading" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <LocateFixed size={15} />
          )}
          Usa la mia posizione
        </button>
        {coords ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={13} className="text-teal" />
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            <button
              type="button"
              onClick={() => setCoords(null)}
              aria-label="Rimuovi posizione"
              className="text-muted-2 hover:text-[var(--red)]"
            >
              <X size={13} />
            </button>
          </span>
        ) : geoStatus === "error" ? (
          <span className="text-xs text-[var(--red)]">
            Posizione non disponibile (permesso negato).
          </span>
        ) : (
          <span className="text-xs text-muted-2">Facoltativa, con il tuo consenso.</span>
        )}
      </div>

      {/* Photo upload (§9) */}
      <div>
        <label
          htmlFor="report-photo"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill border border-border-strong px-3.5 py-2 text-sm font-medium transition-colors hover:border-teal hover:text-teal"
        >
          {photoBusy ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {photo ? "Cambia foto" : "Allega una foto"}
        </label>
        <input
          id="report-photo"
          type="file"
          accept="image/*"
          onChange={onPhoto}
          className="sr-only"
        />
        {photo ? (
          <div className="relative mt-3 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt="Anteprima della foto allegata"
              className="max-h-40 rounded-[var(--radius-sm)] border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => setPhoto(null)}
              aria-label="Rimuovi foto"
              className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-surface shadow ring-1 ring-border hover:text-[var(--red)]"
            >
              <X size={13} />
            </button>
          </div>
        ) : null}
      </div>

      <Field label="Descrizione" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={3}
          required
          maxLength={1000}
          placeholder="Descrivi il problema: cosa, dove, da quanto tempo…"
          className="w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none"
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="anonymous"
          className="size-4 rounded border-border-strong text-teal focus-visible:outline-none"
        />
        Invia in forma anonima (il tuo nome non sarà mostrato pubblicamente)
      </label>

      {/* Urgenza con validazione del moderatore (A1 §8) */}
      <label className="flex items-start gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="urgent"
          className="mt-0.5 size-4 rounded border-border-strong text-teal focus-visible:outline-none"
        />
        <span>
          È un pericolo immediato (tombino aperto, albero caduto, semaforo guasto…)
          <span className="block text-xs text-muted-2">
            Un moderatore verificherà l&apos;urgenza prima di dare priorità.
          </span>
        </span>
      </label>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-2">
          La tua segnalazione sarà pubblica e tracciabile.
        </span>
        <SubmitButton pendingText="Invio…">
          <Plus size={16} />
          Invia segnalazione
        </SubmitButton>
      </div>
    </form>
  );
}
