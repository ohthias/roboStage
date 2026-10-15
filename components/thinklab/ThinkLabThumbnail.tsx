'use client';

import { useMemo } from 'react';
import { CanvasElement } from '@/types/thinklab.types';
import { exportToSvgString } from '@/utils/thinklab/svg-exporter';

interface ThinkLabThumbnailProps {
  elements: CanvasElement[];
  name: string;
}

export function ThinkLabThumbnail({ elements, name }: ThinkLabThumbnailProps) {
  const svgMarkup = useMemo(
    () =>
      elements.length > 0
        ? exportToSvgString(elements, {
            padding: 24,
            backgroundColor: 'transparent',
          })
        : '',
    [elements]
  );

  return (
    <div
      aria-label={`Miniatura do quadro ${name}`}
      className="relative flex h-44 items-center justify-center overflow-hidden rounded-box bg-base-200/70"
      role="img"
    >
      {svgMarkup ? (
        <div
          className="flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      ) : (
        <div className="text-center text-sm opacity-60">
          <span className="mb-1 block text-3xl" aria-hidden="true">□</span>
          Quadro vazio
        </div>
      )}
    </div>
  );
}
