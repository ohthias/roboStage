/** Itens fixados na barra lateral (tipos compartilhados servidor ↔ UI). */

export const PIN_KINDS = ["labtest", "thinklab", "quickbrick", "stagebook"] as const;
export type PinKind = (typeof PIN_KINDS)[number];

/** Quantos itens cabem nos fixados de cada espaço. */
export const MAX_PINS = 3;

export const PIN_KIND_LABEL: Record<PinKind, string> = {
  labtest: "LabTest",
  thinklab: "ThinkLab",
  quickbrick: "QuickBrick",
  stagebook: "StageBook",
};

export function pinHref(kind: PinKind, id: string): string {
  switch (kind) {
    case "labtest":
      return `/dashboard/labtest/${id}`;
    case "thinklab":
      return `/dashboard/thinklab/${id}`;
    case "quickbrick":
      return `/dashboard/quickbrick/${id}`;
    case "stagebook":
      return `/dashboard/documents/${id}`;
  }
}

export function isPinKind(value: unknown): value is PinKind {
  return typeof value === "string" && (PIN_KINDS as readonly string[]).includes(value);
}

export type PinDTO = {
  id: string;
  kind: PinKind;
  resourceId: string;
  title: string;
  /** Emoji da página (StageBook), quando houver. */
  icon: string | null;
  href: string;
};

export type PinCandidate = {
  kind: PinKind;
  id: string;
  title: string;
  icon: string | null;
  href: string;
  updatedAt: string;
  pinned: boolean;
};
