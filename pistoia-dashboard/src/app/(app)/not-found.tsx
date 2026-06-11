import Link from "next/link";

// 404 dentro l'area autenticata: mantiene TopBar e navigazione.
export default function AppNotFound() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="text-center">
        <p className="text-sm font-semibold text-muted-2">Errore 404</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Contenuto non trovato
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Quello che cercavi non esiste o è stato rimosso.
        </p>
        <Link
          href="/la-mia-citta"
          className="mt-5 inline-flex rounded-pill bg-teal px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Torna alla tua città
        </Link>
      </div>
    </div>
  );
}
