"use client";

import { Shapes, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { ThinkLabThumbnail } from "@/features/thinklab/components/ThinkLabThumbnail";
import { EmbedShell, EmbedSkeleton } from "./embed-shell";
import { useEmbedData } from "./embed-data";
import { EMBED_HREF, type EmbedOptions } from "./embed-types";
import {
  EmbedLayoutFrame,
  EmbedPopover,
  HeightControls,
  LayoutControls,
  PopoverSection,
} from "./embed-layout";
import { THUMB_HEIGHT_CLASS, normalizeHeight } from "./embed-options";

export function ThinkLabEmbed({
  refId,
  label,
  options,
  editable,
  onOptionsChange,
  onRemove,
}: {
  refId: string;
  label: string;
  options: EmbedOptions;
  editable: boolean;
  onOptionsChange: (next: EmbedOptions) => void;
  onRemove: () => void;
}) {
  const { data, error, loading, refresh } = useEmbedData("thinklab-board", refId);
  const thumbHeight = normalizeHeight(options.thumbHeight, "md");
  const showDetails = options.showDetails !== false;

  const toolbar = editable && (
    <EmbedPopover icon={<SlidersHorizontal size={13} />} label="Tamanho e posição">
      <LayoutControls layout={options} onChange={onOptionsChange} />
      <HeightControls
        title="Altura da miniatura"
        value={thumbHeight}
        onChange={(h) => onOptionsChange({ ...options, thumbHeight: h })}
      />
      <PopoverSection title="Detalhes">
        <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
          Mostrar nome e descrição
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-primary"
            checked={showDetails}
            onChange={(e) => onOptionsChange({ ...options, showDetails: e.target.checked })}
          />
        </label>
      </PopoverSection>
    </EmbedPopover>
  );

  return (
    <EmbedLayoutFrame layout={options} editable={editable} onChange={onOptionsChange}>
      <EmbedShell
        kind="thinklab-board"
        icon={Shapes}
        href={EMBED_HREF["thinklab-board"](refId)}
        loading={loading}
        error={error}
        fallbackLabel={label}
        onRefresh={refresh}
        onRemove={onRemove}
        toolbar={toolbar}
      >
        {!data ? (
          <EmbedSkeleton height={THUMB_HEIGHT_CLASS[thumbHeight]} />
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
                className={`${THUMB_HEIGHT_CLASS[thumbHeight]} rounded-none transition-[height]`}
              />
            </Link>
            {showDetails && (
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
            )}
          </div>
        )}
      </EmbedShell>
    </EmbedLayoutFrame>
  );
}
