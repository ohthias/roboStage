const KEY = "notebook:recent-docs";
const MAX = 20;

export type RecentEntry = { id: string; at: number };

export function readRecentDocs(): RecentEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((e) => e && typeof e.id === "string" && typeof e.at === "number")
      : [];
  } catch {
    return [];
  }
}

/** Registra a abertura de um documento (mais recente primeiro, sem duplicar). */
export function recordRecentDoc(id: string) {
  try {
    const next = [{ id, at: Date.now() }, ...readRecentDocs().filter((e) => e.id !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}
