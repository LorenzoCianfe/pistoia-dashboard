import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-muted-2">Errore 404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Pagina non trovata
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          L&apos;indirizzo che hai aperto non esiste o non è più disponibile.
        </p>
        <Link
          href="/la-mia-citta"
          className="mt-5 inline-flex rounded-pill bg-teal px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Torna alla tua città
        </Link>
      </div>
    </main>
  );
}
