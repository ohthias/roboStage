"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eraser, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { Modal } from "@/components/stagebook/modal";
import { clearPersonalData, deleteMyAccount } from "@/utils/stagebook/actions/account";
import { CLEANUP_CATEGORIES, CLEANUP_META, type CleanupCategory } from "@/utils/stagebook/cleanup-categories";
import { SettingRow, SettingsCard } from "./settings-card";

export function DataSection({
  counts,
  blockers,
}: {
  /** Quantos itens pessoais existem em cada categoria (para mostrar o que será apagado). */
  counts: Record<CleanupCategory, number>;
  /** Equipes que impedem a exclusão da conta. */
  blockers: { id: string; name: string; members: number }[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [selected, setSelected] = useState<CleanupCategory[]>([]);
  const [cleanOpen, setCleanOpen] = useState(false);
  const [cleanConfirm, setCleanConfirm] = useState("");
  const [cleanError, setCleanError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const selectedTotal = selected.reduce((sum, c) => sum + counts[c], 0);
  const toggle = (c: CleanupCategory) =>
    setSelected((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  function closeClean() {
    setCleanOpen(false);
    setCleanConfirm("");
    setCleanError(null);
  }

  function runClean() {
    setCleanError(null);
    startTransition(async () => {
      const result = await clearPersonalData({ categories: selected, confirmation: cleanConfirm });
      if (!result.ok) {
        setCleanError(result.error);
        return;
      }
      const removed = Object.values(result.data).reduce((a, b) => a + (b ?? 0), 0);
      addToast(`${removed} ${removed === 1 ? "item removido" : "itens removidos"}.`, "success");
      setSelected([]);
      closeClean();
      router.refresh();
    });
  }

  function runDelete() {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteMyAccount(deleteConfirm);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }
      window.location.assign("/");
    });
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        icon={Eraser}
        title="Limpar dados da conta"
        description="Apaga conteúdo do seu espaço pessoal sem excluir a conta. Conteúdo de equipes nunca é apagado aqui."
      >
        <div className="space-y-4 p-5">
          <ul className="grid gap-2 sm:grid-cols-2">
            {CLEANUP_CATEGORIES.map((category) => (
              <li key={category}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    selected.includes(category) ? "border-error/50 bg-error/5" : "border-base-300 hover:border-base-content/30"
                  } ${counts[category] === 0 ? "opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-error checkbox-sm mt-0.5"
                    checked={selected.includes(category)}
                    onChange={() => toggle(category)}
                    disabled={counts[category] === 0}
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {CLEANUP_META[category].label}
                      <span className="badge badge-ghost badge-sm">{counts[category]}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-base-content/50">{CLEANUP_META[category].description}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-base-content/50">
              {selected.length === 0
                ? "Selecione o que deseja apagar."
                : `${selectedTotal} ${selectedTotal === 1 ? "item será apagado" : "itens serão apagados"}.`}
            </p>
            <button
              type="button"
              className="btn btn-error btn-outline btn-sm gap-2"
              disabled={selected.length === 0}
              onClick={() => setCleanOpen(true)}
            >
              <Eraser size={14} /> Limpar selecionados
            </button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard icon={Trash2} title="Zona de risco" description="Ação permanente que afeta toda a sua conta." tone="danger">
        <SettingRow
          title="Excluir conta"
          description="Remove sua conta e todos os dados pessoais. Equipes em que você é o único membro são excluídas junto. Não pode ser desfeito."
        >
          <button type="button" className="btn btn-error btn-outline btn-sm gap-2" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={14} /> Excluir conta
          </button>
        </SettingRow>
      </SettingsCard>

      <Modal open={cleanOpen} onClose={isPending ? () => {} : closeClean} title="Limpar dados selecionados?" size="sm">
        <p className="text-sm text-base-content/70">
          Serão apagados <strong>{selectedTotal}</strong> {selectedTotal === 1 ? "item" : "itens"} de:{" "}
          {selected.map((c) => CLEANUP_META[c].label).join(", ")}. Não pode ser desfeito.
        </p>
        <label className="fieldset mt-4">
          <span className="fieldset-legend">
            Digite <span className="font-mono text-error">limpar</span> para confirmar
          </span>
          <input
            className="input w-full"
            value={cleanConfirm}
            onChange={(e) => setCleanConfirm(e.target.value)}
            placeholder="limpar"
            autoComplete="off"
          />
        </label>
        {cleanError && (
          <div role="alert" className="alert alert-error alert-soft mt-3 py-2 text-sm">
            {cleanError}
          </div>
        )}
        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={closeClean} disabled={isPending}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-error btn-sm"
            disabled={isPending || cleanConfirm.trim().toLowerCase() !== "limpar"}
            onClick={runClean}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Apagar dados
          </button>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={isPending ? () => {} : () => setDeleteOpen(false)} title="Excluir sua conta" size="sm">
        {blockers.length > 0 ? (
          <div role="alert" className="alert alert-warning alert-soft text-sm">
            <AlertTriangle size={18} />
            <div>
              <p className="font-medium">Você ainda é técnico de equipes com outros membros:</p>
              <ul className="mt-1 list-inside list-disc">
                {blockers.map((t) => (
                  <li key={t.id}>
                    {t.name} ({t.members} pessoas)
                  </li>
                ))}
              </ul>
              <p className="mt-1">Passe o cargo de técnico para outra pessoa ou exclua a equipe antes.</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-base-content/70">
              Sua conta e todos os dados pessoais serão removidos permanentemente.
            </p>
            <label className="fieldset mt-4">
              <span className="fieldset-legend">
                Digite <span className="font-mono text-error">excluir</span> para confirmar
              </span>
              <input
                className="input w-full"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="excluir"
                autoComplete="off"
              />
            </label>
          </>
        )}
        {deleteError && (
          <div role="alert" className="alert alert-error alert-soft mt-3 py-2 text-sm">
            {deleteError}
          </div>
        )}
        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDeleteOpen(false)} disabled={isPending}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-error btn-sm"
            disabled={isPending || blockers.length > 0 || deleteConfirm.trim().toLowerCase() !== "excluir"}
            onClick={runDelete}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Excluir permanentemente
          </button>
        </div>
      </Modal>
    </div>
  );
}
