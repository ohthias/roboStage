"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Plus, X } from "lucide-react";
import {
  createOrganizationAction,
  initialCreateOrganizationState,
} from "./actions";

export function CreateOrganizationModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    createOrganizationAction,
    initialCreateOrganizationState
  );

  useEffect(() => {
    if (state.status === "success" && state.organizationId) {
      formRef.current?.reset();
      dialogRef.current?.close();
      router.push(`/dashboard/organizations/${state.organizationId}`);
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary gap-2"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Plus size={16} />
        Nova organização
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Criar nova organização</h3>
              <p className="text-xs text-base-content/60">
                Você se torna administrador automaticamente.
              </p>
            </div>
          </div>

          <form ref={formRef} action={formAction} className="mt-6 space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="org-name">
                <span className="label-text">Nome da organização</span>
              </label>
              <input
                id="org-name"
                name="name"
                type="text"
                required
                minLength={2}
                placeholder="Ex: Estúdio Aurora"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="org-slug">
                <span className="label-text">Identificador (opcional)</span>
                <span className="label-text-alt text-base-content/50">
                  usado na URL
                </span>
              </label>
              <input
                id="org-slug"
                name="slug"
                type="text"
                placeholder="estudio-aurora"
                className="input input-bordered w-full"
              />
            </div>

            {state.status === "error" && (
              <div className="alert alert-error py-2 text-sm">
                <span>{state.message}</span>
              </div>
            )}

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => dialogRef.current?.close()}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={isPending}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                Criar organização
              </button>
            </div>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
