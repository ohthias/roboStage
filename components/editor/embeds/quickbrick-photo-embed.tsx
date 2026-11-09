"use client";

import { Camera } from "lucide-react";
import { EmbedShell, EmbedSkeleton } from "./embed-shell";
import { useEmbedData } from "./embed-data";
import { EMBED_HREF, type QuickbrickEmbedOptions } from "./embed-types";
import { IMAGE_SIZE_CLASS, ImageSizeToggle } from "./image-size-toggle";

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Foto de uma versão do robô (caderno do QuickBrick Studio). */
export function QuickbrickPhotoEmbed({
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
  const { data, error, loading, refresh } = useEmbedData("quickbrick-photo", refId);
  const size = options.size ?? "medium";
  const notebookId = data?.notebookId ?? options.notebookId;

  return (
    <EmbedShell
      kind="quickbrick-photo"
      icon={Camera}
      href={notebookId ? EMBED_HREF["quickbrick-photo"](refId, notebookId) : undefined}
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
          <div className="bg-base-200/40 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL assinada e temporária do R2 */}
            <img
              src={data.url}
              alt={data.title || `Foto do robô ${data.robotName ?? data.notebookName}`}
              loading="lazy"
              decoding="async"
              className={`${IMAGE_SIZE_CLASS[size]} block h-auto max-h-[36rem] rounded-xl object-contain`}
            />
          </div>
          <figcaption className="px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold">
                {data.title || `Versão ${data.version}`}
              </span>
              <span className="text-xs text-base-content/50">
                {data.robotName ? `${data.robotName} · ` : ""}
                {data.notebookName} · versão {data.version} de {data.totalVersions} ·{" "}
                {dateTime.format(new Date(data.takenAt))}
              </span>
            </div>
            {data.notes && (
              <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-base-content/60">
                {data.notes}
              </p>
            )}
          </figcaption>
        </figure>
      )}
    </EmbedShell>
  );
}
