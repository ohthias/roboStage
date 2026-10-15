export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function svgToPng(svg: SVGSVGElement, filename: string, pxPerCm = 8) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll(".no-export").forEach((n) => n.remove());
  const vb = svg.viewBox.baseVal;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(vb.width * pxPerCm));
  clone.setAttribute("height", String(vb.height * pxPerCm));
  clone.setAttribute("font-family", "system-ui, -apple-system, Segoe UI, sans-serif");
  clone.removeAttribute("class");
  clone.removeAttribute("style");
  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("falha ao renderizar SVG"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = vb.width * pxPerCm;
    canvas.height = vb.height * pxPerCm;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (blob) download(blob, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}
