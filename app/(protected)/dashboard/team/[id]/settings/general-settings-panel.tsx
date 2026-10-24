"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { useEnsureActiveOrganization } from "@/components/stagebook/use-ensure-active-org";
import { deleteTeamOrganization, updateTeamProfile } from "../../actions";
import { useToast } from "@/app/context/ToastContext";

export function GeneralSettingsPanel({
  teamId,
  clerkOrgId,
  initialName,
  initialSeason,
  initialOrganizationName,
  initialLogoUrl,
  canDeleteTeam,
}: {
  teamId: string;
  clerkOrgId: string;
  initialName: string;
  initialSeason: string | null;
  initialOrganizationName: string | null;
  initialLogoUrl: string | null;
  /** Só o técnico exclui a equipe (`team.delete`). */
  canDeleteTeam: boolean;
}) {
  const router = useRouter();
  const { organization, isReady, failed } = useEnsureActiveOrganization(clerkOrgId);

  return (
    <div className="flex flex-col gap-6">
      <PhotoSection
        organization={organization}
        isReady={isReady}
        failed={failed}
        initialLogoUrl={initialLogoUrl}
        onChanged={() => router.refresh()}
      />
      <ProfileSection
        teamId={teamId}
        initialName={initialName}
        initialSeason={initialSeason}
        initialOrganizationName={initialOrganizationName}
        onChanged={() => router.refresh()}
      />
      {canDeleteTeam ? (
        <DangerZone teamId={teamId} teamName={initialName} />
      ) : (
        <p className="rounded-2xl border border-base-300 bg-base-100 p-4 text-xs text-base-content/55">
          Excluir a equipe é uma ação do técnico responsável.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Foto
// ---------------------------------------------------------------------------

function PhotoSection({
  organization,
  isReady,
  failed,
  initialLogoUrl,
  onChanged,
}: {
  organization: ReturnType<typeof useEnsureActiveOrganization>["organization"];
  isReady: boolean;
  failed: boolean;
  initialLogoUrl: string | null;
  onChanged: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const logoUrl = organization?.hasImage ? organization.imageUrl : initialLogoUrl;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !organization) return;

    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("A imagem precisa ter até 10MB.");
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      // Método recomendado pelo próprio Clerk pra logo: pelo frontend
      // (organization.setLogo), não pelo backend — evita contar pro rate
      // limit da API e já cuida do upload/redimensionamento.
      await organization.setLogo({ file });
      addToast("Imagem da equipe atualizada.", "success");
      onChanged();
    } catch {
      setError("Não foi possível enviar a imagem. Tente novamente.");
      addToast("Não foi possível enviar a imagem.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    if (!organization) return;
    setError(null);
    setIsUploading(true);
    try {
      await organization.setLogo({ file: null });
      addToast("Imagem da equipe removida.", "success");
      onChanged();
    } catch {
      setError("Não foi possível remover a imagem.");
      addToast("Não foi possível remover a imagem.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="card card-border bg-base-100 p-5">
      <h2 className="font-semibold">Foto da equipe</h2>
      <p className="mt-0.5 text-xs text-base-content/50">Aparece no seletor de equipe e nos convites.</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-base-100 ring-1 ring-base-300">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- avatar de Organization do Clerk, host externo dinâmico
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Camera size={22} className="text-base-content/25" />
          )}
          {(isUploading || !isReady) && !failed && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-100/70">
              <Loader2 size={18} className="animate-spin text-base-content/50" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-sm gap-1.5"
              onClick={() => inputRef.current?.click()}
              disabled={!isReady || isUploading}
            >
              <Upload size={13} />
              Enviar imagem
            </button>
            {logoUrl && (
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error"
                onClick={handleRemove}
                disabled={!isReady || isUploading}
              >
                Remover
              </button>
            )}
          </div>
          <p className="text-[11px] text-base-content/40">PNG ou JPG, até 10MB.</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="mt-2 text-xs text-error">{error}</p>}
      {failed && (
        <p className="mt-2 text-xs text-error">
          Não foi possível carregar a equipe pra edição de foto. Recarregue a página.
        </p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Perfil (nome, temporada, organização/escola)
// ---------------------------------------------------------------------------

function ProfileSection({
  teamId,
  initialName,
  initialSeason,
  initialOrganizationName,
  onChanged,
}: {
  teamId: string;
  initialName: string;
  initialSeason: string | null;
  initialOrganizationName: string | null;
  onChanged: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [season, setSeason] = useState(initialSeason ?? "");
  const [organizationName, setOrganizationName] = useState(initialOrganizationName ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const dirty =
    name.trim().length > 0 &&
    (name.trim() !== initialName ||
      season.trim() !== (initialSeason ?? "") ||
      organizationName.trim() !== (initialOrganizationName ?? ""));

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateTeamProfile(teamId, {
        name,
        season: season || null,
        organizationName: organizationName || null,
      });
      if (!result.ok) {
        setError(result.error);
        addToast(result.error, "error");
        return;
      }
      addToast("Perfil da equipe atualizado.", "success");
      onChanged();
    });
  }

  return (
    <section className="card card-border bg-base-100 p-5">
      <h2 className="font-semibold">Perfil da equipe</h2>
      <p className="mt-0.5 text-xs text-base-content/50">Aparece em todo o Stagebook, no seletor de equipes e nos convites.</p>

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="fieldset">
          <span className="fieldset-legend">Nome da equipe</span>
          <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="fieldset">
            <span className="fieldset-legend">Escola / organização</span>
            <input
              className="input w-full"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              maxLength={120}
            />
          </label>
          <label className="fieldset">
            <span className="fieldset-legend">Temporada</span>
            <input
              className="input w-full"
              placeholder="Ex.: 2026/27"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              maxLength={40}
            />
          </label>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary btn-sm" disabled={!dirty || isPending}>
            {isPending ? <Loader2 size={14} className="animate-spin" /> : "Salvar alterações"}
          </button>
        </div>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Zona de perigo
// ---------------------------------------------------------------------------

function DangerZone({ teamId, teamName }: { teamId: string; teamName: string }) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { addToast } = useToast();

  const canDelete = confirmText.trim() === teamName;

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTeamOrganization(teamId, confirmText.trim());
      if (!result.ok) {
        setError(result.error);
        addToast(result.error, "error");
        return;
      }
      addToast("Equipe excluída com sucesso.", "success");
      router.push("/dashboard/team?view=all");
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-error/30 bg-error/5 p-5">
      <h2 className="font-semibold text-error">Excluir equipe</h2>
      <p className="mt-0.5 text-xs text-base-content/60">
        Apaga a equipe pra sempre — Páginas, Calendário, Boards do Kanban, marcos e a
        Organização no Clerk. Não pode ser desfeito.
      </p>

      {!confirming ? (
        <button
          type="button"
          className="btn btn-error btn-outline btn-sm mt-4 gap-1.5"
          onClick={() => setConfirming(true)}
        >
          <Trash2 size={13} />
          Excluir esta equipe
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-xs text-base-content/60">
            Pra confirmar, digite <strong>{teamName}</strong> abaixo:
          </label>
          <input
            className="input input-bordered input-sm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={teamName}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-error btn-sm gap-1.5"
              onClick={handleDelete}
              disabled={!canDelete || isPending}
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={13} />}
              Excluir de vez
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setConfirming(false);
                setConfirmText("");
                setError(null);
              }}
              disabled={isPending}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </section>
  );
}
