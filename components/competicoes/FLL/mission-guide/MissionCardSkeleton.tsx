export function MissionCardSkeleton() {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="skeleton aspect-square w-full rounded-none rounded-t-2xl" />
      <div className="card-body gap-2 p-4">
        <div className="skeleton h-3 w-10" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-12" />
      </div>
    </div>
  );
}

export function MissionCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <MissionCardSkeleton key={i} />
      ))}
    </div>
  );
}
