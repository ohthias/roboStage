import { SkeletonBlock } from "@/components/stage";

export function MissionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-tl-[24px] rounded-br-[24px] border border-base-300 bg-base-100">
      <SkeletonBlock className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-4">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-12" />
      </div>
    </div>
  );
}

export function MissionCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <MissionCardSkeleton key={i} />
      ))}
    </div>
  );
}
