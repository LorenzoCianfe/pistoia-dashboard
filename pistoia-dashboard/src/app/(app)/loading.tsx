// Skeleton generico per le rotte dell'area app (usa la classe .skeleton
// definita in globals.css). Le pagine più dense hanno un loading.tsx dedicato.
// role="status" + testo sr-only: l'annuncio funziona solo con un testo reale
// in una live region (aria-label su un div generico viene ignorato dagli SR).
export default function AppLoading() {
  return (
    <div role="status">
      <p className="sr-only">Caricamento della pagina in corso…</p>
      <div aria-hidden="true" className="space-y-5">
        <div className="space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-8 w-64" />
          <div className="skeleton h-4 w-full max-w-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-36 w-full" />
          ))}
        </div>
        <div className="skeleton h-64 w-full" />
      </div>
    </div>
  );
}
