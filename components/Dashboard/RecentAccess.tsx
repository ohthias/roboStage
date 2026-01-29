"use client";

import { Palette, TestTube, Rocket, Book } from "lucide-react";
import { useRouter } from "next/navigation";

const ACCESS_ICONS = {
  test: TestTube,
  event: Rocket,
  document: Book,
  style: Palette,
};

const RESOURCE_ROUTES: Record<
  keyof typeof ACCESS_ICONS,
  (id: string | number) => string
> = {
  test: (id) => `/dashboard/labtest/${id}`,
  event: (code_event) => `/showlive/${code_event}`,
  document: (id) => `/innolab/${id}`,
  style: (id) => `/dashboard/stylelab`,
};

export type LastAccessItem = {
  resource_type: keyof typeof ACCESS_ICONS;
  resource_id: string;
  title: string;
  last_access: string;
};

type RecentAccessProps = {
  items: LastAccessItem[];
  loading?: boolean;
  skeletonCount?: number;
};

export function RecentAccess({
  items,
  loading = false,
  skeletonCount = 6,
}: RecentAccessProps) {
  const router = useRouter();

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-base-content/50">
        Acessos recentes
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Skeleton */}
        {loading &&
          Array.from({ length: skeletonCount }).map((_, i) => (
            <RecentAccessSkeleton key={i} />
          ))}

        {/* Conteúdo */}
        {!loading &&
          items.map((item) => {
            const Icon = ACCESS_ICONS[item.resource_type];

            return (
              <button
                key={`${item.resource_type}-${item.resource_id}`}
                onClick={() =>
                  router.push(
                    RESOURCE_ROUTES[item.resource_type](item.resource_id)
                  )
                }
                className="group relative w-full rounded-xl bg-base-100/60 hover:bg-base-100 transition p-3 flex items-center gap-3 border border-base-300"
              >
                {/* Badge último acesso */}
                <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-base-200 text-base-content/60">
                  {formatRelativeTime(item.last_access)}
                </span>

                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>

                <div className="flex flex-col text-left leading-tight min-w-0">
                  <span className="text-xs text-base-content/50 capitalize">
                    {item.resource_type}
                  </span>
                  <span className="text-sm font-medium line-clamp-1">
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}

        {/* Estado vazio */}
        {!loading && items.length === 0 && (
          <div className="col-span-full text-sm text-base-content/40 text-center py-6">
            Nenhum acesso recente
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Utils ---------- */

function formatRelativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Agora";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;

  const days = Math.floor(hours / 24);
  return `${days} d`;
}

/* ---------- Skeleton ---------- */

function RecentAccessSkeleton() {
  return (
    <div className="w-full rounded-xl bg-base-100/40 p-3 flex items-center gap-3 animate-pulse border border-base-300 relative">
      <div className="absolute top-2 right-2 h-4 w-10 rounded-full bg-base-300" />

      <div className="w-9 h-9 rounded-lg bg-base-300 shrink-0" />

      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-20 rounded bg-base-300" />
        <div className="h-4 w-full rounded bg-base-300" />
      </div>
    </div>
  );
}