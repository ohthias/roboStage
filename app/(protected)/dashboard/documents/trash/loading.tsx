export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8" aria-busy="true">
      <div className="h-9 w-40 animate-pulse rounded-md bg-base-content/10" />
      <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-md bg-base-content/10" />
      <div className="mt-8 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-base-content/10" />
        ))}
      </div>
    </div>
  );
}
