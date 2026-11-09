"use client";

import Link from "next/link";
import { Shapes } from "lucide-react";
import { DiagramIcon } from "@/components/QuickBrick/Notebook/diagram-icon";
import { DIAGRAM_META, seasonName } from "@/utils/quickbrick/notebook";
import { EmbedShell, EmbedSkeleton } from "./embed-shell";
import { useEmbedData } from "./embed-data";
import { EMBED_HREF, type QuickbrickEmbedOptions } from "./embed-types";
import { IMAGE_SIZE_CLASS, ImageSizeToggle } from "./image-size-toggle";
import { QuickbrickDiagramPreview } from "./quickbrick-diagram-preview";

/** Imagem de um diagrama do caderno do QuickBrick, sempre atualizada. */
export function QuickbrickDiagramEmbed({
  refId,
  label,
  options,
  onOptionsChange,
  onRemove,
}: {
  refId: string;
  label: string;
  options: QuickbrickEmbedOptions;
  onOptionsChange: (next: QuickbrickEmbedOptions) => void;
  onRemove: () => void;
}) {
  const { data, error, loading, refresh } = useEmbedData("quickbrick-diagram", refId);
  const size = options.size ?? "full";
  const notebookId = data?.notebookId ?? options.notebookId;
  const href = notebookId ? EMBED_HREF["quickbrick-diagram"](refId, notebookId) : undefined;

  return (
    <EmbedShell
      kind="quickbrick-diagram"
      icon={Shapes}
      href={href}
      loading={loading}
      error={error}
      fallbackLabel={label}
      onRefresh={refresh}
      onRemove={onRemove}
      toolbar={<ImageSizeToggle value={size} onChange={(next) => onOptionsChange({ ...options, size: next })} />}
    >
      {!data ? (
        <EmbedSkeleton height="h-64" />
      ) : (
        <figure className="m-0">
          <div className="bg-base-200/30 p-3">
            <div className={`${IMAGE_SIZE_CLASS[size]} overflow-hidden rounded-xl border border-base-300/70 bg-base-100`}>
              <QuickbrickDiagramPreview kind={data.kind} data={data.data} />
            </div>
          </div>
          <figcaption className="flex items-center gap-3 px-4 py-3">
            <span
              className="grid size-8 shrink-0 place-items-center rounded-lg text-white"
              style={{ background: DIAGRAM_META[data.kind].color }}
            >
              <DiagramIcon kind={data.kind} className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              {href ? (
                <Link href={href} className="block truncate text-sm font-semibold hover:underline">
                  {data.title}
                </Link>
              ) : (
                <span className="block truncate text-sm font-semibold">{data.title}</span>
              )}
              <span className="block truncate text-xs text-base-content/50">
                {DIAGRAM_META[data.kind].label}
                {data.season ? ` · ${seasonName(data.season) ?? data.season}` : ""} · {data.notebookName} ·{" "}
                {data.summary}
              </span>
            </span>
          </figcaption>
        </figure>
      )}
    </EmbedShell>
  );
}
