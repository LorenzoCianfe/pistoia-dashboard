"use client";

import { useState, useTransition } from "react";
import { Download, Trash2, MapPin, Loader2 } from "lucide-react";
import {
  setGeoConsentAction,
  exportMyDataAction,
  deleteAccountAction,
} from "@/app/actions/privacy";

export function PrivacyControls({ geoConsent }: { geoConsent: boolean }) {
  const [consent, setConsent] = useState(geoConsent);
  const [confirming, setConfirming] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleConsent() {
    const next = !consent;
    setConsent(next);
    startTransition(async () => {
      await setGeoConsentAction(next);
    });
  }

  async function exportData() {
    setExporting(true);
    try {
      const res = await exportMyDataAction();
      if (res.ok) {
        const blob = new Blob([res.json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pistoia-dati-personali.json";
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  }

  function deleteAccount() {
    startTransition(async () => {
      await deleteAccountAction();
    });
  }

  return (
    <div className="space-y-5">
      {/* Geolocation consent */}
      <label className="flex cursor-pointer items-start justify-between gap-4">
        <span className="flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 shrink-0 text-muted-2" />
          <span>
            <span className="text-sm font-medium">Consenso alla geolocalizzazione</span>
            <span className="mt-0.5 block text-xs text-muted-2">
              Permetti l&apos;uso della tua posizione precisa quando crei una segnalazione.
            </span>
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={consent}
          onClick={toggleConsent}
          disabled={pending}
          className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
            consent ? "bg-teal" : "bg-surface-2 ring-1 ring-border-strong"
          }`}
        >
          <span
            className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
              consent ? "left-[1.375rem]" : "left-0.5"
            }`}
          />
        </button>
      </label>

      {/* Data export */}
      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        <div>
          <p className="text-sm font-medium">Esporta i tuoi dati</p>
          <p className="mt-0.5 text-xs text-muted-2">
            Scarica in formato JSON tutti i dati collegati al tuo account.
          </p>
        </div>
        <button
          type="button"
          onClick={exportData}
          disabled={exporting}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-border-strong px-3.5 py-2 text-sm font-semibold transition-colors hover:border-teal hover:text-teal disabled:opacity-60"
        >
          {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          Esporta
        </button>
      </div>

      {/* Account deletion */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium text-[var(--red)]">Cancella account</p>
        <p className="mt-0.5 text-xs text-muted-2">
          Elimina definitivamente il tuo profilo. I contenuti pubblici già inviati restano in forma
          anonima. Operazione irreversibile.
        </p>
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-[var(--red)]/40 px-3.5 py-2 text-sm font-semibold text-[var(--red)] transition-colors hover:bg-[var(--red-soft)]"
          >
            <Trash2 size={15} />
            Cancella il mio account
          </button>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={deleteAccount}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-pill bg-[var(--red)] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Sì, cancella definitivamente
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-sm font-medium text-muted-2 hover:text-foreground"
            >
              Annulla
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
