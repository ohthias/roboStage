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
  type LucideIcon,
} from "lucide-react";
import { findPinCandidates, movePin, pinResource, unpinByResource, unpinResource } from "@/utils/stagebook/actions/pins";
import { useToast } from "@/app/context/ToastContext";
import { Modal } from "@/components/stagebook/modal";
import { MAX_PINS, PIN_KINDS, PIN_KIND_LABEL, type PinCandidate, type PinDTO, type PinKind } from "@/types/pins";

export const PIN_KIND_META: Record<PinKind, { Icon: LucideIcon; tone: string }> = {
  labtest: { Icon: FlaskConical, tone: "bg-primary/10 text-primary" },
  thinklab: { Icon: Lightbulb, tone: "bg-accent/25 text-[color-mix(in_oklab,var(--color-accent)_55%,var(--color-base-content))]" },
  quickbrick: { Icon: Cuboid, tone: "bg-secondary/10 text-secondary" },
  stagebook: { Icon: Book, tone: "bg-success/12 text-success" },
};

function KindTile({ kind, icon, size = "size-6" }: { kind: PinKind; icon?: string | null; size?: string }) {
  const { Icon, tone } = PIN_KIND_META[kind];
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-tl-md rounded-br-md rounded-tr-sm rounded-bl-sm ${size} ${tone}`}>
      {icon ? <span className="text-[13px] leading-none">{icon}</span> : <Icon size={13} strokeWidth={2} />}
    </span>
  );
}

/**
 * Seção "Fixados" da barra lateral: até 3 itens do espaço ativo (testes,
 * quadros do ThinkLab, cadernos do QuickBrick e páginas do StageBook).
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
  const [picking, setPicking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const full = pins.length >= MAX_PINS;

  function run(task: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await task();
      if (!result.ok) addToast(result.error ?? "Não foi possível concluir.", "error");
      router.refresh();
    });
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-3 lg:is-drawer-close:justify-center lg:is-drawer-close:px-0">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-base-content/35 lg:is-drawer-close:hidden">
          Fixados <span className="text-base-content/25">{pins.length}/{MAX_PINS}</span>
        </span>
        <button
          type="button"
          onClick={() => setPicking(true)}
          disabled={full}
          title={full ? `Limite de ${MAX_PINS} fixados neste espaço` : "Fixar um item"}
          aria-label="Fixar um item"
          className="btn btn-ghost btn-xs btn-square text-base-content/45 hover:text-primary lg:is-drawer-close:hidden"
        >
          <Plus size={13} />
        </button>
        <span className="hidden h-px w-6 bg-base-300 lg:is-drawer-close:block" aria-hidden="true" />
      </div>

      {pins.length === 0 ? (
        <button
          type="button"
          onClick={() => setPicking(true)}
          data-tip="Fixar um item"
          className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-base-300 px-3 py-2.5 text-left text-xs text-base-content/50 transition-colors hover:border-primary/40 hover:text-primary lg:is-drawer-close:tooltip lg:is-drawer-close:tooltip-right lg:is-drawer-close:justify-center lg:is-drawer-close:px-0"
        >
          <Pin size={14} className="shrink-0" />
          <span className="lg:is-drawer-close:hidden">Fixe até {MAX_PINS} testes, quadros, cadernos ou páginas</span>
        </button>
      ) : (
        <ul className="flex flex-col gap-1">
          {pins.map((pin, index) => {
            const active = pathname === pin.href || pathname.startsWith(`${pin.href}/`);
            return (
              <li
                key={pin.id}
                data-tip={`${pin.title} · ${PIN_KIND_LABEL[pin.kind]}`}
                className="group/pin relative lg:is-drawer-close:tooltip lg:is-drawer-close:tooltip-right lg:is-drawer-close:z-50"
              >
                <Link
                  href={pin.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors lg:is-drawer-close:justify-center lg:is-drawer-close:px-0 ${
                    active ? "bg-primary/10 font-medium text-primary" : "text-base-content/70 hover:bg-base-300/60 hover:text-base-content"
                  }`}
                >
                  <KindTile kind={pin.kind} icon={pin.icon} />
                  <span className="min-w-0 flex-1 truncate group-focus-within/pin:pr-14 group-hover/pin:pr-14 lg:is-drawer-close:hidden">
                    {pin.title}
                  </span>
                </Link>
                {/* Ações (aparecem ao passar o mouse) */}
                <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover/pin:opacity-100 lg:is-drawer-close:hidden">
                  {pins.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-square size-6 min-h-0"
                      aria-label={`Mover ${pin.title} ${index === 0 ? "para baixo" : "para cima"}`}
                      title={index === 0 ? "Descer" : "Subir"}
                      disabled={isPending}
                      onClick={() => run(() => movePin(pin.id, index === 0 ? "down" : "up"))}
                    >
                      {index === 0 ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square size-6 min-h-0 hover:text-error"
                    aria-label={`Desafixar ${pin.title}`}
                    title="Desafixar"
                    disabled={isPending}
                    onClick={() => run(() => unpinResource(pin.id))}
                  >
                    <PinOff size={11} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Portal: o drawer usa transform, que quebraria o `position: fixed` do modal. */}
      {picking && createPortal(<PinPicker count={pins.length} onClose={() => setPicking(false)} />, document.body)}
    </section>
  );
}

/** Busca itens do espaço ativo para fixar. */
function PinPicker({ count, onClose }: { count: number; onClose: () => void }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<PinKind | null>(null);
  const [items, setItems] = useState<PinCandidate[] | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const result = await findPinCandidates({ q, kind });
      if (!active) return;
      if (result.ok) setItems(result.data);
      else addToast(result.error, "error");
    }, 220);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [q, kind, addToast]);

  function toggle(item: PinCandidate) {
    startTransition(async () => {
      const result = item.pinned ? await unpinByResource(item.kind, item.id) : await pinResource(item.kind, item.id);
      if (!result.ok) {
        addToast(result.error, "error");
        return;
      }
      router.refresh();
      if (!item.pinned) {
        addToast(`“${item.title}” fixado.`, "success");
        onClose();
      } else {
        setItems((prev) => prev?.map((i) => (i.kind === item.kind && i.id === item.id ? { ...i, pinned: false } : i)) ?? null);
      }
    });
  }

  const full = count >= MAX_PINS;

  return (
    <Modal open onClose={onClose} title="Fixar na barra lateral" description={`Até ${MAX_PINS} itens deste espaço, sempre à mão.`}>
      <label className="input input-sm w-full">
        <Search size={14} className="opacity-50" />
        <input autoFocus type="search" placeholder="Buscar pelo nome" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="mt-2 flex flex-wrap gap-1">
        <button type="button" className={`btn btn-xs ${kind === null ? "btn-primary" : "btn-ghost"}`} onClick={() => setKind(null)}>
          Tudo
        </button>
        {PIN_KINDS.map((k) => {
          const { Icon } = PIN_KIND_META[k];
          return (
            <button
              key={k}
              type="button"
              className={`btn btn-xs gap-1 ${kind === k ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setKind(k)}
            >
              <Icon size={11} /> {PIN_KIND_LABEL[k]}
            </button>
          );
        })}
      </div>

      {full && (
        <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-base-content/70">
          Você já tem {MAX_PINS} fixados neste espaço. Desafixe um para escolher outro.
        </p>
      )}

      <ul className="mt-3 max-h-80 divide-y divide-base-200 overflow-y-auto rounded-lg border border-base-200">
        {items === null ? (
          <li className="flex justify-center py-8">
            <Loader2 size={18} className="animate-spin text-base-content/40" />
          </li>
        ) : items.length === 0 ? (
          <li className="py-8 text-center text-sm text-base-content/50">Nada encontrado neste espaço.</li>
        ) : (
          items.map((item) => (
            <li key={`${item.kind}:${item.id}`} className="flex items-center gap-3 px-3 py-2">
              <KindTile kind={item.kind} icon={item.icon} size="size-8" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="block text-[11px] text-base-content/45">{PIN_KIND_LABEL[item.kind]}</span>
              </span>
              <button
                type="button"
                className={`btn btn-xs gap-1 ${item.pinned ? "btn-ghost text-primary" : "btn-outline"}`}
                disabled={isPending || (!item.pinned && full)}
                onClick={() => toggle(item)}
              >
                {item.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                {item.pinned ? "Desafixar" : "Fixar"}
              </button>
            </li>
          ))
        )}
      </ul>
    </Modal>
  );
}
