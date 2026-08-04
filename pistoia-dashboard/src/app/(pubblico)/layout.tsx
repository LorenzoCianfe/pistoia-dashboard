import { getCurrentUser } from "@/lib/auth/dal";
import { AppShell } from "@/components/app/app-shell";
import { TopBarAnonima } from "@/components/app/top-bar-anonima";
import { Footer } from "@/components/app/footer";

/*
  Il gruppo a LETTURA PUBBLICA (R-5, decisione W1 del 2026-08-04): le pagine
  che chiunque può leggere senza account — oggi `/valutazioni` e le schede.

  Due porte, un contratto:
  - con una sessione si rende l'`AppShell` INTERO, identico al gruppo
    `(app)`: chi è dentro non deve accorgersi di niente;
  - senza sessione: barra anonima (stemma + «Accedi»), il contenuto, il
    footer. Niente barra laterale né navigazione bassa — le loro voci
    puntano a pagine protette, e un menu di porte chiuse è una presa in giro.

  La SCRITTURA non cambia regime qui: il modulo di voto sulla scheda degrada
  a invito per gli anonimi (il voto senza account resta sui QR, `/v/`).
*/
export default async function PubblicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) return <AppShell user={user}>{children}</AppShell>;

  return (
    <div className="min-h-dvh">
      <a
        href="#contenuto"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:rounded-pill focus-visible:bg-surface focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:shadow-lg"
      >
        Salta al contenuto
      </a>
      <TopBarAnonima />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <main
          id="contenuto"
          tabIndex={-1}
          className="min-w-0 pb-16 pt-6 outline-none"
        >
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
