"use client";

export default function TestCardSkeleton() {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-md animate-pulse rounded-lg">
      {/* IMAGE / PREVIEW */}
      <figure className="bg-base-200 h-40 flex items-center justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-1 w-28 h-28">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="skeleton w-full h-full rounded-md"
            />
          ))}
        </div>
      </figure>

      {/* BODY */}
      <div className="card-body p-4 gap-3">
        {/* Title + badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="skeleton h-4 w-32" />
          <div className="flex gap-1">
            <div className="skeleton h-3 w-12 rounded-full" />
            <div className="skeleton h-3 w-10 rounded-full" />
          </div>
        </div>

        {/* Season */}
        <div className="skeleton h-3 w-28" />

        {/* Mission badges */}
        <div className="flex flex-wrap gap-1">
          <div className="skeleton h-4 w-10 rounded-full" />
          <div className="skeleton h-4 w-10 rounded-full" />
          <div className="skeleton h-4 w-10 rounded-full" />
        </div>

        {/* Date */}
        <div className="skeleton h-3 w-24 mt-auto" />

        {/* ACTIONS */}
        <div className="card-actions justify-end pt-2 gap-2">
          <div className="skeleton h-6 w-6 rounded-md" />
          <div className="skeleton h-6 w-6 rounded-md" />
          <div className="skeleton h-6 w-6 rounded-md" />
        </div>
      </div>
    </div>
  );
}