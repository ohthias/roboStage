"use client";

import { Loader2 } from "lucide-react";
import { OrganizationProfile } from "@clerk/nextjs";
import { useEnsureActiveOrganization } from "@/components/stagebook/use-ensure-active-org";

/**
 * Painel completo do Clerk (<OrganizationProfile />) — domínios verificados,
 * faturamento, SSO. O dia a dia (foto, nome, membros) tem telas próprias.
 */
export function OrganizationProfilePanel({ clerkOrgId }: { clerkOrgId: string }) {
  const { isReady, failed } = useEnsureActiveOrganization(clerkOrgId);

  return (
    <div>
      <p className="mb-4 text-sm text-base-content/60">
        Domínios verificados, faturamento e SSO — gerenciados direto pela Organização do Clerk. Para convidar
        pessoas e trocar cargos, use a aba Membros da equipe: lá o cargo do Stagebook e o papel no Clerk ficam
        sincronizados.
      </p>

      {failed && (
        <div role="alert" className="alert alert-error alert-soft mb-4 text-sm">
          Não foi possível abrir as configurações desta equipe. Tente recarregar a página.
        </div>
      )}

      {!isReady && !failed ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-base-content/50">
          <Loader2 size={16} className="animate-spin" />
          Abrindo configurações...
        </div>
      ) : (
        isReady && <OrganizationProfile routing="hash" />
      )}
    </div>
  );
}
