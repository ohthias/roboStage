"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createTeam, switchStagebookScope } from "@/utils/stagebook/actions/teams";
import { useToast } from "@/app/context/ToastContext";

export function TeamCreateForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    const clean = name.trim();
    if (!clean) return;
    startTransition(async () => {
      try {
        const team = await createTeam(clean);
        await switchStagebookScope(team.id);
        addToast("Equipe criada com sucesso.", "success");
        router.push("/dashboard/team");
        router.refresh();
      } catch (error) {
        addToast(error instanceof Error ? error.message : "Não foi possível criar a equipe.", "error");
      }
    });
  }

  return (
    <div className="mx-auto flex max-w-xs items-center gap-2">
      <input
        className="input input-bordered input-sm flex-1"
        placeholder="Nome da equipe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button type="button" className="btn btn-primary btn-sm gap-1" onClick={submit} disabled={isPending}>
        <Plus size={14} />
        Criar
      </button>
    </div>
  );
}
