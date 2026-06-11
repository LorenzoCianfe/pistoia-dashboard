// Skeleton del Bilancio: KPI ad anello + grafico mensile + missioni.
export default function BilancioLoading() {
  return (
    <div role="status">
      <p className="sr-only">Caricamento del bilancio in corso…</p>
      <div aria-hidden="true" className="space-y-5">
        <div className="space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-8 w-72" />
        </div>
        <div className="flex flex-wrap justify-center gap-8 py-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton size-32 rounded-full" />
          ))}
        </div>
        <div className="skeleton h-64 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
