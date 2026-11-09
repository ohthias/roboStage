"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pin, PinOff } from "lucide-react";
import { getPinState, pinResource, unpinByResource } from "@/utils/stagebook/actions/pins";
import { useToast } from "@/app/context/ToastContext";
import { MAX_PINS, type PinKind } from "@/types/pins";

/** Botão "Fixar"/"Fixado" das páginas de item (aparece na barra lateral). */
export function PinToggle({
  kind,
  resourceId,
  className = "btn btn-sm btn-outline gap-2 rounded-full",
}: {
  kind: PinKind;
  resourceId: string;
  className?: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [state, setState] = useState<{ pinned: boolean; full: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getPinState(kind, resourceId).then((s) => active && setState(s));
    return () => {
      active = false;
    };
  }, [kind, resourceId]);

  if (!state) return null;
  const blocked = !state.pinned && state.full;

  function toggle() {
    if (!state) return;
    startTransition(async () => {
      const result = state.pinned ? await unpinByResource(kind, resourceId) : await pinResource(kind, resourceId);
      if (!result.ok) {
        addToast(result.error, "error");
        return;
      }
      setState({ pinned: !state.pinned, full: state.full });
      addToast(state.pinned ? "Desafixado da barra lateral." : "Fixado na barra lateral.", "success");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className={`${className} ${state.pinned ? "text-primary" : ""}`}
      onClick={toggle}
      disabled={isPending || blocked}
      title={blocked ? `Você já fixou ${MAX_PINS} itens neste espaço` : state.pinned ? "Desafixar da barra lateral" : "Fixar na barra lateral"}
      aria-pressed={state.pinned}
    >
      {state.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
      {state.pinned ? "Fixado" : "Fixar"}
    </button>
  );
}
