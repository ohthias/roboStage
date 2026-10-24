'use client';

import { useMemo } from 'react';
import { CanvasElement } from '@/types/thinklab.types';
import { exportToSvgString } from '@/utils/thinklab/svg-exporter';

interface ThinkLabThumbnailProps {
  elements: CanvasElement[];
  name: string;
  /** Classes de tamanho/forma do contêiner (padrão: cartão de 11rem de altura). */
  className?: string;
}

export function ThinkLabThumbnail({
  elements,
  name,
  className = "h-44 rounded-box",
}: ThinkLabThumbnailProps) {
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
      className={`relative flex items-center justify-center overflow-hidden bg-base-200/70 ${className}`}
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
