"use client";

import { useEffect, useState } from "react";
import { ChevronRight, KeyRound, Loader2, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { useClerk, useSession, useUser } from "@clerk/nextjs";
import { useToast } from "@/app/context/ToastContext";
import { SettingRow, SettingsCard } from "./settings-card";

export function SecuritySection() {
  const { openUserProfile } = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { addToast } = useToast();
  const [others, setOthers] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !session) return;
    let alive = true;
    user
      .getSessions()
      .then((all) => alive && setOthers(all.filter((s) => s.id !== session.id).length))
      .catch(() => alive && setOthers(null));
    return () => {
      alive = false;
    };
  }, [user, session]);

  async function revokeOthers() {
    if (!user || !session) return;
    setBusy(true);
    try {
      const all = await user.getSessions();
      await Promise.all(all.filter((s) => s.id !== session.id).map((s) => s.revoke()));
      setOthers(0);
      addToast("Outras sessões encerradas.", "success");
    } catch {
      addToast("Não foi possível encerrar as outras sessões.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsCard icon={ShieldCheck} title="Segurança" description="Como sua conta é protegida e acessada.">
      <div className="divide-y divide-base-300">
        <SettingRow title="Senha e autenticação" description="Altere sua senha ou gerencie a verificação em duas etapas.">
          <button type="button" className="btn btn-outline btn-sm gap-2" onClick={() => openUserProfile()}>
            <KeyRound size={14} /> Gerenciar <ChevronRight size={14} />
          </button>
        </SettingRow>
        <SettingRow
          title="Outras sessões ativas"
          description={
            others === null
              ? "Encerre o acesso da sua conta em outros dispositivos."
              : others === 0
                ? "Você não tem outras sessões abertas."
                : `${others} ${others === 1 ? "outra sessão aberta" : "outras sessões abertas"} em outros dispositivos. Esta sessão continua ativa.`
          }
        >
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2"
            onClick={revokeOthers}
            disabled={busy || others === 0}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <MonitorSmartphone size={14} />}
            Encerrar outras sessões
          </button>
        </SettingRow>
      </div>
    </SettingsCard>
  );
}
