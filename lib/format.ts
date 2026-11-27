/** Formata bytes em B / KB / MB / GB (base 1024), em pt-BR. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exp;
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: exp === 0 ? 0 : value < 10 ? 1 : 0 })} ${units[exp]}`;
}
