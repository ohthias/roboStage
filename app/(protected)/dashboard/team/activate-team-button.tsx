"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";
import { switchStagebookScope } from "@/utils/stagebook/actions/teams";

export function ActivateTeamButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function activate() {
    startTransition(async () => {
      await switchStagebookScope(teamId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm shrink-0 gap-1.5"
      onClick={activate}
      disabled={isPending}
    >
      <ArrowRightLeft size={14} />
      Tornar espaço ativo
    </button>
  );
}
