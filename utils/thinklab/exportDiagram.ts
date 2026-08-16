const BACKGROUND_COLOR = "#FBF9F4";

function serialize(svgEl: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgEl);
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return source;
}

function triggerDownload(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getSvgDimensions(svgEl: SVGSVGElement): { width: number; height: number } {
  const viewBoxWidth = svgEl.viewBox?.baseVal?.width;
  const viewBoxHeight = svgEl.viewBox?.baseVal?.height;
  const width = viewBoxWidth || svgEl.clientWidth || 1000;
  const height = viewBoxHeight || svgEl.clientHeight || 700;
  return { width, height };
}

export function downloadSVG(svgEl: SVGSVGElement, filename = "diagrama-ishikawa.svg"): void {
  const source = serialize(svgEl);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

export interface DownloadPngOptions {
  filename?: string;
  /** Multiplicador de resolução: 2 (padrão web), 3 (impressão) ou 4 (alta definição). */
  scale?: number;
  /** Margem em pixels (no espaço do SVG) adicionada ao redor do diagrama exportado. */
  padding?: number;
}

/**
 * Renderiza o SVG do diagrama em um canvas em memória e baixa como PNG.
 * Usa `scale` para controlar a resolução final (largura_svg * scale) e
 * adiciona um `padding` com a cor de fundo para o PNG não ficar "colado" nas bordas.
 */
export function downloadPNG(svgEl: SVGSVGElement, options: DownloadPngOptions = {}): Promise<void> {
  const { filename = "diagrama-ishikawa.png", scale = 2, padding = 24 } = options;

  return new Promise((resolve, reject) => {
    const source = serialize(svgEl);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      try {
        const { width, height } = getSvgDimensions(svgEl);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round((width + padding * 2) * scale);
        canvas.height = Math.round((height + padding * 2) * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível criar o contexto do canvas."));
          return;
        }

        ctx.scale(scale, scale);
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, width + padding * 2, height + padding * 2);
        ctx.drawImage(img, padding, padding, width, height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Falha ao gerar o PNG a partir do canvas."));
            return;
          }
          const pngUrl = URL.createObjectURL(blob);
          triggerDownload(pngUrl, filename);
          URL.revokeObjectURL(pngUrl);
          resolve();
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err instanceof Error ? err : new Error("Erro desconhecido ao exportar PNG."));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao carregar o SVG para conversão em PNG."));
    };

    img.src = url;
  });
}
