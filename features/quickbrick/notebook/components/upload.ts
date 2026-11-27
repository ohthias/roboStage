/**
 * Envia um arquivo para a URL pré-assinada do R2 (PUT), com progresso.
 * Usa XHR porque `fetch` ainda não informa progresso de upload.
 */
export function putToSignedUrl(url: string, file: File, onProgress?: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    if (file.type) xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`O armazenamento recusou o envio (${xhr.status}).`));
    xhr.onerror = () =>
      reject(new Error("Falha de rede ao enviar o arquivo. Verifique a conexão (ou o CORS do bucket R2)."));
    xhr.send(file);
  });
}

/** Valor para <input type="datetime-local"> no fuso do navegador. */
export function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const fullFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" });

export const fmtDate = (iso: string) => dateFmt.format(new Date(iso));
export const fmtTime = (iso: string) => timeFmt.format(new Date(iso));
export const fmtFull = (iso: string) => fullFmt.format(new Date(iso));

/** "3 dias", "5 h", "12 min" entre duas datas. */
export function fmtDelta(a: string, b: string) {
  const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h} h`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? "dia" : "dias"}`;
}
