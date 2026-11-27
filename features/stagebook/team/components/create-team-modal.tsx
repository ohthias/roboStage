"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, Plus, ShieldCheck, Users } from "lucide-react";
import { createTeamAction, switchStagebookScope } from "@/features/stagebook/actions/teams";
import { updateTeamProfile } from "../actions";
import { useToast } from "@/components/providers/ToastContext";
import { DialogNote, Field, FieldGroup, FormDialog } from "@/components/stage/core/FormDialog";

/** Temporadas sugeridas: a atual (ago→jul, como na FLL) e a seguinte. */
function seasonSuggestions(now = new Date()) {
  const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return [start, start + 1].map((y) => `${y}/${String(y + 1).slice(2)}`);
}

const ROLES = [
  { icon: ShieldCheck, title: "Técnico", text: "Você. Gerencia a equipe, convites e permissões." },
  { icon: GraduationCap, title: "Mentores", text: "Ajudam a planejar treinos, kanban e cadernos." },
  { icon: Users, title: "Membros", text: "Treinam, registram partidas e acompanham tarefas." },
];

/**
 * Botão + modal "Criar equipe". Quem cria vira Técnico (owner) e a equipe ganha
 * uma Organização no Clerk. Quem pode criar é decidido no servidor
 * (`createTeam`); a UI só deixa de oferecer o botão a quem não pode.
 */
export function CreateTeamButton({
  variant = "primary",
}: {
  variant?: "primary" | "icon";
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [season, setSeason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const suggestions = seasonSuggestions();

  function close() {
    setOpen(false);
    setName("");
    setOrganizationName("");
    setSeason("");
    setError(null);
  }

  function submit() {
    const clean = name.trim();
    if (!clean) {
      setError("Informe o nome da equipe.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createTeamAction(clean);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Organização e temporada são opcionais e já existem nas configurações;
      // se essa segunda gravação falhar, a equipe continua criada.
      if (organizationName.trim() || season.trim()) {
        const profile = await updateTeamProfile(result.data.id, {
          organizationName: organizationName.trim() || null,
          season: season.trim() || null,
        });
        if (!profile.ok) addToast("Equipe criada, mas não deu para salvar escola/temporada. Ajuste nas configurações.", "warning");
      }
      await switchStagebookScope(result.data.id);
      addToast("Equipe criada com sucesso.", "success");
      close();
      router.push(`/dashboard/team/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          title="Criar equipe"
          aria-label="Criar equipe"
          onClick={() => setOpen(true)}
        >
          <Plus size={16} />
        </button>
      ) : (
        <button type="button" className="btn btn-primary gap-2" onClick={() => setOpen(true)}>
          <Plus size={16} />
          Criar equipe
        </button>
      )}

      <FormDialog
        open={open}
        onClose={close}
        eyebrow="Equipes"
        title="Nova equipe"
        description="Um espaço compartilhado para treinos, kanban, calendário e cadernos."
        busy={isPending}
        onSubmit={submit}
        footer={
          <>
            <span className="text-xs text-base-content/50">Tudo isso dá para mudar depois.</span>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost rounded-lg" onClick={close} disabled={isPending}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary gap-2 rounded-lg" disabled={isPending || !name.trim()}>
                {isPending ? <span className="loading loading-spinner loading-sm" /> : <Plus size={16} />}
                Criar equipe
              </button>
            </div>
          </>
        }
      >
        <Field label="Nome da equipe">
          <input
            autoFocus
            className="input input-bordered w-full"
            placeholder="Ex.: Robôs do Sertão"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Escola ou organização" optional>
            <span className="input input-bordered flex w-full items-center gap-2">
              <Building2 size={15} className="shrink-0 text-base-content/45" />
              <input
                className="grow"
                placeholder="Ex.: EE Prof. Maria Lúcia"
                maxLength={120}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </span>
          </Field>
          <Field label="Temporada" optional>
            <input
              className="input input-bordered w-full"
              placeholder={`Ex.: ${suggestions[0]}`}
              maxLength={40}
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              list="team-season-suggestions"
            />
            <datalist id="team-season-suggestions">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
        </div>

        <FieldGroup legend="Como a equipe se organiza" hint="Você convida mentores e membros depois de criar.">
          <div className="grid gap-2 sm:grid-cols-3">
            {ROLES.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className={`flex items-start gap-3 rounded-tl-xl rounded-br-xl border p-3 sm:flex-col sm:gap-2 ${
                  i === 0 ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-base-300"
                }`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                    i === 0 ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/60"
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-xs leading-snug text-base-content/55">{text}</span>
                </span>
              </div>
            ))}
          </div>
        </FieldGroup>

        {error && <DialogNote tone="error">{error}</DialogNote>}
      </FormDialog>
    </>
  );
}
