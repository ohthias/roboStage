// Filtros da lista de testes do LabTest. Tudo vive na URL (?q=&modo=&status=
// &temporada=&ordem=&visualizacao=&pagina=) para dar para compartilhar e
// voltar com o navegador. Arquivo puro: usado na página (servidor) e na barra.

import { MODE_META, STATUS_META, normalizeStatus, type ModeKey } from "./catalog";

export type ListSort = "recente" | "criacao" | "nome" | "execucoes";
export type ListStatus = keyof typeof STATUS_META;

export const LIST_SORT_LABEL: Record<ListSort, string> = {
  recente: "Execução mais recente",
  criacao: "Criação mais recente",
  nome: "Nome (A–Z)",
  execucoes: "Mais executados",
};

export type ListFilters = {
  q: string;
  mode: ModeKey | null;
  status: ListStatus | null;
  season: string | null;
  sort: ListSort;
  /** Só testes que ainda não foram executados. */
  neverRun: boolean;
};

export type ListParams = Partial<Record<"q" | "modo" | "status" | "temporada" | "ordem" | "novos" | "visualizacao" | "pagina", string>>;

export function parseListFilters(p: ListParams | undefined): ListFilters {
  const mode = p?.modo && p.modo in MODE_META ? (p.modo as ModeKey) : null;
  const status = p?.status && p.status in STATUS_META ? (p.status as ListStatus) : null;
  const sort = p?.ordem && p.ordem in LIST_SORT_LABEL ? (p.ordem as ListSort) : "recente";
  return {
    q: (p?.q ?? "").slice(0, 80),
    mode,
    status,
    season: p?.temporada?.slice(0, 40) || null,
    sort,
    neverRun: p?.novos === "1",
  };
}

export function activeListFilterCount(f: ListFilters) {
  return (f.q.trim() ? 1 : 0) + (f.mode ? 1 : 0) + (f.status ? 1 : 0) + (f.season ? 1 : 0) + (f.neverRun ? 1 : 0);
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Filterable = {
  name: string;
  description: string | null;
  mode: string;
  status: string;
  season: string | null;
  createdAt: Date;
  executionCount: number;
};

export function applyListFilters<T extends Filterable>(tests: T[], f: ListFilters): T[] {
  const q = norm(f.q.trim());
  const list = tests.filter(
    (t) =>
      (!f.mode || t.mode === f.mode) &&
      (!f.status || normalizeStatus(t.status) === f.status) &&
      (!f.season || t.season === f.season) &&
      (!f.neverRun || t.executionCount === 0) &&
      (!q || norm(`${t.name} ${t.description ?? ""} ${t.season ?? ""}`).includes(q)),
  );
  // "recente" já vem ordenado do banco (última execução, depois criação).
  if (f.sort === "criacao") list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  else if (f.sort === "nome") list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  else if (f.sort === "execucoes") list.sort((a, b) => b.executionCount - a.executionCount);
  return list;
}

/** Monta a URL da lista a partir dos parâmetros atuais + alterações. */
export function listHref(current: ListParams, patch: ListParams) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...patch })) {
    if (v) next.set(k, v);
  }
  if (next.get("ordem") === "recente") next.delete("ordem");
  const qs = next.toString();
  return `/dashboard/labtest${qs ? `?${qs}` : ""}`;
}
