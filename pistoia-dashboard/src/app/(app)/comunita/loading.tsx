// Skeleton della Comunità: composer + lista di post.
export default function ComunitaLoading() {
  return (
    <div role="status">
      <p className="sr-only">Caricamento della comunità in corso…</p>
      <div aria-hidden="true" className="space-y-5">
        <div className="space-y-2">
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-8 w-56" />
        </div>
        <div className="skeleton h-28 w-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-44 w-full" />
        ))}
      </div>
    </div>
  );
}
