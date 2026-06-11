// Skeleton delle Opere: KPI + griglia di card cantiere.
export default function OpereLoading() {
  return (
    <div role="status">
      <p className="sr-only">Caricamento delle opere in corso…</p>
      <div aria-hidden="true" className="space-y-5">
        <div className="space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-8 w-64" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-52 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
