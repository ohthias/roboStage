"use client";

import { Shapes } from "lucide-react";
import { ThinkLabThumbnail } from "@/components/thinklab/ThinkLabThumbnail";
import { EmbedShell, EmbedSkeleton } from "./embed-shell";
import { useEmbedData } from "./embed-data";
import { EMBED_HREF } from "./embed-types";
import Link from "next/link";

export function ThinkLabEmbed({
  refId,
  label,
  onRemove,
}: {
  refId: string;
  label: string;
  onRemove: () => void;
}) {
  const { data, error, loading, refresh } = useEmbedData("thinklab-board", refId);

  return (
    <EmbedShell
      kind="thinklab-board"
      icon={Shapes}
      href={EMBED_HREF["thinklab-board"](refId)}
      loading={loading}
      error={error}
      fallbackLabel={label}
      onRefresh={refresh}
      onRemove={onRemove}
    >
      {!data ? (
        <EmbedSkeleton height="h-56" />
      ) : (
        <div>
          <Link
            href={EMBED_HREF["thinklab-board"](data.id)}
            className="block"
            title="Abrir quadro no ThinkLab"
            contentEditable={false}
          >
            <ThinkLabThumbnail
              elements={data.elements}
              name={data.name}
              className="h-64 rounded-none"
            />
          </Link>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-3">
            <h4 className="text-sm font-semibold">{data.name}</h4>
            <span className="text-xs text-base-content/45">
              {data.elements.length} elemento{data.elements.length === 1 ? "" : "s"} · atualizado em{" "}
              {new Date(data.updatedAt).toLocaleDateString("pt-BR")}
            </span>
            {data.description && (
              <p className="w-full line-clamp-2 text-xs text-base-content/55">{data.description}</p>
            )}
          </div>
        </div>
      )}
    </EmbedShell>
  );
}
