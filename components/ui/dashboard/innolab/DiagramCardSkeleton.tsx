"use client";

interface DiagramCardSkeletonProps {
  viewMode: "grid" | "list";
}

export default function DiagramCardSkeleton({
  viewMode,
}: DiagramCardSkeletonProps) {
  /* ================= LIST MODE ================= */
  if (viewMode === "list") {
    return (
      <div className="flex items-center justify-between gap-4 p-4 bg-base-100 border border-base-300 rounded-xl animate-pulse">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-base-300" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-base-300 rounded" />
            <div className="flex gap-2">
              <div className="h-3 w-16 bg-base-300 rounded" />
              <div className="h-3 w-24 bg-base-300 rounded" />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="w-8 h-8 bg-base-300 rounded-full" />
          <div className="w-8 h-8 bg-base-300 rounded-full" />
        </div>
      </div>
    );
  }

  /* ================= GRID MODE ================= */
  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl p-5 animate-pulse flex flex-col h-full">
      <div className="flex justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-base-300" />
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-base-300 rounded-full" />
          <div className="w-8 h-8 bg-base-300 rounded-full" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-4 w-3/4 bg-base-300 rounded" />
        <div className="h-4 w-1/2 bg-base-300 rounded" />
      </div>

      <div className="mt-auto flex justify-between">
        <div className="h-3 w-20 bg-base-300 rounded" />
        <div className="h-3 w-24 bg-base-300 rounded" />
      </div>
    </div>
  );
}
