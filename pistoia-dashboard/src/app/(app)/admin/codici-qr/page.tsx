import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft, QrCode } from "lucide-react";
import { renderSVG } from "uqr";
import { requireAdmin } from "@/lib/auth/dal";
import { getCodiciQrTutti } from "@/lib/data/valutazioni";
import { servizio as trovaServizio } from "@/lib/valutazioni";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { PulsanteStampa } from "@/components/admin/pulsante-stampa";

/*
  Il generatore dei fogli QR (piano R-3, punto 5). Ogni scheda qui sotto È il
  foglio che si appende accanto allo sportello: parla al cittadino, non
  all'amministratore — l'interfaccia di servizio sta tutta nella testata, che
  in stampa sparisce.

  L'immagine è generata da `uqr` (scelta di Lorenzo, 2026-08-03: pacchetto
  minimo senza sotto-dipendenze, al posto di un encoder trascritto a mano o di
  un rinvio). Il QR resta nero su bianco anche nel tema scuro: non è una
  dimenticanza, è il contrasto che serve alla fotocamera.

  I codici vivono nel database (`CodiceQr`, seminati in `prisma/seed.ts`):
  la creazione da interfaccia arriverà con gli ingressi di R-5, quando si
  deciderà anche chi li appende e dove.
*/

export const metadata: Metadata = { title: "Codici QR · Valutazioni" };

export default async function CodiciQrPage() {
  await requireAdmin();
  const codici = await getCodiciQrTutti();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} aria-hidden />
          Area Comune
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader
            eyebrow="Valutazioni dei servizi"
            title="Codici QR da stampare"
            description="Ogni scheda è un foglio: si stampa, si appende accanto allo sportello o nel luogo, e porta a una pagina di voto con servizio e luogo già compilati."
            icon={<QrCode size={22} className="text-teal" />}
          />
          <PulsanteStampa />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 print:grid-cols-2 print:gap-8">
        {codici.map((c) => {
          const s = trovaServizio(c.servizioId);
          if (!s) return null;
          const url = `${proto}://${host}/v/${c.codice}`;
          const svg = renderSVG(url, { border: 2 });

          return (
            <Card
              key={c.codice}
              className={`break-inside-avoid text-center ${c.attivo ? "" : "print:hidden"}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
                Valutazioni dei servizi
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{s.nome}</h2>
              <p className="mt-0.5 text-sm text-muted">{c.luogo}</p>

              {!c.attivo ? (
                <p className="mt-2 inline-block rounded-pill border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-2">
                  disattivato — non si stampa
                </p>
              ) : null}

              {/* Nero su bianco in ENTRAMBI i temi: è il contrasto per la
                  fotocamera, non una scelta estetica.

                  `dangerouslySetInnerHTML` è sicuro QUI perché l'SVG di uqr è
                  geometria pura (<path> dei moduli): il testo codificato non
                  compare mai come markup, quindi non c'è nulla da sanificare.
                  Se un giorno l'immagine incorporasse testo, questa riga va
                  ripensata. */}
              <div
                aria-hidden
                className="mx-auto mt-4 w-44 rounded-lg bg-white p-2 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <p className="sr-only">Codice QR che porta a {url}</p>

              <p className="mt-3 text-sm text-muted">
                Inquadra col telefono, oppure digita:
              </p>
              <p className="font-mono text-sm font-medium">{url.replace(/^https?:\/\//, "")}</p>
              <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-2">
                Un minuto, senza registrarsi: bastano le stelle e la tua email.
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
