export default function Loading() {
  return (
    <div className="qb-paper min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] animate-pulse space-y-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-base-300/60" />
          <div className="h-10 w-72 rounded-lg bg-base-300/60" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[250px_1fr] xl:grid-cols-[260px_1fr_300px]">
          <div className="h-96 rounded-2xl bg-base-300/40" />
          <div className="h-[560px] rounded-2xl bg-base-300/40" />
          <div className="hidden h-96 rounded-2xl bg-base-300/40 xl:block" />
        </div>
      </div>
    </div>
  );
}
