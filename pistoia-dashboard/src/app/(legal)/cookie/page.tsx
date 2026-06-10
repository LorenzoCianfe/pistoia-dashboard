import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookie policy" };

export default function CookiePage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Cookie policy</h1>
      <p className="!text-muted-2">
        Dashboard di Pistoia usa il minimo indispensabile: nessun cookie di profilazione, nessun
        tracciamento pubblicitario, nessun cookie di terze parti per la pubblicità.
      </p>

      <h2>Cookie tecnici</h2>
      <ul>
        <li>
          <strong>pistoia_session</strong> — cookie di sessione necessario per tenerti autenticato.
          È <code>HttpOnly</code>, <code>SameSite=Lax</code>, con durata 30 giorni. Senza questo
          cookie non è possibile effettuare l&apos;accesso.
        </li>
      </ul>

      <h2>Preferenze locali</h2>
      <p>
        La scelta del tema (chiaro/scuro/sistema) è salvata nel <code>localStorage</code> del
        browser, non in un cookie, e non viene trasmessa ai nostri server.
      </p>

      <h2>Servizi esterni</h2>
      <p>
        La mappa interattiva carica i riquadri cartografici (tile) da OpenStreetMap. La tua richiesta
        di tile raggiunge i server di OpenStreetMap, soggetti alla loro informativa.
      </p>
    </>
  );
}
