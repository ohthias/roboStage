import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { RecentItem } from "@/types/dashboard.types";

const badgeVariant: Record<RecentItem["type"], string> = {
  Evento: "badge-primary",
  Teste: "badge-secondary",
  Documento: "badge-accent",
  Estilo: "badge-neutral",
};

const routeMap: Record<RecentItem["type"], string> = {
  Evento: "/showlive/{code_event}",
  Teste: "/dashboard/labtest/{id}",
  Documento: "/innolab/{id}",
  Estilo: "/dashboard/stylelab",
};

export default function RecentItemRow({ item }: { item: RecentItem }) {
  const badge = badgeVariant[item.type] ?? "badge-ghost";

  const route = routeMap[item.type] ?? "";
  const placeholderMatch = route.match(/{([^}]+)}/);
  const href = placeholderMatch
    ? route.replace(placeholderMatch[0], // e.g. "{code_event}"
        (item as any)[placeholderMatch[1]] ?? item.id)
    : `${route}/${item.id}`;

  return (
    <Link
      href={href}
      className="
        flex items-center gap-3
        py-3 border-b border-base-200
        last:border-0
        hover:bg-base-200/50
        -mx-2 px-2 rounded-lg
        transition-colors
        cursor-pointer
      "
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>

        <p className="text-xs text-base-content/40 mt-0.5">{item.accessedAt}</p>
      </div>

      <span className={`badge badge-sm ${badge} badge-outline`}>
        {item.type}
      </span>

      <ChevronRight className="w-3.5 h-3.5 text-base-content/30 shrink-0" />
    </Link>
  );
}
