/** Data de hoje no fuso de quem usa (AAAA-MM-DD) — toISOString() usaria UTC. */
export function localDateISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
