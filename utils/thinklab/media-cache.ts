/**
 * Cache de imagens usado pelo renderizador do canvas.
 *
 * O canvas desenha de forma síncrona, mas imagens carregam de forma assíncrona:
 * na primeira tentativa `getCachedImage` dispara o carregamento e retorna null;
 * quando a imagem chega, os inscritos em `subscribeMediaLoaded` são avisados
 * para redesenhar.
 */

type Entry = { img: HTMLImageElement; loaded: boolean; failed: boolean; dataUrl?: string };

const cache = new Map<string, Entry>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeMediaLoaded(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getCachedImage(src: string): HTMLImageElement | null {
  if (typeof window === 'undefined' || !src) return null;
  let entry = cache.get(src);
  if (!entry) {
    const img = new Image();
    img.decoding = 'async';
    entry = { img, loaded: false, failed: false };
    cache.set(src, entry);
    const current = entry;
    img.onload = () => {
      current.loaded = true;
      notify();
    };
    img.onerror = () => {
      current.failed = true;
      notify();
    };
    img.src = src;
  }
  return entry.loaded ? entry.img : null;
}

export function isImageFailed(src: string) {
  return !!cache.get(src)?.failed;
}

/**
 * Versão data URL de uma imagem já carregada (mesma origem). A exportação PNG/PDF
 * passa o SVG por uma <img>, que não carrega URLs externas — por isso as imagens
 * são embutidas quando possível. Se ainda não carregou, devolve a URL original.
 */
export function getImageDataUrl(src: string): string {
  if (!src || src.startsWith('data:') || typeof document === 'undefined') return src;
  const entry = cache.get(src);
  if (!entry?.loaded) {
    getCachedImage(src);
    return src;
  }
  if (entry.dataUrl) return entry.dataUrl;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = entry.img.naturalWidth;
    canvas.height = entry.img.naturalHeight;
    canvas.getContext('2d')?.drawImage(entry.img, 0, 0);
    entry.dataUrl = canvas.toDataURL('image/png');
    return entry.dataUrl;
  } catch {
    return src;
  }
}
