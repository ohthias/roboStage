"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Book,
  Cuboid,
  FlaskConical,
  Lightbulb,
  Loader2,
  Pin,
  PinOff,
  Plus,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { findPinCandidates, movePin, pinResource, unpinResource } from "@/utils/stagebook/actions/pins";
import { useToast } from "@/app/context/ToastContext";
import { Modal } from "@/components/stagebook/modal";
import { MAX_PINS, PIN_KINDS, PIN_KIND_LABEL, type PinCandidate, type PinDTO, type PinKind } from "@/types/pins";

export const PIN_KIND_META: Record<PinKind, { Icon: LucideIcon; tone: string }> = {
  labtest: { Icon: FlaskConical, tone: "bg-primary/12 text-primary" },
  thinklab: { Icon: Lightbulb, tone: "bg-accent/30 text-[color-mix(in_oklab,var(--color-accent)_50%,var(--color-base-content))]" },
  quickbrick: { Icon: Cuboid, tone: "bg-secondary/12 text-secondary" },
  stagebook: { Icon: Book, tone: "bg-success/15 text-success" },
};

// Mesmas medidas das linhas de ferramentas (nav-links.tsx).
const ROW =
  "group relative flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:is-drawer-close:justify-center lg:is-drawer-close:px-0";
const TIP = "lg:is-drawer-close:tooltip lg:is-drawer-close:tooltip-right lg:is-drawer-close:z-50";

/** Ladrilho colorido por tipo: é o que separa fixados de ferramentas, em especial com a barra recolhida. */
function KindTile({ kind, icon, size = "size-[22px]" }: { kind: PinKind; icon?: string | null; size?: string }) {
  const { Icon, tone } = PIN_KIND_META[kind];
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-tl-md rounded-br-md rounded-tr-sm rounded-bl-sm ${size} ${tone}`}>
      {icon ? <span className="text-[12px] leading-none">{icon}</span> : <Icon size={12} strokeWidth={2.2} />}
    </span>
  );
}

/**
 * Fixados da barra lateral: até 3 itens do espaço ativo. Funciona nos dois
 * modos — recolhida, cada item vira um ladrilho com tooltip e o "+" abre o
 * mesmo painel, que também reordena e desafixa.
 */
export function PinnedSection({
  pins,
  pathname,
  onNavigate,
}: {
  pins: PinDTO[];
  pathname: string;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const full = pins.length >= MAX_PINS;

  function unpin(pin: PinDTO) {
    startTransition(async () => {
      const result = await unpinResource(pin.id);
      if (!result.ok) addToast(result.error, "error");
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="pinned-title" className="border-t border-base-300/70 pt-3">
      <div className="mb-1 flex h-6 items-center justify-between pl-2.5 pr-1 lg:is-drawer-close:hidden">
        <h2 id="pinned-title" className="text-[11px] font-medium text-base-content/45">
          Fixados
        </h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-ghost btn-xs h-6 min-h-0 gap-1 px-1.5 font-normal text-base-content/45 hover:text-primary"
          aria-label={pins.length ? "Gerenciar fixados" : "Fixar um item"}
          title={pins.length ? "Gerenciar fixados" : "Fixar um item"}
        >
          {pins.length > 0 && <span className="font-mono text-[10px]">{pins.length}/{MAX_PINS}</span>}
          <Plus size={13} />
        </button>
      </div>

      <ul className="flex flex-col gap-0.5">
        {pins.map((pin) => {
          const active = pathname === pin.href || pathname.startsWith(`${pin.href}/`);
          return (
            <li key={pin.id} data-tip={pin.title} className={`group/pin relative ${TIP}`}>
              <Link
                href={pin.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                aria-label={`${pin.title} (${PIN_KIND_LABEL[pin.kind]})`}
                className={`${ROW} ${
                  active
                    ? "bg-base-100 font-semibold text-base-content shadow-sm"
                    : "text-base-content/65 hover:bg-base-300/50 hover:text-base-content"
                }`}
              >
                <KindTile kind={pin.kind} icon={pin.icon} />
                <span className="min-w-0 flex-1 truncate group-hover/pin:pr-6 lg:is-drawer-close:hidden">{pin.title}</span>
              </Link>
              <button
                type="button"
                className="absolute right-1 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-base-content/40 opacity-0 transition-opacity hover:bg-base-300 hover:text-error focus-visible:opacity-100 group-hover/pin:opacity-100 lg:is-drawer-close:hidden"
                aria-label={`Desafixar ${pin.title}`}
                title="Desafixar"
                disabled={isPending}
                onClick={() => unpin(pin)}
              >
                <X size={12} />
              </button>
            </li>
          );
        })}

        {/* Vazio (expandida) ou "+" (recolhida) */}
        {pins.length === 0 ? (
          <li data-tip="Fixar um item" className={TIP}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`${ROW} text-xs text-base-content/45 hover:bg-base-300/50 hover:text-primary`}
              aria-label="Fixar um item"
            >
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-md border border-dashed border-current">
                <Pin size={11} />
              </span>
              <span className="truncate lg:is-drawer-close:hidden">Fixar um item</span>
            </button>
          </li>
        ) : (
          <li data-tip={full ? "Gerenciar fixados" : "Fixar mais um"} className={`hidden lg:is-drawer-close:block ${TIP}`}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={`${ROW} text-base-content/40 hover:bg-base-300/50 hover:text-primary`}
              aria-label="Gerenciar fixados"
            >
              <span className="flex size-[22px] items-center justify-center rounded-md border border-dashed border-current">
                <Plus size={11} />
              </span>
            </button>
          </li>
        )}
      </ul>

      {/* Portal: o drawer usa transform, que quebraria o `position: fixed` do modal. */}
      {open && createPortal(<PinManager pins={pins} onClose={() => setOpen(false)} />, document.body)}
    </section>
  );
}

/** Painel único: fixados atuais (ordenar/desafixar) + busca para fixar. */
function PinManager({ pins, onClose }: { pins: PinDTO[]; onClose: () => void }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<PinKind | null>(null);
  const [items, setItems] = useState<PinCandidate[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const full = pins.length >= MAX_PINS;

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const result = await findPinCandidates({ q, kind });
      if (!active) return;
      if (result.ok) setItems(result.data);
      else addToast(result.error, "error");
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [q, kind, addToast, pins.length]);

  function act(task: () => Promise<{ ok: true } | { ok: false; error: string }>, success?: string) {
    startTransition(async () => {
      const result = await task();
      if (!result.ok) {
        addToast(result.error, "error");
        return;
      }
      if (success) addToast(success, "success");
      router.refresh();
    });
  }

  return (
    <Modal open onClose={onClose} title="Fixados" description={`Até ${MAX_PINS} itens deste espaço, no topo da barra.`}>
      {/* Atuais */}
      {pins.length > 0 && (
        <ol className="mb-4 space-y-1">
          {pins.map((pin, i) => (
            <li key={pin.id} className="flex items-center gap-2.5 rounded-lg bg-base-200/70 px-2.5 py-1.5">
              <span className="w-3 font-mono text-[11px] text-base-content/40">{i + 1}</span>
              <KindTile kind={pin.kind} icon={pin.icon} size="size-7" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{pin.title}</span>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                aria-label={`Subir ${pin.title}`}
                disabled={isPending || i === 0}
                onClick={() => act(() => movePin(pin.id, "up"))}
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                aria-label={`Descer ${pin.title}`}
                disabled={isPending || i === pins.length - 1}
                onClick={() => act(() => movePin(pin.id, "down"))}
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square hover:text-error"
                aria-label={`Desafixar ${pin.title}`}
                disabled={isPending}
                onClick={() => act(() => unpinResource(pin.id))}
              >
                <PinOff size={12} />
              </button>
            </li>
          ))}
        </ol>
      )}

      {/* Buscar para fixar */}
      <label className="input input-sm w-full">
        <Search size={14} className="opacity-50" />
        <input
          autoFocus
          type="search"
          placeholder={full ? "Limite atingido — desafixe um acima" : "Buscar teste, quadro, caderno ou página"}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      <div className="mt-2 flex flex-wrap gap-1">
        <button type="button" className={`btn btn-xs ${kind === null ? "btn-neutral" : "btn-ghost"}`} onClick={() => setKind(null)}>
          Tudo
        </button>
        {PIN_KINDS.map((k) => {
          const { Icon } = PIN_KIND_META[k];
          return (
            <button
              key={k}
              type="button"
              className={`btn btn-xs gap-1 ${kind === k ? "btn-neutral" : "btn-ghost"}`}
              onClick={() => setKind(k)}
            >
              <Icon size={11} /> {PIN_KIND_LABEL[k]}
            </button>
          );
        })}
      </div>

      <ul className="mt-3 max-h-72 divide-y divide-base-200 overflow-y-auto rounded-lg border border-base-200">
        {items === null ? (
          <li className="flex justify-center py-8">
            <Loader2 size={18} className="animate-spin text-base-content/40" />
          </li>
        ) : items.filter((i) => !i.pinned).length === 0 ? (
          <li className="py-8 text-center text-sm text-base-content/50">Nada para fixar neste espaço.</li>
        ) : (
          items
            .filter((i) => !i.pinned)
            .map((item) => (
              <li key={`${item.kind}:${item.id}`} className="flex items-center gap-3 px-3 py-2">
                <KindTile kind={item.kind} icon={item.icon} size="size-7" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{item.title}</span>
                  <span className="block text-[11px] text-base-content/45">{PIN_KIND_LABEL[item.kind]}</span>
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-xs gap-1"
                  disabled={isPending || full}
                  onClick={() => act(() => pinResource(item.kind, item.id), `“${item.title}” fixado.`)}
                >
                  <Pin size={11} /> Fixar
                </button>
              </li>
            ))
        )}
      </ul>
    </Modal>
  );
}
