"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Save, Trash2, Upload } from "lucide-react";
import {
  deleteOrganizationAction,
  updateOrganizationAction,
  updateOrganizationLogoAction,
} from "../actions";

const MAX_LOGO_SIZE_BYTES = 10 * 1024 * 1024;

export function SettingsForm({
  organizationId,
  name,
  slug,
  imageUrl,
}: {
  organizationId: string;
  name: string;
  slug: string;
  imageUrl?: string;
}) {
  const router = useRouter();
  const [formName, setFormName] = useState(name);
  const [formSlug, setFormSlug] = useState(slug);
  const [isSaving, startSaving] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);
  const [confirmText, setConfirmText] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSave(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    startSaving(async () => {
      const result = await updateOrganizationAction(organizationId, {
        name: formName,
        slug: formSlug || undefined,
      });

      setMessage(
        result.success
          ? { type: "success", text: "Organização atualizada." }
          : { type: "error", text: result.message ?? "Erro ao salvar." }
      );
      router.refresh();
    });
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setMessage({
        type: "error",
        text: "O logotipo deve ter no máximo 10 MB.",
      });
      event.target.value = "";
      return;
    }

    setMessage(null);
    const formData = new FormData();
    formData.set("logo", file);

    startUploading(async () => {
      const result = await updateOrganizationLogoAction(
        organizationId,
        formData
      );

      setMessage(
        result.success
          ? { type: "success", text: "Logotipo atualizado." }
          : {
              type: "error",
              text: result.message ?? "Erro ao enviar o logotipo.",
            }
      );
      router.refresh();
    });
  }

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteOrganizationAction(organizationId);

      if (result.success) {
        router.push("/dashboard/organizations");
        router.refresh();
      } else {
        setMessage({
          type: "error",
          text: result.message ?? "Erro ao excluir a organização.",
        });
        dialogRef.current?.close();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div
          className={`alert ${
            message.type === "success" ? "alert-success" : "alert-error"
          } text-sm`}
        >
          <span>{message.text}</span>
        </div>
      )}

      <div className="rounded-2xl border border-base-300 bg-base-100 p-5">
        <h3 className="text-sm font-semibold text-base-content/70">
          Logotipo
        </h3>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-base-300 bg-base-200">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-primary">
                {getInitials(name)}
              </span>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn btn-outline btn-sm gap-2"
            >
              {isUploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              Trocar logotipo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
            <p className="mt-1 text-xs text-base-content/50">
              PNG, JPG ou WEBP. Tamanho máximo do arquivo: 10 MB.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-base-300 bg-base-100 p-5"
      >
        <h3 className="text-sm font-semibold text-base-content/70">
          Informações gerais
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="form-control">
            <label className="label" htmlFor="settings-name">
              <span className="label-text">Nome</span>
            </label>
            <input
              id="settings-name"
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
              required
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary gap-2"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Salvar alterações
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-error/30 bg-error/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 text-error" />
          <div>
            <h3 className="font-semibold text-error">
              Excluir organização
            </h3>
            <p className="text-sm text-base-content/60">
              Essa ação é permanente e remove todos os membros, convites e
              dados associados.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="btn btn-error btn-outline btn-sm mt-4 gap-2"
        >
          <Trash2 size={14} />
          Excluir organização
        </button>
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold text-error">
            Confirmar exclusão
          </h3>
          <p className="mt-2 text-sm text-base-content/70">
            Digite <span className="font-semibold">{name}</span> para
            confirmar a exclusão permanente desta organização.
          </p>

          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            className="input input-bordered mt-4 w-full"
            placeholder={name}
          />

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setConfirmText("");
                dialogRef.current?.close();
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirmText !== name || isDeleting}
              className="btn btn-error gap-2"
            >
              {isDeleting && <Loader2 size={16} className="animate-spin" />}
              Excluir definitivamente
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase();
}
